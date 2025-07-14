import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export function FAQSection() {
  const faqs = [
    {
      question: "How quickly will I receive tenant requests?",
      answer: "Requests are delivered instantly to your chosen email address."
    },
    {
      question: "Can tenants submit requests after hours?",
      answer: "Yes — your assistant works 24/7."
    },
    {
      question: "Can I change the routing email later?",
      answer: "Yes, just update it in the \"Quick Actions\" panel and hit Save."
    },
    {
      question: "Do I need a website to use Pulse Robot?",
      answer: "No — we provide a standalone hosted link you can share directly."
    },
    {
      question: "How much does this service cost?",
      answer: "Please contact us for pricing: support@pulserobot.com"
    }
  ];

  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <span>FAQ</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="text-left font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}