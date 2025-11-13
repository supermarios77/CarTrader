import { ShieldCheck, Star, TrendingUp } from "lucide-react"

import { HeroSearch } from "@/components/home/hero-search"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Premium gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.08),transparent_50%)]" />
      </div>

      {/* Hero Section - Mobile optimized */}
      <section className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <div className="flex w-full max-w-5xl flex-col items-center gap-6 text-center sm:gap-8 md:gap-12">
          {/* Trust Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm sm:px-4 sm:py-1.5"
            >
              <ShieldCheck className="mr-1 size-3 sm:mr-1.5 sm:size-3.5" />
              <span className="hidden sm:inline">Verified Marketplace</span>
              <span className="sm:hidden">Verified</span>
            </Badge>
          </div>

          {/* Main Heading - Mobile optimized typography */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              Find your perfect
              <span className="block bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                car today
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg lg:text-xl">
              Browse thousands of verified listings from trusted sellers. Compare prices, review
              inspections, and drive away with confidence.
            </p>
          </div>

          {/* Search Component - Full width on mobile */}
          <div className="w-full max-w-4xl">
            <HeroSearch />
          </div>

          {/* Trust Indicators - Mobile optimized layout */}
          <div className="grid w-full grid-cols-1 gap-4 pt-4 sm:grid-cols-3 sm:gap-6 sm:pt-6 md:pt-8">
            <div className="flex items-center justify-center gap-2.5 sm:gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm sm:size-12 sm:rounded-2xl">
                <Star className="size-4 text-primary sm:size-5" />
              </div>
              <div className="text-left">
                <p className="text-base font-semibold sm:text-lg">8,400+</p>
                <p className="text-xs text-muted-foreground sm:text-sm">Verified Vehicles</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 sm:gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm sm:size-12 sm:rounded-2xl">
                <ShieldCheck className="size-4 text-primary sm:size-5" />
              </div>
              <div className="text-left">
                <p className="text-base font-semibold sm:text-lg">3,000+</p>
                <p className="text-xs text-muted-foreground sm:text-sm">Trusted Sellers</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 sm:gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm sm:size-12 sm:rounded-2xl">
                <TrendingUp className="size-4 text-primary sm:size-5" />
              </div>
              <div className="text-left">
                <p className="text-base font-semibold sm:text-lg">&lt;10 min</p>
                <p className="text-xs text-muted-foreground sm:text-sm">Avg Reply Time</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
