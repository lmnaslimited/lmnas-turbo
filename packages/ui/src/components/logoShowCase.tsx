"use client"
import Image from "next/image"
import { cn } from "@repo/ui/lib/utils"
import { ReactElement } from "react"
import { motion, useAnimation } from "framer-motion"
import { TlogoShowcaseProps, Timage } from "@repo/middleware"

/**
 * LogoShowcase Component
 * Purpose: Displays a collection of logos in either a grid layout or a marquee (scrolling ticker) layout.
 * Props:
 * - idLogoProps: Configuration object containing logo data, layout preferences, animation speed, and spacing.
 */
export default function LogoShowcase({ idLogoProps }: { idLogoProps: TlogoShowcaseProps }): ReactElement {
  /**
   * Determines the dimensions (width & height) of each logo based on the specified size.
   * Returns an object with width and height properties.
   */
  const fnGetLogoDimensions = (): { width: number; height: number } => {
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

  /**
    * Determines the spacing between logos based on the spacing prop.
    * Returns a Tailwind CSS class for gap spacing.
    */
  const fnGetSpacing = (): string => {
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

  /**
 * Determines the animation speed for the marquee (scrolling ticker).
 * Returns a numerical value representing the animation duration.
 */
  const fnGetMarqueeSpeed = (): number => {
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

  /**
  * Renders the logos either in a grid layout or a marquee (scrolling ticker) layout.
  * Decides which component to use based on the 'variant' prop.
  */
  const fnRenderLogos = (): ReactElement => {
    switch (idLogoProps.variant) {
      case "marquee":
        return (
          <MarqueeLogos
            logos={idLogoProps?.logos || []}
            speed={fnGetMarqueeSpeed()}
            spacing={fnGetSpacing()}
            dimensions={fnGetLogoDimensions() ?? { width: 150, height: 75 }}
            pauseOnHover={idLogoProps?.pauseOnHover ?? true}
            variant="marquee"
          />
        )
      case "grid":
      default:
        return (
          <GridLogos
            logos={idLogoProps.logos}
            spacing={fnGetSpacing()}
            dimensions={fnGetLogoDimensions() ?? { width: 150, height: 75 }}
            logosPerRow={idLogoProps.logosPerRow || 4}
            variant="grid"
          />
        )
    }
  }

  return <div className={cn("w-full overflow-hidden", idLogoProps.className,)}>{fnRenderLogos()}</div>
}

/**
 * MarqueeLogos Component
 * Purpose: Displays logos in a continuous scrolling (ticker) animation.
 * Props:
 * - idMarquee: Configuration object containing logos, animation speed, spacing, and hover behavior.
 */
function MarqueeLogos(idMarquee: TlogoShowcaseProps): ReactElement {
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
          <LogoItem key={`${idLogo.alternate}-${iIndex}`} logo={idLogo} dimensions={idMarquee.dimensions ?? { width: 150, height: 75 }} />
        ))}
      </motion.div>
    </div>
  )
}

/**
 * GridLogos Component
 * Purpose: Displays logos in a grid layout with animations.
 * Props:
 * - idGridLogo: Configuration object containing logos, grid spacing, dimensions, and logos per row.
 */
function GridLogos(idGridLogo: TlogoShowcaseProps): ReactElement {
  /**
   * Determines the Tailwind CSS class for the number of columns in the grid.
   * Returns a grid class based on the 'logosPerRow' prop.
   */
  const fnGridCols = (): string => {
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
            key={`${idLogo.alternate}-${iIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: iIndex * 0.05 }}
            className="flex justify-center"
          >
            <LogoItem logo={idLogo} dimensions={idGridLogo.dimensions ?? { width: 150, height: 75 }} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/**
 * LogoItem Component
 * Purpose: Renders a single logo, either as an image or an inline SVG.
 * Props:
 * - idLogo: Object containing logo details and dimensions.
 */
function LogoItem(idLogo: { logo: Timage; dimensions: { width: number; height: number } }): ReactElement {
  const { width, height } = idLogo.dimensions
  const LogoElement: ReactElement = (
    <div
      className="flex items-center justify-center p-4 rounded-lg transition-all duration-200">
      {idLogo.logo.svg ? (

        <div
          className={cn("flex items-center justify-center")}
          style={{ width: width, height: height }}
        >
          {idLogo.logo.svg}
        </div>
      )

        : <Image
          src={idLogo.logo.source || "/placeholder.svg"}
          alt={idLogo.logo.alternate}
          width={width}
          height={height}
          className={cn("object-contain")}
          loading="lazy"
        />
      }
    </div>
  )

  return LogoElement
}

