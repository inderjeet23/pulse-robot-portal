import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Settings, Search, ChevronDown, Code, Link, Globe, CheckCircle, Wrench, AlertTriangle, Smartphone } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SetupStep {
  step: string;
  content: JSX.Element;
}

interface SetupCategory {
  category: string;
  icon: JSX.Element;
  steps: SetupStep[];
}

export function SetupGuide() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const setupCategories: SetupCategory[] = [
    {
      category: "Website Integration",
      icon: <Code className="w-5 h-5 text-primary" />,
      steps: [
        {
          step: "Copy Your Widget Code",
          content: (
            <div className="space-y-3">
              <p>Copy the widget embed code from the "Widget Embed Code" section above.</p>
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Make sure you've configured your routing email first in the Configuration Panel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        },
        {
          step: "Add to Your Website",
          content: (
            <div className="space-y-3">
              <p>Paste the code just before the closing &lt;/body&gt; tag in your HTML.</p>
              <div className="bg-muted p-3 rounded-lg">
                <code className="text-sm">
                  &lt;/main&gt;<br/>
                  &nbsp;&nbsp;{`<!-- Paste widget code here -->`}<br/>
                  &lt;/body&gt;
                </code>
              </div>
            </div>
          )
        },
        {
          step: "Platform-Specific Instructions",
          content: (
            <div className="space-y-3">
              <ul className="space-y-3">
                <li><strong>WordPress:</strong> Add to footer.php or use a custom HTML widget in Appearance → Widgets</li>
                <li><strong>Squarespace:</strong> Settings → Advanced → Code Injection → Footer</li>
                <li><strong>Wix:</strong> Add HTML Component and paste the code</li>
                <li><strong>Webflow:</strong> Project Settings → Custom Code → Footer Code</li>
                <li><strong>Shopify:</strong> Online Store → Themes → Actions → Edit Code → theme.liquid</li>
              </ul>
            </div>
          )
        },
        {
          step: "Test Your Widget",
          content: (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800">
                      <strong>Success!</strong> The widget appears as a floating chat button in the bottom-right corner. It's mobile-responsive and won't interfere with your site's design.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      category: "Standalone Hosted Link",
      icon: <Link className="w-5 h-5 text-primary" />,
      steps: [
        {
          step: "Get Your Hosted Link",
          content: (
            <div className="space-y-3">
              <p>Your unique hosted link is automatically generated and displayed in the dashboard. It provides a dedicated page for tenant interactions.</p>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Smartphone className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Mobile Optimized:</strong> Works perfectly on all devices. Tenants can bookmark it for easy access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        },
        {
          step: "Distribution Methods",
          content: (
            <div className="space-y-3">
              <h5 className="font-semibold">Share your link through:</h5>
              <ul className="space-y-2 ml-4">
                <li>• <strong>Email Communication:</strong> Include in tenant newsletters and notices</li>
                <li>• <strong>Physical Materials:</strong> Add to lease agreements and welcome packets</li>
                <li>• <strong>Digital Presence:</strong> Post on social media and property listings</li>
                <li>• <strong>QR Codes:</strong> Generate QR codes for building lobbies and common areas</li>
                <li>• <strong>Emergency Contacts:</strong> Include as an emergency maintenance option</li>
              </ul>
            </div>
          )
        },
        {
          step: "Marketing Integration",
          content: (
            <div className="space-y-3">
              <h5 className="font-semibold">Professional Integration:</h5>
              <ul className="space-y-2 ml-4">
                <li>• Add to your email signature</li>
                <li>• Include on business cards</li>
                <li>• Feature in property brochures</li>
                <li>• Share in tenant Facebook groups</li>
                <li>• Add to your Google My Business listing</li>
              </ul>
            </div>
          )
        }
      ]
    },
    {
      category: "No Website Setup",
      icon: <Globe className="w-5 h-5 text-primary" />,
      steps: [
        {
          step: "Immediate Benefits",
          content: (
            <div className="space-y-3">
              <p>The hosted link is your complete solution. No website required!</p>
              <ul className="space-y-2 ml-4">
                <li>• <strong>24/7 Availability:</strong> Tenants can submit requests anytime</li>
                <li>• <strong>Professional Image:</strong> Branded experience with your colors and logo</li>
                <li>• <strong>Instant Setup:</strong> Share the link immediately after configuration</li>
                <li>• <strong>No Maintenance:</strong> We handle hosting, updates, and security</li>
              </ul>
            </div>
          )
        },
        {
          step: "Perfect for Small Operations",
          content: (
            <div className="space-y-3">
              <h5 className="font-semibold">Ideal for:</h5>
              <ul className="space-y-2 ml-4">
                <li>• Independent landlords</li>
                <li>• Small property management companies</li>
                <li>• Property managers transitioning to digital</li>
                <li>• Seasonal or temporary properties</li>
                <li>• Real estate agents managing rentals</li>
              </ul>
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg mt-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-purple-800">
                      <strong>Get Started:</strong> Simply customize your settings and start sharing your hosted link. You'll have a professional tenant portal in minutes!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      category: "Testing & Verification",
      icon: <CheckCircle className="w-5 h-5 text-primary" />,
      steps: [
        {
          step: "Pre-Launch Checklist",
          content: (
            <div className="space-y-3">
              <h5 className="font-semibold">Before going live, verify:</h5>
              <ul className="space-y-2 ml-4">
                <li>□ Widget appears on your website (if embedded)</li>
                <li>□ Hosted link opens correctly</li>
                <li>□ Brand colors and logo display properly</li>
                <li>□ Routing email is configured correctly</li>
                <li>□ Mobile experience works smoothly</li>
              </ul>
            </div>
          )
        },
        {
          step: "Test Submission Process",
          content: (
            <div className="space-y-3">
              <p>Submit a test maintenance request to ensure:</p>
              <ul className="space-y-1 ml-4 mt-2">
                <li>• Email notifications arrive promptly</li>
                <li>• Request appears in your dashboard</li>
                <li>• All required information is captured</li>
                <li>• Status updates work correctly</li>
              </ul>
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg mt-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800">
                      <strong>Pro Tip:</strong> Test from different devices and browsers to ensure consistent experience for all tenants.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      category: "Troubleshooting",
      icon: <Wrench className="w-5 h-5 text-primary" />,
      steps: [
        {
          step: "Common Issues & Solutions",
          content: (
            <div className="space-y-4">
              <div>
                <p className="font-medium text-foreground">Widget not appearing:</p>
                <ul className="text-sm ml-4 mt-1 space-y-1">
                  <li>• Check if code is placed before &lt;/body&gt;</li>
                  <li>• Verify there are no JavaScript errors in console</li>
                  <li>• Clear browser cache and refresh</li>
                  <li>• Ensure no ad blockers are interfering</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-foreground">Not receiving emails:</p>
                <ul className="text-sm ml-4 mt-1 space-y-1">
                  <li>• Check spam/junk folder</li>
                  <li>• Verify routing email in configuration</li>
                  <li>• Confirm email server settings</li>
                  <li>• Test with different email provider</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-foreground">Mobile display issues:</p>
                <ul className="text-sm ml-4 mt-1 space-y-1">
                  <li>• Test on multiple devices</li>
                  <li>• Check viewport meta tag</li>
                  <li>• Ensure responsive design compatibility</li>
                  <li>• Verify touch interactions work properly</li>
                </ul>
              </div>
            </div>
          )
        },
        {
          step: "Get Support",
          content: (
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Need Help?</strong> Contact our support team at support@pulserobot.com with your specific issue and website details. Include:
                    </p>
                    <ul className="text-sm mt-2 ml-4">
                      <li>• Your website URL</li>
                      <li>• Description of the issue</li>
                      <li>• Screenshots if applicable</li>
                      <li>• Browser and device information</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      ]
    }
  ];

  // Filter steps based on search query
  const filteredCategories = setupCategories.map(category => ({
    ...category,
    steps: category.steps.filter(step =>
      step.step.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.content.props.children.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.steps.length > 0);

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

  const hasSearchResults = filteredCategories.length > 0;

  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground flex items-center space-x-2">
          <Settings className="w-5 h-5 text-primary" />
          <span>Complete Setup Guide</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search setup steps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border focus:border-primary transition-colors"
          />
        </div>

        {/* Setup Content */}
        <div className="space-y-4">
          {!hasSearchResults && searchQuery ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No setup steps found for your search.</p>
                <p className="text-sm mt-1">Try different keywords or browse categories below.</p>
              </div>
            </div>
          ) : (
            filteredCategories.map((category, categoryIndex) => (
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
                      <div className="flex items-center space-x-3">
                        {category.icon}
                        <h3 className="font-semibold text-foreground text-lg">
                          {category.category}
                        </h3>
                      </div>
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
                      {category.steps.map((step, stepIndex) => (
                        <AccordionItem 
                          key={stepIndex} 
                          value={`step-${categoryIndex}-${stepIndex}`}
                          className="border-border/50"
                        >
                          <AccordionTrigger className="text-left font-medium hover:text-primary transition-colors">
                            {highlightText(step.step, searchQuery)}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed">
                            {step.content}
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