"use client"

import { Navigation } from "@/components/navigation"
import { Download, Terminal, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"

export default function DownloadPage() {
  const [hoveredPlatform, setHoveredPlatform] = useState<number | null>(null)
  const [gradients, setGradients] = useState<string[]>([])
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])

  const platforms = [
    {
      image: "/apple.png",
      name: "macOS",
      version: "v1.0.1.6",
      size: "124 MB",
      requirements: "macOS 11.0+",
    },
    {
      image: "/windows.png",
      name: "Windows",
      version: "v1.0.1.6",
      size: "142 MB",
      requirements: "Windows 10/11",
    },
    {
      image: "/linux.png",
      name: "Linux",
      version: "v1.0.1.6",
      size: "118 MB",
      requirements: "Ubuntu 20.04+",
    },
  ]

  useEffect(() => {
    const extractColors = async () => {
      const newGradients: string[] = []

      for (let i = 0; i < platforms.length; i++) {
        const canvas = canvasRefs.current[i]
        if (!canvas) continue

        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) continue

        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.src = platforms[i].image

        await new Promise((resolve) => {
          img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
            let r = 0, g = 0, b = 0
            let count = 0

            // Muestrear píxeles
            for (let j = 0; j < imageData.length; j += 4 * 10) {
              const alpha = imageData[j + 3]
              if (alpha > 128) { // Solo píxeles no transparentes
                r += imageData[j]
                g += imageData[j + 1]
                b += imageData[j + 2]
                count++
              }
            }

            if (count > 0) {
              r = Math.floor(r / count)
              g = Math.floor(g / count)
              b = Math.floor(b / count)
            }

            // Crear gradiente con el color extraído
            const gradient = `linear-gradient(135deg, rgba(${r},${g},${b},0.2) 0%, rgba(${r},${g},${b},0.05) 100%)`
            newGradients[i] = gradient
            resolve(null)
          }
        })
      }

      setGradients(newGradients)
    }

    extractColors()
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 text-xs font-mono text-primary">
              BETA PÚBLICA v1.0.1.6
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter">
              Descarga Scrakk
            </h1>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
              Disponible para todas las plataformas principales
            </p>
          </div>

          {/* Hidden canvases for color extraction */}
          {platforms.map((_, i) => (
            <canvas
              key={i}
              ref={(el) => (canvasRefs.current[i] = el)}
              style={{ display: 'none' }}
            />
          ))}

          {/* Platform Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {platforms.map((platform, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden cursor-pointer transition-all duration-500"
                onMouseEnter={() => setHoveredPlatform(i)}
                onMouseLeave={() => setHoveredPlatform(null)}
                style={{
                  transform: hoveredPlatform === i ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                }}
              >
                {/* Gradient Background */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: gradients[i] || 'transparent'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Content */}
                <div className="relative z-10 space-y-6">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <Image 
                      src={platform.image} 
                      alt={platform.name} 
                      width={64} 
                      height={64} 
                      className="transition-transform duration-500 group-hover:scale-110" 
                    />
                  </div>

                  {/* Platform Name */}
                  <div className="text-center space-y-2">
                    <h3 className="text-3xl font-black group-hover:text-primary transition-colors duration-300">
                      {platform.name}
                    </h3>
                    <div className="h-px w-0 bg-primary mx-auto group-hover:w-full transition-all duration-500" />
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono">{platform.version}</span>
                      <span>•</span>
                      <span>{platform.size}</span>
                    </div>
                    <div className="text-xs">{platform.requirements}</div>
                  </div>

                  {/* Download Button */}
                  <Button
                    className="w-full rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Package Managers */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <Terminal className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold">Package Managers</h3>
              </div>
              <div className="space-y-3 font-mono text-sm">
                {[
                  { manager: "Homebrew", command: "brew install scrakk" },
                  { manager: "Winget", command: "winget install scrakk" },
                  { manager: "Snap", command: "snap install scrakk" },
                ].map((item, i) => (
                  <div 
                    key={i}
                    className="group p-4 rounded-xl bg-black/40 border border-white/10 hover:border-primary/50 transition-all duration-300 cursor-pointer"
                  >
                    <div className="text-primary text-xs mb-1"># {item.manager}</div>
                    <div className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      {item.command}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <Package className="h-6 w-6 text-yellow-500" />
                <h3 className="text-2xl font-bold">Beta Release</h3>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Esta es una versión beta estable para uso diario, pero pueden existir bugs ocasionales.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    <span>Reporta problemas en GitHub</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    <span>Actualizaciones frecuentes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    <span>Feedback bienvenido</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Release Notes */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black">Notas de Versión</h2>
              <div className="h-px max-w-xs mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Sistema de temas mejorado con soporte para gradientes personalizados",
                "Rendimiento optimizado: +50% más rápido en archivos grandes",
                "Integración de IA actualizada con modelos más recientes",
                "47 bugs corregidos basados en feedback de la comunidad",
              ].map((note, i) => (
                <div
                  key={i}
                  className="group p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 group-hover:scale-150 transition-transform duration-300" />
                    <p className="text-base text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      {note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-12 px-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 Scrakk Code Editor v1.0.1.6 Beta</p>
        </div>
      </footer>
    </div>
  )
}
