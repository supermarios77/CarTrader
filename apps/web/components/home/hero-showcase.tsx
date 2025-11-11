"use client"

import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const showcaseImages = [
  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?auto=format&fit=crop&w=1400&q=80",
]

export function HeroShowcase() {
  return (
    <div className="relative isolate flex w-full flex-col gap-5">
      <div className="absolute -left-20 top-20 size-64 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute -right-10 bottom-10 size-72 rounded-full bg-sky-500/20 blur-3xl" />

      <Card className="relative border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-900/90 p-0 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
        <CardContent className="grid gap-4 p-6">
          <div className="flex items-center justify-between">
            <Badge className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100">
              Verified listing
            </Badge>
            <span className="text-xs text-slate-300/80">Inspected 2 hrs ago</span>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={showcaseImages[0]}
              alt="Hero listing exterior"
              width={720}
              height={420}
              className="w-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent" />
            <div className="absolute bottom-0 flex w-full items-center justify-between px-5 pb-4">
              <div>
                <p className="text-sm font-medium text-white/90">2022 Mercedes GLC 200 AMG Line</p>
                <p className="text-xs text-slate-200/70">Lahore · 18,400 km · Single owner</p>
              </div>
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow">
                PKR 16,800,000
              </span>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-slate-200">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Average response" value="9 min" />
              <Stat label="Listed this week" value="1,240" />
              <Stat label="Verified sellers" value="3,021" />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200/80">
              <div>
                <p className="font-medium text-white/90">Live buyer interest</p>
                <p>4 buyers reviewing inspection doc right now</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-100">
                <span className="inline-flex size-2 rounded-full bg-emerald-300" />
                <span className="text-xs font-semibold uppercase tracking-wide">Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative ml-auto w-[85%] border-white/10 bg-white/5 p-0 shadow-xl backdrop-blur-2xl">
        <CardContent className="flex items-center gap-4 p-4 text-slate-100">
          <div className="relative size-20 overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={showcaseImages[1]}
              alt="Inspection snapshot"
              width={200}
              height={200}
              className="size-full object-cover"
            />
          </div>
          <div className="space-y-1.5 text-sm">
            <p className="font-semibold text-white">Inspection uploaded</p>
            <p className="text-slate-300/80">
              Diagnostics passed · 47-point checklist signed off · Buyer notified
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs uppercase tracking-wide text-slate-300/70">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

