import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"
import { cva } from "class-variance-authority"
import * as LucideIcons from "lucide-react"
import {Titems, TfeatureProps} from "@repo/ui/type"

const buttonContainer = cva("mt-8 flex lg:flex-shrink-0", {
  variants: {
    position: {
      header: "lg:mt-0",
      "bottom-left": "justify-start mt-12",
      "bottom-center": "justify-center mt-12",
      "bottom-right": "justify-end mt-12",
    },
  },
  defaultVariants: {
    position: "header",
  },
})


export default function Feature({ buttonPosition = "header", layout = "classic", iShowButton=true, iFeature }: TfeatureProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       {layout === "classic" ? (
        <div className="mx-auto py-12 px-4 sm:px-6 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">{iFeature.header.textWithoutColor}</span>
            <span className="block text-primary/70">{iFeature.header.text}</span>
          </h2>
          {iShowButton && buttonPosition === "header" && (
            <div className={buttonContainer({ position: "header" })}>
              <Button asChild size="lg">
              {iFeature.button?.href && (
                <Link href={iFeature.button?.href}>{iFeature.button?.label}</Link>)}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="lg:text-center">
            <h2 className="text-base text-primary/70 font-semibold tracking-wide uppercase">{iFeature.header.badge}</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                {iFeature.header.textWithoutColor}
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                {iFeature.header.subtitle}
            </p>
        </div>  
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {iFeature.items?.map((idItem) => (
              <FAQItem key={idItem.question} {...idItem} />
            ))}
          </dl>
        </div>

        {iShowButton && buttonPosition !== "header" && (
          <div className={buttonContainer({ position: buttonPosition })}>
            <Button asChild size="lg">
                {iFeature.button?.href && (
              <Link href={iFeature.button?.href}>{iFeature.button?.label}</Link>)}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

const FAQItem = ({ question, answer, icon }: Titems) => {
    const IconComponent = icon && (LucideIcons[icon as keyof typeof LucideIcons] as React.ElementType)
  return (
    <div className= "relative flex gap-4 items-start">
    {IconComponent && (
      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-muted text-white shrink-0">
        <IconComponent className="h-6 w-6 text-primary" />
      </div>
    )}
    <div className={IconComponent ? "ml-2" : ""}>
      <dt className="text-lg leading-6 font-medium text-gray-900">{question}</dt>
      <dd className="mt-2 text-base text-gray-500">{answer}</dd>
    </div>
  </div>
  
  )
}