import { Car, CarFront, Timer, Truck, Waves, Wind } from "lucide-react"

import { Card } from "@/components/ui/card"

const categories = [
  { label: "Sedans", icon: Car },
  { label: "Hatchbacks", icon: CarFront },
  { label: "SUVs", icon: Truck },
  { label: "Crossovers", icon: Wind },
  { label: "EV & Hybrid", icon: Waves },
  { label: "Quick Delivery", icon: Timer },
]

export function CategoryTiles() {
  return (
    <section className="rounded-3xl border border-border/60 bg-muted/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Browse by body type</h2>
          <p className="text-sm text-muted-foreground">
            Pick a segment to filter listings in seconds.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Card
            key={category.label}
            className="flex flex-col items-center gap-3 rounded-2xl border border-transparent bg-background/80 p-5 text-center transition hover:-translate-y-1 hover:border-border/80 hover:shadow-lg"
          >
            <span className="rounded-full bg-primary/10 p-3 text-primary">
              <category.icon className="size-6" />
            </span>
            <p className="text-sm font-medium">{category.label}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}

