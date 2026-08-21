import { FileText, Download } from "lucide-react"

const certificates = [
  {
    title: "Form 10AB Approval Order - Section 80G(5)",
    year: "2026",
    description:
      "Registration approval granted by CIT (Exemption), Hyderabad under clause (ii) of 2nd proviso to Sec.80G(5) for assessment years 2027-28 to 2031-32.",
    image: "/certificates/form-10ab-preview.svg",
    downloadUrl: "/certificates/form-10ab-approval-order-2026.pdf",
  },
  {
    title: "CSR-1 Registration Certificate",
    year: "2021",
    description:
      "Registration under CSR-1 for eligibility to receive Corporate Social Responsibility funds.",
    image: "/certificates/csr1-preview.svg",
    downloadUrl: "/certificates/CSR_Documents.pdf",
  },
]

export function Recognition() {
  return (
    <section id="recognition" className="border-t border-border/60 bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <FileText className="h-3.5 w-3.5" />
            Certificates
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Our Certificates
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Official registrations and certifications that validate our commitment to transparency and social impact.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert.title}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="mb-2 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {cert.year}
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground">
                  {cert.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {cert.description}
                </p>
                <a
                  href={cert.downloadUrl}
                  download
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <Download className="h-4 w-4" />
                  Download Certificate
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
