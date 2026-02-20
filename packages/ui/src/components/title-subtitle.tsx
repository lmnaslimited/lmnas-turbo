"use client"

import { ReactElement } from "react";
import { cn } from "@repo/ui/lib/utils";
import { Theader } from "@repo/middleware/types";

export default function TitleSubtitle({ idTitle }: { idTitle: Theader }): ReactElement {
    return (
        <div className={cn("w-full flex flex-col space-y-4 mb-10", idTitle.className)}>
            <h2 className={cn("text-3xl font-bold tracking-tighter sm:text-4xl", idTitle.headingClass)}>
                <span>{idTitle.title}</span>{" "}
                <span className="bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">{idTitle.highlight}</span>
            </h2>
            <p className={cn("max-w-[700px] text-muted-foreground md:text-xl", idTitle.descripClass)}>
                {idTitle.subtitle}
            </p>
        </div>
    )
}