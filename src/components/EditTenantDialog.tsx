import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Tenant name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  propertyAddress: z.string().min(1, "Property address is required"),
  unitNumber: z.string().optional(),
  rentAmount: z.string().min(1, "Rent amount is required"),
  rentDueDate: z.string().min(1, "Rent due date is required"),
  leaseStartDate: z.string().optional(),
  leaseEndDate: z.string().optional(),
  securityDeposit: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Tenant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  unit_number: string | null;
  property_address: string;
  rent_amount: number;
  rent_due_date: number;
  lease_start_date: string | null;
  lease_end_date: string | null;
  security_deposit: number | null;
  notes: string | null;
}

interface EditTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  onSuccess: () => void;
}

export function EditTenantDialog({
  open,
  onOpenChange,
  tenant,
  onSuccess,
}: EditTenantDialogProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      propertyAddress: "",
      unitNumber: "",
      rentAmount: "",
      rentDueDate: "1",
      leaseStartDate: "",
      leaseEndDate: "",
      securityDeposit: "",
      notes: "",
    },
  });

  // Reset form when tenant changes or dialog opens
  useEffect(() => {
    if (tenant && open) {
      form.reset({
        name: tenant.name || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        propertyAddress: tenant.property_address || "",
        unitNumber: tenant.unit_number || "",
        rentAmount: tenant.rent_amount?.toString() || "",
        rentDueDate: tenant.rent_due_date?.toString() || "1",
        leaseStartDate: tenant.lease_start_date || "",
        leaseEndDate: tenant.lease_end_date || "",
        securityDeposit: tenant.security_deposit?.toString() || "",
        notes: tenant.notes || "",
      });
    }
  }, [tenant, open, form]);

  const onSubmit = async (data: FormData) => {
    if (!tenant?.id) return;

    setSubmitting(true);
    try {
      const updateData = {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        property_address: data.propertyAddress,
        unit_number: data.unitNumber || null,
        rent_amount: parseFloat(data.rentAmount),
        rent_due_date: parseInt(data.rentDueDate),
        lease_start_date: data.leaseStartDate || null,
        lease_end_date: data.leaseEndDate || null,
        security_deposit: data.securityDeposit ? parseFloat(data.securityDeposit) : null,
        notes: data.notes || null,
      };

      const { error } = await supabase
        .from("tenants")
        .update(updateData)
        .eq("id", tenant.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant updated successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating tenant:", error);
      toast({
        title: "Error",
        description: "Failed to update tenant",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold">Edit Tenant</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update tenant and lease information
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <h3 className="font-medium">Personal Information</h3>
              </div>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="john@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(555) 123-4567" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Property Information */}
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <h3 className="font-medium">Property Information</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="propertyAddress"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Property Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123 Main St, City, State 12345" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="A, 101, etc." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Lease Details */}
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <h3 className="font-medium">Lease Details</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Rent Amount</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="1500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rentDueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rent Due Date (Day of Month)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" max="31" placeholder="1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="leaseStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lease Start Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leaseEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lease End Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="securityDeposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Deposit (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="1500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any additional notes about the tenant or lease..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Tenant
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}