import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, Calendar, AlertTriangle, Plus, TrendingUp, MoreHorizontal, Receipt, Mail, Scale, Phone, Clock } from "lucide-react";
import { format, differenceInDays, isAfter, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PayOrQuitNotice } from "@/components/PayOrQuitNotice";
import { useNavigate } from "react-router-dom";

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
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    property_address: string;
    unit_number: string | null;
    rent_amount: number;
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
  rent_due_date: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  partial: "bg-primary/20 text-primary",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  overdue: "bg-destructive/20 text-destructive"
};

import { LucideIcon } from "lucide-react";
const statusIcons: Record<string, LucideIcon> = {
  pending: Clock,
  partial: AlertTriangle,
  paid: TrendingUp,
  overdue: AlertTriangle
};

export const EnhancedRentOverview = ({ rentFilter }: { rentFilter: string | null }) => {
  const { propertyManager } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [rentRecords, setRentRecords] = useState<RentRecord[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<RentRecord | null>(null);
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
            id,
            name,
            email,
            phone,
            property_address,
            unit_number,
            rent_amount
          )
        `)
        .eq('property_manager_id', propertyManager.id)
        .order('due_date', { ascending: false });

      if (error) throw error;
      
      // Create overdue records for tenants who haven't paid this month
      const enrichedRecords = await createMissingOverdueRecords(data || []);
      setRentRecords(enrichedRecords);
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
        .select('id, name, email, phone, property_address, unit_number, rent_amount, rent_due_date')
        .eq('property_manager_id', propertyManager.id)
        .order('name');

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const createMissingOverdueRecords = async (existingRecords: RentRecord[]) => {
    if (!propertyManager?.id) return existingRecords;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get all tenants
    const { data: allTenants } = await supabase
      .from('tenants')
      .select('*')
      .eq('property_manager_id', propertyManager.id);

    if (!allTenants) return existingRecords;

    const newRecords = [...existingRecords];

    for (const tenant of allTenants) {
      // Check if tenant has a record for this month
      const hasCurrentMonthRecord = existingRecords.some(record => {
        const recordDate = new Date(record.due_date);
        return record.tenant_id === tenant.id &&
               recordDate.getMonth() === currentMonth &&
               recordDate.getFullYear() === currentYear;
      });

      if (!hasCurrentMonthRecord) {
        // Create due date for this month
        const dueDate = new Date(currentYear, currentMonth, tenant.rent_due_date);
        
        // Only create overdue record if due date has passed
        if (isAfter(currentDate, dueDate)) {
          const overdueRecord: RentRecord = {
            id: `temp-${tenant.id}-${currentYear}-${currentMonth}`,
            tenant_id: tenant.id,
            due_date: dueDate.toISOString().split('T')[0],
            amount_due: tenant.rent_amount,
            amount_paid: 0,
            status: 'overdue',
            paid_date: null,
            late_fees: 0,
            payment_method: null,
            notes: null,
            tenants: {
              id: tenant.id,
              name: tenant.name,
              email: tenant.email,
              phone: tenant.phone,
              property_address: tenant.property_address,
              unit_number: tenant.unit_number,
              rent_amount: tenant.rent_amount
            }
          };
          newRecords.push(overdueRecord);
        }
      }
    }

    return newRecords;
  };

  useEffect(() => {
    fetchTenants();
    fetchRentRecords();
  }, [propertyManager?.id, fetchTenants, fetchRentRecords]);

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
      const paymentAmount = parseFloat(paymentFormData.amount);
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
        description: "Payment logged successfully"
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

  const handleSendLegalNotice = (record: RentRecord) => {
    setSelectedRecord(record);
    // Create a tenant object that matches the Tenant interface
    const tenantForNotice: Tenant = {
      ...record.tenants,
      rent_due_date: 1 // Default to 1st of month since this field isn't in the record
    };
    setSelectedTenant(tenantForNotice);
    setIsNoticeDialogOpen(true);
  };

  const getOverdueDays = (dueDate: string) => {
    return differenceInDays(new Date(), parseISO(dueDate));
  };

  const filteredTenants = rentRecords.filter(record => {
    if (rentFilter === 'overdue') {
      return record.status === 'overdue';
    }
    return true;
  });

  const filteredRecords = filteredTenants.filter(record => {
    if (activeTab === "all") return true;
    return record.status === activeTab;
  });

  // Calculate enhanced stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthRecords = rentRecords.filter(record => {
    const recordDate = new Date(record.due_date);
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  });

  const stats = {
    total: rentRecords.length,
    pending: rentRecords.filter(r => r.status === 'pending').length,
    overdue: rentRecords.filter(r => r.status === 'overdue').length,
    paid: rentRecords.filter(r => r.status === 'paid').length,
    totalDueThisMonth: thisMonthRecords.reduce((sum, r) => sum + r.amount_due, 0),
    totalCollectedThisMonth: thisMonthRecords.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount_paid, 0),
    totalOverdueAmount: rentRecords.filter(r => r.status === 'overdue').reduce((sum, r) => sum + (r.amount_due - r.amount_paid), 0)
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Rent Management
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
            <CardTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              Rent Management
            </CardTitle>
            <CardDescription className="mt-1">
              Track rent payments, overdue accounts, and send notices
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {rentFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()} // Simple way to clear filter for now
              >
                Clear Filter
              </Button>
            )}
            {filteredRecords.length > 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/tenants")}
              >
                View All
              </Button>
            )}
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-button"
              onClick={() => setIsPaymentDialogOpen(true)}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Log Payment
            </Button>
          </div>
        </div>
        
        {/* Enhanced Stats */}
        <div className="flex gap-6 mt-6 p-4 bg-muted/20 rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            <div className="text-sm text-muted-foreground">Paid</div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-background rounded-lg border">
            <div className="text-sm text-muted-foreground">Due This Month</div>
            <div className="text-lg font-bold">${stats.totalDueThisMonth.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-background rounded-lg border">
            <div className="text-sm text-muted-foreground">Collected This Month</div>
            <div className="text-lg font-bold text-green-600">${stats.totalCollectedThisMonth.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-background rounded-lg border">
            <div className="text-sm text-muted-foreground">Total Overdue</div>
            <div className="text-lg font-bold text-destructive">${stats.totalOverdueAmount.toLocaleString()}</div>
          </div>
        </div>
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
                    <TableRow className="border-b">
                      <TableHead className="font-medium">Tenant</TableHead>
                      <TableHead className="font-medium">Property</TableHead>
                      <TableHead className="font-medium">Amount</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Due Date</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => {
                      const StatusIcon = statusIcons[record.status];
                      const isOverdue = record.status === 'overdue';
                      const overdueDays = isOverdue ? getOverdueDays(record.due_date) : 0;
                      
                      return (
                        <TableRow 
                          key={record.id}
                          className={`hover:bg-muted/50 transition-colors ${
                            isOverdue ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-l-red-500" : ""
                          }`}
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium flex items-center gap-2">
                                {record.tenants.name}
                                {isOverdue && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Overdue by {overdueDays} days</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                              {record.tenants.email && (
                                <div className="text-xs text-muted-foreground">{record.tenants.email}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div>{record.tenants.property_address}</div>
                              {record.tenants.unit_number && (
                                <div className="text-muted-foreground text-xs">Unit {record.tenants.unit_number}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">${record.amount_due.toFixed(2)}</div>
                              {record.amount_paid > 0 && record.amount_paid < record.amount_due && (
                                <div className="text-xs text-muted-foreground">
                                  Paid: ${record.amount_paid.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                record.status === 'pending' ? 'bg-yellow-500' :
                                record.status === 'overdue' ? 'bg-red-500' :
                                record.status === 'paid' ? 'bg-green-500' : 'bg-gray-400'
                              }`}></span>
                              <span className="text-sm capitalize">{record.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(record.due_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 hover:bg-muted"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                {(record.status === 'overdue' || record.status === 'pending') && (
                                  <DropdownMenuItem
                                    onClick={() => handleSendLegalNotice(record)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Scale className="h-4 w-4 mr-2" />
                                    Send Legal Notice
                                  </DropdownMenuItem>
                                )}
                                {record.tenants.phone && (
                                  <DropdownMenuItem
                                    onClick={() => window.open(`tel:${record.tenants.phone}`)}
                                  >
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call Tenant
                                  </DropdownMenuItem>
                                )}
                                {record.tenants.email && (
                                  <DropdownMenuItem
                                    onClick={() => window.open(`mailto:${record.tenants.email}`)}
                                  >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Offline Payment</DialogTitle>
            <DialogDescription>
              Record a payment received via cash, check, or other offline method
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tenant">Tenant *</Label>
              <Select value={paymentFormData.tenant_id} onValueChange={value => setPaymentFormData({
                ...paymentFormData,
                tenant_id: value
              })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map(tenant => (
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
                  onChange={e => setPaymentFormData({
                    ...paymentFormData,
                    amount: e.target.value
                  })} 
                />
              </div>
              <div>
                <Label htmlFor="payment_date">Payment Date *</Label>
                <Input 
                  id="payment_date" 
                  type="date" 
                  value={paymentFormData.payment_date}
                  onChange={e => setPaymentFormData({
                    ...paymentFormData,
                    payment_date: e.target.value
                  })} 
                />
              </div>
            </div>
            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select value={paymentFormData.payment_method} onValueChange={value => setPaymentFormData({
                ...paymentFormData,
                payment_method: value
              })}>
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
                onChange={e => setPaymentFormData({
                  ...paymentFormData,
                  notes: e.target.value
                })}
                rows={2} 
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background">
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

      {/* Legal Notice Dialog */}
      <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Legal Notice</DialogTitle>
            <DialogDescription>
              Create a pay or quit notice for {selectedTenant?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && selectedTenant && (
            <PayOrQuitNotice
              tenantId={selectedRecord.tenant_id}
              rentRecordId={selectedRecord.id}
              amountOwed={selectedRecord.amount_due - selectedRecord.amount_paid}
              daysToQuit={3}
              onNoticeGenerated={() => {
                setIsNoticeDialogOpen(false);
                toast({
                  title: "Legal Notice Generated",
                  description: `Notice created for ${selectedTenant.name}`,
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};