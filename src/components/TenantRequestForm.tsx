import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TenantRequestData {
  tenant_name: string;
  unit_number: string;
  property_address: string;
  contact_phone: string;
  contact_email: string;
  request_type: string;
  urgency: string;
  description: string;
}

const PROPERTY_MANAGER_ID = "20a071d5-915b-4c8f-acd5-8d74d61832b2"; // Your property manager ID

export const TenantRequestForm = () => {
  const [formData, setFormData] = useState<TenantRequestData>({
    tenant_name: "",
    unit_number: "",
    property_address: "",
    contact_phone: "",
    contact_email: "",
    request_type: "",
    urgency: "",
    description: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestId, setRequestId] = useState<string>("");

  const handleInputChange = (field: keyof TenantRequestData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateTitle = (requestType: string, urgency: string): string => {
    const urgencyPrefix = urgency === "Yes, it's urgent" ? "URGENT: " : "";
    const typeMap: Record<string, string> = {
      "Leak": "Water Leak",
      "No heat": "Heating Issue",
      "Broken appliance": "Appliance Repair",
      "Other": "Maintenance Request"
    };
    return urgencyPrefix + (typeMap[requestType] || "Maintenance Request");
  };

  const mapUrgencyToPriority = (urgency: string): string => {
    return urgency === "Yes, it's urgent" ? "Urgent" : "Medium";
  };

  const handleSubmit = async () => {
    const { tenant_name, unit_number, property_address, contact_phone, contact_email, request_type, urgency, description } = formData;
    
    // Validation
    if (!tenant_name || !property_address || !request_type || !urgency || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!contact_phone && !contact_email) {
      toast.error("Please provide either a phone number or email");
      return;
    }

    setIsSubmitting(true);

    try {
      const title = generateTitle(request_type, urgency);
      const priority = mapUrgencyToPriority(urgency);
      
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert({
          property_manager_id: PROPERTY_MANAGER_ID,
          tenant_name,
          tenant_email: contact_email || null,
          tenant_phone: contact_phone || null,
          property_address: unit_number ? `${property_address}, Unit ${unit_number}` : property_address,
          unit_number: unit_number || null,
          request_type,
          priority,
          status: 'New',
          title,
          description: `${description}\n\nSubmitted via tenant portal.\nUrgency: ${urgency}`,
        })
        .select()
        .single();

      if (error) throw error;

      setRequestId(data.id);
      setIsSubmitted(true);
      toast.success("Maintenance request submitted successfully!");
      
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">Request Submitted Successfully!</CardTitle>
          <CardDescription>
            Your maintenance request has been received and will be reviewed promptly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Request ID:</strong> {requestId.slice(0, 8)}<br />
              <strong>What's Next:</strong> Your property manager will review your request and contact you within 24 hours.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                tenant_name: "",
                unit_number: "",
                property_address: "",
                contact_phone: "",
                contact_email: "",
                request_type: "",
                urgency: "",
                description: ""
              });
            }}
            variant="outline"
            className="w-full"
          >
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Maintenance Request</CardTitle>
        <CardDescription>
          Please provide the following information about your maintenance issue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tenant Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          
          <div>
            <Label htmlFor="tenant_name">Full Name *</Label>
            <Input
              id="tenant_name"
              value={formData.tenant_name}
              onChange={(e) => handleInputChange("tenant_name", e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_phone">Phone Number</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Email Address</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange("contact_email", e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please provide either a phone number or email address so we can contact you.
            </AlertDescription>
          </Alert>
        </div>

        {/* Property Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Property Information</h3>
          
          <div>
            <Label htmlFor="property_address">Property Address *</Label>
            <Input
              id="property_address"
              value={formData.property_address}
              onChange={(e) => handleInputChange("property_address", e.target.value)}
              placeholder="123 Main Street, City, State 12345"
            />
          </div>

          <div>
            <Label htmlFor="unit_number">Unit Number (if applicable)</Label>
            <Input
              id="unit_number"
              value={formData.unit_number}
              onChange={(e) => handleInputChange("unit_number", e.target.value)}
              placeholder="Apt 2B, Unit 5, etc."
            />
          </div>
        </div>

        {/* Issue Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Issue Details</h3>
          
          <div>
            <Label>Type of Issue *</Label>
            <Select value={formData.request_type} onValueChange={(value) => handleInputChange("request_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of issue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Leak">Leak</SelectItem>
                <SelectItem value="No heat">No heat</SelectItem>
                <SelectItem value="Broken appliance">Broken appliance</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Is this urgent? *</Label>
            <RadioGroup 
              value={formData.urgency} 
              onValueChange={(value) => handleInputChange("urgency", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes, it's urgent" id="urgent-yes" />
                <Label htmlFor="urgent-yes">Yes, it's urgent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No, it's routine" id="urgent-no" />
                <Label htmlFor="urgent-no">No, it's routine</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description">Issue Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Please describe the issue in detail..."
              rows={4}
            />
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Maintenance Request
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};