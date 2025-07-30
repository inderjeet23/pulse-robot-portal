import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, UserPlus, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

interface SetupWizardProps {
  open: boolean;
  onComplete: () => void;
}

type Step = "property" | "tenants" | "success";

export function SetupWizard({ open, onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>("property");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { propertyManager } = useAuth();
  const { toast } = useToast();

  const stepProgress = {
    property: 33,
    tenants: 66,
    success: 100
  };

  const handleAddProperty = async () => {
    if (!propertyAddress.trim() || !propertyManager?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .insert({
          property_manager_id: propertyManager.id,
          address: propertyAddress.trim(),
          name: propertyAddress.trim()
        })
        .select()
        .single();

      if (error) throw error;

      setPropertyId(data.id);
      setCurrentStep("tenants");
      toast({
        title: "Property added!",
        description: "Now let's add your tenants.",
      });
    } catch (error) {
      console.error("Error adding property:", error);
      toast({
        title: "Error",
        description: "Failed to add property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const tenants = results.data
            .filter((row: Record<string, unknown>) => row.name && (row.name as string).trim())
            .map((row: Record<string, unknown>) => ({
              property_manager_id: propertyManager?.id,
              name: row.name?.trim(),
              email: row.email?.trim() || null,
              phone: row.phone?.trim() || null,
              unit_number: row.unitNumber?.trim() || null,
              property_address: propertyAddress,
              rent_amount: parseFloat(row.rentAmount) || 0,
              rent_due_date: parseInt(row.rentDueDate) || 1,
            }));

          if (tenants.length === 0) {
            toast({
              title: "No valid data",
              description: "Please check your CSV file format.",
              variant: "destructive",
            });
            return;
          }

          const { error } = await supabase
            .from("tenants")
            .insert(tenants);

          if (error) throw error;

          toast({
            title: "Tenants imported!",
            description: `Successfully added ${tenants.length} tenants.`,
          });

          setCurrentStep("success");
        } catch (error) {
          console.error("Error importing tenants:", error);
          toast({
            title: "Import failed",
            description: "Failed to import tenants. Please try again.",
            variant: "destructive",
          });
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        toast({
          title: "File error",
          description: "Failed to parse CSV file.",
          variant: "destructive",
        });
      }
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        name: "John Smith",
        email: "john@example.com",
        phone: "(555) 123-4567",
        unitNumber: "1A",
        rentAmount: "1200",
        rentDueDate: "1"
      },
      {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "(555) 987-6543",
        unitNumber: "2B",
        rentAmount: "1400",
        rentDueDate: "1"
      }
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tenant-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCompleteOnboarding = async () => {
    if (!propertyManager?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("property_managers")
        .update({ has_completed_onboarding: true })
        .eq("id", propertyManager.id);

      if (error) throw error;

      toast({
        title: "Setup complete!",
        description: "Welcome to Pulse Robot! Your dashboard is ready.",
      });

      onComplete();
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "property":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Property Address</Label>
              <Input
                id="address"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                placeholder="123 Main St, City, State 12345"
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleAddProperty}
              disabled={!propertyAddress.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? "Adding Property..." : "Add Property"}
            </Button>
          </div>
        );

      case "tenants":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <CardTitle className="text-lg">Import from CSV</CardTitle>
                  <CardDescription>
                    Upload a CSV file with your tenant data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <Button
                    variant="link"
                    onClick={downloadTemplate}
                    className="w-full mt-2 text-sm"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Download Template
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader className="text-center">
                  <UserPlus className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <CardTitle className="text-lg">Add Manually</CardTitle>
                  <CardDescription>
                    Add tenants one by one using our form
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => {
                      // TODO: Open AddTenantDialog
                      console.log("Manual add not implemented yet");
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Tenant
                  </Button>
                </CardContent>
              </Card>
            </div>
            <Button 
              variant="outline"
              onClick={() => setCurrentStep("success")}
              className="w-full"
            >
              Skip for Now
            </Button>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Congratulations! You're all set up.</h3>
            <p className="text-muted-foreground">
              Your property management dashboard is ready to use.
            </p>
            <Button 
              onClick={handleCompleteOnboarding}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Finalizing..." : "Get Started"}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = {
    property: "Add Your First Property",
    tenants: "Add Your Tenants",
    success: "Setup Complete!"
  };

  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="space-y-4">
            <Progress value={stepProgress[currentStep]} className="w-full" />
            <DialogTitle className="text-2xl font-bold text-center">
              {stepTitles[currentStep]}
            </DialogTitle>
            {currentStep === "property" && (
              <DialogDescription className="text-center">
                Start by adding your first property address.
              </DialogDescription>
            )}
            {currentStep === "tenants" && (
              <DialogDescription className="text-center">
                Now let's add your tenants. You can import them from a CSV or add them manually.
              </DialogDescription>
            )}
          </div>
        </DialogHeader>
        <div className="mt-6">
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}