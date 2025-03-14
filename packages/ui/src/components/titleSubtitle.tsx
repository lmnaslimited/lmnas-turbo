import { cn } from "@repo/ui/lib/utils";
import { Theader } from "@repo/ui/type";
import clsx from "clsx";

export default function TitleSubtitle({iTitle}:{iTitle:Theader}) {
    return (
        <div className={clsx("w-full flex flex-col space-y-4 mb-10", iTitle.className)}>
            <h2 className={cn("text-3xl font-bold tracking-tighter sm:text-4xl", iTitle.headingClass)}>
                <span >{iTitle.textWithoutColor}</span>
                <span className="text-primary">{iTitle.text}</span>
            </h2>
            <p className={clsx("max-w-[700px] text-primary/70 md:text-xl", iTitle.descripClass)}>
                {iTitle.subtitle}
            </p>
        </div>
    )
}