import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui/components/ui/accordion"
import { Titems } from "../type.js"
import { ReactElement } from "react"

export default function FAQs({idFaq}:{idFaq:Titems[]}):ReactElement {
  return (
   
    <div className="mt-6 space-y-6 divide-y divide-muted">
      <Accordion type="single" collapsible className="w-full">
        {idFaq.map((idFaq, iIndex) => (
          <AccordionItem key={iIndex} value={`item-${iIndex}`}>
            <AccordionTrigger>{idFaq.question}</AccordionTrigger>
            <AccordionContent>{idFaq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
      
  )
}