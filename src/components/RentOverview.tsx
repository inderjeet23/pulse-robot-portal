import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, Calendar, AlertTriangle, Plus, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

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

  useEffect(() => {
    fetchRentRecords();
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

  const filteredRecords = rentRecords.filter(record => {
    if (activeTab === "all") return true;
    return record.status === activeTab;
  });

  const stats = {
    total: rentRecords.length,
    pending: rentRecords.filter(r => r.status === 'pending').length,
    overdue: rentRecords.filter(r => r.status === 'overdue').length,
    paid: rentRecords.filter(r => r.status === 'paid').length,
    totalCollected: rentRecords
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + r.amount_paid, 0)
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Rent Overview
            </CardTitle>
            <CardDescription>
              Track and manage tenant rent payments
            </CardDescription>
          </div>
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Tenant
          </Button>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{stats.paid}</div>
            <div className="text-sm text-muted-foreground">Paid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">${stats.totalCollected.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Collected</div>
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
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <h3 className="font-medium">{record.tenants.name}</h3>
                        <Badge className={statusColors[record.status] || "bg-secondary text-secondary-foreground"}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {record.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => markAsPaid(record.id, record.amount_due)}
                          >
                            Mark Paid
                          </Button>
                        )}
                        {record.status === 'overdue' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive"
                            >
                              Send Notice
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => markAsPaid(record.id, record.amount_due)}
                            >
                              Mark Paid
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-2">
                      <div>
                        <strong>Amount Due:</strong> ${record.amount_due.toLocaleString()}
                      </div>
                      <div>
                        <strong>Due Date:</strong> {format(new Date(record.due_date), 'MMM d, yyyy')}
                      </div>
                      <div>
                        <strong>Property:</strong> {record.tenants.property_address}
                        {record.tenants.unit_number && ` - Unit ${record.tenants.unit_number}`}
                      </div>
                      <div>
                        <strong>Amount Paid:</strong> ${record.amount_paid.toLocaleString()}
                      </div>
                    </div>

                    {record.late_fees > 0 && (
                      <div className="text-sm text-destructive">
                        <strong>Late Fees:</strong> ${record.late_fees.toLocaleString()}
                      </div>
                    )}

                    {record.paid_date && (
                      <div className="text-sm text-accent">
                        <strong>Paid Date:</strong> {format(new Date(record.paid_date), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};