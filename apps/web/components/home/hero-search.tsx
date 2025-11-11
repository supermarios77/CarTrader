"use client"

import { useMemo, useState } from "react"
import { Search, Settings2 } from "lucide-react"

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
import { Slider } from "@/components/ui/slider"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

type SliderField = {
  type: "slider"
  label: string
  min: number
  max: number
  step?: number
  unit?: string
}

type SelectField = {
  type: "select"
  label: string
  placeholder?: string
  options: string[]
}

type InputField = {
  type: "input"
  label: string
  placeholder?: string
}

type SearchField = (SliderField | SelectField | InputField) & { id: string }

export type SearchTabConfig = {
  id: string
  label: string
  description: string
  ctaLabel: string
  fields: SearchField[]
}

type HeroSearchProps = {
  tabs: SearchTabConfig[]
}

export function HeroSearch({ tabs }: HeroSearchProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "")
  const defaultSliderValue = useMemo(() => {
    const firstSliderField = tabs
      .flatMap((tab) => tab.fields)
      .find((field) => field.type === "slider") as SliderField | undefined
    if (!firstSliderField) return 0
    return Math.round(
      firstSliderField.min +
        (firstSliderField.max - firstSliderField.min) * 0.35,
    )
  }, [tabs])

  const [sliderValue, setSliderValue] = useState<number[]>([
    defaultSliderValue,
  ])

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full rounded-3xl border border-border/60 bg-card p-6 shadow-lg"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <TabsList className="h-10 rounded-full bg-muted p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-full px-5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <p className="mt-2 text-sm text-muted-foreground">
            {tabs.find((tab) => tab.id === activeTab)?.description}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 text-sm">
          <Settings2 className="size-4" />
          Advanced search
        </Button>
      </div>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="mt-6 rounded-2xl border border-border/60 bg-background/80 p-6 shadow-inner"
        >
          <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tab.fields.map((field) => {
              if (field.type === "select") {
                return (
                  <div key={field.id} className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                      {field.label}
                    </Label>
                    <Select defaultValue="">
                      <SelectTrigger className="h-11 rounded-xl border-border/60 bg-background">
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              }

              if (field.type === "input") {
                return (
                  <div key={field.id} className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                      {field.label}
                    </Label>
                    <Input
                      placeholder={field.placeholder}
                      className="h-11 rounded-xl border-border/60 bg-background"
                    />
                  </div>
                )
              }

              if (field.type === "slider") {
                return (
                  <div key={field.id} className="space-y-3 lg:col-span-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                      {field.label}
                    </Label>
                    <Slider
                      value={sliderValue}
                      min={field.min}
                      max={field.max}
                      step={field.step ?? 5}
                      onValueChange={setSliderValue}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">
                      Up to {field.unit}
                      {sliderValue[0].toLocaleString()} lacs
                    </div>
                  </div>
                )
              }

              return null
            })}

            <div className="flex items-end">
              <Button
                type="submit"
                className="h-11 w-full rounded-xl"
              >
                <Search className="mr-2 size-4" />
                {tab.ctaLabel}
              </Button>
            </div>
          </form>
        </TabsContent>
      ))}
    </Tabs>
  )
}

