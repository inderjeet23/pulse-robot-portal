import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Code, Link, Globe } from "lucide-react";

export function SetupGuide() {
  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Setup Guide</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="embed">
            <AccordionTrigger className="text-left">
              <div className="flex items-center space-x-3">
                <Code className="w-5 h-5 text-primary" />
                <span>How to embed the assistant on your website</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <div className="space-y-3">
                <p>Copy the widget embed code above and paste it before the &lt;/body&gt; tag on your website.</p>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Tip:</strong> The widget will appear as a floating chat button in the bottom right corner of your website.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="hosted">
            <AccordionTrigger className="text-left">
              <div className="flex items-center space-x-3">
                <Link className="w-5 h-5 text-primary" />
                <span>How to use the hosted link</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <div className="space-y-3">
                <p>Simply share your hosted assistant link with your tenants.</p>
                <ul className="space-y-2 ml-4">
                  <li>• Email the link to tenants</li>
                  <li>• Post it on your property website</li>
                  <li>• Include it in welcome packets</li>
                  <li>• Add it to your email signature</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="no-website">
            <AccordionTrigger className="text-left">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-primary" />
                <span>No website?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <div className="space-y-3">
                <p>No problem! Just use your hosted link — tenants can access it directly.</p>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Perfect for:</strong> Property managers who don't have their own website but want to provide 24/7 tenant support.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}