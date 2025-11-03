"use client"

import { useEffect, useState } from "react"

interface TypewriterProps {
  text: string
  delay?: number
  className?: string
}

export function Typewriter({ text, delay = 100, className = "" }: TypewriterProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, delay)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, delay, text])

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">_</span>
    </span>
  )
}
