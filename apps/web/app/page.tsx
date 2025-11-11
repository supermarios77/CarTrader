import Link from "next/link"
import {
  Car,
  Gauge,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Fuel,
  BadgeCheck,
} from "lucide-react"

import { HeroSearch } from "@/components/home/hero-search"
import { ListingCard } from "@/components/home/listing-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const highlights = [
  {
    title: "Verified sellers",
    description:
      "Every listing passes identity & fraud checks so buyers know exactly who they’re dealing with.",
    icon: ShieldCheck,
  },
  {
    title: "Smart search",
    description:
      "Filter by budget, mileage, ownership history, and more. Get instant alerts as new matches land.",
    icon: Gauge,
  },
  {
    title: "Checkout handled",
    description:
      "Reserve your ride, finalize payment, and schedule delivery — all with one guided flow.",
    icon: Sparkles,
  },
]

const stats = [
  { label: "Active listings", value: "8,432" },
  { label: "Verified sellers", value: "3,021" },
  { label: "Average delivery", value: "3 days" },
]

const categories = [
  { label: "Used Cars", icon: Car },
  { label: "New Cars", icon: Sparkles },
  { label: "SUVs & Crossovers", icon: Gauge },
  { label: "Hybrids & EVs", icon: Fuel },
  { label: "Bikes", icon: Smartphone },
  { label: "Commercial", icon: ShieldCheck },
]

const featuredListings = [
  {
    id: "toyota-yaris-2022",
    title: "2022 Toyota Yaris ATIV X CVT 1.5",
    price: "PKR 4,150,000",
    location: "Karachi",
    mileage: "18,200 km",
    fuelType: "Petrol",
    year: "2022",
    badges: ["featured", "verified"] as const,
    sellerType: "Dealer" as const,
  },
  {
    id: "kia-sportage-2021",
    title: "2021 KIA Sportage AWD Signature",
    price: "PKR 7,850,000",
    location: "Lahore",
    mileage: "24,500 km",
    fuelType: "Petrol",
    year: "2021",
    badges: ["featured"] as const,
    sellerType: "Dealer" as const,
  },
  {
    id: "honda-city-2020",
    title: "2020 Honda City Aspire Prosmatec 1.5",
    price: "PKR 3,250,000",
    location: "Islamabad",
    mileage: "36,000 km",
    fuelType: "Petrol",
    year: "2020",
    badges: ["verified"] as const,
  },
  {
    id: "suzuki-alto-2022",
    title: "2022 Suzuki Alto VXL AGS",
    price: "PKR 2,330,000",
    location: "Rawalpindi",
    mileage: "9,100 km",
    fuelType: "Petrol",
    year: "2022",
    badges: undefined,
  },
]

const serviceHighlights = [
  {
    title: "Expert inspections",
    description:
      "Certified inspectors evaluate each point of your vehicle before listing. Get detailed reports and highlighted fixes.",
    icon: BadgeCheck,
  },
  {
    title: "Flexible financing",
    description:
      "Partnered banks and Islamic financing options with instant eligibility checks and digital payouts.",
    icon: Sparkles,
  },
  {
    title: "Secure checkout",
    description:
      "Escrow-style payments, reservation deposits, and dispute resolution baked into the orders workflow.",
    icon: ShieldCheck,
  },
]

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-20">
      <HeroSearch />

      <section className="container space-y-10">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              variant="outline"
              className="h-auto justify-start gap-3 rounded-2xl border-border/60 bg-background px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5"
            >
              <Icon className="size-5 text-primary" aria-hidden />
              <span className="text-sm font-medium">{label}</span>
            </Button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="outline" className="uppercase tracking-wide">
                  Featured this week
                </Badge>
                <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                  Spotlight listings vetted by our moderation team
                </h2>
              </div>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                View all
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredListings.slice(0, 2).map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          </div>
          <Card className="border-0 bg-muted/30">
            <CardContent className="flex h-full flex-col justify-between gap-6 p-5">
              <div className="space-y-3">
                <Badge variant="outline" className="uppercase tracking-wide">
                  Marketplace pulse
                </Badge>
                <h3 className="text-xl font-semibold">
                  Live activity across CarTrader
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start justify-between gap-4">
                    <span>Hyundai Tucson reserved in Islamabad</span>
                    <span>2 min ago</span>
                  </li>
                  <li className="flex items-start justify-between gap-4">
                    <span>Suzuki Alto VXL listed by verified seller</span>
                    <span>8 min ago</span>
                  </li>
                  <li className="flex items-start justify-between gap-4">
                    <span>
                      Buyer secured inspection slot for Honda City Aspire
                    </span>
                    <span>12 min ago</span>
                  </li>
                </ul>
              </div>
              <Separator />
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Insider metrics
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-border/60 bg-background p-4"
                    >
                      <p className="text-xl font-semibold">{stat.value}</p>
                      <p className="text-xs uppercase text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" className="w-full">
                  Explore analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredListings.slice(2).map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      </section>

      <section className="container space-y-12">
        <div className="max-w-2xl space-y-4">
          <Badge variant="secondary" className="w-fit uppercase tracking-wide">
            Built for confidence
          </Badge>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Everything serious buyers and sellers need, baked in.
          </h2>
          <p className="text-lg text-muted-foreground sm:text-xl">
            From secure escrow to instant notifications and moderation-ready
            tooling, the CarTrader stack mirrors the operational maturity you
            expect from a nationwide marketplace.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                <feature.icon className="size-5" aria-hidden />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container grid gap-10 rounded-2xl border border-border/60 bg-muted/30 px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Sellers get the runway they deserve.
          </h2>
          <p className="text-lg text-muted-foreground">
            Upload media to MinIO-backed storage, track moderation decisions,
            and stay synced with search indexing so every update lands
            everywhere it should.
          </p>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Sparkles className="mt-1 size-4 text-primary" />
              <span>
                Guided listing flows with validation powered by NestJS + Zod,
                backed by Prisma migrations.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Smartphone className="mt-1 size-4 text-primary" />
              <span>
                Presigned uploads direct to MinIO, optimized for photo-heavy
                vehicle listings.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-1 size-4 text-primary" />
              <span>
                Moderation dashboard with audit logs, suspension workflows, and
                instant OpenSearch sync.
              </span>
            </li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/seller">Access seller cockpit</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/docs">View technical docs</Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-background p-6">
          <h3 className="text-lg font-semibold">Operational snapshot</h3>
          <Separator />
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Real-time notifications
              </p>
              <p className="text-sm text-muted-foreground">
                BullMQ + Redis queue keeps OTP, email, and webhook traffic
                flowing while workers autoscale.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Observability
              </p>
              <p className="text-sm text-muted-foreground">
                OpenTelemetry traces, Prometheus metrics, and Loki logs wire
                directly into Grafana dashboards.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Mock payments
              </p>
              <p className="text-sm text-muted-foreground">
                Switch providers without rewiring orders. The mock service
                mirrors intent life cycles for local ops.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container grid gap-8 rounded-2xl border border-border/60 bg-card px-6 py-10 sm:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold">
              Services designed for everyday drivers.
            </h3>
            <p className="text-sm text-muted-foreground">
              From expert inspections to secure checkout, every step is tuned
              for confidence.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/support">Talk to support</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {serviceHighlights.map((service) => (
            <Card key={service.title} className="border border-border/60 bg-background">
              <CardContent className="space-y-3 p-6">
                <service.icon className="size-5 text-primary" aria-hidden />
                <h4 className="text-lg font-semibold">{service.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 text-center shadow-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <Badge variant="secondary" className="mx-auto w-fit uppercase tracking-wide">
            Ready to list?
          </Badge>
          <h3 className="text-3xl font-semibold sm:text-4xl">
            Sell your car in days, not weeks.
          </h3>
          <p className="text-base text-muted-foreground sm:text-lg">
            Publish an inspection-backed listing, screen buyers with secure OTP
            logins, and use our orders flow to handle payments with ease.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/sell">List your vehicle</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/support/request-call">Request a concierge call</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
