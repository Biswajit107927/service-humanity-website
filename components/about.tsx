import Image from "next/image"
import {
  GraduationCap,
  HeartHandshake,
  Stethoscope,
  ShieldCheck,
  Music,
  Sprout,
} from "lucide-react"

const services = [
  {
    icon: GraduationCap,
    title: "Education",
    description:
      "Primary schooling within the foundation, with older children attending nearby government middle and high schools.",
  },
  {
    icon: HeartHandshake,
    title: "Care & Counseling",
    description:
      "A loving, family-like home for orphaned and destitute children, with counseling for the traumatized and abused.",
  },
  {
    icon: Music,
    title: "Arts & Sports",
    description:
      "Sports, music, dance and entertainment woven into the curriculum for wholesome, joyful growth.",
  },
  {
    icon: Stethoscope,
    title: "Health Check-ups",
    description:
      "Regular health check-ups for all children and staff, with records carefully maintained.",
  },
  {
    icon: ShieldCheck,
    title: "Transparency",
    description:
      "Registered under the JJ Act of 2000, reporting monthly to the district judge with full compliance.",
  },
  {
    icon: Sprout,
    title: "Community Awareness",
    description:
      "Women's awareness camps, environment drives, science exhibitions and youth programs for the wider community.",
  },
]

export function About() {
  return (
    <section id="about" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl">
            <Image
              src="/images/classroom.png"
              alt="A teacher helping young children with their lessons"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              About Us
            </span>
            <h2 className="mt-4 text-balance font-heading text-3xl font-semibold leading-tight text-foreground md:text-4xl">
              Raising children to stand on their own feet
            </h2>
            <div className="mt-6 space-y-5 text-pretty leading-relaxed text-muted-foreground">
              <p>
                The seedling of Service to Humanity Foundation was sown on 30th
                January 1981. Our objective is to rear orphaned and destitute
                children for a wholesome upbringing — developing a scientific
                approach to learning, free from non-scientific beliefs.
              </p>
              <p>
                Led by principal instructor Ms Hemanta — fondly called
                &ldquo;Ma&rdquo; — children are raised with patience, love and
                care, so that every child may grow into a confident, honest and
                responsible adult.
              </p>
            </div>
          </div>
        </div>

        <div id="work" className="mt-20 scroll-mt-24">
          <h3 className="text-center font-heading text-2xl font-semibold text-foreground md:text-3xl">
            What we do
          </h3>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <service.icon className="h-5 w-5" />
                </span>
                <h4 className="mt-4 font-heading text-lg font-semibold text-foreground">
                  {service.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
