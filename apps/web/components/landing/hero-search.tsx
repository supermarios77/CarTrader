"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

type SearchTab = "used" | "new" | "bikes"

const tabCopy: Record<SearchTab, { title: string; blurb: string }> = {
  used: {
    title: "Find used cars in Pakistan",
    blurb: "150,000+ active listings. Filter by make, city, budget, and verified sellers.",
  },
  new: {
    title: "Research the newest models",
    blurb: "Compare trims, specs, and booking options direct from dealers.",
  },
  bikes: {
    title: "Discover motorbikes & accessories",
    blurb: "Browse street bikes, EVs, and gear tailored to your ride style.",
  },
}

const makes = [
  "Toyota",
  "Honda",
  "Suzuki",
  "Kia",
  "Hyundai",
  "MG",
  "Changan",
  "United",
]

const cities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Peshawar",
  "Multan",
]

export function HeroSearch() {
  const [activeTab, setActiveTab] = useState<SearchTab>("used")
  const [priceRange, setPriceRange] = useState<number[]>([10, 40])

  const copy = useMemo(() => tabCopy[activeTab], [activeTab])

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-6 py-12 text-white shadow-xl lg:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]" />
      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end">
        <div className="space-y-4 lg:max-w-md">
          <span className="rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-blue-100">
            Marketplace
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              {copy.title}
            </h1>
            <p className="text-base text-blue-100/80">{copy.blurb}</p>
          </div>
        </div>
        <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
          <Tabs
            defaultValue="used"
            className="flex flex-col gap-6 p-6"
            onValueChange={(value) => setActiveTab(value as SearchTab)}
          >
            <TabsList className="grid grid-cols-3 gap-2 bg-white/10 p-1">
              <TabsTrigger
                value="used"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900"
              >
                Used Cars
              </TabsTrigger>
              <TabsTrigger
                value="new"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900"
              >
                New Cars
              </TabsTrigger>
              <TabsTrigger
                value="bikes"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900"
              >
                Bikes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="used" className="space-y-6">
              <form className="grid gap-3 md:grid-cols-2">
                <Select>
                  <SelectTrigger className="bg-white/10 text-white ring-white/30">
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {makes.map((item) => (
                      <SelectItem key={item} value={item.toLowerCase()}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="bg-white/10 text-white ring-white/30">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="corolla">Corolla</SelectItem>
                    <SelectItem value="city">City</SelectItem>
                    <SelectItem value="civic">Civic</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="bg-white/10 text-white ring-white/30">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city.toLowerCase()}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Keywords or variant"
                  className="bg-white/10 text-white placeholder:text-blue-100/60 ring-white/30"
                />
                <div className="col-span-full space-y-3 rounded-xl bg-white/5 p-4">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-blue-100/80">
                    <span>Budget (PKR lacs)</span>
                    <span>
                      {priceRange[0]} - {priceRange[1]}
                    </span>
                  </div>
                  <Slider
                    defaultValue={priceRange}
                    min={0}
                    max={100}
                    step={5}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value)}
                    className="[&>[role=slider]]:bg-white"
                  />
                </div>
                <Button size="lg" className="col-span-full bg-blue-500 hover:bg-blue-400">
                  Search Listings
                </Button>
              </form>
              <div className="flex flex-wrap gap-2 text-xs text-blue-100/70">
                <span>Popular searches:</span>
                {["Corolla", "Sportage", "Cultus", "Civic", "Yaris"].map((item) => (
                  <button
                    key={item}
                    className="rounded-full border border-white/20 px-3 py-1 transition hover:border-white/40"
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="new" className="space-y-6">
              <form className="grid gap-3 md:grid-cols-2">
                <Select>
                  <SelectTrigger className="bg-white/10 text-white ring-white/30">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {makes.map((item) => (
                      <SelectItem key={item} value={item.toLowerCase()}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="bg-white/10 text-white ring-white/30">
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="hatchback">Hatchback</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="crossover">Crossover</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="bg-white/10 text-white ring-white/30">
                    <SelectValue placeholder="Delivery city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city.toLowerCase()}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Budget or monthly installment"
                  className="bg-white/10 text-white placeholder:text-blue-100/60 ring-white/30"
                />
                <Button
                  size="lg"
                  className="col-span-full bg-blue-500 hover:bg-blue-400"
                >
                  Compare Offers
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="bikes" className="space-y-6">
              <form className="grid gap-3 md:grid-cols-2">
                <Select>
                  <SelectTrigger className="bg-white/10 text-white ring-white/30">
                    <SelectValue placeholder="Bike make" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="honda">Honda</SelectItem>
                    <SelectItem value="yamaha">Yamaha</SelectItem>
                    <SelectItem value="suzuki">Suzuki</SelectItem>
                    <SelectItem value="super-power">Super Power</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="bg-white/10 text-white ring-white/30">
                    <SelectValue placeholder="Engine capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="70cc">70 cc</SelectItem>
                    <SelectItem value="125cc">125 cc</SelectItem>
                    <SelectItem value="150cc">150 cc</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="bg-white/10 text-white ring-white/30">
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city.toLowerCase()}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Accessories or keywords"
                  className="bg-white/10 text-white placeholder:text-blue-100/60 ring-white/30"
                />
                <Button
                  size="lg"
                  className="col-span-full bg-blue-500 hover:bg-blue-400"
                >
                  Search Bikes
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}

