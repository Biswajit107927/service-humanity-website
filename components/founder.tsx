import Image from "next/image"

const orphanages = [
  "Sisu Ashram, Jagatsingpur",
  "Rourkela Sisu Bhavan",
  "Manaba Seva Sishu Sadan, Sundargarh",
  "Manaba Seva Kanya Ashram, Bhadrak",
  "Ram Rukmani Sisu Sadan, Sariabar Patana",
  "Service to Humanity Foundation, Jagda, Rourkela",
]

export function Founder() {
  return (
    <section id="founder" className="bg-secondary py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 md:grid-cols-2 md:gap-16 md:px-6">
        <div className="md:sticky md:top-28">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src="/images/founder.png"
              alt="Dr Sashikanta Acharya, founder of the foundation"
              fill
              className="object-cover"
            />
          </div>
          <div className="mt-5">
            <h3 className="font-heading text-xl font-semibold text-foreground">
              Dr Sashikanta Acharya
            </h3>
            <p className="text-sm text-muted-foreground">
              Founder &amp; President · PhD, Mechanical Engineering, TU Berlin
            </p>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Our Founder
          </span>
          <h2 className="mt-4 text-balance font-heading text-3xl font-semibold leading-tight text-foreground md:text-4xl">
            A lifetime of selfless devotion
          </h2>
          <div className="mt-6 space-y-5 text-pretty leading-relaxed text-muted-foreground">
            <p>
              A visionary with exemplary selfless devotion, Dr Acharya has
              illuminated the lives of poor, orphaned and destitute children. He
              earned his PhD in mechanical engineering from the Technical
              University of Berlin, Germany.
            </p>
            <p>
              Though he could have built a fortune for himself, he chose instead
              to forgo the material world and devote his entire life to the
              welfare of the most deprived children of our community — teaching
              them the value of science and the principles of living free from
              religious, gender, political and caste bias.
            </p>
            <p>
              Now 84 years old, he continues to conduct women&apos;s awareness
              camps, health programs, science exhibitions, youth camps,
              environment awareness drives and a creche for the babies of
              working women.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <h4 className="font-heading text-lg font-semibold text-foreground">
              Six orphanages established across Odisha
            </h4>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {orphanages.map((name) => (
                <li
                  key={name}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
