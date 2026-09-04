/* Client-side knowledge-base retrieval
 * ----------------------------------------------------------------------------
 * Pure browser module: loads the pre-built index (public/knowledge-base/
 * index.json), ranks chunks with BM25 and returns the most relevant sections.
 * No Node.js APIs — safe for a fully static Next.js export.
 * ------------------------------------------------------------------------- */

export interface KnowledgeChunk {
  id: string
  file: string
  title: string
  heading: string
  text: string
  tags: string[]
}

export interface KnowledgeBaseIndex {
  version: number
  generatedAt: string
  chunks: KnowledgeChunk[]
}

export interface KnowledgeSource {
  title: string
  heading: string
  excerpt: string
  file: string
  score: number
}

/* ----------------------------------------------------------------------------
 * Tokeniser, stemmer, stop words + synonyms
 * ------------------------------------------------------------------------- */

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "could", "did", "do",
  "does", "doing", "down", "during", "each", "few", "for", "from", "further",
  "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
  "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its",
  "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not",
  "now", "of", "off", "on", "once", "only", "or", "other", "our", "ours",
  "ourselves", "out", "over", "own", "same", "she", "should", "so", "some",
  "such", "than", "that", "the", "their", "theirs", "them", "themselves",
  "then", "there", "these", "they", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "we", "were", "what", "when",
  "where", "which", "while", "who", "whom", "why", "will", "with", "would",
  "you", "your", "yours", "yourself", "yourselves", "shall", "may", "might",
  "must", "us", "ours", "please", "also", "else", "via", "per", "get", "got",
  "make", "like", "want", "know", "think", "would", "could",
])

/** Map well-known wording to canonical knowledge-base vocabulary. */
const SYNONYMS: Record<string, string[]> = {
  ngo: ["non", "profit", "organisation"],
  nonprofit: ["non", "profit", "organisation"],
  society: ["foundation"],
  kids: ["child", "children"],
  kid: ["child", "children"],
  child: ["children"],
  sponsor: ["sponsoring", "donate", "donation"],
  donate: ["donation", "support", "giving"],
  donates: ["donation", "support", "giving"],
  donation: ["donate", "support", "giving"],
  volunteer: ["volunteering"],
  volunteers: ["volunteering"],
  team: ["founder", "trustees", "people", "governance"],
  school: ["education", "tuition", "books", "students"],
  legal: ["registration", "registered", "certificate", "compliance"],
  contact: ["website", "reach", "email", "phone", "contacting"],
  help: ["support", "donate", "volunteer"],
  organization: ["organisation"],
}

function stem(word: string): string {
  let w = word
  if (w.endsWith("ies") && w.length > 4) w = `${w.slice(0, -3)}y`
  else if (w.endsWith("ing") && w.length > 5) w = w.slice(0, -3)
  else if (w.endsWith("ed") && w.length > 4) w = w.slice(0, -2)
  else if (w.endsWith("ly") && w.length > 4) w = w.slice(0, -2)
  else if (w.endsWith("es") && w.length > 4) w = w.slice(0, -2)
  else if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3)
    w = w.slice(0, -1)
  return w
}

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, " ")
    .split(/[\s-]+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
    .map(stem)
}

function tokeniseQuery(question: string): Map<string, number> {
  const expanded = new Map<string, number>()
  const add = (term: string, weight: number) => {
    const key = stem(term)
    expanded.set(key, Math.max(weight, expanded.get(key) ?? 0))
  }
  const rawTokens = question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, " ")
    .split(/[\s-]+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))

  for (const token of rawTokens) {
    add(stem(token), 1)
    const synonyms = SYNONYMS[token]
    if (synonyms) for (const syn of synonyms) add(stem(syn), 0.5)
  }
  return expanded
}

/* ----------------------------------------------------------------------------
 * Index loading (with cache)
 * ------------------------------------------------------------------------- */

let indexCache: KnowledgeBaseIndex | null = null
let indexPromise: Promise<KnowledgeBaseIndex> | null = null

export async function loadKnowledgeIndex(): Promise<KnowledgeBaseIndex> {
  if (indexCache) return indexCache
  if (!indexPromise) {
    indexPromise = fetch("/knowledge-base/index.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load index (${res.status})`)
        return res.json() as Promise<KnowledgeBaseIndex>
      })
      .then((data) => {
        indexCache = data
        return data
      })
  }
  return indexPromise
}

export async function knowledgeBaseSize(): Promise<{
  chunks: number
  files: string[]
}> {
  const index = await loadKnowledgeIndex()
  return {
    chunks: index.chunks.length,
    files: [...new Set(index.chunks.map((c) => c.file))],
  }
}

/* ----------------------------------------------------------------------------
 * BM25 ranking
 * ------------------------------------------------------------------------- */

interface RankedChunk {
  chunk: KnowledgeChunk
  score: number
}

function rankChunks(
  chunks: KnowledgeChunk[],
  queryTokens: Map<string, number>,
  limit: number
): RankedChunk[] {
  const docCount = chunks.length || 1
  const avgDocLen =
    chunks.reduce(
      (sum, c) => sum + tokenise(`${c.heading} ${c.text}`).length,
      0
    ) /
      docCount || 1

  const documentFrequency = new Map<string, number>()
  for (const chunk of chunks) {
    const seen = new Set(
      tokenise(`${chunk.title} ${chunk.tags.join(" ")} ${chunk.heading} ${chunk.text}`)
    )
    for (const term of seen) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1)
    }
  }

  const idf = new Map<string, number>()
  for (const [term, df] of documentFrequency) {
    idf.set(term, Math.log(1 + (docCount - df + 0.5) / (df + 0.5)))
  }

  const k1 = 1.5
  const b = 0.75

  const scored: RankedChunk[] = []
  for (const chunk of chunks) {
    const searchable = tokenise(
      `${chunk.title} ${chunk.tags.join(" ")} ${chunk.heading} ${chunk.text}`
    )
    const docLenNorm = 1 - b + (b * searchable.length) / avgDocLen

    const tf = new Map<string, number>()
    for (const term of searchable) tf.set(term, (tf.get(term) ?? 0) + 1)

    let score = 0
    for (const [term, weight] of queryTokens) {
      const termTf = tf.get(term) ?? 0
      const termIdf = idf.get(term) ?? 0
      if (termTf === 0 || termIdf === 0) continue
      score +=
        weight * termIdf * ((termTf * (k1 + 1)) / (termTf + k1 * docLenNorm))
    }
    if (score > 0) scored.push({ chunk, score })
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit)
}

/* ----------------------------------------------------------------------------
 * Public search API (used from browser components)
 * ------------------------------------------------------------------------- */

export async function searchKnowledgeBase(
  question: string,
  limit = 4
): Promise<KnowledgeSource[]> {
  const trimmed = question.trim()
  if (!trimmed) return []
  const index = await loadKnowledgeIndex()
  const queryTokens = tokeniseQuery(trimmed)
  if (queryTokens.size === 0) return []

  return rankChunks(index.chunks, queryTokens, limit).map(({ chunk, score }) => ({
    title: chunk.title,
    heading: chunk.heading,
    excerpt: chunk.text,
    file: chunk.file,
    score: Math.round(score * 1000) / 1000,
  }))
}