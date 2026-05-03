import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQ[]
  className?: string
}

export function FAQSection({ faqs, className }: FAQSectionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn("w-full space-y-4", className)}
    >
      {faqs.map((faq, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="bg-white rounded-xl border border-border/50 px-6 shadow-sm"
        >
          <AccordionTrigger className="text-left text-navy hover:text-navy/80 hover:no-underline py-5">
            <span className="font-medium pr-4">{faq.question}</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
