import { useState } from "react";
import { ChevronDown, Mail, Phone, MapPin, DollarSign, Calendar, FileText, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

interface TenantCardListProps {
  tenants: Tenant[];
  onViewDetails: (tenant: Tenant) => void;
  getLeaseStatus: (tenant: Tenant) => { status: string; variant: "default" | "secondary" | "destructive" };
}

export const TenantCardList = ({ tenants, onViewDetails, getLeaseStatus }: TenantCardListProps) => {
  const { toast } = useToast();
  const [openCards, setOpenCards] = useState<Set<string>>(new Set());

  const toggleCard = (tenantId: string) => {
    const newOpenCards = new Set(openCards);
    if (newOpenCards.has(tenantId)) {
      newOpenCards.delete(tenantId);
    } else {
      newOpenCards.add(tenantId);
    }
    setOpenCards(newOpenCards);
  };

  if (tenants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tenants match your search criteria.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tenants.map((tenant) => {
        const leaseStatus = getLeaseStatus(tenant);
        const isOpen = openCards.has(tenant.id);

        return (
          <li key={tenant.id} className="bg-card border rounded-lg shadow-sm">
            <Collapsible open={isOpen} onOpenChange={() => toggleCard(tenant.id)}>
              <CollapsibleTrigger asChild>
                <div className="flex items-start justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{tenant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tenant.unit_number ? `Unit ${tenant.unit_number}` : tenant.property_address}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {tenant.email && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">{tenant.email}</span>
                            </div>
                          )}
                          {tenant.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{tenant.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={leaseStatus.variant} className="text-xs">
                          {leaseStatus.status}
                        </Badge>
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
                    {/* Property Information */}
                    <div className="space-y-1">
                      <dt className="font-medium text-muted-foreground">Property</dt>
                      <dd className="flex items-start gap-1">
                        <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span>{tenant.property_address}</span>
                      </dd>
                    </div>

                    {/* Financial Information */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <dt className="font-medium text-muted-foreground">Monthly Rent</dt>
                        <dd className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          ${tenant.rent_amount.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-muted-foreground">Due Date</dt>
                        <dd className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {tenant.rent_due_date}{tenant.rent_due_date === 1 ? 'st' : tenant.rent_due_date === 2 ? 'nd' : tenant.rent_due_date === 3 ? 'rd' : 'th'}
                        </dd>
                      </div>
                    </div>

                    {/* Security Deposit */}
                    {tenant.security_deposit && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Security Deposit</dt>
                        <dd className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          ${tenant.security_deposit.toLocaleString()}
                        </dd>
                      </div>
                    )}

                    {/* Lease Dates */}
                    {(tenant.lease_start_date || tenant.lease_end_date) && (
                      <div className="grid grid-cols-2 gap-3">
                        {tenant.lease_start_date && (
                          <div>
                            <dt className="font-medium text-muted-foreground">Lease Start</dt>
                            <dd className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {format(new Date(tenant.lease_start_date), 'MMM d, yyyy')}
                            </dd>
                          </div>
                        )}
                        {tenant.lease_end_date && (
                          <div>
                            <dt className="font-medium text-muted-foreground">Lease End</dt>
                            <dd className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {format(new Date(tenant.lease_end_date), 'MMM d, yyyy')}
                            </dd>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {tenant.notes && (
                      <div>
                        <dt className="font-medium text-muted-foreground">Notes</dt>
                        <dd className="flex items-start gap-1">
                          <FileText className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs">{tenant.notes}</span>
                        </dd>
                      </div>
                    )}
                  </dl>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(tenant);
                      }}
                      className="text-xs h-8"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(tenant);
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          toast({ title: "Coming Soon", description: "Edit functionality will be available soon." });
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Tenant
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          toast({ title: "Coming Soon", description: "Delete functionality will be available soon." });
                        }}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Tenant
                        </DropdownMenuItem>
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