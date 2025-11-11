import Link from "next/link"
import { Gauge, ShieldCheck, Sparkles, Smartphone } from "lucide-react"

import { HeroSearch } from "@/components/home/hero-search"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-20">
      <HeroSearch />

      <section className="container">
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
              <Card className="border border-primary/30 bg-primary/5">
                <CardContent className="space-y-3 p-5">
                  <Skeleton className="aspect-[16/10] rounded-lg" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      2022 Toyota Yaris ATIV X CVT
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      PKR 4,150,000 · 18,200 km · Karachi
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-1 text-primary">
                      Inspected
                    </span>
                    <span>Verified Seller</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-border/60">
                <CardContent className="space-y-3 p-5">
                  <Skeleton className="aspect-[16/10] rounded-lg" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      2021 KIA Sportage AWD Signature
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      PKR 7,850,000 · 24,500 km · Lahore
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-1 text-primary">
                      Featured
                    </span>
                    <span>Inspection booked</span>
                  </div>
                </CardContent>
              </Card>
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
            <h3 className="text-2xl font-semibold">Ready for launch day.</h3>
            <p className="text-sm text-muted-foreground">
              Health checks, smoke tests, runbooks, and backups are already in place.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/docs/operations">Explore runbooks</Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-primary/30 bg-primary/5">
            <CardContent className="space-y-3 p-6">
              <p className="text-sm font-medium text-primary">APIs</p>
              <p className="text-sm text-muted-foreground">
                Gateway proxies every service with JWT auth, rate limiting, and
                contract-tested DTOs.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="text-sm font-medium">Deploy</p>
              <p className="text-sm text-muted-foreground">
                Docker Compose spins the entire stack locally. GitHub Actions
                handles lint, test, and build.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="text-sm font-medium">Docs</p>
              <p className="text-sm text-muted-foreground">
                Comprehensive README suite, ADRs, and onboarding paths keep the
                team aligned.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="text-sm font-medium">Support</p>
              <p className="text-sm text-muted-foreground">
                Incident response playbooks, escalation paths, and DR plans are
                in place from day one.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
