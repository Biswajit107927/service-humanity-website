/* Cloudflare Pages Function — AI chat proxy (Workers AI)
 * ----------------------------------------------------------------------------
 * Deployed automatically alongside the static export by Cloudflare Pages
 * (no changes needed to the static site; the `functions/` directory is only
 * used at deploy time). It receives the question + retrieved knowledge-base
 * sources (RAG retrieval runs in the visitor's browser) and asks the Workers
 * AI binding to phrase a conversational answer — strictly from the provided
 * sources.
 *
 * Free tier: open-source models (Llama, Qwen, ...) hosted by Cloudflare.
 *
 * Setup (one-time, in the Cloudflare dashboard):
 *   Pages → (your project) → Settings → Functions → Bindings → + Add
 *   "Workers AI" binding named: `AI`. Optional: set an `AI_MODEL`
 *   environment variable to override the default model.
 * ------------------------------------------------------------------------- */

interface ChatSource {
  title: string
  heading: string
  excerpt: string
}

interface ChatBody {
  question?: unknown
  sources?: unknown
}

/* Local structural types — kept deliberately outside Cloudflare's generated
 * types so this file typechecks in any toolchain (the Pages runtime just
 * passes the standard context shape). */
interface AiBinding {
  run(model: string, inputs: Record<string, unknown>): Promise<Record<string, unknown>>
}

interface Env {
  AI?: AiBinding | undefined
  AI_MODEL?: string
}

const DEFAULT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"

const SYSTEM_PROMPT = `You are "Humanity Assistant", the friendly AI helper for the Service to Humanity Foundation website.
Answer ONLY using the knowledge-base excerpts provided. Keep answers to 2-4 sentences. If the excerpts don't contain the answer, say so and suggest contacting the foundation via the website's Donate section. Never invent facts. Do not mention "knowledge base" or "excerpts" in your reply.`

const MAX_QUESTION = 1_000
const MAX_SOURCES = 4
const MAX_EXCERPT = 600
const MAX_TITLE = 120
const MAX_HEADING = 200

function asChatSources(value: unknown): ChatSource[] {
  if (!Array.isArray(value)) return []
  return value
    .filter(
      (x): x is Record<string, unknown> => typeof x === "object" && x !== null
    )
    .map((x) => ({
      title: typeof x.title === "string" ? x.title.slice(0, MAX_TITLE) : "",
      heading: typeof x.heading === "string" ? x.heading.slice(0, MAX_HEADING) : "",
      excerpt: typeof x.excerpt === "string" ? x.excerpt.slice(0, MAX_EXCERPT) : "",
    }))
    .filter((s) => s.excerpt.length > 0)
    .slice(0, MAX_SOURCES)
}

export async function onRequestPost(context: {
  request: Request
  env: Env
}): Promise<Response> {
  const { request, env } = context

  let body: ChatBody
  try {
    body = (await request.json()) as ChatBody
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 })
  }

  const question =
    typeof body.question === "string" ? body.question.trim().slice(0, MAX_QUESTION) : ""
  if (!question) {
    return Response.json({ error: "empty_question" }, { status: 400 })
  }

  const sources = asChatSources(body.sources)

  if (sources.length === 0) {
    return Response.json({ error: "no_context" }, { status: 422 })
  }

  const ai = env.AI
  if (!ai) {
    return Response.json(
      { error: "workers_ai_not_bound",
        message:
          'Add a "Workers AI" binding named `AI` in Pages → Settings → Functions → Bindings (see README).' },
      { status: 503 }
    )
  }

  const model = env.AI_MODEL?.trim() || DEFAULT_MODEL

  const contextText = sources
    .map((s, i) => `[${i + 1}] ${s.title} — ${s.heading}\n${s.excerpt}`)
    .join("\n\n")

  const chatMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `KNOWLEDGE BASE CONTEXT:\n\n${contextText}\n\nVisitor's question:\n${question}`,
    },
  ]

  const commonOptions = {
    temperature: 0.2,
    max_tokens: 400,
  }

  try {
    let answer = ""

    // 1) Chat-completions style (Workers AI models that accept `messages`).
    try {
      const result = await ai.run(model, { ...commonOptions, messages: chatMessages })
      if (typeof result?.response === "string" && result.response.trim()) {
        answer = result.response.trim()
      }
    } catch {
      /* fall through to prompt style below */
    }

    // 2) Text-generation style (the `prompt` shape Cloudflare's docs/example
    //    use for Llama — covers models that don't accept `messages`).
    if (!answer) {
      try {
        const promptText = chatMessages
          .map((m) => `${m.role.toUpperCase()}:\n${m.content}`)
          .join("\n\n")
        const result = await ai.run(model, { ...commonOptions, prompt: promptText })
        if (typeof result?.response === "string" && result.response.trim()) {
          answer = result.response.trim()
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return Response.json(
          { error: "workers_ai_error", message },
          { status: 502 }
        )
      }
    }

    if (!answer) {
      return Response.json({ error: "empty_answer" }, { status: 502 })
    }
    return Response.json({ answer, model })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json(
      { error: "workers_ai_error", message },
      { status: 502 }
    )
  }
}