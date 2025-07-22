import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Wrench, Clock, CheckCircle, AlertCircle, Plus, Phone, MoreHorizontal } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NewMaintenanceRequestDialog } from "./NewMaintenanceRequestDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle } from "lucide-react";

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

interface RequestsOverviewProps {
  newRequestDialogOpen?: boolean;
  setNewRequestDialogOpen?: (open: boolean) => void;
}

export const RequestsOverview = ({ 
  newRequestDialogOpen: externalNewRequestDialogOpen,
  setNewRequestDialogOpen: externalSetNewRequestDialogOpen 
}: RequestsOverviewProps = {}) => {
  const { propertyManager } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [internalNewRequestDialogOpen, setInternalNewRequestDialogOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const newRequestDialogOpen = externalNewRequestDialogOpen ?? internalNewRequestDialogOpen;
  const setNewRequestDialogOpen = externalSetNewRequestDialogOpen ?? setInternalNewRequestDialogOpen;

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
          <Button 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setNewRequestDialogOpen(true)}
          >
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead className="hidden md:table-cell">Property</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Created</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => {
                      const StatusIcon = statusIcons[request.status];
                      const isOverdue = request.status === 'In Progress' && 
                        differenceInDays(new Date(), new Date(request.updated_at)) > 7;
                      
                      return (
                        <TableRow 
                          key={request.id}
                          className={isOverdue ? "bg-yellow-50 dark:bg-yellow-900/10" : ""}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-4 w-4" />
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {request.title}
                                  {isOverdue && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>This request has been in progress for {differenceInDays(new Date(), new Date(request.updated_at))} days</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground md:hidden">
                                  {request.property_address}
                                  {request.unit_number && ` - Unit ${request.unit_number}`}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.tenant_name}</div>
                              <div className="text-sm text-muted-foreground">{request.request_type}</div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="text-sm">
                              {request.property_address}
                              {request.unit_number && (
                                <div className="text-muted-foreground">Unit {request.unit_number}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={priorityColors[request.priority] || "bg-secondary text-secondary-foreground"}>
                              {request.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {format(new Date(request.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {/* Mobile quick call button */}
                              {request.tenant_phone && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 md:hidden"
                                  onClick={() => window.open(`tel:${request.tenant_phone}`)}
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {request.status === 'New' && (
                                    <DropdownMenuItem
                                      onClick={() => updateRequestStatus(request.id, 'In Progress')}
                                    >
                                      Start Work
                                    </DropdownMenuItem>
                                  )}
                                  {request.status === 'In Progress' && (
                                    <DropdownMenuItem
                                      onClick={() => updateRequestStatus(request.id, 'Completed')}
                                    >
                                      Mark Complete
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Update Status</DropdownMenuItem>
                                  {request.tenant_phone && (
                                    <DropdownMenuItem
                                      onClick={() => window.open(`tel:${request.tenant_phone}`)}
                                    >
                                      Call Tenant
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
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
      
      <NewMaintenanceRequestDialog
        open={newRequestDialogOpen}
        onOpenChange={setNewRequestDialogOpen}
        onSuccess={fetchRequests}
      />
    </Card>
  );
};