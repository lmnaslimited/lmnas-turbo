"use client"
import { cn } from "@repo/ui/lib/utils";
import { Theader } from "@repo/ui/type";
import { motion } from "framer-motion";
import { ReactElement } from "react";

export default function TitleSubtitle({idTitle}:{idTitle:Theader}):ReactElement {
    return (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }} className={cn("w-full flex flex-col space-y-4 mb-10", idTitle.className)}>
            <h2 className={cn("text-3xl font-bold tracking-tighter sm:text-4xl", idTitle.headingClass)}>
                <span >{idTitle.textWithoutColor}</span>
                <span className="text-primary">{idTitle.text}</span>
            </h2>
            <p className={cn("max-w-[700px] text-muted-foreground md:text-xl", idTitle.descripClass)}>
                {idTitle.subtitle}
            </p>
        </motion.div>
    )
}