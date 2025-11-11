import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Separator } from "@/components/ui/separator"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/40">
      <div className="container flex flex-col gap-10 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col gap-3">
            <span className="text-lg font-semibold tracking-tight">
              {siteConfig.name}
            </span>
            <p className="text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>
          {siteConfig.footerNav.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </span>
              <ul className="flex flex-col gap-2 text-sm">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-foreground/80 transition-colors hover:text-primary"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              href="mailto:support@cartrader.local"
              className="transition-colors hover:text-primary"
            >
              support@cartrader.local
            </Link>
            <Link
              href={siteConfig.links.github}
              className="transition-colors hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

