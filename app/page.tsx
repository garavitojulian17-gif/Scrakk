"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, Zap, Terminal, Globe, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Typewriter } from "@/components/typewriter"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const ambientLightRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (videoContainerRef.current) {
        const rect = videoContainerRef.current.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const isVisible = rect.top < windowHeight && rect.bottom > 0
        
        if (isVisible) {
          const visiblePercentage = Math.min(
            1,
            Math.max(0, (windowHeight - rect.top) / (windowHeight + rect.height))
          )
          const scale = 0.95 + visiblePercentage * 0.05
          videoContainerRef.current.style.transform = `scale(${scale})`
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const ambientLight = ambientLightRef.current
    if (!video || !ambientLight) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    const extractColors = () => {
      if (video.readyState >= 2) {
        canvas.width = 100
        canvas.height = 100
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        let r = 0, g = 0, b = 0
        const sampleSize = 1000
        
        for (let i = 0; i < sampleSize; i++) {
          const idx = Math.floor(Math.random() * (imageData.length / 4)) * 4
          r += imageData[idx]
          g += imageData[idx + 1]
          b += imageData[idx + 2]
        }
        
        r = Math.floor(r / sampleSize)
        g = Math.floor(g / sampleSize)
        b = Math.floor(b / sampleSize)
        
        ambientLight.style.background = `radial-gradient(circle, rgba(${r},${g},${b},0.8) 0%, rgba(${r},${g},${b},0.5) 40%, rgba(${r},${g},${b},0.2) 70%, transparent 100%)`
      }
    }

    const interval = setInterval(extractColors, 100)
    video.addEventListener("loadeddata", extractColors)
    
    return () => {
      clearInterval(interval)
      video.removeEventListener("loadeddata", extractColors)
    }
  }, [])
  return (
    <div className="min-h-screen pt-24 relative">
      <Navigation />

      <section className="relative pt-32 pb-32 px-4 overflow-visible">
        <div ref={ambientLightRef} className="fixed top-0 left-1/2 -translate-x-1/2 w-[150vw] h-[100vh] blur-[150px] transition-all duration-300 opacity-60 pointer-events-none" style={{ zIndex: 0 }} />
        <div className="container mx-auto relative z-10 max-w-7xl">
          <div className="grid md:grid-cols-[1fr,1.4fr] gap-8 md:gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 text-xs text-primary font-mono">
                <Sparkles className="h-3 w-3" />
                v1.0.1.6 BETA
              </div>

              <h1 className="text-7xl md:text-8xl font-bold tracking-tighter leading-none">
                El editor de código
                <span className="block text-primary mt-4 font-mono text-6xl md:text-7xl">
                  <Typewriter text="del futuro" delay={80} />
                </span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Rendimiento extremo. Privacidad total. Diseñado para desarrolladores que no aceptan compromisos.
              </p>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-base rounded-xl border-2 border-primary transition-all duration-200 hover:translate-x-1 hover:translate-y-1 shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] hover:shadow-[0px_0px_0px_0px_rgba(100,100,100,1)]"
                >
                  <Link href="/download" className="flex items-center gap-2">
                    Descargar Beta
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-base rounded-xl border-2 bg-transparent transition-all duration-200 hover:translate-x-1 hover:translate-y-1 shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] hover:shadow-[0px_0px_0px_0px_rgba(100,100,100,1)]"
                >
                  <Link href="/features">Características</Link>
                </Button>
              </div>
            </div>

            <div className="relative w-full group">
              <div ref={videoContainerRef} className="relative w-full rounded-2xl border border-border overflow-hidden bg-black transition-transform duration-300 ease-out shadow-2xl">
                <video
                  ref={videoRef}
                  src="/1.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  crossOrigin="anonymous"
                  className="w-full h-auto"
                />
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-black/60 backdrop-blur-sm border border-border hover:bg-black/80 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 text-white" />
                    ) : (
                      <Play className="h-5 w-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { value: "50ms", label: "Tiempo de inicio" },
              { value: "10M+", label: "Líneas de código soportadas" },
              { value: "100%", label: "Privacidad garantizada" },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="text-6xl font-bold text-primary font-mono">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl space-y-32">
          {[
            {
              icon: Zap,
              title: "Velocidad sin precedentes",
              description:
                "Arquitectura optimizada desde cero. Maneja proyectos masivos sin comprometer la fluidez. Búsqueda instantánea en millones de líneas.",
              align: "left",
              image: "/3.png",
            },
            {
              icon: Globe,
              title: "Navegador integrado con IA",
              description:
                "Navegador web nativo integrado que la IA puede ver, analizar y controlar en tiempo real. Desarrolla y prueba sin salir del editor.",
              align: "right",
              image: null,
            },
            {
              icon: Terminal,
              title: "IA que respeta tu privacidad",
              description:
                "Integra tu propia API key o ejecuta modelos localmente. Asistencia inteligente sin sacrificar tu privacidad.",
              align: "left",
              image: null,
            },
          ].map((feature, i) => (
            <div
              key={i}
              className={`grid lg:grid-cols-2 gap-16 items-center ${feature.align === "right" ? "lg:grid-flow-dense" : ""}`}
            >
              <div className={`space-y-6 ${feature.align === "right" ? "lg:col-start-2" : ""}`}>
                <div className="inline-flex p-4 rounded-2xl bg-primary/10">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-5xl font-bold tracking-tight leading-tight">{feature.title}</h2>
                <p className="text-xl text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
              <div className={`${feature.align === "right" ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                {feature.image ? (
                  <div className="rounded-2xl border border-border overflow-hidden bg-black">
                    <Image src={feature.image} alt={feature.title} width={1920} height={1080} className="w-full h-auto" />
                  </div>
                ) : (
                  <div className="aspect-video rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] hover:scale-[1.02]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-32 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="relative border border-border/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
            <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
            <div className="relative z-10 px-16 py-20">
              <div className="grid lg:grid-cols-[1fr,auto] gap-12 items-center">
                <div className="space-y-6 text-left">
                  <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                    Desarrolla sin límites.
                    <span className="block text-primary mt-2">Empieza hoy.</span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-xl">
                    Únete a miles de desarrolladores que ya están usando Scrakk para construir el futuro del software.
                  </p>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-base rounded-xl border-2 border-primary transition-all duration-200 hover:translate-x-1 hover:translate-y-1 shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] hover:shadow-[0px_0px_0px_0px_rgba(100,100,100,1)]"
                >
                  <Link href="/download" className="flex items-center gap-2">
                    Descargar ahora
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Scrakk Code Editor Logo" width={20} height={20} className="text-primary" />
              <span className="font-mono font-bold">Scrakk Code Editor</span>
              <span className="text-xs text-muted-foreground">v1.0.1.6</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Scrakk Code Editor. En desarrollo.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
