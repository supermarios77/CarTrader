"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const searchTabs = [
  { key: "used", label: "Used Cars" },
  { key: "new", label: "New Cars" },
  { key: "bikes", label: "Bikes" },
] as const

const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar"]
const makes = ["Toyota", "Honda", "Suzuki", "Hyundai", "KIA", "MG", "Changan"]
const bodyTypes = ["Sedan", "Hatchback", "SUV", "Crossover", "Pickup"]

export function HeroSearch() {
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    10,
    80,
  ])

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background to-muted/60 p-6 shadow-sm sm:p-10">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="space-y-6">
          <Badge variant="secondary" className="uppercase tracking-wide">
            Find your next ride
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Marketplace simplicity with dealership-level trust.
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Search verified listings across Pakistan, compare inspection
              grades, and secure your reservation in a single guided flow.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg">Browse marketplace</Button>
            <Button size="lg" variant="outline">
              List your vehicle
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <HeroHighlight stat="8,400+" label="Verified listings" />
            <HeroHighlight stat="3,000+" label="Trusted sellers" />
            <HeroHighlight stat="3 days" label="Avg. delivery time" />
          </div>
        </div>

        <Card className="border-0 bg-background shadow-lg">
          <CardContent className="p-0">
            <Tabs defaultValue="used" className="w-full">
              <div className="border-b border-border/80 bg-muted/40 p-4">
                <TabsList className="grid w-full grid-cols-3 bg-transparent">
                  {searchTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.key}
                      value={tab.key}
                      className="rounded-md text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="used" className="space-y-6">
                  <SearchFields
                    priceRange={priceRange}
                    onPriceChange={setPriceRange}
                  />
                </TabsContent>
                <TabsContent value="new" className="space-y-6">
                  <SearchFields
                    showMileage={false}
                    priceRange={priceRange}
                    onPriceChange={setPriceRange}
                  />
                </TabsContent>
                <TabsContent value="bikes" className="space-y-6">
                  <SearchFields
                    bodyLabel="Bike Type"
                    makes={["Honda", "Yamaha", "United", "Unique"]}
                    priceRange={priceRange}
                    onPriceChange={setPriceRange}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

type SearchFieldsProps = {
  makes?: string[]
  bodyLabel?: string
  showMileage?: boolean
  priceRange: [number, number]
  onPriceChange: (value: [number, number]) => void
}

function SearchFields({
  makes: makesOverride,
  bodyLabel = "Body Type",
  showMileage = true,
  priceRange,
  onPriceChange,
}: SearchFieldsProps) {
  const optionMakes = makesOverride ?? makes

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="City" placeholder="Select city" options={cities} />
        <SelectField label="Make" placeholder="Select make" options={optionMakes} />
        <SelectField label="Model" placeholder="Any model" options={[]} />
        <SelectField label={bodyLabel} placeholder={`Any ${bodyLabel.toLowerCase()}`} options={bodyTypes} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Price range (lakh PKR)</FieldLabel>
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceChange([value[0], value[1]] as [number, number])}
            min={0}
            max={150}
            step={5}
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{priceRange[0]} Lakh</span>
            <span>{priceRange[1]} Lakh</span>
          </div>
        </div>
        {showMileage && (
          <div className="space-y-2">
            <FieldLabel>Mileage (km)</FieldLabel>
            <Input type="number" placeholder="Up to 60,000" />
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-[auto,1fr] sm:items-center">
        <Input
          placeholder="Keyword or Stock ID"
          className="w-full sm:col-span-2"
        />
        <Button size="lg" className="sm:h-12">
          Search listings
        </Button>
        <Button variant="ghost" className="justify-start text-sm text-muted-foreground">
          Advanced search
        </Button>
      </div>
    </div>
  )
}

type SelectFieldProps = {
  label: string
  placeholder: string
  options: string[]
}

function SelectField({ label, placeholder, options }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 ? (
            <SelectItem value="any">Any</SelectItem>
          ) : (
            options.map((option) => (
              <SelectItem key={option} value={option.toLowerCase()}>
                {option}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-muted-foreground">{children}</span>
}

type HeroHighlightProps = {
  stat: string
  label: string
}

function HeroHighlight({ stat, label }: HeroHighlightProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm">
      <p className="text-2xl font-semibold text-foreground">{stat}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

