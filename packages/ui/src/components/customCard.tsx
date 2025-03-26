"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";
import {Card, CardFooter, CardHeader} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import { TcardProps } from "@repo/ui/type";
import { ReactElement } from "react";

/**
 * CustomCard component renders a flexible and responsive card UI
 * that can include an image, profile details, header, footer, buttons, and links.
 */

export default function CustomCard({ idCardProps }:{ idCardProps:TcardProps}):ReactElement {
  /**
   * Determines the CSS class for the image's aspect ratio.
   * Returns an empty string if no valid aspect ratio is set.
   */
  const fnGetAspectRatioClass = ():string => {
    if (!idCardProps.image?.aspectRatio || idCardProps.image.aspectRatio === "auto") return "";

    switch (idCardProps.image.aspectRatio) {
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

   /**
   * Renders profile details including an avatar, name, and location.
   * Adjusts the layout dynamically based on `namePosition` (left, right, top, or bottom).
   */
  const ProfileDetail = idCardProps.nameAndPlace && (
    <div
      className={cn(
        "flex items-start gap-2",
        idCardProps.namePosition === "left" || "bottom" || idCardProps.namePosition === "right"
          ? "flex-row"
          : "flex-col"
      )}
    >
      {idCardProps.avatar &&
        (idCardProps.namePosition === "left" ||
          idCardProps.namePosition === "right" ||
          idCardProps.namePosition === "top" ||
          idCardProps.namePosition === "bottom") && (
          <Avatar>
            <AvatarImage src={idCardProps.avatar.src} alt={idCardProps.avatar.alt} />
            <AvatarFallback>{idCardProps.avatar.alt}</AvatarFallback>
          </Avatar>
        )}
      <div
        className={cn(
          idCardProps.namePosition === "left"
            ? "text-left"
            : idCardProps.namePosition === "right"
              ? "text-right"
              : "text-left"
        )}
      >
        <p className="font-medium">{idCardProps.nameAndPlace.name}</p>
        {idCardProps.nameAndPlace.place && (
          <p className="text-sm text-muted-foreground">{idCardProps.nameAndPlace.place}</p>
        )}
      </div>
    </div>
  );
  
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-md",
        idCardProps.layout === "horizontal" ? "md:flex md:flex-row" : "flex flex-col",
        idCardProps.onClick && "cursor-pointer",
        idCardProps.className
      )}
      onClick={idCardProps.onClick}
    >
       {/* Renders image or SVG if available, with an optional tag badge */}
      {idCardProps.image && (
        <div className={cn("w-full overflow-hidden relative",fnGetAspectRatioClass())}>
          {idCardProps.image?.svg ? (
            <div>
              {" "}
              {idCardProps.image?.svg}{" "}
            </div>
          ) : (
            <Image
              src={idCardProps.image?.src || "/placeholder.svg"}
              alt={idCardProps.image.alt}
              width={500}
              height={300}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          )}
          {idCardProps.tag && (
            <Badge
              variant="default"
              className="absolute top-2 right-2 rounded-full px-2 py-1"
            >
              {idCardProps.tag}
            </Badge>
          )}
        </div>
      )}

      <div className={cn("flex flex-col", idCardProps.layout === "horizontal" && "md:flex-1")}>

        {/* Horizontal layout: Renders image on the side if applicable */}
        {idCardProps.image?.alt && idCardProps.layout === "horizontal" && (
          <div
            className={cn(
              "md:w-48 overflow-hidden",
              fnGetAspectRatioClass() || "h-full"
            )}
          >
            {idCardProps.image?.svg ? (
              <div
                style={{
                  width: `${idCardProps.image.width}px`,
                  height: `${idCardProps.image.height}px`,
                }}
              >
                
                {idCardProps.image.svg}
              </div>
            ) : (
              <Image
                src={idCardProps.image.src || "/placeholder.svg"}
                alt={idCardProps.image.alt}
                width={500}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            )}
          </div>
        )}

        {/* Name and place at the top if specified */}
        {idCardProps.nameAndPlace && idCardProps.namePosition === "top" && (
          <div className="px-6 pt-6">{ProfileDetail}</div>
        )}

        {/* Card Header: Displays title, subtitle, and optional tag if no image is present */}
        <CardHeader>
        {idCardProps.tag &&  !idCardProps.image &&(
            <Badge
              variant="default"
              className="rounded-full px-2 py-1 w-fit mb-2"
            >
              {idCardProps.tag}
            </Badge>
          )}
          <h2 className={cn("text-xl mb-3 font-semibold", idCardProps.header.headingClass)}>{idCardProps.header.text}</h2>
          <p className={cn("max-w-[700px] text-muted-foreground", idCardProps.header.descripClass)}>{idCardProps.header.subtitle}</p>

           {/* Renders a list of items if provided */}
          {idCardProps.list && idCardProps.list.length > 0 && (
              <ul className="space-y-2">
              {idCardProps.list.map((idItem, iIndex) => (
                <li key={iIndex} className="flex items-start gap-2 py-2">
                  {idItem.icon && <span className="text-primary">{idItem.icon}</span>}
                  <div>
                    <span className="font-medium">{idItem.text}</span>
                    {idItem.subtitle && (
                      <p className="text-sm text-muted-foreground">{idItem.subtitle}</p>
                    )}
                  </div>
                </li>
              ))}
              </ul>
          )}
        </CardHeader>

         {/* Card Footer: Renders buttons, links, and profile details if positioned at the bottom */}
        <CardFooter
          className={cn(
            "flex",
            idCardProps.namePosition === "bottom" ? "flex-col" : "flex-row",
            idCardProps.footerClassName
          )}
        >
          <div
            className={cn(
              "flex w-full gap-8",
              idCardProps.button?.length === 1 || idCardProps.link?.length === 1
                ? ""
                : "md:justify-center flex-col md:flex-row",
                idCardProps.buttonPosition
            )}
          >
            {idCardProps.button?.map((idBtn, iIndex) => (
              <Button
                key={`btn-${iIndex}`}
                variant={idBtn.variant || "default"}
                size={idBtn.size || "default"}
                className=""
              >
                {/* If iconPosition is 'before', render icon first */}
                {idBtn.icon && idBtn.iconPosition === "before" && (
                  <span className="mr-2">{idBtn.icon}</span>
                )}

                {/* Button Label */}
               {idBtn.href && <Link href={idBtn.href}>{idBtn.label}</Link>}
                {/* If iconPosition is 'after', render icon after */}
                {idBtn.icon && idBtn.iconPosition === "after" && (
                  <span className="ml-2">{idBtn.icon}</span>
                )}
              </Button>
            ))}
            {
              idCardProps.link?.map((idLnk, iIndex) => (
                <Button
                  key={`lnk-${iIndex}`}
                  variant="link"
                  className="p-0"
                  size={idLnk.size || "default"}
                  onClick={(e) => e.stopPropagation()}
                >
                  {idLnk.icon && idLnk.iconPosition === "before" && (
                    <span className="mr-2">{idLnk.icon}</span>
                  )}{" "}
                  {idLnk.href && <Link href={idLnk.href}>{idLnk.label}</Link>}
                  {idLnk.icon && idLnk.iconPosition === "after" && (
                    <span className="ml-2">{idLnk.icon}</span>
                  )}
                </Button>
              ))}
          </div>

           {/* Name and place positioned at the bottom if specified */}
          {idCardProps.nameAndPlace && idCardProps.namePosition === "bottom" && ProfileDetail}
        </CardFooter>
      </div>
    </Card>
  );
}
