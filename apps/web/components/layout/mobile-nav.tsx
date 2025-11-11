"use client"

import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

import { Icons } from "../shared/icons"

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-9 lg:hidden"
          aria-label="Open navigation"
        >
          <Icons.menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[280px] flex-col gap-4">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-left font-semibold">
            {siteConfig.name}
          </SheetTitle>
          <ThemeToggle />
        </SheetHeader>
        <nav className="flex flex-col gap-2 text-sm font-medium">
          {siteConfig.mainNav.map((item) => (
            <Button key={item.href} variant="ghost" asChild>
              <Link href={item.href}>{item.title}</Link>
            </Button>
          ))}
        </nav>
        <Separator />
        <div className="flex flex-col gap-2">
          <Button variant="outline" asChild>
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Join now</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

