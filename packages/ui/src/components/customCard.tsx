"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";
import { ReactElement } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Card, CardFooter, CardHeader } from "@repo/ui/components/ui/card";
import { TcardProps, Tbutton } from "@repo/middleware";
import { getIconComponent } from "@repo/ui/lib/icon";

const renderIcon = (icon: Tbutton['icon']) => {
  const iconName = typeof icon === "string" ? icon : "HelpCircle";
  const IconComponent = getIconComponent(iconName);
  return <IconComponent className="w-6 h-6 text-black" />;
};
/**
 * CustomCard component renders a flexible and responsive card UI
 * that can include an image, profile details, header, footer, buttons, and links.
 */

export default function CustomCard({ idCardProps }: { idCardProps: TcardProps }): ReactElement {
  /**
   * Determines the CSS class for the image's aspect ratio.
   * Returns an empty string if no valid aspect ratio is set.
   */
  const fnGetAspectRatioClass = (): string => {
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
  const ProfileDetail = idCardProps.avatarDetails && (
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
            <AvatarImage src={idCardProps.avatar.source} alt={idCardProps.avatar.alternate} />
            <AvatarFallback>{idCardProps.avatar.alternate}</AvatarFallback>
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
        <p className="font-medium">{idCardProps.avatarDetails.label}</p>
        {idCardProps.avatarDetails.description && (
          <p className="text-sm text-muted-foreground">{idCardProps.avatarDetails.description}</p>
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
        <div className={cn("w-full overflow-hidden relative", fnGetAspectRatioClass())}>
          {idCardProps.image?.svg ? (
            <div>
              {""}
              {typeof idCardProps.image?.svg === "string"
                ? renderIcon(idCardProps.image.svg)
                : idCardProps.image?.svg}
              {""}
            </div>
          ) : (
            <Image
              src={idCardProps.image?.source || "/placeholder.svg"}
              alt={idCardProps.image.alternate}
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
        {idCardProps.image?.alternate && idCardProps.layout === "horizontal" && (
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
                src={idCardProps.image.source || "/placeholder.svg"}
                alt={idCardProps.image.alternate}
                width={500}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            )}
          </div>
        )}

        {/* Name and place at the top if specified */}
        {idCardProps.avatarDetails && idCardProps.namePosition === "top" && (
          <div className="px-6 pt-6">{ProfileDetail}</div>
        )}

        {/* Card Header: Displays title, subtitle, and optional tag if no image is present */}
        <CardHeader>
          {idCardProps.tag && !idCardProps.image && (
            <Badge
              variant="default"
              className="rounded-full px-2 py-1 w-fit mb-2"
            >
              {idCardProps.tag}
            </Badge>
          )}
          <h2 className={cn("text-xl mb-3 font-semibold", idCardProps.header.headingClass)}>{idCardProps.header.title}</h2>
          <p className={cn("max-w-[700px] text-muted-foreground", idCardProps.header.descripClass)}>{idCardProps.header.subtitle}</p>

          {/* Renders a list of items if provided */}
          {idCardProps.list && idCardProps.list.length > 0 && (
            <ul className="space-y-2">
              {idCardProps.list.map((idItem, iIndex) => (
                <li key={iIndex} className="flex items-start gap-2 py-2">
                  {idItem.icon && <span className="text-primary">{renderIcon(idItem.icon)}</span>}
                  <div>
                    <span className="font-medium">{idItem.label}</span>
                    {idItem.description && (
                      <p className="text-sm text-muted-foreground">{idItem.description}</p>
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
              idCardProps.buttons?.length === 1 || idCardProps.link?.length === 1
                ? ""
                : "md:justify-center flex-col md:flex-row",
              idCardProps.buttonPosition
            )}
          >
            {idCardProps.buttons?.map((idBtn, iIndex) => (
              idBtn.href ? (
                <Button
                  key={`btn-${iIndex}`}
                  variant={idBtn.variant || "default"}
                  size={idBtn.size || "default"}
                >
                  {/* If iconPosition is 'before', render icon first */}
                  {idBtn.icon && idBtn.iconPosition === "before" && (
                    <span className="mr-2">{renderIcon(idBtn.icon)}</span>
                  )}

                  {/* Button Label */}
                  <Link href={idBtn.href}>{idBtn.label}</Link>
                  {/* If iconPosition is 'after', render icon after */}
                  {idBtn.icon && idBtn.iconPosition === "after" && (
                    <span className="ml-2">{renderIcon(idBtn.icon)}</span>
                  )}
                </Button>) : (
                <Button
                  key={`btn-${iIndex}`}
                  variant={idBtn.variant || "default"}
                  size={idBtn.size || "default"}
                  onClick={() => idCardProps.onButtonClick?.(idBtn.formMode)}
                >
                  {/* If iconPosition is 'before', render icon first */}
                  {idBtn.icon && idBtn.iconPosition === "before" && (
                    <span className="mr-2">{renderIcon(idBtn.icon)}</span>
                  )}
                  {idBtn.label}
                  {/* If iconPosition is 'after', render icon after */}
                  {idBtn.icon && idBtn.iconPosition === "after" && (
                    <span className="ml-2">{renderIcon(idBtn.icon)}</span>
                  )}
                </Button>
              )

            ))}
            {
              idCardProps.link?.map((idLnk, iIndex) => (
                <Button
                  key={`lnk-${iIndex}`}
                  variant="link"
                  className="p-0"
                  size={idLnk.size || "default"}
                  onClick={(event) => event.stopPropagation()}
                >
                  {idLnk.icon && idLnk.iconPosition === "before" && (
                    <span className="mr-2">{renderIcon(idLnk.icon)}</span>
                  )}{" "}
                  {idLnk.href ? <Link href={idLnk.href}>{idLnk.label}</Link> : idLnk.label}
                  {idLnk.icon && idLnk.iconPosition === "after" && (
                    <span>{renderIcon(idLnk.icon)}</span>
                  )}
                </Button>
              ))}
          </div>

          {/* Name and place positioned at the bottom if specified */}
          {idCardProps.avatarDetails && idCardProps.namePosition === "bottom" && ProfileDetail}
        </CardFooter>
      </div>
    </Card>
  );
}