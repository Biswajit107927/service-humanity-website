# Knowledge Base

This is the **AI knowledge base** for the Service to Humanity Foundation website.

Everything under this directory is used by the built-in chatbot to answer visitor
questions using **Retrieval-Augmented Generation (RAG)**.

## How to publish information

1. Create a new Markdown (`.md`) file in this folder (or a sub-folder).
2. Start the file with optional YAML front matter:
   ```md
   ---
   title: "Donation Options"
   tags: [donate, giving, support]
   ---
   ```
3. Use Markdown headings (`##`) to structure sections. Each heading becomes a
   searchable "chunk" that the bot retrieves.
4. Keep facts clear, accurate and self-contained.
5. Save the file, then run `pnpm kb:build` (or start the site with `pnpm dev` /
   `pnpm build` — these rebuild the index automatically). The chatbot now
   knows the new content..

## Rules of thumb

- Only use files written by you/your organisation. The bot answers **only** from
  the content you publish here.
- Avoid very large single blocks of text — split them into short sections.
- To remove a document from the bot, simply delete the file.

## Example

See `01-about-foundation.md` in this folder for a real example.

## Technical notes

- Supported format: Markdown (`.md`).
- Sub-directories are supported and scanned recursively.
- The retrieval layer runs entirely on your own infrastructure with no external
  API — open source and free.