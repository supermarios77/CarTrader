import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"

import { AuthActions, MainNav } from "./main-nav"
import { MobileNav } from "./mobile-nav"
import { Icons } from "../shared/icons"
import { ThemeToggle } from "../theme-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center gap-3 sm:h-20">
        <MobileNav />
        <Link href="/" className="flex items-center gap-2">
          <Icons.logo className="size-6 text-primary" aria-hidden />
          <span className="text-base font-semibold leading-none sm:text-lg">
            {siteConfig.name}
          </span>
        </Link>
        <MainNav />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button className="hidden sm:inline-flex" asChild>
            <Link href="/sell">List your vehicle</Link>
          </Button>
          <AuthActions />
        </div>
      </div>
    </header>
  )
}

