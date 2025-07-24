import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TenantCardList } from "@/components/TenantCardList";
import { EditTenantDialog } from "@/components/EditTenantDialog";
import { DeleteTenantDialog } from "@/components/DeleteTenantDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Plus, Mail, Phone, MapPin, DollarSign, Search, Filter, MoreVertical, Eye, Edit, Trash2, Calendar, FileText } from "lucide-react";
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
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [deleteTenant, setDeleteTenant] = useState<Tenant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
      setFilteredTenants(data || []);
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

  // Filter tenants based on search and status
  useEffect(() => {
    let filtered = tenants;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tenant =>
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.property_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.unit_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter (lease status)
    if (statusFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(tenant => {
        if (statusFilter === "active") {
          return !tenant.lease_end_date || new Date(tenant.lease_end_date) > now;
        } else if (statusFilter === "expired") {
          return tenant.lease_end_date && new Date(tenant.lease_end_date) <= now;
        } else if (statusFilter === "no-lease") {
          return !tenant.lease_start_date && !tenant.lease_end_date;
        }
        return true;
      });
    }

    setFilteredTenants(filtered);
  }, [tenants, searchQuery, statusFilter]);

  const getLeaseStatus = (tenant: Tenant) => {
    if (!tenant.lease_start_date && !tenant.lease_end_date) {
      return { status: "No Lease", variant: "secondary" as const };
    }
    
    const now = new Date();
    if (tenant.lease_end_date && new Date(tenant.lease_end_date) <= now) {
      return { status: "Expired", variant: "destructive" as const };
    }
    
    return { status: "Active", variant: "default" as const };
  };

  const handleViewDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDetailSheetOpen(true);
  };

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
        <div className="flex justify-between items-start mb-6">
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

                <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Tenant</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tenants by name, email, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tenants</SelectItem>
              <SelectItem value="active">Active Leases</SelectItem>
              <SelectItem value="expired">Expired Leases</SelectItem>
              <SelectItem value="no-lease">No Lease Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {tenants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tenants found. Add your first tenant to get started.
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tenants match your search criteria. Try adjusting your filters.
          </div>
        ) : (
          <>
            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden sm:block border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Lease Status</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant) => {
                    const leaseStatus = getLeaseStatus(tenant);
                    return (
                      <TableRow 
                        key={tenant.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(tenant)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{tenant.name}</div>
                            {tenant.unit_number && (
                              <div className="text-sm text-muted-foreground">
                                Unit {tenant.unit_number}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {tenant.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {tenant.email}
                              </div>
                            )}
                            {tenant.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {tenant.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground" />
                            <span className="text-sm">{tenant.property_address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">${tenant.rent_amount.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              Due {tenant.rent_due_date}{tenant.rent_due_date === 1 ? 'st' : tenant.rent_due_date === 2 ? 'nd' : tenant.rent_due_date === 3 ? 'rd' : 'th'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={leaseStatus.variant}>
                            {leaseStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(tenant);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setEditTenant(tenant);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Tenant
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTenant(tenant);
                              }}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Tenant
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card List - Visible only on mobile */}
            <div className="block sm:hidden">
              <TenantCardList 
                tenants={filteredTenants}
                onViewDetails={handleViewDetails}
                onTenantUpdate={fetchTenants}
                getLeaseStatus={getLeaseStatus}
              />
            </div>
          </>
        )}

        {/* Tenant Details Sheet */}
        <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            {selectedTenant && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {selectedTenant.name}
                  </SheetTitle>
                  <SheetDescription>
                    Tenant details and lease information
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="font-medium mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      {selectedTenant.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedTenant.email}</span>
                        </div>
                      )}
                      {selectedTenant.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedTenant.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Property Information */}
                  <div>
                    <h3 className="font-medium mb-3">Property Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div>{selectedTenant.property_address}</div>
                          {selectedTenant.unit_number && (
                            <div className="text-sm text-muted-foreground">Unit {selectedTenant.unit_number}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div>
                    <h3 className="font-medium mb-3">Financial Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>Monthly Rent: ${selectedTenant.rent_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Due {selectedTenant.rent_due_date}{selectedTenant.rent_due_date === 1 ? 'st' : selectedTenant.rent_due_date === 2 ? 'nd' : selectedTenant.rent_due_date === 3 ? 'rd' : 'th'} of each month</span>
                      </div>
                      {selectedTenant.security_deposit && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>Security Deposit: ${selectedTenant.security_deposit.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lease Information */}
                  {(selectedTenant.lease_start_date || selectedTenant.lease_end_date) && (
                    <div>
                      <h3 className="font-medium mb-3">Lease Information</h3>
                      <div className="space-y-2">
                        {selectedTenant.lease_start_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Start: {format(new Date(selectedTenant.lease_start_date), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                        {selectedTenant.lease_end_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>End: {format(new Date(selectedTenant.lease_end_date), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                        <div className="mt-2">
                          <Badge variant={getLeaseStatus(selectedTenant).variant}>
                            {getLeaseStatus(selectedTenant).status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedTenant.notes && (
                    <div>
                      <h3 className="font-medium mb-3">Notes</h3>
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm">{selectedTenant.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Edit and Delete Dialogs */}
        <EditTenantDialog
          open={!!editTenant}
          onOpenChange={(open) => !open && setEditTenant(null)}
          tenant={editTenant}
          onSuccess={fetchTenants}
        />
        
        <DeleteTenantDialog
          open={!!deleteTenant}
          onOpenChange={(open) => !open && setDeleteTenant(null)}
          tenant={deleteTenant}
          onSuccess={fetchTenants}
        />
      </CardContent>
    </Card>
  );
};