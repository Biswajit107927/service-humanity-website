import { Heart, MapPin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Heart className="h-4 w-4" />
              </span>
              <span className="font-heading text-base font-semibold text-foreground">
                Service to Humanity Foundation
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Establishing peace and harmony through the welfare and education
              of orphaned and deprived children across Odisha since 1981.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">
              Explore
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: "Our Founder", href: "#founder" },
                { label: "About Us", href: "#about" },
                { label: "Our Work", href: "#work" },
                { label: "Stories", href: "#testimonials" },
                { label: "Donate", href: "#donate" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">
              Visit Us
            </h4>
            <p className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Jagda, PO–Jhirpani,
                <br />
                Rourkela–769042, Odisha, India
              </span>
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Service to Humanity Foundation. A
          registered charitable organization.
        </div>
      </div>
    </footer>
  )
}
