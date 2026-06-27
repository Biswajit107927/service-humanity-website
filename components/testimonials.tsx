import { Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "The Service to Humanity Foundation is one of a kind, serving the most deprived and vulnerable children amongst the local tribal community. If one were to witness Dr Acharya with the orphan children, you can see the warmth and genuine love in their interactions. Ms Hemanta, addressed as 'Ma', truly treats every child like her own.",
    author: "Dr Ranjan Dey, M.D.",
    role: "St. Louis, Missouri, USA",
  },
  {
    quote:
      "It's been a wonderful journey with the inmates of the Ashram, and we hope to continue it well into the future. The way the children are trained to be self-reliant, courteous and full of etiquette is commendable. The sacrifice of Prof. S. Acharya is to be seen to be believed.",
    author: "Sanjay Tripathy & Sangita Banerjee",
    role: "Supporters of the Foundation",
  },
]

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-accent py-20 text-accent-foreground md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-foreground/70">
            In Their Words
          </span>
          <h2 className="mt-4 text-balance font-heading text-3xl font-semibold leading-tight md:text-4xl">
            Stories from those who have visited
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <figure
              key={t.author}
              className="flex flex-col rounded-2xl border border-accent-foreground/15 bg-accent-foreground/5 p-7"
            >
              <Quote className="h-8 w-8 text-accent-foreground/40" />
              <blockquote className="mt-4 flex-1 text-pretty leading-relaxed text-accent-foreground/90">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-accent-foreground/15 pt-4">
                <div className="font-heading font-semibold">{t.author}</div>
                <div className="text-sm text-accent-foreground/70">
                  {t.role}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
