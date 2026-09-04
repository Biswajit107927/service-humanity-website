/* Optional local-model enrichment (Ollama)
 * ----------------------------------------------------------------------------
 * This site is a fully static export, so a visitor's browser can never reach
 * an LLM running on the SITE OWNER's machine. This module is therefore only
 * useful in one situation: you are browsing your own site locally while
 * Ollama is running on the SAME machine (e.g. during development at
 * http://localhost:3000 with `ollama serve` also running locally).
 *
 * It is a pure progressive enhancement:
 *  - If Ollama is not reachable (production, most visitors, no local model),
 *    this silently fails fast and the chat widget uses the always-available
 *    extractive answer engine (lib/knowledge-base/answer.ts) instead.
 *
 * No server, no API keys, no cost — 100% open source (Ollama + local models
 * such as Llama, Qwen, Mistral, etc.). The model is AUTO-DETECTED from the
 * installed models list — no hard-coded model name to go stale..
 * ------------------------------------------------------------------------- */

import type { KnowledgeSource } from "@/lib/knowledge-base/client"

const DEFAULT_BASE_URL = "http://127.0.0.1:11434/v1"
const PING_TIMEOUT_MS = 700
const COMPLETE_TIMEOUT_MS = 20_000

const SYSTEM_PROMPT = `You are "Humanity Assistant",the friendly AI helper for the Service to Humanity Foundation website.
Answer ONLY using the knowledge-base excerpts provided. Keep answers to 2-4 sentencesми. If the excerpts don't contain the answer, say soand suggest contacting the foundation via the website's Donate section. Never invent facts. Do not mention "knowledge base" or "excerpts" in your reply.`

/* Preferred model families, in order (matched against installed model names). */
const MODEL_PREFERENCES: RegExp[] = [
  /^llama3(?:[.:-]|$)/i,
  /^qwen3(?:[.:-]|$)/i,
  /^qwen2(?:[.:-]|$)/i,
  /^mistral/i,
  /^phi/i,
  /^gemma/i,
  /^aya/i,
  /^deepseek/i,
  /^llama/i,
  /^qwen/i,
]

interface OllamaState {
  availability: "unknown" | "available" | "unavailable"
  models: string[] | null
  model: string | null
}

const state: OllamaState = {
  availability: "unknown",
  models: null,
  model: null,
}

function getBaseUrl(): string {
  const raw =
    (typeof window !== "undefined" &&
      window.localStorage?.getItem("kb-ai-base-url")) ||
    DEFAULT_BASE_URL
  return raw.replace(/\/+$/, "")
}

function isEmbedModel(name: string): boolean {
  return /embed/i.test(name)
}

function pickBestModel(models: string[]): string | null {
  for (const pattern of MODEL_PREFERENCES) {
    const match = models.find((m) => pattern.test(m) && !isEmbedModel(m))
    if (match) return match
  }
  const first = models.find((m) => !isEmbedModel(m))
  return first ?? models[0] ?? null
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** Discover the running Ollama server and auto-select the best installed model. */
async function discoverOllama(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(
      `${getBaseUrl().replace(/\/v1\/?$/, "")}/api/tags`,
      { method: "GET" },
      PING_TIMEOUT_MS
    )
    if (!res.ok) {
      state.availability = "unavailable"
      return false
    }
    const data = (await res.json()) as { models?: { name?: string }[] }
    state.models = (data.models ?? []).map((m) => m.name?.trim()).filter(Boolean) as string[]
    state.model = pickBestModel(state.models ?? [])
    state.availability = state.model ? "available" : "unavailable"
  } catch {
    state.availability = "unavailable"
  }
  return state.availability === "available"
}

export async function isLocalModelAvailable(): Promise<boolean> {
  if (state.availability !== "unknown") return state.availability === "available"
  return discoverOllama()
}

/** Debug/status helper — what model would the widget use? */
export async function getLocalModelInfo(): Promise<{
  available: boolean
  model: string | null
  baseUrl: string
}> {
  if (state.availability === "unknown") await discoverOllama()
  return {
    available: state.availability === "available",
    model: state.model,
    baseUrl: getBaseUrl(),
  }
}

interface OpenAIChatResponse {
  choices?: { message?: { content?: string } }[]
}

/**
 * Ask the local model to phrase an answer from the given knowledge-base
 * sources. Returns null if unavailable or on any failure — callers must
 * fall back to the extractive answer engine..
 */
export async function completeWithLocalModel(
  question: string,
  sources: KnowledgeSource[]
): Promise<string | null> {
  if (sources.length === 0) return null
  if (state.availability === "unknown") await discoverOllama()
  if (state.availability !== "available" || !state.model) return null

  const context = sources
    .map((s,i) => `[${i + 1}] ${s.title} — ${s.heading}\n${s.excerpt}`)
    .join("\n\n")

  try {
    const res = await fetchWithTimeout(
      `${getBaseUrl()}/chat/completions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: state.model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `KNOWLEDGE BASE CONTEXT:\n\n${context}\n\nVisitor's question:\n${question}`,
            },
          ],
          temperature: 0.2,
          max_tokens: 400,
          stream: false,
        }),
      },
      COMPLETE_TIMEOUT_MS
    )
    if (!res.ok) return null
    const data = (await res.json()) as OpenAIChatResponse
    const text = data.choices?.[0]?.message?.content?.trim()
    return text || null
  } catch {
    state.availability = "unavailable"
    return null
  }
}