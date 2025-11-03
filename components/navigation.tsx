"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/features", label: "Características" },
    { href: "/download", label: "Descargar" },
  ]

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
      <div className="rounded-2xl border border-border/40 bg-background/80 backdrop-blur-xl shadow-lg">
        <div className="flex h-16 items-center justify-between px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Scrakk Code Editor Logo" width={32} height={32} />
            <span className="text-xl font-bold font-mono">Scrakk Code Editor</span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200",
                  pathname === link.href
                    ? "text-primary-foreground bg-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
