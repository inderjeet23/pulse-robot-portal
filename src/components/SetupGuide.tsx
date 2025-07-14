import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Code, Link, Globe, Settings, Smartphone, CheckCircle, AlertTriangle, Wrench } from "lucide-react";

export function SetupGuide() {
  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground flex items-center space-x-2">
          <Settings className="w-5 h-5 text-primary" />
          <span>Complete Setup Guide</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="embed">
            <AccordionTrigger className="text-left">
              <div className="flex items-center space-x-3">
                <Code className="w-5 h-5 text-primary" />
                <span>Website Integration (Recommended)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Step 1: Copy Your Widget Code</h4>
                  <p>Copy the widget embed code from the "Widget Embed Code" section above.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Step 2: Add to Your Website</h4>
                  <p>Paste the code just before the closing &lt;/body&gt; tag in your HTML.</p>
                  <div className="bg-muted p-3 rounded-lg mt-2">
                    <code className="text-sm">
                      &lt;/main&gt;<br/>
                      &nbsp;&nbsp;{`<!-- Paste widget code here -->`}<br/>
                      &lt;/body&gt;
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Platform-Specific Instructions</h4>
                  <ul className="space-y-2 ml-4">
                    <li><strong>WordPress:</strong> Add to footer.php or use a custom HTML widget</li>
                    <li><strong>Squarespace:</strong> Settings → Advanced → Code Injection → Footer</li>
                    <li><strong>Wix:</strong> Add HTML Component and paste the code</li>
                    <li><strong>Webflow:</strong> Project Settings → Custom Code → Footer Code</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-800">
                        <strong>Best Practice:</strong> The widget appears as a floating chat button in the bottom-right corner. It's mobile-responsive and won't interfere with your site's design.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="hosted">
            <AccordionTrigger className="text-left">
              <div className="flex items-center space-x-3">
                <Link className="w-5 h-5 text-primary" />
                <span>Standalone Hosted Link</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <div className="space-y-4">
                <p>Your hosted link provides a dedicated page for tenant interactions. Perfect for sharing directly.</p>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Distribution Methods</h4>
                  <ul className="space-y-2 ml-4">
                    <li>• <strong>Email Communication:</strong> Include in tenant newsletters and notices</li>
                    <li>• <strong>Physical Materials:</strong> Add to lease agreements and welcome packets</li>
                    <li>• <strong>Digital Presence:</strong> Post on social media and property listings</li>
                    <li>• <strong>QR Codes:</strong> Generate QR codes for building lobbies and common areas</li>
                    <li>• <strong>Emergency Contacts:</strong> Include as an emergency maintenance option</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Marketing Integration</h4>
                  <ul className="space-y-2 ml-4">
                    <li>• Add to your email signature</li>
                    <li>• Include on business cards</li>
                    <li>• Feature in property brochures</li>
                    <li>• Share in tenant Facebook groups</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Smartphone className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800">
                        <strong>Mobile Optimized:</strong> The hosted link works perfectly on all devices. Tenants can bookmark it for easy access.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="no-website">
            <AccordionTrigger className="text-left">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-primary" />
                <span>No Website? No Problem!</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <div className="space-y-4">
                <p>The hosted link is your complete solution. No website required!</p>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Immediate Benefits</h4>
                  <ul className="space-y-2 ml-4">
                    <li>• <strong>24/7 Availability:</strong> Tenants can submit requests anytime</li>
                    <li>• <strong>Professional Image:</strong> Branded experience with your colors and logo</li>
                    <li>• <strong>Instant Setup:</strong> Share the link immediately after configuration</li>
                    <li>• <strong>No Maintenance:</strong> We handle hosting, updates, and security</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Perfect for Small Operations</h4>
                  <ul className="space-y-2 ml-4">
                    <li>• Independent landlords</li>
                    <li>• Small property management companies</li>
                    <li>• Property managers transitioning to digital</li>
                    <li>• Seasonal or temporary properties</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="testing">
            <AccordionTrigger className="text-left">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Testing Your Setup</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Verification Checklist</h4>
                  <ul className="space-y-2 ml-4">
                    <li>□ Widget appears on your website (if embedded)</li>
                    <li>□ Hosted link opens correctly</li>
                    <li>□ Brand colors and logo display properly</li>
                    <li>□ Test submission reaches your routing email</li>
                    <li>□ Mobile experience works smoothly</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Test Submission</h4>
                  <p>Submit a test maintenance request to ensure:</p>
                  <ul className="space-y-1 ml-4 mt-2">
                    <li>• Email notifications arrive promptly</li>
                    <li>• Request appears in your dashboard</li>
                    <li>• All required information is captured</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="troubleshooting">
            <AccordionTrigger className="text-left">
              <div className="flex items-center space-x-3">
                <Wrench className="w-5 h-5 text-primary" />
                <span>Troubleshooting</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Common Issues</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Widget not appearing:</p>
                      <ul className="text-sm ml-4 mt-1">
                        <li>• Check if code is placed before &lt;/body&gt;</li>
                        <li>• Verify there are no JavaScript errors</li>
                        <li>• Clear browser cache and refresh</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">Not receiving emails:</p>
                      <ul className="text-sm ml-4 mt-1">
                        <li>• Check spam/junk folder</li>
                        <li>• Verify routing email in configuration</li>
                        <li>• Confirm email server settings</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">Mobile display issues:</p>
                      <ul className="text-sm ml-4 mt-1">
                        <li>• Test on multiple devices</li>
                        <li>• Check viewport meta tag</li>
                        <li>• Ensure responsive design compatibility</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800">
                        <strong>Need Help?</strong> Contact our support team at support@pulserobot.com with your specific issue and website details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}