"use client"

import { Heart, MapPin, Gauge, Fuel, Calendar } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export type ListingCardProps = {
  id: string
  title: string
  price: string
  location: string
  mileage?: string
  fuelType?: string
  year: string
  sellerType?: "Dealer" | "Individual"
  badges?: Array<"featured" | "verified" | "inspected">
  thumbnailUrl?: string
  href?: string
  className?: string
}

const BADGE_LABELS: Record<NonNullable<ListingCardProps["badges"]>[number], string> = {
  featured: "Featured",
  verified: "Verified Seller",
  inspected: "Inspected",
}

export function ListingCard({
  id,
  title,
  price,
  location,
  mileage,
  fuelType,
  year,
  sellerType,
  badges,
  thumbnailUrl,
  href = `/listings/${id}`,
  className,
}: ListingCardProps) {
  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-muted">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <Skeleton className="h-full w-full rounded-none" />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
          {badges?.map((badge) => (
            <Badge key={badge} variant="secondary" className="bg-white/90 text-xs font-semibold uppercase tracking-wide text-foreground">
              {BADGE_LABELS[badge]}
            </Badge>
          ))}
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 text-foreground shadow hover:bg-white"
        >
          <Heart className="size-4" aria-hidden />
          <span className="sr-only">Save listing</span>
        </Button>
      </div>

      <CardHeader className="space-y-2 p-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Link href={href} className="text-lg font-semibold leading-tight hover:text-primary">
              {title}
            </Link>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {year} · {sellerType ?? "Individual Seller"}
            </p>
          </div>
          <p className="text-lg font-semibold text-primary">{price}</p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" aria-hidden />
            <span>{location}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            {mileage && (
              <SpecPill icon={Gauge} label="Mileage" value={mileage} />
            )}
            {fuelType && (
              <SpecPill icon={Fuel} label="Fuel" value={fuelType} />
            )}
            <SpecPill icon={Calendar} label="Year" value={year} />
          </div>
        </div>
        <Button asChild>
          <Link href={href}>View details</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

type SpecPillProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  value: string
}

function SpecPill({ icon: Icon, label, value }: SpecPillProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-2">
      <Icon className="size-3.5 text-primary" aria-hidden />
      <div className="flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-xs font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

