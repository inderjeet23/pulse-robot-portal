import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageSquare, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAQSection = () => {
  const faqs = [
    {
      question: "How do I add a new tenant to the system?",
      answer: "Navigate to the Tenants page and click 'Add New Tenant'. Fill in the required information including name, contact details, property address, and lease terms."
    },
    {
      question: "How can tenants submit maintenance requests?",
      answer: "Tenants can submit requests through the tenant portal link you provide them, or you can manually enter requests on their behalf through the Maintenance section."
    },
    {
      question: "How do I mark rent as paid?",
      answer: "Go to the Rent Management page, find the tenant's record, and click 'Mark as Paid'. You can also add notes about the payment method and any additional details."
    },
    {
      question: "Can I send automated rent reminders?",
      answer: "Yes, the system can automatically send email and SMS reminders to tenants when rent is due or overdue. Configure this in the Setup & Configuration section."
    },
    {
      question: "How do I generate legal notices?",
      answer: "From the Rent Management page, you can generate pay-or-quit notices and other legal documents for tenants with overdue rent."
    },
    {
      question: "What reports can I generate?",
      answer: "The dashboard provides overview statistics, and you can export detailed reports for rent collection, maintenance costs, and tenant information from each respective section."
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">FAQ & Support</h1>
        <p className="text-muted-foreground">
          Frequently asked questions and support resources
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Live Chat
            </CardTitle>
            <CardDescription>
              Get instant help from our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Support
            </CardTitle>
            <CardDescription>
              Speak directly with a support specialist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Call (555) 123-4567
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Support
            </CardTitle>
            <CardDescription>
              Send us a detailed message
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              support@pulse-robot.com
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Find answers to common questions about using the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
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
    </div>
  );
};

export default FAQSection;