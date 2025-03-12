"use client"

import Image from "next/image"
import { motion, useAnimation } from "framer-motion"
import { cn } from "@repo/ui/lib/utils"
import {TlogoShowcaseProps, Timage} from "@repo/ui/type.js"

export default function LogoShowcase({
  logos,
  variant = "grid",
  className = "",
  logoSize = "medium",
  speed = "medium",
  spacing = "normal",
  logosPerRow = 4,
  pauseOnHover = true,
}: TlogoShowcaseProps) {
  // Calculate logo dimensions based on size prop
  const fnGetLogoDimensions = () => {
    switch (logoSize) {
      case "small":
        return { width: 100, height: 50 }
      case "large":
        return { width: 200, height: 100 }
      case "medium":
      default:
        return { width: 150, height: 75 }
    }
  }

  // Calculate spacing based on spacing prop
  const fnGetSpacing = () => {
    switch (spacing) {
      case "tight":
        return "gap-8"
      case "loose":
        return "gap-24"
      case "normal":
      default:
        return "gap-16"
    }
  }

  // Calculate speed for marquee animation
  const fnGetMarqueeSpeed = () => {
    switch (speed) {
      case "slow":
        return 20
      case "fast":
        return 5
      case "medium":
      default:
        return 10
    }
  }

  // Render the appropriate variant
  const fnRenderLogos = () => {
    switch (variant) {
      case "marquee":
        return (
          <MarqueeLogos
            logos={logos}
            speed={fnGetMarqueeSpeed()}
            spacing={fnGetSpacing()}
            dimensions={fnGetLogoDimensions()}
            pauseOnHover={pauseOnHover}
          />
        )
      case "grid":
      default:
        return (
          <GridLogos
            logos={logos}
            spacing={fnGetSpacing()}
            dimensions={fnGetLogoDimensions()}
            logosPerRow={logosPerRow}
          />
        )
    }
  }

  return <div className={cn("w-full overflow-hidden", className,)}>{fnRenderLogos()}</div>
}

// Marquee (Running Ticker) Implementation
function MarqueeLogos({
  logos,
  speed,
  spacing,
  dimensions,
  pauseOnHover,
}: {
  logos: Timage[]
  speed: number
  spacing: string
  dimensions: { width: number; height: number }
  pauseOnHover: boolean
}) {
    const controls = useAnimation() // Controls for animation
    const duplicatedLogos = [...logos, ...logos]
  
    return (
      <div className="relative py-6 w-full overflow-hidden">
        <motion.div
          className={`flex ${spacing} min-w-max`}
          animate={controls}
          initial={{ x: "0%" }}
          transition={{
            x: ["0%", "-100%"],
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            duration: speed,
          }}
          onHoverStart={() => pauseOnHover && controls.stop()} // Stops animation
          onHoverEnd={() => pauseOnHover && controls.start({
            x: ["0%", "-100%"],
            transition: { repeat: Infinity, ease: "linear", duration: speed }
          })} // Restarts animation
        >
          {duplicatedLogos.map((logo, index) => (
            <LogoItem key={`${logo.alt}-${index}`} logo={logo} dimensions={dimensions} />
          ))}
        </motion.div>
      </div>
    )
}

// Grid/Flex Layout Implementation
function GridLogos({
  logos,
  spacing,
  dimensions,
  logosPerRow,
}: {
  logos: Timage[]
  spacing: string
  dimensions: { width: number; height: number }
  logosPerRow: number
}) {
  // Calculate grid columns based on logosPerRow
  const fnGridCols = () => {
    switch (logosPerRow) {
      case 2:
        return "grid-cols-2"
      case 3:
        return "grid-cols-2 md:grid-cols-3"
      case 5:
        return "grid-cols-2 md:grid-cols-5"
      case 6:
        return "grid-cols-2 md:grid-cols-6"
      case 4:
      default:
        return "grid-cols-2 md:grid-cols-4"
    }
  }

  return (
    <div className="py-6">
      <div className={cn("grid", fnGridCols(), spacing)}>
        {logos.map((logo, index) => (
          <motion.div
            key={`${logo.alt}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex justify-center"
          >
            <LogoItem logo={logo} dimensions={dimensions} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Shared Logo Item Component
function LogoItem({
  logo,
  dimensions,
}: {
  logo: Timage
  dimensions: { width: number; height: number }
}) {
  const { width, height } = dimensions
  const LOGO_WIDTH = logo.width || width
  const LOGO_HEIGHT = logo.height || height

  const LOGO_ELEMENT = (
    <div
      className={cn(
        "flex items-center justify-center p-4 rounded-lg transition-all duration-200",
       "",
        "",
      )}
    >
   {logo.svg ? (
      
        <div
          className={cn("flex items-center justify-center")}
          style={{ width: LOGO_WIDTH, height: LOGO_HEIGHT }}
        >
          {logo.svg}
        </div>
      )
    
     : <Image
        src={logo.src || "/placeholder.svg"}
        alt={logo.alt}
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className={cn("object-contain")}
        loading="lazy"
      />
    }
    </div>
  )

  return LOGO_ELEMENT
}

