import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Wrench, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceRequest {
  id: string;
  tenant_name: string;
  tenant_email: string | null;
  tenant_phone: string | null;
  property_address: string;
  unit_number: string | null;
  request_type: string;
  priority: string;
  status: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  assigned_to: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  notes: string | null;
}

const priorityColors: Record<string, string> = {
  Low: "bg-secondary text-secondary-foreground",
  Medium: "bg-primary/20 text-primary",
  High: "bg-destructive/20 text-destructive",
  Urgent: "bg-destructive text-destructive-foreground"
};

const statusIcons: Record<string, any> = {
  New: AlertCircle,
  "In Progress": Clock,
  Completed: CheckCircle,
  Cancelled: AlertCircle
};

export const RequestsOverview = () => {
  const { propertyManager } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchRequests = async () => {
    if (!propertyManager?.id) return;

    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('property_manager_id', propertyManager.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load maintenance requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [propertyManager?.id]);

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      await fetchRequests();
      toast({
        title: "Success",
        description: `Request status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive"
      });
    }
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab === "all") return true;
    return request.status.toLowerCase().replace(" ", "-") === activeTab;
  });

  const stats = {
    total: requests.length,
    new: requests.filter(r => r.status === 'New').length,
    inProgress: requests.filter(r => r.status === 'In Progress').length,
    completed: requests.filter(r => r.status === 'Completed').length
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Requests
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
              <Wrench className="h-5 w-5" />
              Maintenance Requests
            </CardTitle>
            <CardDescription>
              Track and manage property maintenance requests
            </CardDescription>
          </div>
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{stats.new}</div>
            <div className="text-sm text-muted-foreground">New</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No requests found for this status.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => {
                  const StatusIcon = statusIcons[request.status];
                  return (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <h3 className="font-medium">{request.title}</h3>
                          <Badge className={priorityColors[request.priority] || "bg-secondary text-secondary-foreground"}>
                            {request.priority}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          {request.status === 'New' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateRequestStatus(request.id, 'In Progress')}
                            >
                              Start
                            </Button>
                          )}
                          {request.status === 'In Progress' && (
                            <Button
                              size="sm"
                              onClick={() => updateRequestStatus(request.id, 'Completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-2">
                        <div>
                          <strong>Tenant:</strong> {request.tenant_name}
                        </div>
                        <div>
                          <strong>Property:</strong> {request.property_address}
                          {request.unit_number && ` - Unit ${request.unit_number}`}
                        </div>
                        <div>
                          <strong>Type:</strong> {request.request_type}
                        </div>
                        <div>
                          <strong>Created:</strong> {format(new Date(request.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {request.description}
                      </p>

                      {request.assigned_to && (
                        <div className="text-sm">
                          <strong>Assigned to:</strong> {request.assigned_to}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};