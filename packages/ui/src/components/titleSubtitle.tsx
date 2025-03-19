/*
usage:
const titleData = {
    textWithoutColor: "Welcome to ",
    text: "Multimine Dashboard",
    subtitle: "Track your mining activities and monitor performance.",
    className: "custom-container-class", // (Optional) Additional styling for the wrapper div
    headingClass: "custom-heading-class", // (Optional) Additional styling for the heading
    descripClass: "custom-description-class" // (Optional) Additional styling for the description
};
<TitleSubtitle iTitle={titleData} />
 */
import { cn } from "@repo/ui/lib/utils";
import { Theader } from "@repo/ui/type";
import clsx from "clsx";
import { motion } from "framer-motion";

export default function TitleSubtitle({iTitle}:{iTitle:Theader}) {
    return (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }} className={clsx("w-full flex flex-col space-y-4 mb-10", iTitle.className)}>
            <h2 className={cn("text-3xl font-bold tracking-tighter sm:text-4xl", iTitle.headingClass)}>
                <span >{iTitle.textWithoutColor}</span>
                <span className="text-primary">{iTitle.text}</span>
            </h2>
            <p className={clsx("max-w-[700px] text-muted-foreground md:text-xl", iTitle.descripClass)}>
                {iTitle.subtitle}
            </p>
        </motion.div>
    )
}