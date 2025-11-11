"use client"

import { Heart } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

type Listing = {
  id: string
  title: string
  price: string
  mileage: string
  city: string
  year: string
  badges?: string[]
}

const featuredListings: Listing[] = [
  {
    id: "1",
    title: "Toyota Corolla Altis Grande 1.8",
    price: "PKR 85.0 lacs",
    mileage: "21,350 km",
    city: "Lahore",
    year: "2022",
    badges: ["Verified", "Featured"],
  },
  {
    id: "2",
    title: "Kia Sportage AWD",
    price: "PKR 120.0 lacs",
    mileage: "14,800 km",
    city: "Karachi",
    year: "2023",
    badges: ["Inspected"],
  },
  {
    id: "3",
    title: "Hyundai Tucson GLS Sport",
    price: "PKR 118.5 lacs",
    mileage: "18,420 km",
    city: "Islamabad",
    year: "2022",
  },
  {
    id: "4",
    title: "Suzuki Swift GL CVT",
    price: "PKR 47.0 lacs",
    mileage: "9,050 km",
    city: "Karachi",
    year: "2023",
  },
]

const recentListings: Listing[] = [
  {
    id: "5",
    title: "Honda City Aspire 1.5",
    price: "PKR 62.5 lacs",
    mileage: "12,500 km",
    city: "Islamabad",
    year: "2023",
  },
  {
    id: "6",
    title: "Changan Oshan X7 FutureSense",
    price: "PKR 95.0 lacs",
    mileage: "8,900 km",
    city: "Lahore",
    year: "2023",
    badges: ["Featured"],
  },
  {
    id: "7",
    title: "Suzuki Alto VXL AGS",
    price: "PKR 26.8 lacs",
    mileage: "24,300 km",
    city: "Rawalpindi",
    year: "2022",
  },
]

const badgeColors: Record<string, string> = {
  Verified: "bg-emerald-100 text-emerald-700",
  Featured: "bg-blue-100 text-blue-700",
  Inspected: "bg-amber-100 text-amber-700",
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-border/70 bg-card shadow-sm transition hover:-translate-y-1 hover:border-border hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_70%)]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition duration-500 group-hover:scale-105 group-hover:brightness-110" />
        <div className="absolute inset-0 flex items-end justify-start p-4">
          <span className="text-xs uppercase tracking-widest text-white/70">
            Photo coming soon
          </span>
        </div>
        {listing.badges && (
          <div className="absolute inset-x-3 top-3 flex flex-wrap gap-2">
            {listing.badges.map((badge) => (
              <Badge key={badge} className={badgeColors[badge] ?? "bg-white/80 text-slate-800"}>
                {badge}
              </Badge>
            ))}
          </div>
        )}
        <Button
          size="icon"
          variant="outline"
          className="absolute right-3 top-3 size-9 rounded-full bg-white/80 text-slate-800 hover:bg-white"
        >
          <Heart className="size-4" />
        </Button>
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <p className="text-lg font-semibold leading-tight">{listing.price}</p>
          <Link
            href={`/listings/${listing.id}`}
            className="line-clamp-2 text-sm font-medium text-foreground/90 transition hover:text-primary"
          >
            {listing.title}
          </Link>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <dt className="uppercase tracking-wide">Mileage</dt>
            <dd>{listing.mileage}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-wide">City</dt>
            <dd>{listing.city}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-wide">Year</dt>
            <dd>{listing.year}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-wide">Condition</dt>
            <dd>Excellent</dd>
          </div>
        </dl>
        <Button variant="outline" className="mt-auto text-sm" asChild>
          <Link href={`/listings/${listing.id}`}>View details</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function FeaturedListings() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Featured used cars</h2>
          <p className="text-sm text-muted-foreground">
            Handpicked rides inspected and ready for the road.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/listings?tag=featured">See all featured</Link>
        </Button>
      </div>

      <ScrollArea orientation="horizontal" className="w-full">
        <div className="flex gap-4 pb-4 pr-4">
          {featuredListings.map((listing) => (
            <div key={listing.id} className="min-w-[280px] max-w-[320px] flex-1">
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  )
}

export function RecentListings() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Fresh on CarTrader</h2>
          <p className="text-sm text-muted-foreground">
            Newly listed vehicles from verified sellers.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/listings?sort=newest">View all</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {recentListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  )
}

