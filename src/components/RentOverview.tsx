import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, Calendar, AlertTriangle, Plus, TrendingUp, MoreHorizontal, Receipt, Users, Mail, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface RentRecord {
  id: string;
  tenant_id: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  status: string;
  paid_date: string | null;
  late_fees: number;
  payment_method: string | null;
  notes: string | null;
  tenants: {
    name: string;
    email: string | null;
    phone: string | null;
    property_address: string;
    unit_number: string | null;
  };
}

interface Tenant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  property_address: string;
  unit_number: string | null;
  rent_amount: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  partial: "bg-primary/20 text-primary",
  paid: "bg-accent text-accent-foreground",
  overdue: "bg-destructive/20 text-destructive"
};

export const RentOverview = () => {
  const { propertyManager } = useAuth();
  const { toast } = useToast();
  const [rentRecords, setRentRecords] = useState<RentRecord[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    tenant_id: "",
    amount: "",
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: "cash",
    notes: ""
  });

  const fetchRentRecords = async () => {
    if (!propertyManager?.id) return;

    try {
      const { data, error } = await supabase
        .from('rent_records')
        .select(`
          *,
          tenants (
            name,
            email,
            phone,
            property_address,
            unit_number
          )
        `)
        .eq('property_manager_id', propertyManager.id)
        .order('due_date', { ascending: false });

      if (error) throw error;
      setRentRecords(data || []);
    } catch (error) {
      console.error('Error fetching rent records:', error);
      toast({
        title: "Error",
        description: "Failed to load rent records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    if (!propertyManager?.id) return;

    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, email, phone, property_address, unit_number, rent_amount')
        .eq('property_manager_id', propertyManager.id)
        .order('name');

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  useEffect(() => {
    fetchRentRecords();
    fetchTenants();
  }, [propertyManager?.id]);

  const markAsPaid = async (recordId: string, amountDue: number) => {
    try {
      const { error } = await supabase
        .from('rent_records')
        .update({ 
          status: 'paid',
          amount_paid: amountDue,
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', recordId);

      if (error) throw error;

      await fetchRentRecords();
      toast({
        title: "Success",
        description: "Rent marked as paid",
      });
    } catch (error) {
      console.error('Error marking rent as paid:', error);
      toast({
        title: "Error",
        description: "Failed to update rent status",
        variant: "destructive"
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(new Set(filteredRecords.map(r => r.id)));
    } else {
      setSelectedRecords(new Set());
    }
  };

  const handleSelectRecord = (recordId: string, checked: boolean) => {
    const newSelected = new Set(selectedRecords);
    if (checked) {
      newSelected.add(recordId);
    } else {
      newSelected.delete(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const handleBulkReminder = async () => {
    // TODO: Implement bulk reminder functionality
    toast({
      title: "Reminders Sent",
      description: `Sent reminders to ${selectedRecords.size} tenants`,
    });
    setSelectedRecords(new Set());
  };

  const handleLogPayment = async () => {
    if (!propertyManager?.id || !paymentFormData.tenant_id || !paymentFormData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Find the most recent pending/overdue record for this tenant
      const { data: existingRecord, error: findError } = await supabase
        .from('rent_records')
        .select('*')
        .eq('tenant_id', paymentFormData.tenant_id)
        .eq('property_manager_id', propertyManager.id)
        .in('status', ['pending', 'overdue'])
        .order('due_date', { ascending: false })
        .limit(1);

      if (findError) throw findError;

      const paymentAmount = parseFloat(paymentFormData.amount);

      if (existingRecord && existingRecord.length > 0) {
        // Update existing record
        const record = existingRecord[0];
        const { error } = await supabase
          .from('rent_records')
          .update({
            status: 'paid',
            amount_paid: paymentAmount,
            paid_date: paymentFormData.payment_date,
            payment_method: paymentFormData.payment_method,
            notes: paymentFormData.notes || null
          })
          .eq('id', record.id);

        if (error) throw error;
      } else {
        // Create new record if no pending record exists
        const selectedTenant = tenants.find(t => t.id === paymentFormData.tenant_id);
        if (!selectedTenant) throw new Error("Tenant not found");

        const { error } = await supabase
          .from('rent_records')
          .insert({
            property_manager_id: propertyManager.id,
            tenant_id: paymentFormData.tenant_id,
            amount_due: paymentAmount,
            amount_paid: paymentAmount,
            due_date: paymentFormData.payment_date,
            paid_date: paymentFormData.payment_date,
            status: 'paid',
            payment_method: paymentFormData.payment_method,
            notes: paymentFormData.notes || null
          });

        if (error) throw error;
      }

      await fetchRentRecords();
      setIsPaymentDialogOpen(false);
      setPaymentFormData({
        tenant_id: "",
        amount: "",
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: "cash",
        notes: ""
      });

      toast({
        title: "Success",
        description: "Payment logged successfully",
      });
    } catch (error) {
      console.error('Error logging payment:', error);
      toast({
        title: "Error",
        description: "Failed to log payment",
        variant: "destructive"
      });
    }
  };

  const filteredRecords = rentRecords.filter(record => {
    if (activeTab === "all") return true;
    return record.status === activeTab;
  });

  // Calculate financial KPIs
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthRecords = rentRecords.filter(record => {
    const recordDate = new Date(record.due_date);
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  });

  const kpis = {
    totalDueThisMonth: thisMonthRecords.reduce((sum, r) => sum + r.amount_due, 0),
    totalCollectedThisMonth: thisMonthRecords
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + r.amount_paid, 0),
    totalOverdueAllTime: rentRecords
      .filter(r => r.status === 'overdue')
      .reduce((sum, r) => sum + (r.amount_due - r.amount_paid), 0),
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Rent Overview
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
    <div className="space-y-6">
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rent Due This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">${kpis.totalDueThisMonth.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Collected This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">${kpis.totalCollectedThisMonth.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Overdue (All Time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">${kpis.totalOverdueAllTime.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Rent Management Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Rent Management
              </CardTitle>
              <CardDescription>
                Track and manage tenant rent payments
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Log Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Offline Payment</DialogTitle>
                    <DialogDescription>
                      Record a payment received via cash, check, or other offline method
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tenant">Tenant *</Label>
                      <Select value={paymentFormData.tenant_id} onValueChange={(value) => 
                        setPaymentFormData({...paymentFormData, tenant_id: value})
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a tenant" />
                        </SelectTrigger>
                        <SelectContent>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.name} - {tenant.property_address}
                              {tenant.unit_number && ` (Unit ${tenant.unit_number})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={paymentFormData.amount}
                          onChange={(e) => setPaymentFormData({...paymentFormData, amount: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment_date">Payment Date *</Label>
                        <Input
                          id="payment_date"
                          type="date"
                          value={paymentFormData.payment_date}
                          onChange={(e) => setPaymentFormData({...paymentFormData, payment_date: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Select value={paymentFormData.payment_method} onValueChange={(value) => 
                        setPaymentFormData({...paymentFormData, payment_method: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="money_order">Money Order</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional notes about this payment..."
                        value={paymentFormData.notes}
                        onChange={(e) => setPaymentFormData({...paymentFormData, notes: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleLogPayment}>
                        Log Payment
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="sm" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Add Tenant
              </Button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedRecords.size > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {selectedRecords.size} record{selectedRecords.size > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleBulkReminder}>
                    <Mail className="h-4 w-4 mr-1" />
                    Send Reminder ({selectedRecords.size})
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedRecords(new Set())}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No rent records found for this status.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRecords.size === filteredRecords.length && filteredRecords.length > 0}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead className="hidden md:table-cell">Property</TableHead>
                      <TableHead>Amount Due</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRecords.has(record.id)}
                            onCheckedChange={(checked) => handleSelectRecord(record.id, checked as boolean)}
                            aria-label={`Select ${record.tenants.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{record.tenants.name}</div>
                              <div className="text-sm text-muted-foreground md:hidden">
                                {record.tenants.property_address}
                                {record.tenants.unit_number && ` - Unit ${record.tenants.unit_number}`}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm">
                            {record.tenants.property_address}
                            {record.tenants.unit_number && (
                              <div className="text-muted-foreground">Unit {record.tenants.unit_number}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">${record.amount_due.toLocaleString()}</div>
                          {record.late_fees > 0 && (
                            <div className="text-sm text-destructive">
                              +${record.late_fees.toLocaleString()} late fees
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(record.due_date), 'MMM d, yyyy')}
                          </div>
                          {record.paid_date && (
                            <div className="text-xs text-muted-foreground">
                              Paid: {format(new Date(record.paid_date), 'MMM d')}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[record.status] || "bg-secondary text-secondary-foreground"}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(record.status === 'pending' || record.status === 'overdue') && (
                                <DropdownMenuItem
                                  onClick={() => markAsPaid(record.id, record.amount_due)}
                                >
                                  Mark as Paid
                                </DropdownMenuItem>
                              )}
                              {record.status === 'overdue' && (
                                <DropdownMenuItem>Send Notice</DropdownMenuItem>
                              )}
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Record</DropdownMenuItem>
                              {record.tenants.phone && (
                                <DropdownMenuItem
                                  onClick={() => window.open(`tel:${record.tenants.phone}`)}
                                >
                                  Call Tenant
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  );
};