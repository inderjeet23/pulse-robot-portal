import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Plus, Mail, Phone, MapPin, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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
  created_at: string;
}

export const TenantManagement = () => {
  const { propertyManager } = useAuth();
  const { toast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    unit_number: "",
    property_address: "",
    rent_amount: "",
    rent_due_date: "1",
    lease_start_date: "",
    lease_end_date: "",
    security_deposit: "",
    notes: ""
  });

  const fetchTenants = async () => {
    if (!propertyManager?.id) return;

    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('property_manager_id', propertyManager.id)
        .order('name');

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast({
        title: "Error",
        description: "Failed to load tenants",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [propertyManager?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyManager?.id) return;

    try {
      const { error } = await supabase
        .from('tenants')
        .insert({
          property_manager_id: propertyManager.id,
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          unit_number: formData.unit_number || null,
          property_address: formData.property_address,
          rent_amount: parseFloat(formData.rent_amount),
          rent_due_date: parseInt(formData.rent_due_date),
          lease_start_date: formData.lease_start_date || null,
          lease_end_date: formData.lease_end_date || null,
          security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : null,
          notes: formData.notes || null
        });

      if (error) throw error;

      await fetchTenants();
      setIsDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        unit_number: "",
        property_address: "",
        rent_amount: "",
        rent_due_date: "1",
        lease_start_date: "",
        lease_end_date: "",
        security_deposit: "",
        notes: ""
      });

      toast({
        title: "Success",
        description: "Tenant added successfully",
      });
    } catch (error) {
      console.error('Error adding tenant:', error);
      toast({
        title: "Error",
        description: "Failed to add tenant",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tenant Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tenant Management
            </CardTitle>
            <CardDescription>
              Manage your tenants and their lease information
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Tenant</DialogTitle>
                <DialogDescription>
                  Enter tenant information and lease details
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Tenant Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit_number">Unit Number</Label>
                    <Input
                      id="unit_number"
                      value={formData.unit_number}
                      onChange={(e) => setFormData({...formData, unit_number: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="property_address">Property Address *</Label>
                  <Input
                    id="property_address"
                    value={formData.property_address}
                    onChange={(e) => setFormData({...formData, property_address: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="rent_amount">Monthly Rent *</Label>
                    <Input
                      id="rent_amount"
                      type="number"
                      step="0.01"
                      value={formData.rent_amount}
                      onChange={(e) => setFormData({...formData, rent_amount: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="rent_due_date">Due Day of Month</Label>
                    <Input
                      id="rent_due_date"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.rent_due_date}
                      onChange={(e) => setFormData({...formData, rent_due_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="security_deposit">Security Deposit</Label>
                    <Input
                      id="security_deposit"
                      type="number"
                      step="0.01"
                      value={formData.security_deposit}
                      onChange={(e) => setFormData({...formData, security_deposit: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lease_start_date">Lease Start Date</Label>
                    <Input
                      id="lease_start_date"
                      type="date"
                      value={formData.lease_start_date}
                      onChange={(e) => setFormData({...formData, lease_start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lease_end_date">Lease End Date</Label>
                    <Input
                      id="lease_end_date"
                      type="date"
                      value={formData.lease_end_date}
                      onChange={(e) => setFormData({...formData, lease_end_date: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Tenant</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {tenants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tenants found. Add your first tenant to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-lg">{tenant.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {tenant.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {tenant.email}
                        </div>
                      )}
                      {tenant.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {tenant.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary">
                      ${tenant.rent_amount.toLocaleString()}/mo
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Due {tenant.rent_due_date}{tenant.rent_due_date === 1 ? 'st' : tenant.rent_due_date === 2 ? 'nd' : tenant.rent_due_date === 3 ? 'rd' : 'th'} of month
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{tenant.property_address}</span>
                    {tenant.unit_number && <span> - Unit {tenant.unit_number}</span>}
                  </div>
                  {tenant.security_deposit && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>Security: ${tenant.security_deposit.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {(tenant.lease_start_date || tenant.lease_end_date) && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Lease:</strong> 
                    {tenant.lease_start_date && ` From ${format(new Date(tenant.lease_start_date), 'MMM d, yyyy')}`}
                    {tenant.lease_end_date && ` to ${format(new Date(tenant.lease_end_date), 'MMM d, yyyy')}`}
                  </div>
                )}

                {tenant.notes && (
                  <div className="text-sm text-muted-foreground mt-2">
                    <strong>Notes:</strong> {tenant.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};