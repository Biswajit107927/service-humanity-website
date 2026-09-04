# 🙏 Service to Humanity Foundation — Website

**Live:** [service-humanity-website.pages.dev](https://service-humanity-website.pages.dev/)

A modern, responsive website for **Service to Humanity Foundation** — a registered charitable organization in Odisha, India that has sheltered and educated orphaned children since 1981.

## ✨ Features

- Fully responsive single-page design
- Smooth scroll navigation
- Donation section with bank transfer details
- Testimonials carousel
- **🤖 AI assistant chat widget** — answers visitor questions from your own
  `knowledge-base/` Markdown files using Retrieval-Augmented Generation (RAG)
- Optimized for performance (Lighthouse 95+)
- Deployed on Cloudflare Pages with automatic CI/CD

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Hosting | Cloudflare Pages |
| CI/CD | Cloudflare automatic deploys on push |

## 🚀 Run Locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📂 Structure

```
├── app/                    # Next.js app router pages
├── components/             # Reusable UI components (incl. AI chat widget)
├── knowledge-base/         # 📚 Your AI knowledge base (Markdown files)
├── lib/
│   ├── ai/                 # Optional local Ollama enrichment (dev browsing only)
│   └── knowledge-base/     # Client BM25 retrieval + extractive answer engine
├── public/                 # Static assets (images, knowledge-base index.json)
└── next.config.mjs         # Next.js configuration
```

## 🤖 AI Assistant (Knowledge-Base Chat)

The site ships with a floating chatbot ("Humanity Assistant") that answers
visitors using **only** the content you publish in
[`knowledge-base/`](knowledge-base/README.md).

### How it works

1. On build (`pnpm dev` / `pnpm build` / `pnpm kb:build`),a small script
   converts every Markdown file in `knowledge-base/` into a compact JSON
   index at `public/knowledge-base/index.json`.
2. When a visitor asks, the widget ranks the indexed sections with a pure-
   browser **BM25** search engine (no external services, no embeddings API>.
3. An **extractive answer engine** selects the most relevant sentences from your
   own content and answers from them — like a site search, it always works,
   works offline, and never invents facts..
4. **Conversational AI phrasing** is done server-side through a tiny
   Cloudflare Pages Function (`functions/api/chat`) powered by **Workers AI**
   — open-source Llama models hosted by Cloudflare (free tier, no API keys
   to manage).This works for **every visitor,everywhere** once the binding is
   added (step below). If no function is available (e.g. traditional local
   dev),the widget falls back in order: ① your local Ollama (dev-only,
   same machine)→ ② the always-available extractive engine..

### Publishing information

1. Add (or edit) a Markdown file in `knowledge-base/`
   (see `knowledge-base/README.md` for the format).
2. Run `pnpm kb:build` (or just `pnpm dev` / `pnpm build`) to refresh the
   index. That's it — the chatbot now knows the new content..

### Optional: local Ollama enrichment for self-hosting

Only needed if you want conversational AI phrasing while developing locally:

```bash
brew install ollama                      # https://ollama.com
ollama serve &
ollama pull llama3.2:3b
pnpm dev
```

The widget detects the best installed model automatically. Overrides (optional):
set `localStorage.kb-ai-model` / `localStorage.kb-ai-base-url` (see `.env.example`).
If the browser can't reach Ollama (CORS), restart it with
`OLLAMA_ORIGINS="http://localhost:3000,http://127.0.0.1:3000" ollama serve`.

> The public site works with zero infrastructure — the extractive engine answers
> every visitor from your knowledge base. Conversational AI phrasing for
> visitors is optional (Workers AI, free tier); for your local browsing you
> may instead use Ollama (below�).

### Production AI phrasing — every visitor, free, Cloudflare Workers AI

Open-source models (e.g. **Llama 3.3 70B**)hosted by Cloudflare with a
free tier — no API keys to manage and no payment needed on the free tier (check
current Cloudflare terms).

One-timoh setup (dashboard, ~2 minutes):

1. Cloudflare dashboard → your Pages project → **Settings → Functions →**
   **Bindings**.
2. **Add binding** → *Workers AI* → name it **`AI`** (exact name,any
   account),save.
3. (Optional)Set an environment variable **`AI_MODEL`** to change the model
   (default: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`).

That's it — deployed visitors now get conversational AI answers from your
knowledge base,, anywhere in the world. If the binding is missing, the widget
politely falls back to local/extractive answers — the site never breaks..

The function lives at `functions/api/chat.ts` — it receives only the question
and the top retrieved sections (RAG already happened in the visitor's browser,
phrases the answer strictly from those sections,and returns it. Cloudflare
deploys it automatically next to your static files. No extra build step.

### How answers are produced (retrieval-augmented)



1. Your question is matched against `knowledge-base/` using a self-contained
   **BM25** search engine (no external services, no embeddings API).
2. The top-ranked sections are selected as evidence (and shown as sources..
3. The answer is phrased **only from that evidence**: on Cloudflare Pages,
   the `functions/api/chat` function (Workers AI) does the phrasing server-side;
   in local dev, your own browser may reach a local Ollama; otherwise the
   extractive engine answers from the same evidence. Facts always come from
   your knowledge base alone..
## 🌐 About the Foundation

Service to Humanity Foundation was established on January 30, 1981 by Dr. Sashikanta Acharya (PhD, TU Berlin). The foundation operates 6 orphanages across Odisha, currently caring for 50+ children. It is registered under the JJ Act of 2000 and holds 80G tax-exempt status.

## 📄 License

Built pro bono for the foundation. All rights reserved by Service to Humanity Foundation.
