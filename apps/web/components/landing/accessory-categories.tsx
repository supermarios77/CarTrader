import { Battery, Cable, Car, Gauge, Lightbulb, Shield } from "lucide-react"

import { Card } from "@/components/ui/card"

const accessories = [
  { label: "Tyres & wheels", icon: Gauge },
  { label: "Batteries", icon: Battery },
  { label: "Car care", icon: Shield },
  { label: "Interior tech", icon: Lightbulb },
  { label: "Charging", icon: Cable },
  { label: "Performance", icon: Car },
]

export function AccessoryCategories() {
  return (
    <section className="rounded-3xl border border-border/60 bg-muted/30 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Parts & accessories marketplace</h2>
          <p className="text-sm text-muted-foreground">
            Trusted sellers delivering nationwide with warranty support.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {accessories.map((item) => (
          <Card
            key={item.label}
            className="flex items-center gap-4 rounded-2xl border border-transparent bg-background/80 p-5 transition hover:-translate-y-1 hover:border-border/80 hover:shadow-lg"
          >
            <span className="rounded-full bg-primary/10 p-3 text-primary">
              <item.icon className="size-5" />
            </span>
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">
                Explore curated stock & bundle offers.
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

