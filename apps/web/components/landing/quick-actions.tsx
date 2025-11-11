import { ArrowRight, FileText, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const actions = [
  {
    title: "Sell Your Car",
    description:
      "Instantly list, schedule inspections, and sync with buyers across Pakistan.",
    href: "/sell",
    icon: Sparkles,
    cta: "Post an Ad",
    tone: "primary" as const,
  },
  {
    title: "Get CarTrader Assist",
    description:
      "Let our specialists manage valuation, photography, and negotiation for you.",
    href: "/services/assist",
    icon: ShieldCheck,
    cta: "Book a Call",
    tone: "neutral" as const,
  },
  {
    title: "Finance & Insurance",
    description:
      "Compare installment plans and insure your ride with trusted partners.",
    href: "/financing",
    icon: FileText,
    cta: "Explore Offers",
    tone: "neutral" as const,
  },
]

export function QuickActions() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {actions.map((action) => (
        <Card
          key={action.title}
          className="group relative overflow-hidden border-border/70 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 p-2 text-primary">
                <action.icon className="size-5" />
              </span>
              <h3 className="text-lg font-semibold">{action.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {action.description}
            </p>
            <Button
              variant={action.tone === "primary" ? "default" : "outline"}
              asChild
            >
              <Link href={action.href} className="flex items-center gap-2">
                {action.cta}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

