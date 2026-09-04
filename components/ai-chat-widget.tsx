"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bot,
  Heart,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react"
import {
  searchKnowledgeBase,
  type KnowledgeSource,
} from "@/lib/knowledge-base/client"
import { buildAnswer, formatSourceLabels } from "@/lib/knowledge-base/answer"
import { completeWithLocalModel } from "@/lib/ai/ollama"

interface UiMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: KnowledgeSource[]
  mode?: "ai" | "knowledge"
}

const WELCOME: UiMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Namaste 🙏 I'm the Service to Humanity assistant. Ask me about the foundation, the children we support, our programmes, donations, volunteering, certificates, our team or how to get in touch.",
}

const SUGGESTIONS = [
  "Who does the foundation support?",
  "How can I donate?",
  "Can I volunteer?",
  "What legal certificates are published?",
]

function buildId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function AiChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<UiMessage[]>([WELCOME])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading, open])

  async function send(text: string) {
    const question = text.trim()
    if (!question || loading) return
    setInput("")
    setLoading(true)

    const userMessage: UiMessage = {
      id: buildId(),
      role: "user",
      content: question.slice(0, 1000),
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      // 1) Retrieve relevant knowledge-base sections (in the browser).
      const sources = await searchKnowledgeBase(question, 5)

      let answer: string | null = null
      let mode: "ai" | "knowledge" | undefined = undefined

      // 2) Production: Cloudflare Pages Function → Workers AI−(works for
      //    every visitor as soon as the site is live on Cloudflare Pages).
      if (!answer && sources.length > 0) {
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question,
              sources: sources.slice(0, 4).map(({ title, heading, excerpt }) => ({
                title,
                heading,
                excerpt,
              })),
            }),
          })
          if (res.ok) {
            const data = (await res.json()) as { answer?: string }
            if (data.answer) {
              answer = data.answer
              mode = "ai"
            }
          }
        } catch {
          /* local dev has no /api/chat route — fall through */
        }
      }

      // 3) Local dev bonus: Ollama on the same machine as the visitor..
      if (!answer && sources.length > 0) {
        const local = await completeWithLocalModel(question, sources)
        if (local) {
          answer = local
          mode = "ai"
        }
      }

      // 4) Always-available extractive answer engine.
//
      const { answer: knowledgeAnswer } = await buildAnswer(question, sources)
      const finalAnswer = answer ?? knowledgeAnswer
      const finalMode = mode ?? ("knowledge" as const)

      setMessages((prev) => [
        ...prev,
        {
          id: buildId(),
          role: "assistant",
          content: finalAnswer,
          mode: finalMode,
          sources: sources.length > 0 ? sources : undefined,
        },
      ])
    } catch {
      const fallback: UiMessage = {
        id: buildId(),
        role: "assistant",
        content:
          "I could not search the knowledge base right now. Please try again — or contact the foundation directly on the website.",
      }
      setMessages((prev) => [...prev, fallback])
    } finally {
      setLoading(false)
    }
  }
return (
    <>
      {/* Floating launch button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className={`fixed bottom-4 right-4 z-[70] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors md:bottom-6 md:right-6 md:h-16 md:w-16 ${
          open
            ? "bg-muted text-foreground hover:bg-muted/80"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-[70] flex max-h-[calc(100dvh-6rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:bottom-24 md:right-6 md:w-96">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-card-foreground">
                Humanity Assistant
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                Answers from our knowledge base
              </p>
            </div>
            <span className="hidden rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:inline-flex">
              AI
            </span>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {msg.mode === "ai" ? (
                      <Sparkles className="h-3.5 w-3.5" />
                    ) : (
                      <Heart className="h-3.5 w-3.5" />
                    )}
                  </span>
                )}
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-card-foreground"
                  }`}
                >
                  {msg.content}
                  {msg.sources && msg.sources.length > 0 && (
                    <span className="mt-2 block border-t border-border/60 pt-1.5 text-[11px] leading-snug text-muted-foreground">
                      Sources: {formatSourceLabels(msg.sources)}
                    </span>
                  )}
                </div>
              </div>
))}
{loading && (
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Heart className="h-3.5 w-3.5" />
                </span>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking…</span>
                </div>
              </div>
            )}

            {messages.length <= 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border bg-background p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send(input)
                  }
                }}
                rows={1}
                placeholder="Ask about the foundation…"
                className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Ask a question"
              />
              <button
                type="button"
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}