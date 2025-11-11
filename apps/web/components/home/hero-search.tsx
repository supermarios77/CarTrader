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
      className="w-full rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_35px_120px_-45px_rgba(15,23,42,0.65)] backdrop-blur-2xl"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <TabsList className="h-10 rounded-full bg-white/10 p-1 text-slate-100">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-full px-5 text-sm font-medium text-slate-200 data-[state=active]:bg-slate-950 data-[state=active]:text-emerald-300"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <p className="mt-2 text-sm text-slate-200/70">
            {tabs.find((tab) => tab.id === activeTab)?.description}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 rounded-full bg-white/5 text-sm text-slate-100 hover:bg-white/10"
        >
          <Settings2 className="size-4" />
          Advanced search
        </Button>
      </div>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-inner backdrop-blur"
        >
          <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tab.fields.map((field) => {
              if (field.type === "select") {
                return (
                  <div key={field.id} className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-slate-300/80">
                      {field.label}
                    </Label>
                    <Select defaultValue="">
                      <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/5 text-slate-100 focus-visible:ring-emerald-400/40">
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
                    <Label className="text-xs uppercase tracking-wide text-slate-300/80">
                      {field.label}
                    </Label>
                    <Input
                      placeholder={field.placeholder}
                      className="h-11 rounded-xl border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-400 focus-visible:ring-emerald-400/40"
                    />
                  </div>
                )
              }

              if (field.type === "slider") {
                return (
                  <div key={field.id} className="space-y-3 lg:col-span-2">
                    <Label className="text-xs uppercase tracking-wide text-slate-300/80">
                      {field.label}
                    </Label>
                    <Slider
                      value={sliderValue}
                      min={field.min}
                      max={field.max}
                      step={field.step ?? 5}
                      onValueChange={setSliderValue}
                      className="w-full [&_[role=slider]]:border-white/20 [&_[role=slider]]:bg-emerald-400"
                    />
                    <div className="text-xs text-slate-300/70">
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
                className="h-11 w-full rounded-xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/40 hover:bg-emerald-300"
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

