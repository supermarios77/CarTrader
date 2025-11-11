"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const activeTheme = theme ?? "system"
  const isDark = resolvedTheme === "dark"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-9"
          aria-label="Toggle theme"
        >
          <Sun
            className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            aria-hidden={!isDark}
          />
          <Moon
            className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            aria-hidden={isDark}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[9rem]">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          data-state={activeTheme === "light" ? "active" : undefined}
        >
          <Sun className="mr-2 size-4" aria-hidden />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          data-state={activeTheme === "dark" ? "active" : undefined}
        >
          <Moon className="mr-2 size-4" aria-hidden />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          data-state={activeTheme === "system" ? "active" : undefined}
        >
          <Sun className="mr-2 size-4" aria-hidden />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

