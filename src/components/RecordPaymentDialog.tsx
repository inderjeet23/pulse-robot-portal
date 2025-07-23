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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  tenantId: z.string().min(1, "Please select a tenant"),
  amountPaid: z.string().min(1, "Payment amount is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paidDate: z.string().min(1, "Payment date is required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Tenant {
  id: string;
  name: string;
  property_address: string;
  unit_number: string | null;
  rent_amount: number;
}

interface PendingRentRecord {
  id: string;
  amount_due: number;
  due_date: string;
  late_fees: number;
}

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
}: RecordPaymentDialogProps) {
  const { propertyManager } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [tenantSearchOpen, setTenantSearchOpen] = useState(false);
  const [selectedTenantRent, setSelectedTenantRent] = useState<PendingRentRecord | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenantId: "",
      amountPaid: "",
      paymentMethod: "",
      paidDate: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const selectedTenantId = form.watch("tenantId");

  // Fetch tenants when dialog opens
  useEffect(() => {
    if (open && propertyManager?.id) {
      fetchTenants();
    }
  }, [open, propertyManager?.id]);

  // Fetch pending rent record when tenant is selected
  useEffect(() => {
    if (selectedTenantId) {
      fetchPendingRentRecord(selectedTenantId);
    }
  }, [selectedTenantId]);

  const fetchTenants = async () => {
    if (!propertyManager?.id) return;

    setTenantsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, property_address, unit_number, rent_amount")
        .eq("property_manager_id", propertyManager.id)
        .order("name");

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      toast({
        title: "Error",
        description: "Failed to load tenants",
        variant: "destructive",
      });
    } finally {
      setTenantsLoading(false);
    }
  };

  const fetchPendingRentRecord = async (tenantId: string) => {
    try {
      const { data, error } = await supabase
        .from("rent_records")
        .select("id, amount_due, due_date, late_fees")
        .eq("tenant_id", tenantId)
        .eq("status", "pending")
        .order("due_date", { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSelectedTenantRent(data);
        // Auto-fill amount with what's due
        const totalDue = (data.amount_due || 0) + (data.late_fees || 0);
        form.setValue("amountPaid", totalDue.toString());
      } else {
        setSelectedTenantRent(null);
        // Set to regular rent amount if no pending record
        const tenant = tenants.find(t => t.id === tenantId);
        if (tenant) {
          form.setValue("amountPaid", tenant.rent_amount.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching pending rent record:", error);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!propertyManager?.id) return;

    setSubmitting(true);
    try {
      const amountPaid = parseFloat(data.amountPaid);

      if (selectedTenantRent) {
        // Update existing rent record
        const { error: updateError } = await supabase
          .from("rent_records")
          .update({
            amount_paid: amountPaid,
            paid_date: data.paidDate,
            payment_method: data.paymentMethod,
            notes: data.notes || null,
            status: "paid",
          })
          .eq("id", selectedTenantRent.id);

        if (updateError) throw updateError;
      } else {
        // Create new rent record for this payment
        const { error: insertError } = await supabase
          .from("rent_records")
          .insert([{
            property_manager_id: propertyManager.id,
            tenant_id: data.tenantId,
            amount_due: amountPaid,
            amount_paid: amountPaid,
            due_date: data.paidDate,
            paid_date: data.paidDate,
            payment_method: data.paymentMethod,
            notes: data.notes || null,
            status: "paid",
          }]);

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = [
    "Cash",
    "Check",
    "Bank Transfer",
    "Credit Card",
    "Online Payment",
    "Money Order",
    "Other"
  ];

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold">Record Payment</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Log a rent payment received from a tenant
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Tenant Selection */}
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <h3 className="font-medium">Select Tenant</h3>
              </div>

              <FormField
                control={form.control}
                name="tenantId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tenant</FormLabel>
                    <Popover open={tenantSearchOpen} onOpenChange={setTenantSearchOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={tenantsLoading}
                          >
                            {field.value
                              ? tenants.find(tenant => tenant.id === field.value)?.name
                              : "Search and select a tenant..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search tenants..." />
                          <CommandList>
                            <CommandEmpty>No tenant found.</CommandEmpty>
                            <CommandGroup>
                              {tenants.map((tenant) => (
                                <CommandItem
                                  key={tenant.id}
                                  value={tenant.name}
                                  onSelect={() => {
                                    form.setValue("tenantId", tenant.id);
                                    setTenantSearchOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      tenant.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div>
                                    <div className="font-medium">{tenant.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {tenant.property_address}
                                      {tenant.unit_number && ` - Unit ${tenant.unit_number}`}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedTenant && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm">
                    <p><span className="font-medium">Property:</span> {selectedTenant.property_address}</p>
                    {selectedTenant.unit_number && (
                      <p><span className="font-medium">Unit:</span> {selectedTenant.unit_number}</p>
                    )}
                    <p><span className="font-medium">Monthly Rent:</span> ${selectedTenant.rent_amount}</p>
                    {selectedTenantRent && (
                      <p className="text-amber-700 dark:text-amber-300 mt-2">
                        <span className="font-medium">Pending Payment:</span> ${(selectedTenantRent.amount_due + selectedTenantRent.late_fees).toFixed(2)}
                        {selectedTenantRent.late_fees > 0 && (
                          <span className="text-red-600 dark:text-red-400"> (includes ${selectedTenantRent.late_fees} late fees)</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <h3 className="font-medium">Payment Details</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amountPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Paid</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="1500.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="paidDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
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
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any additional notes about this payment..." />
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
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}