"use client"

import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const vehicleTypes = ["Used cars", "New cars", "Bikes", "Commercial"]
const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar"]
const priceBrackets = ["Up to 5 lacs", "5–10 lacs", "10–20 lacs", "20–40 lacs", "40+ lacs"]

export function HeroSearch() {
  return (
    <form className="group relative">
      {/* Premium glassmorphism container - hidden on mobile for performance */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100 md:rounded-3xl" />
      
      {/* Main container - Mobile optimized padding and spacing */}
      <div className="relative rounded-2xl border border-border/40 bg-card/80 p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 sm:p-5 md:rounded-3xl md:p-6 lg:p-8">
        {/* Vertical stack on mobile, horizontal grid on desktop */}
        <div className="flex flex-col gap-3 sm:gap-4 md:grid md:grid-cols-[1fr_1fr_1fr_auto] md:items-end md:gap-4">
          {/* Looking For */}
          <div className="space-y-2 sm:space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Looking for
            </Label>
            <Select defaultValue={vehicleTypes[0]}>
              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-background/50 text-sm shadow-sm transition-all hover:border-primary/40 hover:bg-background active:bg-background sm:h-12 sm:rounded-2xl sm:text-base">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl md:rounded-2xl">
                {vehicleTypes.map((type) => (
                  <SelectItem key={type} value={type} className="rounded-lg md:rounded-xl">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className="space-y-2 sm:space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              City
            </Label>
            <Select defaultValue={cities[0]}>
              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-background/50 text-sm shadow-sm transition-all hover:border-primary/40 hover:bg-background active:bg-background sm:h-12 sm:rounded-2xl sm:text-base">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent className="rounded-xl md:rounded-2xl">
                {cities.map((city) => (
                  <SelectItem key={city} value={city} className="rounded-lg md:rounded-xl">
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
          <div className="space-y-2 sm:space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Budget
            </Label>
            <Select defaultValue={priceBrackets[0]}>
              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-background/50 text-sm shadow-sm transition-all hover:border-primary/40 hover:bg-background active:bg-background sm:h-12 sm:rounded-2xl sm:text-base">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent className="rounded-xl md:rounded-2xl">
                {priceBrackets.map((price) => (
                  <SelectItem key={price} value={price} className="rounded-lg md:rounded-xl">
                    {price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button - Full width on mobile, auto width on desktop */}
          <Button
            type="submit"
            size="lg"
            className="h-11 w-full rounded-xl bg-primary px-6 text-sm font-semibold shadow-lg shadow-primary/25 transition-all active:scale-[0.98] sm:h-12 sm:rounded-2xl sm:text-base md:w-auto md:px-8 md:hover:scale-[1.02] md:hover:shadow-xl md:hover:shadow-primary/30"
          >
            <Search className="mr-2 size-4 sm:size-5" />
            Search
          </Button>
        </div>
      </div>
    </form>
  )
}
