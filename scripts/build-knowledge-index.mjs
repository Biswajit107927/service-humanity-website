#!/usr/bin/env node
/**
 * Builds public/knowledge-base/index.json from the Markdown files in
 * knowledge-base/. This file is then served as a static asset and used by the
 * browser-side retrieval engine (BM25) to answer visitor questions.
 *
 * Run via:  pnpm kb:build
 * Auto-runs on: pnpm dev / pnpm build
 */

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, "..")
const KB_ROOT = path.join(PROJECT_ROOT, "knowledge-base")
const OUT_DIR = path.join(PROJECT_ROOT, "public", "knowledge-base")
const OUT_FILE = path.join(OUT_DIR, "index.json")

function parseFrontMatter(md) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(md)
  if (!match) return { title: "", tags: [], body: md.trim() }
  const fm = match[1]
  const titleMatch = /^title\s*:\s*["']?(.*?)["']?\s*$/m.exec(fm)
  const tagsMatch = /^tags\s*:\s*\[([\s\S]*?)\]\s*$/m.exec(fm)
  const tags = tagsMatch
    ? tagsMatch[1].split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
    : []
  return {
    title: titleMatch?.[1]?.trim() ?? "",
    tags,
    body: md.slice(match[0].length).trim(),
  }
}

function flatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
}

/** Split one markdown body into heading-based sections. */
function chunkBody(body, title, file) {
  const chunks = []
  let heading = title || "Overview"
  let buffer = []
  let inFence = false

  const flush = () => {
    const text = flatText(buffer.join(" "))
    if (text) {
      const slug =
        heading
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || "overview"
      chunks.push({
        id: `${file.replace(/\.[^.]+$/, "")}::${slug}`,
        file,
        title: title || file,
        heading,
        text,
        tags: [],
      })
    }
    buffer = []
  }

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue
    if (line.startsWith("```")) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    if (/^#{1,6}\s+/.test(line)) {
      flush()
      heading = line.replace(/^#{1,6}\s+/, "").trim()
      continue
    }
    buffer.push(line)
  }
  flush()
  return chunks
}

async function collectMarkdownFiles(dir) {
  const files = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return files
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await collectMarkdownFiles(full)))
    else if (entry.isFile() && /\.md$/i.test(entry.name)) files.push(full)
  }
  return files.sort()
}

async function main() {
  const files = await collectMarkdownFiles(KB_ROOT)
  const chunks = []
  for (const file of files) {
    if (/README\.md$/i.test(file)) continue // skip the instruction doc itself
    const raw = await readFile(file, "utf8").catch(() => null)
    if (raw === null) continue
    const { title, tags, body } = parseFrontMatter(raw)
    const fileLabel = path.relative(KB_ROOT, file)
    const fileChunks = chunkBody(body, title, fileLabel)
    for (const chunk of fileChunks) chunk.tags = tags
    chunks.push(...fileChunks)
  }

  await mkdir(OUT_DIR, { recursive: true })
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    chunks,
  }
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2), "utf8")

  const counts = {}
  for (const c of chunks) counts[c.file] = (counts[c.file] || 0) + 1
  const docCount = Object.keys(counts).length
  console.log(
    `✅ knowledge base index written → ${path.relative(PROJECT_ROOT, OUT_FILE)}`
  )
  console.log(`   ${chunks.length} sections from ${docCount} documents:`)
  for (const [file, n] of Object.entries(counts)) {
    console.log(`   - ${file} (${n} sections)`)
  }
}

main().catch((err) => {
  console.error("❌ Failed to build knowledge base index:", err)
  process.exit(1)
})