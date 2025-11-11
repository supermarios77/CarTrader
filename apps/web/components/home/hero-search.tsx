"use client"

import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const vehicleTypes = ["Any type", "Used cars", "New cars", "Bikes", "Commercial"]
const cities = ["All cities", "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar"]

export function HeroSearch() {
  return (
    <form className="grid gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase text-muted-foreground">Looking for</Label>
        <Select defaultValue={vehicleTypes[0]}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {vehicleTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase text-muted-foreground">City</Label>
        <Select defaultValue={cities[0]}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase text-muted-foreground">Max budget (PKR)</Label>
        <Input
          type="number"
          placeholder="e.g. 5,000,000"
          className="h-11 rounded-xl"
        />
      </div>

      <Button type="submit" className="h-11 rounded-xl">
        <Search className="mr-2 size-4" />
        Search listings
      </Button>
    </form>
  )
}
