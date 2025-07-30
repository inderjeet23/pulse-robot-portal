import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench, Clock, User, ArrowRight, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MaintenanceRequest {
  id: string;
  title: string;
  tenant_name: string;
  priority: string;
  status: string;
  created_at: string;
  property_address: string;
  unit_number?: string;
  assigned_to?: string;
}

const priorityColors = {
  High: 'bg-error text-error-foreground',
  Medium: 'bg-warning text-warning-foreground',
  Low: 'bg-success text-success-foreground'
};

export function RecentMaintenance() {
  const { propertyManager } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!propertyManager?.id) return;

      try {
        const { data } = await supabase
          .from("maintenance_requests")
          .select("*")
          .eq("property_manager_id", propertyManager.id)
          .order("created_at", { ascending: false })
          .limit(5);

        setRequests(data || []);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [propertyManager?.id]);

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const isUrgent = (request: MaintenanceRequest) => {
    const hoursOld = (new Date().getTime() - new Date(request.created_at).getTime()) / (1000 * 60 * 60);
    return request.priority === 'High' || (request.status === 'In Progress' && hoursOld > 168); // 7 days
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-heading">
            <Wrench className="w-5 h-5" />
            Recent Maintenance
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
          <Wrench className="w-5 h-5 text-primary" />
          Recent Maintenance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">No maintenance requests yet</p>
            <Button variant="outline" size="sm">
              Create First Request
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 cursor-pointer",
                    isUrgent(request) && "bg-error/5 border-error/20"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{request.title}</h4>
                      {isUrgent(request) && (
                        <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />
                      )}
                    </div>
                    <Badge variant="outline" className={cn("text-xs", priorityColors[request.priority as keyof typeof priorityColors])}>
                      {request.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{request.tenant_name}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{getTimeSince(request.created_at)}</span>
                    </div>
                    
                    {request.assigned_to && (
                      <div className="flex items-center gap-1">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-xs">
                            {request.assigned_to.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {request.property_address}
                    {request.unit_number && ` • Unit ${request.unit_number}`}
                  </div>
                </div>
              ))}
            </div>
            
            {requests.length > 5 && (
              <Button variant="outline" className="w-full" size="sm" onClick={() => navigate("/maintenance")}>
                View All Requests
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}