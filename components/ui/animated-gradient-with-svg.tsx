"use client"

import type React from "react"
import { useMemo, useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useDimensions } from "@/components/hooks/use-debounced-dimensions"

interface AnimatedGradientProps {
  colors: string[]
  speed?: number
  blur?: "light" | "medium" | "heavy"
}

// Seeded random function for consistent SSR/client values
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function seededRandomInt(seed: number, min: number, max: number) {
  return Math.floor(seededRandom(seed) * (max - min + 1)) + min
}

const AnimatedGradient: React.FC<AnimatedGradientProps> = ({ colors, speed = 5, blur = "light" }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const dimensions = useDimensions(containerRef)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const randomValues = useMemo(() => {
    return colors.map((_, index) => ({
      top: seededRandom(index * 10 + 1) * 50,
      left: seededRandom(index * 10 + 2) * 50,
      tx1: seededRandom(index * 10 + 3) - 0.5,
      ty1: seededRandom(index * 10 + 4) - 0.5,
      tx2: seededRandom(index * 10 + 5) - 0.5,
      ty2: seededRandom(index * 10 + 6) - 0.5,
      tx3: seededRandom(index * 10 + 7) - 0.5,
      ty3: seededRandom(index * 10 + 8) - 0.5,
      tx4: seededRandom(index * 10 + 9) - 0.5,
      ty4: seededRandom(index * 10 + 10) - 0.5,
      widthMultiplier: seededRandomInt(index * 10 + 11, 5, 15) / 10,
      heightMultiplier: seededRandomInt(index * 10 + 12, 5, 15) / 10,
    }))
  }, [colors.length])

  const circleSize = useMemo(() => {
    if (dimensions.width === 0 && dimensions.height === 0) {
      return 400 // Default size for SSR
    }
    return Math.max(dimensions.width, dimensions.height)
  }, [dimensions.width, dimensions.height])

  const blurClass = blur === "light" ? "blur-2xl" : blur === "medium" ? "blur-3xl" : "blur-[100px]"

  if (!isMounted) {
    return <div ref={containerRef} className="absolute inset-0 overflow-hidden" />
  }

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <div className={cn(`absolute inset-0`, blurClass)}>
        {colors.map((color, index) => {
          const randomValue = randomValues[index]
          if (!randomValue) return null

          return (
            <svg
              key={index}
              className="absolute animate-background-gradient"
              style={
                {
                  top: `${randomValue.top}%`,
                  left: `${randomValue.left}%`,
                  "--background-gradient-speed": `${1 / speed}s`,
                  "--tx-1": randomValue.tx1,
                  "--ty-1": randomValue.ty1,
                  "--tx-2": randomValue.tx2,
                  "--ty-2": randomValue.ty2,
                  "--tx-3": randomValue.tx3,
                  "--ty-3": randomValue.ty3,
                  "--tx-4": randomValue.tx4,
                  "--ty-4": randomValue.ty4,
                } as React.CSSProperties
              }
              width={circleSize * randomValue.widthMultiplier}
              height={circleSize * randomValue.heightMultiplier}
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="50" fill={color} className="opacity-30 dark:opacity-[0.15]" />
            </svg>
          )
        })}
      </div>
    </div>
  )
}

export { AnimatedGradient }
