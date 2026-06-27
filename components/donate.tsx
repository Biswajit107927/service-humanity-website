import Image from "next/image"
import { Check } from "lucide-react"

const bankDetails = [
  { label: "Account Name", value: "Service To Humanity Foundation" },
  { label: "Bank", value: "State Bank of India, Jagda Branch" },
  { label: "Account Number", value: "32520815914" },
  { label: "IFSC Code", value: "SBIN0014469" },
]

const impact = [
  "₹2,150 covers a child's basic needs for one month",
  "Funds digitized learning, books and uniforms",
  "Supports sporting gear, instruments and vocational training",
]

export function Donate() {
  return (
    <section id="donate" className="relative overflow-hidden bg-foreground py-20 md:py-28">
      <div className="absolute inset-0 opacity-20">
        <Image
          src="/images/community.png"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-foreground/70" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2 md:gap-16 md:px-6">
        <div className="text-background">
          <span className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
            80G Tax Exempt
          </span>
          <h2 className="mt-5 text-balance font-heading text-3xl font-semibold leading-tight md:text-4xl">
            Your gift keeps a child sheltered, fed and learning
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-background/80">
            The foundation runs entirely on public donations. Every
            contribution directly supports the care, education and growth of
            children who have nowhere else to turn.
          </p>
          <ul className="mt-7 space-y-3">
            {impact.map((item) => (
              <li key={item} className="flex items-start gap-3 text-background/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-7 shadow-xl md:p-8">
          <h3 className="font-heading text-xl font-semibold text-foreground">
            Donate via Bank Transfer
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Donations are eligible for 80G tax exemption.
          </p>
          <dl className="mt-6 divide-y divide-border">
            {bankDetails.map((detail) => (
              <div
                key={detail.label}
                className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <dt className="text-sm text-muted-foreground">
                  {detail.label}
                </dt>
                <dd className="font-medium text-foreground sm:text-right">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 rounded-xl bg-secondary p-4 text-xs leading-relaxed text-secondary-foreground">
            Registered as a charitable organization under the Income Tax Act
            (rule 17A/11AA/2C). PO–Jhirpani, Rourkela–769042, Odisha, India.
          </p>
        </div>
      </div>
    </section>
  )
}
