import { useState, useEffect, useCallback } from "react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  isInternalRequest: z.boolean().default(false),
  tenantId: z.string().optional(),
  tenantName: z.string().min(1, "Tenant name is required"),
  tenantEmail: z.string().email().optional().or(z.literal("")),
  tenantPhone: z.string().optional(),
  propertyAddress: z.string().min(1, "Property address is required"),
  unitNumber: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  requestType: z.string().min(1, "Request type is required"),
  priority: z.string().min(1, "Priority is required"),
  description: z.string().min(1, "Description is required"),
  assignedTo: z.string().optional(),
  estimatedCost: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Tenant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  property_address: string;
  unit_number: string | null;
}

interface NewMaintenanceRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NewMaintenanceRequestDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewMaintenanceRequestDialogProps) {
  const { propertyManager } = useAuth();
  const { toast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tenantSearchOpen, setTenantSearchOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isInternalRequest: false,
      tenantName: "",
      tenantEmail: "",
      tenantPhone: "",
      propertyAddress: "",
      unitNumber: "",
      title: "",
      requestType: "",
      priority: "Medium",
      description: "",
      assignedTo: "",
      estimatedCost: "",
    },
  });

  const isInternalRequest = form.watch("isInternalRequest");
  const selectedTenantId = form.watch("tenantId");

  const fetchTenants = useCallback(async () => {
    if (!propertyManager?.id) return;

    setTenantsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, email, phone, property_address, unit_number")
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
  }, [propertyManager?.id, toast]);

  // Fetch tenants when dialog opens
  useEffect(() => {
    if (open && propertyManager?.id) {
      fetchTenants();
    }
  }, [open, propertyManager?.id, fetchTenants]);

  const onSubmit = async (data: FormData) => {
    if (!propertyManager?.id) return;

    setSubmitting(true);
    try {
      const requestData = {
        property_manager_id: propertyManager.id,
        tenant_name: data.tenantName,
        tenant_email: data.tenantEmail || null,
        tenant_phone: data.tenantPhone || null,
        property_address: data.propertyAddress,
        unit_number: data.unitNumber || null,
        title: data.title,
        request_type: data.requestType,
        priority: data.priority,
        description: data.description,
        assigned_to: data.assignedTo || null,
        estimated_cost: data.estimatedCost ? parseFloat(data.estimatedCost) : null,
        status: "New",
      };

      const { error } = await supabase
        .from("maintenance_requests")
        .insert([requestData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance request created successfully",
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      toast({
        title: "Error",
        description: "Failed to create maintenance request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const requestTypes = [
    "Plumbing",
    "Electrical", 
    "HVAC",
    "Appliance",
    "General",
  ];

  const priorities = [
    "Low",
    "Medium", 
    "High",
    "Urgent",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold">Create New Request</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Quick form to log maintenance requests
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Primary Section: Who & Where */}
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <h3 className="font-medium">Who & Where</h3>
              </div>
              
              {/* Internal Request Checkbox */}
              <FormField
                control={form.control}
                name="isInternalRequest"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <Label className="text-sm font-medium">
                        Internal request (no tenant)
                      </Label>
                    </div>
                  </FormItem>
                )}
              />

              {/* Tenant Selection Combobox */}
              {!isInternalRequest && (
                <FormField
                  control={form.control}
                  name="tenantId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Select Tenant</FormLabel>
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
              )}

              {/* Tenant Name */}
              <FormField
                control={form.control}
                name="tenantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenant Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        readOnly={!isInternalRequest && !!selectedTenantId}
                        placeholder={isInternalRequest ? "Internal Maintenance" : "Enter tenant name"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tenantEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          readOnly={!isInternalRequest && !!selectedTenantId}
                          placeholder="tenant@email.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tenantPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          readOnly={!isInternalRequest && !!selectedTenantId}
                          placeholder="(555) 123-4567"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Property Information */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="propertyAddress"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Property Address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          readOnly={!isInternalRequest && !!selectedTenantId}
                          placeholder="123 Main St, City, State 12345"
                        />
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
                        <Input 
                          {...field} 
                          readOnly={!isInternalRequest && !!selectedTenantId}
                          placeholder="A, 101, etc."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Primary Section: What's the Issue */}
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <h3 className="font-medium">What's the Issue</h3>
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief summary of the issue" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requestType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select request type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {requestTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Detailed description of the maintenance issue"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Section - Show/Hide Toggle */}
            <details className="group">
              <summary className="flex items-center gap-2 text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground group-open:bg-primary transition-colors"></div>
                Advanced Options
                <span className="ml-auto text-xs group-open:hidden">Click to expand</span>
              </summary>
              <div className="mt-4 p-4 bg-muted/10 rounded-lg border space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Assigned To</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Contractor or staff" className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Estimated Cost</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
                            step="0.01"
                            placeholder="0.00"
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </details>

            <DialogFooter className="flex gap-3 pt-6">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-button"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? "Creating..." : "Create Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}