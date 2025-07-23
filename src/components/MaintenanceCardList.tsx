import { useState } from "react";
import { ChevronDown, Wrench, Calendar, Phone, MapPin, AlertTriangle, MoreHorizontal, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

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

interface MaintenanceCardListProps {
  requests: MaintenanceRequest[];
  onUpdateStatus: (requestId: string, newStatus: string) => void;
}

const statusIcons: Record<string, any> = {
  New: AlertCircle,
  "In Progress": Clock,
  Completed: CheckCircle,
  Cancelled: AlertCircle
};

export const MaintenanceCardList = ({ requests, onUpdateStatus }: MaintenanceCardListProps) => {
  const [openCards, setOpenCards] = useState<Set<string>>(new Set());

  const toggleCard = (requestId: string) => {
    const newOpenCards = new Set(openCards);
    if (newOpenCards.has(requestId)) {
      newOpenCards.delete(requestId);
    } else {
      newOpenCards.add(requestId);
    }
    setOpenCards(newOpenCards);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-red-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Completed': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No requests found for this status.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {requests.map((request) => {
        const isOpen = openCards.has(request.id);
        const isOverdue = request.status === 'In Progress' && 
          differenceInDays(new Date(), new Date(request.updated_at)) > 7;

        return (
          <li key={request.id} className={cn(
            "bg-card border rounded-lg shadow-sm",
            isOverdue && "border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10"
          )}>
            <Collapsible open={isOpen} onOpenChange={() => toggleCard(request.id)}>
              <CollapsibleTrigger asChild>
                <div className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="p-1 rounded-md bg-primary/10 mt-0.5">
                    <Wrench className="h-3 w-3 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{request.title}</p>
                          {isOverdue && (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>In progress for {differenceInDays(new Date(), new Date(request.updated_at))} days</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className={cn("w-1.5 h-1.5 rounded-full", getPriorityColor(request.priority))}></span>
                          <span>{request.request_type}</span>
                          <span>•</span>
                          <span>{request.priority}</span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {request.tenant_name} • {request.property_address}
                          {request.unit_number && ` - Unit ${request.unit_number}`}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <span className={cn("w-2 h-2 rounded-full", getStatusColor(request.status))}></span>
                          <span className="text-xs">{request.status}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                            isOpen && "rotate-180"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="px-3 pb-3">
                <div className="border-t pt-3 space-y-3">
                  <dl className="text-xs space-y-2">
                    {/* Description */}
                    <div>
                      <dt className="font-medium text-muted-foreground">Description</dt>
                      <dd className="text-xs mt-1">{request.description}</dd>
                    </div>

                    {/* Tenant Contact */}
                    {(request.tenant_email || request.tenant_phone) && (
                      <div className="space-y-1">
                        <dt className="font-medium text-muted-foreground">Tenant Contact</dt>
                        <dd className="space-y-1">
                          {request.tenant_email && (
                            <div className="text-xs">{request.tenant_email}</div>
                          )}
                          {request.tenant_phone && (
                            <div className="text-xs">{request.tenant_phone}</div>
                          )}
                        </dd>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <dt className="font-medium text-muted-foreground">Created</dt>
                        <dd className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(request.created_at), 'MMM d, yyyy')}
                        </dd>
                      </div>
                      {request.completed_at && (
                        <div>
                          <dt className="font-medium text-muted-foreground">Completed</dt>
                          <dd className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(request.completed_at), 'MMM d, yyyy')}
                          </dd>
                        </div>
                      )}
                    </div>

                    {/* Cost Information */}
                    {(request.estimated_cost || request.actual_cost) && (
                      <div className="grid grid-cols-2 gap-3">
                        {request.estimated_cost && (
                          <div>
                            <dt className="font-medium text-muted-foreground">Estimated Cost</dt>
                            <dd>${request.estimated_cost.toLocaleString()}</dd>
                          </div>
                        )}
                        {request.actual_cost && (
                          <div>
                            <dt className="font-medium text-muted-foreground">Actual Cost</dt>
                            <dd>${request.actual_cost.toLocaleString()}</dd>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Assigned To */}
                    {request.assigned_to && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Assigned To</dt>
                        <dd className="text-xs">{request.assigned_to}</dd>
                      </div>
                    )}

                    {/* Notes */}
                    {request.notes && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Notes</dt>
                        <dd className="text-xs">{request.notes}</dd>
                      </div>
                    )}
                  </dl>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex gap-2">
                      {request.status === 'New' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(request.id, 'In Progress');
                          }}
                          className="text-xs h-8"
                        >
                          Start Work
                        </Button>
                      )}
                      {request.status === 'In Progress' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(request.id, 'Completed');
                          }}
                          className="text-xs h-8"
                        >
                          Mark Complete
                        </Button>
                      )}
                      {request.tenant_phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${request.tenant_phone}`);
                          }}
                          className="text-xs h-8"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {request.status === 'New' && (
                          <DropdownMenuItem
                            onClick={() => onUpdateStatus(request.id, 'In Progress')}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Start Work
                          </DropdownMenuItem>
                        )}
                        {request.status === 'In Progress' && (
                          <DropdownMenuItem
                            onClick={() => onUpdateStatus(request.id, 'Completed')}
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
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </li>
        );
      })}
    </ul>
  );
};