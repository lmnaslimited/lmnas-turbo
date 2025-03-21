"use client"

import Image from "next/image"
import { motion, useAnimation } from "framer-motion"
import { cn } from "@repo/ui/lib/utils"
import {TlogoShowcaseProps, Timage} from "@repo/ui/type"

export default function LogoShowcase({
 idLogoProps
}: {idLogoProps:TlogoShowcaseProps}) {
  // Calculate logo dimensions based on size prop
  const fnGetLogoDimensions = () => {
    switch (idLogoProps.logoSize) {
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
    switch (idLogoProps.spacing) {
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
    switch (idLogoProps.speed) {
      case "slow":
        return 20
      case "fast":
        return 5
      case "medium":
      default:
        return 10
    }
  }

  // Render either grid / marquee(animation) layout
  //based on prop "variant"
  const fnRenderLogos = () => {
    switch (idLogoProps.variant) {
      case "marquee":
        return (
          <MarqueeLogos
          idMarquee={{logos:idLogoProps.logos,
            speed:fnGetMarqueeSpeed(),
            spacing:fnGetSpacing(),
            dimensions:fnGetLogoDimensions() || { width: 150, height: 75 },
            pauseOnHover:idLogoProps.pauseOnHover || true,
            variant: "marquee"
          }}
          />
        )
      case "grid":
      default:
        return (
          <GridLogos
          idGridLogo={{logos:idLogoProps.logos,
            spacing:fnGetSpacing(),
            dimensions:fnGetLogoDimensions() || { width: 150, height: 75 },
            logosPerRow:idLogoProps.logosPerRow || 4,
            variant: "grid"
          }}
          />
        )
    }
  }

  return <div className={cn("w-full overflow-hidden", idLogoProps.className,)}>{fnRenderLogos()}</div>
}

// Marquee (Running Ticker) Implementation
function MarqueeLogos({
 idMarquee
}: {
  idMarquee:TlogoShowcaseProps
}) {
    const Controls = useAnimation() // Controls for animation
    const DuplicateLogo = [...idMarquee.logos, ...idMarquee.logos]
  
    return (
      <div className="relative py-6 w-full overflow-hidden">
        <motion.div
          className={`flex ${idMarquee.spacing} min-w-max`}
          animate={Controls}
          initial={{ x: "0%" }}
          transition={{
            x: ["0%", "-100%"],
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            duration: idMarquee.speed,
          }}
          onHoverStart={() => idMarquee.pauseOnHover && Controls.stop()} // Stops animation
          onHoverEnd={() => idMarquee.pauseOnHover && Controls.start({
            x: ["0%", "-100%"],
            transition: { repeat: Infinity, ease: "linear", duration: idMarquee.speed }
          })} // Restarts animation
        >
          {DuplicateLogo.map((idLogo, iIndex) => (
            <LogoItem key={`${idLogo.alt}-${iIndex}`} idLogo={{logo: idLogo,  // Ensure the logo is explicitly passed
              dimensions: idMarquee.dimensions || { width: 150, height: 75 }}} />
          ))}
        </motion.div>
      </div>
    )
}

// Grid/Flex Layout Implementation
function GridLogos({
 idGridLogo
}: {
  idGridLogo:TlogoShowcaseProps
}) {
  // Calculate grid columns based on logosPerRow
  //this return a grid-cols tailwind class element
  const fnGridCols = () => {
    switch (idGridLogo.logosPerRow) {
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
      <div className={cn("grid", fnGridCols(), idGridLogo.spacing)}>
        {idGridLogo.logos.map((idLogo, iIndex) => (
          <motion.div
            key={`${idLogo.alt}-${iIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: iIndex * 0.05 }}
            className="flex justify-center"
          >
            <LogoItem idLogo={{logo: idLogo,  // Ensure the logo is explicitly passed
  dimensions: idGridLogo.dimensions || { width: 150, height: 75 } }} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Shared Logo Item Component
function LogoItem({
  idLogo
}: {idLogo:{
  logo: Timage
  dimensions: { width: number; height: number }
}}) {
  const { width, height } = idLogo.dimensions
  const LogoWidth =  width
  const LogoHeight =  height

  const LogoElement = (
    <div
      className={cn(
        "flex items-center justify-center p-4 rounded-lg transition-all duration-200",
       "",
        "",
      )}
    >
   {idLogo.logo.svg ? (
      
        <div
          className={cn("flex items-center justify-center")}
          style={{ width: LogoWidth, height: LogoHeight }}
        >
          {idLogo.logo.svg}
        </div>
      )
    
     : <Image
        src={idLogo.logo.src || "/placeholder.svg"}
        alt={idLogo.logo.alt}
        width={LogoWidth}
        height={LogoHeight}
        className={cn("object-contain")}
        loading="lazy"
      />
    }
    </div>
  )

  return LogoElement
}

