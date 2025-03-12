"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@repo/ui/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Button } from "@repo/ui/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar"
import { Badge } from "@repo/ui/components/ui/badge"
import {TcardProps} from "@repo/ui/type"

export default function CustomCard({
  image,
  title,
  description,
  button,
  link,
  avatar,
  nameAndPlace,
  namePosition = "bottom",
  tags,
  layout = "vertical",
  width = "compact",
  onClick,
  className,
}: TcardProps) {
 
  // Returns a CSS class for the image's aspect ratio or 
  // an empty string if not set.
  const fnGetAspectRatioClass = () => {
    if (!image?.aspectRatio || image.aspectRatio === "auto") return ""

    switch (image.aspectRatio) {
      case "square":
        return "aspect-square"
      case "video":
        return "aspect-video"
      case "wide":
        return "aspect-[16/9]"
      default:
        return ""
    }
  }

  // Component to display a user's profile details, including their name, place, and avatar.
  // The layout adjusts based on the `namePosition` prop, allowing the avatar to be positioned
  // on the left, right, top, or bottom relative to the name and place.
  const PROFILE_DETAILS = nameAndPlace && (
    <div
      className={cn(
        "flex items-start gap-2",
        namePosition === "left" || namePosition === "right" ? "flex-row" : "flex-col",
      )}
    >
      {avatar && (namePosition === "left" || namePosition === "right" || namePosition === "top" || namePosition === "bottom") && (
        <Avatar>
          <AvatarImage src={avatar.src} alt={avatar.alt} />
          <AvatarFallback>{avatar.fallback}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(namePosition === "left" ? "text-left" : namePosition === "right" ? "text-right" : "text-left")}
      >
        <p className="font-medium">{nameAndPlace.name}</p>
        {nameAndPlace.place && <p className="text-sm text-muted-foreground">{nameAndPlace.place}</p>}
      </div>
     
    </div>
  )

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-md",
        width === "compact" ? "max-w-sm" : "w-full",
        layout === "horizontal" ? "md:flex md:flex-row" : "flex flex-col",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      {/* Image Section */}
      {image && layout === "vertical" && (
        <div className={cn("w-full overflow-hidden", fnGetAspectRatioClass())}>
          {image.svg ? <div style={{ width: `${image.width}px`, height: `${image.height}px` }}> {image.svg} </div> :<Image
            src={image.src || "/placeholder.svg"}
            alt={image.alt}
            width={500}
            height={300}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />}
        </div>
      )}

      <div className={cn("flex flex-col", layout === "horizontal" && "md:flex-1")}>
        {/* Horizontal Layout Image */}
        {image && layout === "horizontal" && (
          <div className={cn("md:w-48 overflow-hidden", fnGetAspectRatioClass() || "h-full")}>
             {image.svg ? <div style={{ width: `${image.width}px`, height: `${image.height}px` }}> {image.svg} </div> :<Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              width={500}
              height={300}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />}
          </div>
        )}

        {/* Name and Place - Top Position */}
        {nameAndPlace && namePosition === "top" && <div className="px-6 pt-6">{PROFILE_DETAILS}</div>}

        {/* Card Header */}
        <CardHeader>
          {/* Name and Place - Left Position */}
          {nameAndPlace && namePosition === "left" && PROFILE_DETAILS}

          <div className={cn("flex", namePosition === "right" ? "flex-row items-center justify-between" : "flex-col")}>
            <CardTitle>{title}</CardTitle>

            {/* Name and Place - Right Position */}
            {nameAndPlace && namePosition === "right" && PROFILE_DETAILS}
          </div>

          <CardDescription>{description}</CardDescription>
        </CardHeader>

        {/* Card Content - Tags */}
        {tags && tags.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}

        {/* Card Footer */}
        <CardFooter
          className={cn(
            "flex",
            namePosition === "bottom" ? "flex-col items-start gap-4" : "flex-row justify-between items-center",
          )}
        >
       <div className="flex w-full justify-between">
        {button?.map((btn, index) => (
         
          <Button
            key={`btn-${index}`}
            variant={btn.variant || "default"}
            size={btn.size || "default"}
          >
             <Link href={btn.href}>
            {btn.label}
            </Link>
          </Button>
        ))}
         {Array.isArray(link) &&
          link.map((lnk, index) => (
            <Button key={`lnk-${index}`} variant="link" className="p-0" asChild onClick={(e) => e.stopPropagation()}>
              <Link href={lnk.href}>{lnk.label}</Link>
            </Button>
          ))}
      </div>

          {/* Name and Place - Bottom Position */}
          {nameAndPlace && namePosition === "bottom" && PROFILE_DETAILS}
        </CardFooter>
      </div>
    </Card>
  )
}

