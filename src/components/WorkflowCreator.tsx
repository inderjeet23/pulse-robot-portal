import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, ArrowRight } from "lucide-react";

const maintenanceCategories = [
  "Plumbing",
  "Electrical", 
  "HVAC",
  "Appliances",
  "Flooring",
  "Painting",
  "Landscaping",
  "General",
  "Emergency"
];

export const WorkflowCreator = () => {
  const [trigger, setTrigger] = useState("");
  const [condition, setCondition] = useState("");
  const [action, setAction] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trigger || !condition || !action || !vendorEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to create your automation rule.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create automation rules.",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(vendorEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address for the vendor.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const workflowData = {
        user_id: user.id,
        trigger_type: 'new_maintenance_request',
        trigger_conditions: { category: condition },
        action_type: 'send_email_to_vendor',
        action_details: { vendor_email: vendorEmail },
        is_active: true
      };

      const { error } = await supabase
        .from('workflows')
        .insert([workflowData]);

      if (error) throw error;

      toast({
        title: "Automation Created!",
        description: `Your rule has been saved. When a ${condition.toLowerCase()} maintenance request is created, ${vendorEmail} will be automatically notified.`
      });

      // Reset form
      setTrigger("");
      setCondition("");
      setAction("");
      setVendorEmail("");
      
    } catch (error: any) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Error",
        description: "Failed to create automation rule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <CardTitle>Create Automation Rule</CardTitle>
        </div>
        <CardDescription>
          Set up "If This, Then That" automation to save time on routine maintenance tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visual Flow Indicator */}
          <div className="flex items-center justify-center gap-4 py-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">IF</span>
              Trigger
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">AND IF</span>
              Condition
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">THEN</span>
              Action
            </div>
          </div>

          {/* Trigger Section */}
          <div className="space-y-2">
            <Label htmlFor="trigger" className="text-sm font-medium flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">IF</span>
              When this happens...
            </Label>
            <Select value={trigger} onValueChange={setTrigger}>
              <SelectTrigger id="trigger">
                <SelectValue placeholder="Choose a trigger event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new_maintenance_request">
                  A new maintenance request is created
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Condition Section */}
          <div className="space-y-2">
            <Label htmlFor="condition" className="text-sm font-medium flex items-center gap-2">
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">AND IF</span>
              And the category is...
            </Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger id="condition">
                <SelectValue placeholder="Select a maintenance category" />
              </SelectTrigger>
              <SelectContent>
                {maintenanceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Section */}
          <div className="space-y-2">
            <Label htmlFor="action" className="text-sm font-medium flex items-center gap-2">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">THEN</span>
              Automatically do this...
            </Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger id="action">
                <SelectValue placeholder="Choose an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_email_to_vendor">
                  Notify a vendor by email
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Details */}
          {action === "send_email_to_vendor" && (
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-dashed">
              <Label htmlFor="vendor-email" className="text-sm font-medium">
                Vendor Email Address
              </Label>
              <Input
                id="vendor-email"
                type="email"
                placeholder="vendor@example.com"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                This vendor will receive an email with the maintenance request details.
              </p>
            </div>
          )}

          {/* Preview */}
          {trigger && condition && action && vendorEmail && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Preview of your automation:</h4>
              <p className="text-sm text-muted-foreground">
                <strong>IF</strong> a new maintenance request is created <strong>AND IF</strong> the category is "{condition}", 
                <strong> THEN</strong> automatically notify {vendorEmail} by email.
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !trigger || !condition || !action || !vendorEmail}
          >
            {isSubmitting ? "Creating Automation..." : "Save Automation Rule"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};