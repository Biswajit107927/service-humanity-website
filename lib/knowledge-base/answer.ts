/* Extractive answer engine
 * ----------------------------------------------------------------------------
 * Turns retrieved knowledge-base sections into a short, human-sounding answer
 * WITHOUT running an LLM. It selects the most relevant sentences from the top
 * ranked source and assembles a clean paragraph.
 *
 * This is intentionally tiny — a few KB of code and a few MB of memory at
 * most — so it is safe to run on every visitor's device, including low-end
 * phones.
 * ------------------------------------------------------------------------- */

import { knowledgeBaseSize, type KnowledgeSource } from "@/lib/knowledge-base/client"

interface AnswerResult {
  answer: string
  mode: "retrieval" | "fallback"
}

const GREETINGS = /^(hi+|hello|hey|namaste|good\s*(morning|afternoon|evening)|greetings)\b/i

function detectGreeting(raw: string): boolean {
  const q = raw.trim()
  if (!q) return false
  if (GREETINGS.test(q)) return true
  if (q.length < 25 && /\b(hi+|hello|hey|namaste)\b/i.test(q)) return true
  return false
}

function detectThanks(raw: string): boolean {
  return /^(thanks|thank you|thankyou|thx)\b/i.test(raw.trim())
}

/** Split retrieved text into individual sentences. */
function sentenceise(text: string): string[] {
  const parts = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“’])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  if (parts.length === 0) {
    const t = text.trim()
    return t ? [t] : []
  }
  return parts
}

function answerFromSource(
  question: string,
  source: KnowledgeSource
): AnswerResult {
  const sentences = sentenceise(source.excerpt)

  // 1) Prefer sentences containing question keywords.
  const keywords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 3 &&
        ![
          "what", "when", "where", "which", "who", "whose", "whom", "does",
          "would", "could", "should", "about", "there", "their", "these",
          "those", "would",
        ].includes(w)
    )

  let selected: string[] = sentences.filter((s) => {
    const lower = s.toLowerCase()
    return keywords.some((k) => lower.includes(k))
  })

  // 2) If none matched, take the first sentences of the chunk.
  if (selected.length === 0) selected = sentences.slice(0, 2)

  // 3) Cap length to roughly 360 characters.
  const trimmed: string[] = []
  let total = 0
  for (const s of selected) {
    if (total + s.length > 360) break
    trimmed.push(s)
    total += s.length + 1
  }

  const body = trimmed.join(" ")
  return {
    answer: body,
    mode: "retrieval" as const,
  }
}

// Prefer sections whose heading/title matches the question keywords (so "who is
// the founder?" lands on the founder section rather than a generic team section).
function orderSourcesByRelevance(
  question: string,
  sources: KnowledgeSource[]
): KnowledgeSource[] {
  const tokens = new Set(
    question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, " ")
      .split(/\s+/)
      .filter((t) => t.length > 3)
  )
  if (tokens.size ===  ​0) return sources

  const score = (s: KnowledgeSource): number => {
    let sc =  ​0
    const heading = s.heading.toLowerCase()
    const title = s.title.toLowerCase()
    for (const t of tokens) {
      const word = new RegExp(`\\b${t}`, "i")
      if (word.test(s.heading)) sc +=​ 3
      else if (heading.includes(t)) sc +=​ 2
      if (word.test(s.title)) sc +=​ ​1
    }
    return sc
  }
  return [...sources].sort((a, b) => score(b) - score(a))
}

export async function buildAnswer(
  question: string,
  sources: KnowledgeSource[]
): Promise<AnswerResult> {
  const trimmed = question.trim()

  if (detectThanks(trimmed)) {
    return {
      answer:
        "You're welcome! Is there anything else you'd like to know about the foundation?",
      mode: "fallback",
    }
  }

  if (detectGreeting(trimmed)) {
    return {
      answer:
        "Namaste 🙏 I'm the Service to Humanity assistant. " +
        "Ask me about the foundation and the children we support, our " +
        "programmes, donations, volunteering, certificates, our team, or how to get in touch.",
      mode: "fallback",
    }
  }

  if (sources.length === 0) {
    const size = await knowledgeBaseSize().catch(() => null)
    let hint = ""
    if (size && size.chunks === 0) {
      hint =
        " The knowledge base has not been published yet — add your first Markdown file and rebuild the site."
    }
    return {
      answer:
        "I couldn't find that in the information the foundation has published so far." +
        " Please try rephrasing, or contact the foundation directly via the website's Donate section." +
        hint,
      mode: "fallback",
    }
  }

  // Prefer sections whose heading/title matches the question keywords..
  const ordered = orderSourcesByRelevance(trimmed, sources)

  // Article / summary-style requests: compose a short structured brief from the
  // top sections instead of a single-sentence answer..
  if (/\b(write|article|essay|draft|compose|outline|blog|newsletter|summar|describe|advertis)\b/i.test(trimmed)) {
    const parts = ordered
      .slice(0, 3)
      .map((s) => `${s.heading}\n${s.excerpt}`)
    return {
      answer: parts.join("\n\n"),
      mode: "retrieval" as const,
    }
  }

  // Try the top source first; if the answer feels too thin, blend in source 2.
  const primary = answerFromSource(trimmed, ordered[0])
  let answer = primary.answer

  if (ordered.length > 1) {
    const second = answerFromSource(trimmed, ordered[1])
    const primarySentences = sentenceise(primary.answer)
    const extraSentences = sentenceise(second.answer)
    const seen = new Set(primarySentences)
    const additions = extraSentences.filter((s) => !seen.has(s)).slice(0, 1)

    if (additions.length > 0 && answer.length + additions[0].length < 420) {
      answer += " " + additions[0]
    }
  }

  return { answer, mode: "retrieval" as const }
}

/** Compose phrases like "About the foundation · Donations" from top titles. */
export function formatSourceLabels(sources: KnowledgeSource[]): string {
  const labels = sources.slice(0, 2).map((s) => s.title || s.heading)
  return labels.join(" · ")
}