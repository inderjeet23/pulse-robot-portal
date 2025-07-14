import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { HelpCircle, Search, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  questions: FAQ[];
}

export function FAQSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const faqs: FAQCategory[] = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How quickly will I receive tenant requests?",
          answer: "Requests are delivered instantly to your chosen email address. You'll also see them immediately in your dashboard for real-time tracking and management."
        },
        {
          question: "Do I need a website to use Pulse Robot?",
          answer: "No — we provide a standalone hosted link you can share directly with tenants. However, if you have a website, you can also embed the widget for seamless integration."
        },
        {
          question: "How long does setup take?",
          answer: "Initial setup takes just 2-3 minutes. Simply configure your routing email, customize your branding, and start sharing your link or embed code."
        },
        {
          question: "Can I customize the appearance?",
          answer: "Yes! Upload your logo, set your brand colors, and the assistant will match your property's branding for a professional, cohesive experience."
        }
      ]
    },
    {
      category: "Features & Functionality",
      questions: [
        {
          question: "Can tenants submit requests after hours?",
          answer: "Yes — your assistant works 24/7, 365 days a year. Tenants can submit maintenance requests anytime, and you'll be notified immediately via email."
        },
        {
          question: "What types of requests can tenants submit?",
          answer: "Tenants can submit any type of maintenance request including plumbing, electrical, HVAC, appliances, general repairs, and emergency issues. They can also upload photos and provide detailed descriptions."
        },
        {
          question: "Can tenants upload photos with their requests?",
          answer: "Yes! Tenants can attach multiple photos to help you better understand the issue before dispatching maintenance staff or contractors."
        },
        {
          question: "How do I track request status?",
          answer: "Use the built-in dashboard to view all requests, update their status (New → In Progress → Completed), add notes, assign contractors, and track costs."
        },
        {
          question: "Can I assign requests to specific contractors?",
          answer: "Yes! You can assign requests to specific team members or contractors and add internal notes for better coordination and tracking."
        }
      ]
    },
    {
      category: "Technical",
      questions: [
        {
          question: "Will the widget slow down my website?",
          answer: "No! The widget loads asynchronously and won't affect your website's performance. It's optimized for fast loading and minimal resource usage."
        },
        {
          question: "Is it mobile-friendly?",
          answer: "Absolutely! Both the embedded widget and hosted link are fully responsive and optimized for mobile devices. Tenants can easily submit requests from their phones."
        },
        {
          question: "Can I use it on multiple properties?",
          answer: "Each property needs its own configuration to ensure requests are properly routed. Contact support@pulserobot.com to discuss multi-property management options."
        },
        {
          question: "What browsers are supported?",
          answer: "The assistant works on all modern browsers including Chrome, Firefox, Safari, and Edge. It's also compatible with mobile browsers on iOS and Android."
        }
      ]
    },
    {
      category: "Configuration & Management",
      questions: [
        {
          question: "Can I change the routing email later?",
          answer: "Yes, you can update your routing email anytime in the \"Configuration Panel\". Changes take effect immediately for all new requests."
        },
        {
          question: "Can I have multiple people receive notifications?",
          answer: "Currently, requests are sent to one primary email address. For multiple recipients, consider using a shared email account or distribution list at your email provider."
        },
        {
          question: "How do I update my logo or branding?",
          answer: "Go to the Configuration Panel, upload a new logo, or change your brand colors. Updates are reflected immediately across all tenant-facing interfaces."
        },
        {
          question: "Can I customize the questions tenants are asked?",
          answer: "The assistant asks for essential information like contact details, property address, unit number, issue description, and urgency. Contact support for custom question requirements."
        }
      ]
    },
    {
      category: "Billing & Support",
      questions: [
        {
          question: "How much does this service cost?",
          answer: "We offer flexible pricing plans based on your property portfolio size and usage. Contact us at support@pulserobot.com for a personalized quote and to discuss enterprise options."
        },
        {
          question: "Is there a free trial?",
          answer: "Yes! You can test all features during your trial period. No credit card required to get started."
        },
        {
          question: "What kind of support do you provide?",
          answer: "We offer email support, setup assistance, and comprehensive documentation. Premium plans include priority support and phone assistance."
        },
        {
          question: "How secure is tenant data?",
          answer: "We use enterprise-grade security with encrypted data transmission and storage. We're committed to protecting tenant privacy and comply with data protection regulations."
        },
        {
          question: "Can I export my request data?",
          answer: "Yes! You can export your maintenance request history and analytics data. This is useful for reporting, trend analysis, and property management records."
        }
      ]
    }
  ];

  // Filter FAQs based on search query
  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 text-primary rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const hasSearchResults = filteredFAQs.length > 0;

  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <span>Frequently Asked Questions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border focus:border-primary transition-colors"
          />
        </div>

        {/* FAQ Content */}
        <div className="space-y-4">
          {!hasSearchResults && searchQuery ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No FAQs found for your search.</p>
                <p className="text-sm mt-1">Try different keywords or browse categories below.</p>
              </div>
            </div>
          ) : (
            filteredFAQs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="border border-border rounded-lg bg-background">
                <Collapsible
                  open={searchQuery ? true : openCategories[category.category]}
                  onOpenChange={() => !searchQuery && toggleCategory(category.category)}
                >
                  <CollapsibleTrigger
                    className={`w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors rounded-lg ${
                      searchQuery ? 'cursor-default' : 'cursor-pointer'
                    }`}
                    disabled={!!searchQuery}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground text-lg">
                        {category.category}
                      </h3>
                      {!searchQuery && (
                        <ChevronDown 
                          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                            openCategories[category.category] ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-3">
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, questionIndex) => (
                        <AccordionItem 
                          key={questionIndex} 
                          value={`faq-${categoryIndex}-${questionIndex}`}
                          className="border-border/50"
                        >
                          <AccordionTrigger className="text-left font-medium hover:text-primary transition-colors">
                            {highlightText(faq.question, searchQuery)}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed">
                            {highlightText(faq.answer, searchQuery)}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}