const stats = [
  { value: "1981", label: "Serving since" },
  { value: "6", label: "Orphanages in Odisha" },
  { value: "50+", label: "Children cared for today" },
  { value: "80G", label: "Tax-exempt donations" },
]

export function Mission() {
  return (
    <section className="border-b border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          Our Mission
        </span>
        <h2 className="mt-4 text-balance font-heading text-3xl font-semibold leading-tight text-foreground md:text-4xl">
          Building peace and harmony through education, care and compassion
        </h2>
        <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
          Service to Humanity Foundation works toward the educational, social,
          economic and scientific development of underprivileged communities.
          Through welfare activities and the establishment of caring
          institutions, our goal is to nurture feelings of universal
          brotherhood and sisterhood across society.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border px-4 md:grid-cols-4 md:px-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card px-6 py-8 text-center"
          >
            <div className="font-heading text-3xl font-semibold text-primary md:text-4xl">
              {stat.value}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
