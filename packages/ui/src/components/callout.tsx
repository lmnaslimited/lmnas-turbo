import { Button } from "@repo/ui/components/ui/button";
import clsx from "clsx";
import Link from "next/link";
type Theader={
    textWithoutColor:string
    badge?:string
    text?: string;
    subtitle?:string
}
type Tbutton={
    label: string;
    href?:string;
    variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
}
type TcalloutProps = {
    header: Theader
    buttons: Tbutton[]
    points?:{
      title:string
      items:string[]
      actionText:string
    }
    variant?:string
  };

export default function Callout({iCallout, layout = "classic"}:{iCallout: TcalloutProps, layout?: "classic" | "simple"}) {
  return (
    <div className={`${layout === "classic" ? "max-w-2xl" : "max-w-7xl"} mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8`}>
        {layout === "classic" ? (<h2 className={clsx("text-3xl font-extrabold sm:text-4xl", iCallout.variant || "text-white")}>
          <span className="block">{iCallout.header.textWithoutColor}</span>
          <span className="block">{iCallout.header.subtitle}</span>
        </h2>):(
           
             <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
             <span className="block">{iCallout.header.textWithoutColor}</span>
             <span className="block text-indigo-600">
              {iCallout.header.subtitle}
             </span>
           </h2>
        
        )}

        <p className="mt-4 text-lg leading-6 text-indigo-200">{iCallout.points?.title}</p>
        <ul className="mt-4 space-y-4">
          {iCallout.points?.items.map((point:string, index:number) => (
            <li key={index} className={clsx("text-lg", iCallout.variant || "text-white")}>
              {point}
            </li>
          ))}
        </ul>
        <p className={clsx("mt-8 text-xl", iCallout.variant || "text-white")}>{iCallout.points?.actionText}</p>
        <div className="mt-8 flex justify-center space-x-3">
          {iCallout.buttons.map((button:Tbutton, index:number) => (
            <Button asChild key={index} size="lg" variant={button.variant}>
                {button.href &&(
              <Link href={button.href}>{button.label}</Link>
                )}
            </Button>
          ))}
        </div>
      </div>
  );
}