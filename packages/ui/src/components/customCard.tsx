"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";
import clsx from "clsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import { TcardProps } from "@repo/ui/type";

export default function CustomCard({
  image,
  header,
  button,
  link,
  avatar,
  nameAndPlace,
  namePosition = "bottom",
  footerClassName = "",
  buttonPosition = "",
  tag,
  layout = "vertical",
  onClick,
  className,
}: TcardProps) {
  // Returns a CSS class for the image's aspect ratio or
  // an empty string if not set.
  const fnGetAspectRatioClass = () => {
    if (!image?.aspectRatio || image.aspectRatio === "auto") return "";

    switch (image.aspectRatio) {
      case "square":
        return "aspect-square";
      case "video":
        return "aspect-video";
      case "wide":
        return "aspect-[16/9]";
      default:
        return "";
    }
  };

  // Component to display a user's profile details, including their name, place, and avatar.
  // The layout adjusts based on the `namePosition` prop, allowing the avatar to be positioned
  // on the left, right, top, or bottom relative to the name and place.
  const PROFILE_DETAILS = nameAndPlace && (
    <div
      className={cn(
        "flex items-start gap-2",
        namePosition === "left" || "bottom" || namePosition === "right"
          ? "flex-row"
          : "flex-col"
      )}
    >
      {avatar &&
        (namePosition === "left" ||
          namePosition === "right" ||
          namePosition === "top" ||
          namePosition === "bottom") && (
          <Avatar>
            <AvatarImage src={avatar.src} alt={avatar.alt} />
            <AvatarFallback>{avatar.alt}</AvatarFallback>
          </Avatar>
        )}
      <div
        className={cn(
          namePosition === "left"
            ? "text-left"
            : namePosition === "right"
              ? "text-right"
              : "text-left"
        )}
      >
        <p className="font-medium">{nameAndPlace.name}</p>
        {nameAndPlace.place && (
          <p className="text-sm text-muted-foreground">{nameAndPlace.place}</p>
        )}
      </div>
    </div>
  );

  return (
    <Card
      className={clsx(
        "overflow-hidden transition-all duration-200 hover:shadow-md",
        // width === "compact" ? "max-w-md" : "w-full",
        layout === "horizontal" ? "md:flex md:flex-row" : "flex flex-col",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Image Section */}
      {image && layout === "vertical" && (
        <div
          className={cn(
            "w-full overflow-hidden relative",
            fnGetAspectRatioClass()
          )}
        >
          {image.svg ? (
            <div
              style={{ width: `${image.width}px`, height: `${image.height}px` }}
            >
              {" "}
              {image.svg}{" "}
            </div>
          ) : (
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              width={500}
              height={300}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          )}
          {tag && (
            <Badge
              variant="default"
              className="absolute top-2 right-2 rounded-full px-2 py-1"
            >
              {tag}
            </Badge>
          )}
        </div>
      )}

      <div
        className={cn("flex flex-col", layout === "horizontal" && "md:flex-1")}
      >
        {/* Horizontal Layout Image */}
        {image && layout === "horizontal" && (
          <div
            className={cn(
              "md:w-48 overflow-hidden",
              fnGetAspectRatioClass() || "h-full"
            )}
          >
            {image.svg ? (
              <div
                style={{
                  width: `${image.width}px`,
                  height: `${image.height}px`,
                }}
              >
                
                {image.svg}
              </div>
            ) : (
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                width={500}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            )}
          </div>
        )}

        {/* Name and Place - Top Position */}
        {nameAndPlace && namePosition === "top" && (
          <div className="px-6 pt-6">{PROFILE_DETAILS}</div>
        )}

        {/* Card Header */}
        <CardHeader>
          {/* Name and Place - Left Position
          {nameAndPlace && namePosition === "left" && PROFILE_DETAILS} */}

          {/* <div className={cn("flex", namePosition === "right" ? "flex-row items-center justify-between" : "flex-col")}> */}
          <h2 className={cn("text-xl mb-3 font-semibold", header.headingClass)}>{header.text}</h2>

          {/* Name and Place - Right Position
            {nameAndPlace && namePosition === "right" && PROFILE_DETAILS} */}
          {/* </div> */}

          <p className={cn("max-w-[700px] text-muted-foreground", header.descripClass)}>{header.subtitle}</p>
        </CardHeader>

        {/* Card Footer */}
        <CardFooter
          className={cn(
            "flex",
            namePosition === "bottom" ? "flex-col" : "flex-row",
            footerClassName
          )}
        >
          <div
            className={clsx(
              "flex w-full gap-8",
              button?.length === 1 || link?.length === 1
                ? ""
                : "md:justify-center flex-col md:flex-row",
              buttonPosition
            )}
          >
            {button?.map((btn, index) => (
              <Button
                key={`btn-${index}`}
                variant={btn.variant || "default"}
                size={btn.size || "default"}
                className=""
              >
                {/* If iconPosition is 'before', render icon first */}
                {btn.icon && btn.iconPosition === "before" && (
                  <span className="mr-2">{btn.icon}</span>
                )}

                {/* Button Label */}
               {btn.href && <Link href={btn.href}>{btn.label}</Link>}
                {/* If iconPosition is 'after', render icon after */}
                {btn.icon && btn.iconPosition === "after" && (
                  <span className="ml-2">{btn.icon}</span>
                )}
              </Button>
            ))}
            {
              link?.map((lnk, index) => (
                <Button
                  key={`lnk-${index}`}
                  variant="link"
                  className="p-0"
                 
                  onClick={(e) => e.stopPropagation()}
                >
                  {lnk.icon && lnk.iconPosition === "before" && (
                    <span className="mr-2">{lnk.icon}</span>
                  )}{" "}
                  {lnk.href && <Link href={lnk.href}>{lnk.label}</Link>}
                  {lnk.icon && lnk.iconPosition === "after" && (
                    <span className="ml-2">{lnk.icon}</span>
                  )}
                </Button>
              ))}
          </div>

          {/* Name and Place - Bottom Position */}
          {nameAndPlace && namePosition === "bottom" && PROFILE_DETAILS}
        </CardFooter>
      </div>
    </Card>
  );
}
