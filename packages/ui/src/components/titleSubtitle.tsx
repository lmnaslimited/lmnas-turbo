"use client"
import { cn } from "@repo/ui/lib/utils";
import { Theader } from "@repo/ui/type";
import { ReactElement } from "react";

export default function TitleSubtitle({ idTitle }: { idTitle: Theader }): ReactElement {
    return (
        <div className={cn("w-full flex flex-col space-y-4 mb-10", idTitle.className)}>
            <h2 className={cn("text-3xl font-bold tracking-tighter sm:text-4xl", idTitle.headingClass)}>
                <span >{idTitle.highlight}</span>{" "}
                <span className="bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">{idTitle.title}</span>
            </h2>
            <p className={cn("max-w-[700px] text-muted-foreground md:text-xl", idTitle.descripClass)}>
                {idTitle.subtitle}
            </p>
        </div>
    )
}