import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-children.png"
          alt="Children studying together at the foundation"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/20" />
      </div>

      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-4 py-24 md:px-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-background/30 bg-background/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-background backdrop-blur-sm">
            A registered charitable foundation in Odisha, India
          </span>
          <h1 className="mt-6 text-balance font-heading text-4xl font-semibold leading-tight text-background sm:text-5xl md:text-6xl">
            Nurturing the most deprived children toward a brighter future
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-background/85">
            For over four decades, we have sheltered, taught and loved orphaned
            and destitute children — helping them grow into independent, honest
            and confident human beings.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#donate">
                Support a child
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-background/40 bg-background/10 text-background backdrop-blur-sm hover:bg-background/20 hover:text-background"
            >
              <a href="#about">Learn about our work</a>
            </Button>
          </div>
        </div>

        <blockquote className="mt-16 max-w-md border-l-2 border-primary/80 pl-5">
          <p className="font-heading text-lg italic leading-relaxed text-background">
            &ldquo;The meaning of life is to find your gift. The purpose is to
            give it away.&rdquo;
          </p>
          <footer className="mt-2 text-sm text-background/70">
            — Pablo Picasso
          </footer>
        </blockquote>
      </div>
    </section>
  )
}
