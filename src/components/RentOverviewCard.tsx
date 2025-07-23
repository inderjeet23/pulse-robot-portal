import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Calendar, Send, Receipt, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface RentRecord {
  id: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: string;
  tenants: {
    name: string;
    property_address: string;
    unit_number?: string;
  };
  payment_method?: string;
}

const statusColors = {
  paid: 'bg-success text-success-foreground',
  overdue: 'bg-error text-error-foreground',
  pending: 'bg-warning text-warning-foreground'
};

export function RentOverviewCard() {
  const { propertyManager } = useAuth();
  const [rentRecords, setRentRecords] = useState<RentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRentRecords = async () => {
      if (!propertyManager?.id) return;

      try {
        const { data } = await supabase
          .from("rent_records")
          .select(`
            id,
            amount_due,
            amount_paid,
            due_date,
            status,
            payment_method,
            tenants!inner (name, property_address, unit_number)
          `)
          .eq("property_manager_id", propertyManager.id)
          .order("due_date", { ascending: false })
          .limit(5);

        setRentRecords(data || []);
      } catch (error) {
        console.error("Error fetching rent records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRentRecords();
  }, [propertyManager?.id]);

  const getPaymentIcon = (method?: string) => {
    switch (method) {
      case 'card':
        return '💳';
      case 'bank':
        return '🏦';
      case 'cash':
        return '💵';
      default:
        return '💰';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysUntilDue = (dueDateString: string) => {
    const today = new Date();
    const dueDate = new Date(dueDateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-heading">
            <DollarSign className="w-5 h-5" />
            Rent Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-heading">
          <DollarSign className="w-5 h-5 text-primary" />
          Rent Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rentRecords.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">No rent records yet</p>
            <Button variant="outline" size="sm">
              Add First Record
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {rentRecords.map((record) => (
                <div
                  key={record.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 cursor-pointer",
                    record.status === 'overdue' && "bg-error/5 border-error/20"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {record.tenants.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {record.tenants.property_address}
                        {record.tenants.unit_number && ` • Unit ${record.tenants.unit_number}`}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs ml-2", statusColors[record.status as keyof typeof statusColors])}
                    >
                      {record.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-lg font-semibold">
                        ${record.amount_due.toLocaleString()}
                      </div>
                      {record.payment_method && (
                        <span className="text-sm">
                          {getPaymentIcon(record.payment_method)}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground text-right">
                      <div>{formatDate(record.due_date)}</div>
                      <div className={cn(
                        "font-medium",
                        record.status === 'overdue' && "text-error"
                      )}>
                        {getDaysUntilDue(record.due_date)}
                      </div>
                    </div>
                  </div>
                  
                  {record.status !== 'paid' && (
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Send className="w-3 h-3 mr-1" />
                        Send Reminder
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Receipt className="w-3 h-3 mr-1" />
                        Record Payment
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full" size="sm">
              View All Records
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}