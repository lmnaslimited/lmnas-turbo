import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui/components/ui/accordion"

const faqs = [
  {
    question: "Can LMNAs work with my existing systems?",
    answer:
      "Yes, LMNAs is designed to integrate seamlessly with a wide range of existing systems. Our team of experts will work closely with you to ensure a smooth integration process, minimizing disruption to your current operations.",
  },
  {
    question: "How fast can I see results?",
    answer:
      "Many of our clients start seeing improvements within weeks of implementation. However, the full benefits of LMNAs solutions typically become apparent within 3-6 months as your team becomes more familiar with the system and you start leveraging its full capabilities.",
  },
  {
    question: "What industries do you specialize in?",
    answer:
      "LMNAs has extensive experience across various industries, including manufacturing, retail, healthcare, and logistics. Our solutions are highly customizable to meet the specific needs of your industry and business.",
  },
  {
    question: "How do you ensure data security?",
    answer:
      "At LMNAs, we take data security very seriously. We employ industry-leading security measures, including end-to-end encryption, regular security audits, and compliance with international data protection standards to ensure your data is always safe and secure.",
  },
]

export default function FAQs() {
  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto divide-y-2 divide-gray-200">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Got Questions? We've Got Answers!
          </h2>
          <dl className="mt-6 space-y-6 divide-y divide-gray-200">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </dl>
        </div>
      </div>
    </div>
  )
}