"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { siteConfig, type NavItem } from "@/config/site"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

const isActive = (href: string, pathname: string) => {
  if (href === "/") {
    return pathname === href
  }

  return pathname.startsWith(href)
}

export function MainNav() {
  const pathname = usePathname()

  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        {siteConfig.mainNav.map((item) => (
          <NavigationMenuItem key={item.href}>
            <NavigationMenuLink
              asChild
              className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary data-[active]:text-primary"
              data-active={isActive(item.href, pathname)}
            >
              <Link href={item.href}>{item.title}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function AuthActions() {
  const actions: NavItem[] = [
    { title: "Sign in", href: "/auth/sign-in" },
    { title: "Join now", href: "/auth/sign-up" },
  ]

  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Button variant="ghost" asChild>
        <Link href={actions[0].href}>{actions[0].title}</Link>
      </Button>
      <Button asChild>
        <Link href={actions[1].href}>{actions[1].title}</Link>
      </Button>
    </div>
  )
}

