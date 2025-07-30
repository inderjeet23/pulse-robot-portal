import { useEffect, useState, useCallback } from "react";
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
import { MaintenanceCardList } from "@/components/MaintenanceCardList";
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

import { LucideIcon } from "lucide-react";
const statusIcons: Record<string, LucideIcon> = {
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

  const fetchRequests = useCallback(async () => {
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
  }, [propertyManager?.id, toast]);

  useEffect(() => {
    fetchRequests();
  }, [propertyManager?.id, fetchRequests]);

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
            <CardTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              Maintenance Requests
            </CardTitle>
            <CardDescription className="mt-1">
              Track and manage all property requests
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-button"
            onClick={() => setNewRequestDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
        
        {/* Simplified Stats */}
        <div className="flex gap-6 mt-6 p-4 bg-muted/20 rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{stats.new}</div>
            <div className="text-sm text-muted-foreground">New</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Done</div>
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
              <>
                {/* Desktop Table - Hidden on mobile */}
                <div className="hidden sm:block rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b">
                        <TableHead className="font-medium">Request</TableHead>
                        <TableHead className="font-medium">Tenant</TableHead>
                        <TableHead className="hidden md:table-cell font-medium">Property</TableHead>
                        <TableHead className="font-medium">Status</TableHead>
                        <TableHead className="hidden lg:table-cell font-medium">Date</TableHead>
                        <TableHead className="w-20"></TableHead>
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
                            className={`hover:bg-muted/50 transition-colors ${isOverdue ? "bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-l-yellow-500" : ""}`}
                          >
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium flex items-center gap-2">
                                  {request.title}
                                  {isOverdue && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>In progress for {differenceInDays(new Date(), new Date(request.updated_at))} days</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    request.priority === 'Urgent' ? 'bg-red-500' :
                                    request.priority === 'High' ? 'bg-orange-500' :
                                    request.priority === 'Medium' ? 'bg-blue-500' : 'bg-gray-400'
                                  }`}></span>
                                  {request.request_type} • {request.priority}
                                </div>
                                <div className="text-xs text-muted-foreground md:hidden">
                                  {request.property_address}
                                  {request.unit_number && ` - Unit ${request.unit_number}`}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{request.tenant_name}</div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="text-sm space-y-1">
                                <div>{request.property_address}</div>
                                {request.unit_number && (
                                  <div className="text-muted-foreground text-xs">Unit {request.unit_number}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  request.status === 'New' ? 'bg-red-500' :
                                  request.status === 'In Progress' ? 'bg-blue-500' :
                                  request.status === 'Completed' ? 'bg-green-500' : 'bg-gray-400'
                                }`}></span>
                                <span className="text-sm">{request.status}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                              {format(new Date(request.created_at), 'MMM d')}
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
                                  {request.status === 'New' && (
                                    <DropdownMenuItem
                                      onClick={() => updateRequestStatus(request.id, 'In Progress')}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      Start Work
                                    </DropdownMenuItem>
                                  )}
                                  {request.status === 'In Progress' && (
                                    <DropdownMenuItem
                                      onClick={() => updateRequestStatus(request.id, 'Completed')}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      Mark Complete
                                    </DropdownMenuItem>
                                  )}
                                  {request.tenant_phone && (
                                    <DropdownMenuItem
                                      onClick={() => window.open(`tel:${request.tenant_phone}`)}
                                    >
                                      <Phone className="h-4 w-4 mr-2" />
                                      Call Tenant
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

                {/* Mobile Card List - Visible only on mobile */}
                <div className="block sm:hidden">
                  <MaintenanceCardList 
                    requests={filteredRequests}
                    onUpdateStatus={updateRequestStatus}
                  />
                </div>
              </>
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