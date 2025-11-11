import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Building,
  Car,
  CarFront,
  Clock,
  Fuel,
  Gauge,
  MapPin,
  ShieldCheck,
  Sparkles,
  SquareKanban,
} from "lucide-react"

import { HeroSearch, type SearchTabConfig } from "@/components/home/hero-search"
import { HeroShowcase } from "@/components/home/hero-showcase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { siteConfig } from "@/config/site"

const searchTabs: SearchTabConfig[] = [
  {
    id: "used-cars",
    label: "Used cars",
    description: "Browse inspected and verified listings from across Pakistan.",
    ctaLabel: "Search used cars",
    fields: [
      {
        id: "keywords",
        type: "input",
        label: "Keywords",
        placeholder: "e.g. Civic, Corolla, Alto",
      },
      {
        id: "city",
        type: "select",
        label: "City",
        placeholder: "Any city",
        options: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar"],
      },
      {
        id: "make",
        type: "select",
        label: "Make",
        placeholder: "All makes",
        options: [
          "Toyota",
          "Honda",
          "Suzuki",
          "Hyundai",
          "Kia",
          "Changan",
        ],
      },
      {
        id: "budget",
        type: "slider",
        label: "Budget (PKR lacs)",
        min: 5,
        max: 300,
        step: 5,
        unit: "PKR ",
      },
    ],
  },
  {
    id: "new-cars",
    label: "New cars",
    description:
      "Compare pricing, specs, and delivery timelines for the latest models.",
    ctaLabel: "Explore new cars",
    fields: [
      {
        id: "brand",
        type: "select",
        label: "Brand",
        placeholder: "Select brand",
        options: ["Toyota", "Honda", "Hyundai", "Kia", "MG", "Peugeot"],
      },
      {
        id: "bodyType",
        type: "select",
        label: "Body type",
        placeholder: "Any body type",
        options: ["Sedan", "Hatchback", "SUV", "Crossover", "MPV"],
      },
      {
        id: "delivery",
        type: "select",
        label: "Delivery timeline",
        placeholder: "Under 30 days",
        options: ["Immediate", "Within 30 days", "45+ days"],
      },
      {
        id: "location",
        type: "select",
        label: "Dealer city",
        placeholder: "All Pakistan",
        options: ["Karachi", "Lahore", "Islamabad", "Multan", "Faisalabad"],
      },
    ],
  },
  {
    id: "bikes",
    label: "Bikes",
    description: "Find reliable scooties and bikes ready for everyday rides.",
    ctaLabel: "Search bikes",
    fields: [
      {
        id: "bikeKeywords",
        type: "input",
        label: "Keywords",
        placeholder: "e.g. CG 125, GR 150",
      },
      {
        id: "bikeCity",
        type: "select",
        label: "City",
        placeholder: "Any city",
        options: ["Karachi", "Lahore", "Islamabad", "Gujranwala", "Quetta"],
      },
      {
        id: "engine",
        type: "select",
        label: "Engine capacity",
        placeholder: "All engines",
        options: ["70cc", "100cc", "125cc", "150cc", "200cc+"],
      },
      {
        id: "condition",
        type: "select",
        label: "Condition",
        placeholder: "Both",
        options: ["New", "Used", "Showroom", "Certified"],
      },
    ],
  },
]

const quickActions = [
  {
    title: "Sell your car in days",
    description:
      "List with verified photos, share history, and reach serious buyers instantly.",
    cta: "Start listing",
    href: "/sell",
    icon: CarFront,
  },
  {
    title: "Request an inspection",
    description:
      "Our experts evaluate the car, record diagnostics, and publish a transparent report.",
    cta: "Book inspection",
    href: "/inspections",
    icon: ShieldCheck,
  },
  {
    title: "Finance & insurance",
    description:
      "Compare bank offers, secure pre-approvals, and bundle coverage before you buy.",
    cta: "Browse offers",
    href: "/financing",
    icon: Building,
  },
]

const featuredListings = [
  {
    id: "listing-1",
    title: "2021 Kia Sportage Alpha AWD",
    price: "PKR 7,450,000",
    location: "Lahore",
    mileage: "34,000 km",
    image:
      "https://images.unsplash.com/photo-1542293787938-4d2226c57e94?auto=format&fit=crop&w=800&q=80",
    badge: "Featured",
  },
  {
    id: "listing-2",
    title: "2022 Toyota Corolla Altis Grande",
    price: "PKR 6,950,000",
    location: "Karachi",
    mileage: "12,500 km",
    image:
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80",
    badge: "Verified",
  },
  {
    id: "listing-3",
    title: "2020 Honda Civic RS 1.5 Turbo",
    price: "PKR 8,100,000",
    location: "Islamabad",
    mileage: "26,400 km",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
    badge: "Inspected",
  },
  {
    id: "listing-4",
    title: "2023 Hyundai Tucson FWD A/T",
    price: "PKR 9,550,000",
    location: "Karachi",
    mileage: "7,800 km",
    image:
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80",
    badge: "Certified",
  },
]

const trendingCategories = [
  { label: "Sedan", icon: Car },
  { label: "SUV & Crossover", icon: Sparkles },
  { label: "Hatchback", icon: Gauge },
  { label: "Hybrid & EV", icon: Fuel },
  { label: "Luxury", icon: SquareKanban },
  { label: "Commercial", icon: Building },
]

const brandGrid = [
  "Toyota",
  "Honda",
  "Suzuki",
  "Hyundai",
  "Kia",
  "MG",
  "Changan",
  "Peugeot",
  "Haval",
  "Prince",
  "Subaru",
  "Audi",
]

const editorial = [
  {
    title: "How we vet every listing before it goes live",
    date: "Operations",
  },
  {
    title: "Building a nationwide inspection network with NestJS & BullMQ",
    date: "Engineering",
  },
  {
    title: "Mock payments today, plug-in providers tomorrow",
    date: "Product",
  },
]

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      <section className="relative overflow-hidden bg-slate-950 text-slate-50">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0f1729] to-slate-950" />
          <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(125%_90%_at_50%_-20%,rgba(94,234,212,0.18),transparent_65%)]" />
          <div className="absolute left-[18%] top-1/4 size-[520px] rounded-full bg-sky-400/10 blur-3xl" />
        </div>
        <div className="container relative grid gap-16 pb-28 pt-24 lg:grid-cols-[1.1fr_minmax(0,0.9fr)] lg:items-center">
          <div className="space-y-10">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200/80">
              <Badge
                variant="outline"
                className="border-emerald-400/40 bg-emerald-400/15 text-emerald-100"
              >
                Marketplace preview
              </Badge>
              <span>Backend is production-ready — the UI is catching up fast.</span>
            </div>
            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[3.75rem]">
                A calmer, smarter way to shop verified vehicles across Pakistan.
              </h1>
              <p className="max-w-2xl text-lg text-slate-200/80">
                {siteConfig.description} We have inspections, moderation, payments, and observability already wired — now we’re translating that maturity into a modern buying experience inspired by PakWheels but tuned for today.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Listings powered", value: "8.4k+", description: "Synced across search, media, orders." },
                { label: "Verified sellers", value: "3k+", description: "Automated KYC & fraud checks live." },
                { label: "Telemetry uptime", value: "99.9%", description: "Grafana, Loki, Tempo already shipping." },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="border-white/10 bg-white/[0.07] text-slate-100 shadow-lg backdrop-blur"
                >
                  <CardContent className="space-y-2 p-5">
                    <p className="text-xs uppercase tracking-wide text-slate-200/70">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-semibold">{stat.value}</p>
                    <p className="text-xs text-slate-200/65">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <HeroSearch tabs={searchTabs} />
          </div>
          <HeroShowcase />
        </div>
        <div className="relative h-20 w-full bg-gradient-to-b from-transparent to-background" />
      </section>

      <section className="container grid gap-6 md:grid-cols-3">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            className="group border-border/60 bg-card transition-shadow hover:shadow-lg hover:shadow-primary/10"
          >
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex size-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <action.icon className="size-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <Button variant="link" className="px-0" asChild>
                <Link href={action.href}>
                  {action.cta} <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="container space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <Badge variant="secondary" className="w-fit uppercase tracking-wide">
              Featured picks
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight">
              Handpicked rides you can drive home this week.
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              These listings are backed by inspections, rich media, and sellers who engage within minutes.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/listings">View all featured</Link>
          </Button>
        </div>
        <ScrollArea className="-mx-4">
          <div className="flex gap-6 px-4 pb-2">
            {featuredListings.map((listing) => (
              <Card
                key={listing.id}
                className="w-[320px] flex-shrink-0 border-border/60 bg-card/95 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
              >
                <CardContent className="space-y-4 p-4">
                  <div className="relative overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src={listing.image}
                      alt={listing.title}
                      width={320}
                      height={180}
                      className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <Badge className="absolute left-3 top-3 rounded-full bg-primary/90 text-xs">
                      {listing.badge}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{listing.title}</h3>
                    <p className="text-sm font-medium text-primary">{listing.price}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" /> {listing.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge className="size-3.5" /> {listing.mileage}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    View details <ArrowRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="mx-4" />
        </ScrollArea>
      </section>

      <section className="container space-y-8 rounded-3xl border border-border/60 bg-muted/40 p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Shop by lifestyle</h2>
            <p className="text-sm text-muted-foreground">
              Explore curated categories built from our most popular searches.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/categories">See all categories</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trendingCategories.map((category) => (
            <Card
              key={category.label}
              className="border-border/50 bg-background/95 transition hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <category.icon className="size-5" />
                </div>
                <div>
                  <p className="font-medium">{category.label}</p>
                  <p className="text-xs text-muted-foreground">2,400+ listings</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Brands that buyers love</h2>
          <p className="text-sm text-muted-foreground">
            Tap a brand to jump straight into its latest inventory and upcoming releases.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {brandGrid.map((brand) => (
            <Card
              key={brand}
              className="border-border/60 bg-card transition hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="flex h-24 flex-col items-center justify-center gap-2 p-4 text-center">
                <Badge variant="secondary" className="rounded-full bg-secondary/50 text-xs">
                  {brand.slice(0, 1)}
                </Badge>
                <span className="text-sm font-medium">{brand}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container grid gap-8 rounded-3xl border border-border/60 bg-card/80 p-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Badge variant="outline" className="w-fit uppercase tracking-wide">
            Built for operators
          </Badge>
          <h2 className="text-3xl font-semibold leading-tight">
            Everything the backend already powers — now reflected upfront.
          </h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-1 size-4 text-primary" />
              Listings run through moderation workflows with audit logs and status transitions your team can track.
            </p>
            <p className="flex items-start gap-2">
              <Clock className="mt-1 size-4 text-primary" />
              Webhooks and mock payments sync with orders, so checkout flows stay deterministic from day one.
            </p>
            <p className="flex items-start gap-2">
              <Fuel className="mt-1 size-4 text-primary" />
              Observability stack is shipping traces, metrics, and logs — surface them where it matters.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/seller">Enter seller workspace</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/docs/operations">Ops runbooks</Link>
            </Button>
          </div>
        </div>
        <Card className="border-border/50 bg-background/90">
          <CardContent className="space-y-5 p-6">
            <div>
              <h3 className="text-lg font-semibold">Latest from the engineering blog</h3>
              <p className="text-sm text-muted-foreground">
                Ship notes from the backend journey powering this experience.
              </p>
            </div>
            <Separator />
            <div className="space-y-4">
              {editorial.map((post) => (
                <div key={post.title} className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {post.date}
                  </p>
                  <p className="font-medium leading-snug text-foreground">
                    {post.title}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container grid gap-6 rounded-3xl border border-border/60 bg-muted/30 p-8 md:grid-cols-[1fr_0.7fr]">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Never miss a launch.</h2>
          <p className="text-sm text-muted-foreground">
            Subscribe for early access to the React app once we wire it fully to the production-ready backend.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <input
                className="h-11 w-full rounded-xl border border-border/70 bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                placeholder="Enter your email"
              />
            </div>
            <Button className="h-11 rounded-xl px-6">Notify me</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            We’ll only use your email to share launch updates. No spam — promise.
          </p>
        </div>
        <Card className="border-border/50 bg-background">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">Showcase timeline</p>
              <p className="text-xs text-muted-foreground">
                A glimpse at what’s already in motion.
              </p>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-1 size-2 rounded-full bg-primary" />
                <span>Backend MVP complete — auth, listings, media, orders, payments, notifications, search.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 size-2 rounded-full bg-primary" />
                <span>Observability stack deployed with Grafana, Loki, Tempo, and OTEL collector.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 size-2 rounded-full bg-primary" />
                <span>Frontend shell ready — next sprint: live queries, auth wiring, dashboards.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
