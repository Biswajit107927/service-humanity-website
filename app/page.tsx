import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { Mission } from "@/components/mission"
import { Founder } from "@/components/founder"
import { About } from "@/components/about"
import { Testimonials } from "@/components/testimonials"
import { Donate } from "@/components/donate"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <Mission />
      <Founder />
      <About />
      <Testimonials />
      <Donate />
      <SiteFooter />
    </main>
  )
}
