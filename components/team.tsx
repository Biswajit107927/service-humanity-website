import { Users } from "lucide-react"

const teamMembers = [
  {
    name: "Anjan Dey",
    designation: "President",
    image: "/placeholder-user.jpg",
  },
  {
    name: "Col.Bijayananda Patnaik",
    designation: "Vice President",
    image: "/placeholder-user.jpg",
  },
  {
    name: "Pitambar Lenka",
    designation: "Secretary",
    image: "/placeholder-user.jpg",
  },
  {
    name: "Dillip Kumar Barik",
    designation: "Chief Functionary",
    image: "/placeholder-user.jpg",
  },
  {
    name: "Narendra Gope",
    designation: "Treasure",
    image: "/placeholder-user.jpg",
  },
  {
    name: "Hemanta Tandia",
    designation: "Superintendent",
    image: "/placeholder-user.jpg",
  }
]

export function Team() {
  return (
    <section id="team" className="border-t border-border/60 bg-muted/30 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Users className="h-3.5 w-3.5" />
            Our Team
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Meet the People Behind Our Mission
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Our dedicated team works tirelessly to bring positive change to communities across the region.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="group rounded-xl border border-border/60 bg-background p-6 text-center shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {member.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-primary">
                {member.designation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
