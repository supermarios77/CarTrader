import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function AppPromo() {
  return (
    <Card className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-8">
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-4">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            CarTrader App
          </span>
          <h2 className="text-2xl font-semibold leading-tight">
            Experience the full marketplace on the go.
          </h2>
          <p className="text-sm text-muted-foreground">
            Receive instant price drops, inspection reports, and buyer leads in real
            time. Available on both Android and iOS.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="https://play.google.com">Get on Play Store</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://www.apple.com/app-store/">Download for iOS</Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative h-64 w-40 rounded-[2rem] border border-border/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-[0_20px_60px_-25px_rgba(59,130,246,0.6)]">
            <div className="absolute inset-x-6 top-10 h-10 rounded-xl bg-white/10" />
            <div className="absolute inset-x-6 top-24 h-10 rounded-xl bg-white/20" />
            <div className="absolute inset-x-6 top-40 h-16 rounded-xl bg-blue-500/40" />
          </div>
        </div>
      </div>
    </Card>
  )
}

