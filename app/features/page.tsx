"use client"

import { Navigation } from "@/components/navigation"
import { Code2, Brain, Zap, Palette, Blocks, Monitor } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export default function FeaturesPage() {
  const [activeSection, setActiveSection] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const stickyRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Generar valores aleatorios únicos para cada letra al cargar
    const randomValues = new Map()

    const handleScroll = () => {
      const scrollY = window.scrollY

      // Scroll indicator fade out
      const scrollIndicator = document.querySelector('.scroll-indicator') as HTMLElement
      if (scrollIndicator) {
        const opacity = Math.max(0, 1 - scrollY / 200)
        scrollIndicator.style.opacity = `${opacity}`
        scrollIndicator.style.transform = `translate(-50%, ${scrollY * 0.3}px)`
      }

      // Hero tag border fade out
      const heroTag = document.querySelector('.hero-tag') as HTMLElement
      if (heroTag) {
        const borderOpacity = Math.max(0, 1 - scrollY / 300)
        heroTag.style.borderColor = `rgba(112, 32, 243, ${borderOpacity * 0.3})`
      }

      // Hero con efecto de destrucción letra por letra ALEATORIO
      if (heroRef.current) {
        const chars = heroRef.current.querySelectorAll('.hero-char')
        chars.forEach((char) => {
          const charEl = char as HTMLElement
          const index = parseInt(charEl.getAttribute('data-index') || '0')

          // Generar o recuperar valores aleatorios únicos para esta letra
          if (!randomValues.has(index)) {
            randomValues.set(index, {
              delay: Math.random() * 200,
              xDirection: (Math.random() - 0.5) * 200,
              yDirection: 50 + Math.random() * 150,
              rotation: (Math.random() - 0.5) * 360,
              scale: 0.3 + Math.random() * 0.4,
              blurAmount: 5 + Math.random() * 15
            })
          }

          const random = randomValues.get(index)
          const charProgress = Math.max(0, Math.min(1, (scrollY - random.delay) / 150))

          charEl.style.opacity = `${1 - charProgress * charProgress}` // Easing
          charEl.style.transform = `
            translateY(${charProgress * random.yDirection}px) 
            translateX(${charProgress * random.xDirection}px) 
            rotate(${charProgress * random.rotation}deg) 
            scale(${1 - charProgress * random.scale})
          `
          charEl.style.filter = `blur(${charProgress * random.blurAmount}px)`
        })

        // Destruir el scroll indicator y el gradiente
        const scrollIndicator = heroRef.current.querySelector('.scroll-indicator') as HTMLElement
        const gradient = heroRef.current.querySelector('.hero-gradient') as HTMLElement

        if (scrollIndicator) {
          const indicatorProgress = Math.max(0, Math.min(1, scrollY / 300))
          scrollIndicator.style.opacity = `${1 - indicatorProgress}`
          scrollIndicator.style.transform = `translateY(${indicatorProgress * 100}px) scale(${1 - indicatorProgress * 0.5})`
        }

        if (gradient) {
          const gradientProgress = Math.max(0, Math.min(1, scrollY / 400))
          gradient.style.opacity = `${1 - gradientProgress}`
        }
      }

      // Sticky sections
      stickyRefs.current.forEach((section, index) => {
        if (section) {
          const rect = section.getBoundingClientRect()
          const windowHeight = window.innerHeight

          // Determinar sección activa
          if (rect.top < windowHeight / 2 && rect.bottom > windowHeight / 2) {
            setActiveSection(index)
          }

          // Efecto de reveal
          const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight))
          const image = section.querySelector('.feature-image') as HTMLElement
          const content = section.querySelector('.feature-content') as HTMLElement

          if (image) {
            image.style.transform = `scale(${0.8 + progress * 0.2}) rotate(${(1 - progress) * 5}deg)`
            image.style.opacity = `${progress}`
          }

          if (content) {
            content.style.transform = `translateX(${(1 - progress) * 50}px)`
            content.style.opacity = `${progress}`

            // Animación suave y elegante: fade in desde abajo con delay
            const titleChars = content.querySelectorAll('.title-char')
            titleChars.forEach((char, i) => {
              const charEl = char as HTMLElement
              const charProgress = Math.max(0, Math.min(1, progress * 1.2 - i * 0.05))

              // Easing suave (ease-out cubic)
              const eased = 1 - Math.pow(1 - charProgress, 3)

              // Simple fade in desde abajo
              const yDistance = (1 - eased) * 30
              const scale = 0.9 + eased * 0.1

              charEl.style.transform = `translateY(${yDistance}px) scale(${scale})`
              charEl.style.opacity = `${eased}`
            })
          }

          // Destruir SVG cuando sale del viewport
          const iconContainer = section.querySelector('.feature-icon-container') as HTMLElement
          if (iconContainer && rect.bottom < 0) {
            const exitProgress = Math.min(1, Math.abs(rect.bottom) / 300)
            iconContainer.style.opacity = `${1 - exitProgress}`
            iconContainer.style.transform = `
              translateY(${exitProgress * -100}px) 
              translateX(${(Math.random() - 0.5) * exitProgress * 100}px)
              rotate(${exitProgress * 360}deg) 
              scale(${1 - exitProgress * 0.8})
            `
            iconContainer.style.filter = `blur(${exitProgress * 10}px)`
          } else if (iconContainer && rect.bottom >= 0) {
            iconContainer.style.opacity = '1'
            iconContainer.style.transform = 'none'
            iconContainer.style.filter = 'none'
          }

          // Animar stats con scroll
          const stats = section.querySelectorAll('.stat-item')
          stats.forEach((stat, idx) => {
            const statEl = stat as HTMLElement
            statEl.style.transform = `translateY(${(1 - progress) * 60}px) rotate(${(1 - progress) * 10}deg)`
            statEl.style.opacity = `${Math.max(0, progress - 0.3 - idx * 0.1)}`
          })

          // Animar lista de features con scroll
          const listItems = section.querySelectorAll('.feature-list-item')
          listItems.forEach((item, idx) => {
            const itemEl = item as HTMLElement
            itemEl.style.transform = `translateX(${(1 - progress) * 40}px)`
            itemEl.style.opacity = `${Math.max(0, progress - 0.4 - idx * 0.05)}`
          })

          // Animar textos individuales con efectos únicos
          const title = section.querySelector('.feature-title') as HTMLElement
          const subtitle = section.querySelector('.feature-subtitle') as HTMLElement
          const description = section.querySelector('.feature-description') as HTMLElement
          const tag = section.querySelector('.feature-tag') as HTMLElement
          const icon = section.querySelector('.feature-icon') as HTMLElement

          if (title) {
            title.style.transform = `translateY(${(1 - progress) * 30}px) scale(${0.95 + progress * 0.05})`
            title.style.opacity = `${progress}`
            title.style.letterSpacing = `${(1 - progress) * -2}px`
          }
          if (subtitle) {
            subtitle.style.transform = `translateY(${(1 - progress) * 40}px) translateX(${(1 - progress) * -20}px)`
            subtitle.style.opacity = `${Math.max(0, progress - 0.1)}`
          }
          if (description) {
            description.style.transform = `translateY(${(1 - progress) * 50}px)`
            description.style.opacity = `${Math.max(0, progress - 0.2)}`
            description.style.filter = `blur(${(1 - progress) * 4}px)`
          }
          if (tag) {
            tag.style.transform = `translateX(${(1 - progress) * -30}px)`
            tag.style.opacity = `${progress}`
            tag.style.letterSpacing = `${0.1 + progress * 0.2}em`
          }
          if (icon) {
            icon.style.transform = `rotate(${(1 - progress) * 180}deg) scale(${0.5 + progress * 0.5})`
            icon.style.opacity = `${progress}`
          }
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const features = [
    {
      icon: Code2,
      tag: "EDITOR",
      title: "Monaco",
      subtitle: "El motor de VS Code",
      description: "Resaltado de sintaxis avanzado, IntelliSense y soporte para más de 100 lenguajes de programación.",
      stats: ["100+", "∞"],
      labels: ["Lenguajes", "Temas"],
      image: "/monaco-editor-code-interface-with-syntax-highlight.jpg",
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Brain,
      tag: "INTELIGENCIA",
      title: "IA Integrada",
      subtitle: "Tu asistente privado",
      description: "Integración con modelos de IA mediante API key o ejecución local. Asistencia inteligente sin comprometer tu privacidad.",
      features: ["API Key personalizada", "Modelos locales", "100% privado"],
      image: "/ai-assistant-interface-with-code-suggestions.jpg",
      color: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: Zap,
      tag: "RENDIMIENTO",
      title: "Velocidad",
      subtitle: "Extremadamente rápido",
      description: "Optimizado para proyectos masivos. Búsqueda instantánea, bajo consumo de memoria y rendimiento que no compromete la fluidez.",
      stats: ["<50ms", "<200MB"],
      labels: ["Inicio", "RAM"],
      image: "/performance-metrics-dashboard-with-graphs.jpg",
      color: "from-yellow-500/20 to-orange-500/20",
    },
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-black">
      <Navigation />

      {/* Hero con efecto de destrucción */}
      <section ref={heroRef} className="h-screen flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent hero-gradient" />
        <div className="text-center space-y-6 relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 text-xs font-mono text-primary mb-4 hero-tag">
            {'SCROLL PARA EXPLORAR'.split('').map((char, i) => (
              <span key={i} className="inline-block hero-char" data-index={i}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter hero-title">
            {'Características'.split('').map((char, i) => (
              <span key={i} className="inline-block hero-char" data-index={i + 20}>
                {char}
              </span>
            ))}
          </h1>
          <p className="text-2xl text-muted-foreground font-light max-w-2xl mx-auto hero-subtitle">
            {'Cada detalle diseñado para la perfección'.split('').map((char, i) => (
              <span key={i} className="inline-block hero-char" data-index={i + 35}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </p>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce scroll-indicator transition-all duration-300">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-primary rounded-full" />
          </div>
        </div>
      </section>

      {/* Secciones sticky con reveal */}
      {features.map((feature, index) => (
        <section
          key={index}
          ref={(el) => (stickyRefs.current[index] = el)}
          className="min-h-screen flex items-center px-6 py-32 relative"
        >
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className={`feature-content space-y-8 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="feature-icon-container">
                      {index === 0 ? (
                        <feature.icon className="h-8 w-8 text-primary" strokeWidth={2.5} />
                      ) : index === 1 ? (
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                          <feature.icon className="h-6 w-6 text-primary" strokeWidth={2} />
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg border border-primary/30">
                          <feature.icon className="h-7 w-7 text-primary" strokeWidth={2} />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-mono text-primary tracking-widest">{feature.tag}</span>
                  </div>

                  <div className="overflow-hidden">
                    <h2 className="text-6xl font-black tracking-tighter mb-2">
                      {feature.title.split('').map((char, i) => (
                        <span
                          key={i}
                          className="inline-block title-char transition-all duration-300"
                        >
                          {char}
                        </span>
                      ))}
                    </h2>
                    <p className="text-2xl text-muted-foreground font-light">{feature.subtitle}</p>
                  </div>
                </div>

                <p className="text-lg text-muted-foreground/80 leading-relaxed">
                  {feature.description}
                </p>

                {feature.stats && (
                  <div className="flex gap-12 pt-4">
                    {feature.stats.map((stat, i) => (
                      <div key={i} className="relative group cursor-pointer">
                        <div className="text-5xl font-black text-primary font-mono mb-2 group-hover:scale-110 transition-transform duration-300">
                          {stat.split('').map((char, idx) => (
                            <span
                              key={idx}
                              className="inline-block hover:text-white hover:scale-150 transition-all duration-200"
                            >
                              {char}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors duration-300">{feature.labels[i]}</div>
                        <div className="absolute -bottom-2 left-0 w-12 h-1 bg-primary/50 group-hover:w-full transition-all duration-500" />
                      </div>
                    ))}
                  </div>
                )}

                {feature.features && (
                  <div className="space-y-3 pt-4">
                    {feature.features.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm group hover:bg-white/10 hover:border-primary/50 transition-all duration-300 cursor-pointer"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-[2] transition-transform duration-300" />
                        <span className="text-sm group-hover:text-foreground transition-colors duration-300">
                          {item.split(' ').map((word, idx) => (
                            <span
                              key={idx}
                              className="inline-block hover:text-primary hover:scale-110 transition-all duration-200 mr-1"
                            >
                              {word}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={`feature-image ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} mix-blend-overlay`} />
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Sección final rediseñada */}
      <section className="min-h-screen flex items-center px-6 py-32 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Y mucho más
            </h2>
            <div className="h-px max-w-xs mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
            <p className="text-xl text-muted-foreground font-light">Herramientas que potencian tu flujo de trabajo</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: () => (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3V7M15 3V6M4 10H20M12 21C10.2337 21 8.91561 19.3737 9.28133 17.6457L9.34332 17.3528C9.56076 16.3254 9.04388 15.2832 8.09439 14.8346L5.9897 13.8401C4.77487 13.2661 4 12.043 4 10.6994V4.63149C4 3.73044 4.73044 3 5.63149 3H18.3685C19.2696 3 20 3.73044 20 4.63149V10.6994C20 12.043 19.2251 13.2661 18.0103 13.8401L15.9056 14.8346C14.9561 15.2832 14.4392 16.3254 14.6567 17.3528L14.7187 17.6457C15.0844 19.3737 13.7663 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: "Temas",
                desc: "Personalización total",
                color: "pink"
              },
              {
                icon: () => (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 14V20M14 17H20M15.6 10H18.4C18.9601 10 19.2401 10 19.454 9.89101C19.6422 9.79513 19.7951 9.64215 19.891 9.45399C20 9.24008 20 8.96005 20 8.4V5.6C20 5.03995 20 4.75992 19.891 4.54601C19.7951 4.35785 19.6422 4.20487 19.454 4.10899C19.2401 4 18.9601 4 18.4 4H15.6C15.0399 4 14.7599 4 14.546 4.10899C14.3578 4.20487 14.2049 4.35785 14.109 4.54601C14 4.75992 14 5.03995 14 5.6V8.4C14 8.96005 14 9.24008 14.109 9.45399C14.2049 9.64215 14.3578 9.79513 14.546 9.89101C14.7599 10 15.0399 10 15.6 10ZM5.6 10H8.4C8.96005 10 9.24008 10 9.45399 9.89101C9.64215 9.79513 9.79513 9.64215 9.89101 9.45399C10 9.24008 10 8.96005 10 8.4V5.6C10 5.03995 10 4.75992 9.89101 4.54601C9.79513 4.35785 9.64215 4.20487 9.45399 4.10899C9.24008 4 8.96005 4 8.4 4H5.6C5.03995 4 4.75992 4 4.54601 4.10899C4.35785 4.20487 4.20487 4.35785 4.10899 4.54601C4 4.75992 4 5.03995 4 5.6V8.4C4 8.96005 4 9.24008 4.10899 9.45399C4.20487 9.64215 4.35785 9.79513 4.54601 9.89101C4.75992 10 5.03995 10 5.6 10ZM5.6 20H8.4C8.96005 20 9.24008 20 9.45399 19.891C9.64215 19.7951 9.79513 19.6422 9.89101 19.454C10 19.2401 10 18.9601 10 18.4V15.6C10 15.0399 10 14.7599 9.89101 14.546C9.79513 14.3578 9.64215 14.2049 9.45399 14.109C9.24008 14 8.96005 14 8.4 14H5.6C5.03995 14 4.75992 14 4.54601 14.109C4.35785 14.2049 4.20487 14.3578 4.10899 14.546C4 14.7599 4 15.0399 4 15.6V18.4C4 18.9601 4 19.2401 4.10899 19.454C4.20487 19.6422 4.35785 19.7951 4.54601 19.891C4.75992 20 5.03995 20 5.6 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: "Extensiones",
                desc: "Marketplace integrado",
                color: "blue"
              },
              { icon: Monitor, title: "Multi-plataforma", desc: "Windows, Mac, Linux", color: "orange" },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden cursor-pointer"
                style={{
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: `${i * 100}ms`,
                }}
                onMouseMove={(e) => {
                  const card = e.currentTarget
                  const rect = card.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top
                  card.style.setProperty('--mouse-x', `${x}px`)
                  card.style.setProperty('--mouse-y', `${y}px`)
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(112, 32, 243, 0.1), transparent 40%)`
                  }}
                />

                <div className="relative z-10 space-y-6">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-700" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {i === 0 || i === 1 ? (
                        <div className="text-primary transition-all duration-500 group-hover:rotate-[360deg]">
                          <item.icon />
                        </div>
                      ) : (
                        <item.icon
                          className="h-8 w-8 text-primary transition-all duration-500 group-hover:rotate-[360deg]"
                          strokeWidth={2}
                        />
                      )}
                    </div>
                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-orbit" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black">
                      {item.title.split('').map((char, idx) => (
                        <span
                          key={idx}
                          className="inline-block transition-all duration-300 group-hover:text-primary"
                          style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                          {char}
                        </span>
                      ))}
                    </h3>
                    <div className="h-px w-0 bg-primary group-hover:w-full transition-all duration-500" />
                  </div>

                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
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
