"use client"

import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const heroImage =
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80"

export function HeroShowcase() {
  return (
    <Card className="border border-border/60 bg-card shadow-xl">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            Featured listing
          </Badge>
          <span>Inspected 2h ago</span>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-muted">
          <Image
            src={heroImage}
            alt="Hero listing showcase"
            width={640}
            height={400}
            className="h-60 w-full object-cover"
            priority
          />
        </div>
        <div>
          <p className="text-base font-semibold">2022 Toyota Fortuner GRS</p>
          <p className="text-sm text-muted-foreground">Lahore · 12,800 km · Single owner</p>
        </div>
        <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
          <Stat label="Price" value="PKR 15,200,000" />
          <Stat label="Response time" value="8 min" />
          <Stat label="Watchers" value="32 buyers" />
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="font-medium text-foreground">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  )
}

