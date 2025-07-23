import { useState } from "react";
import { ChevronDown, DollarSign, Calendar, Mail, Phone, MapPin, Receipt, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

interface RentCardListProps {
  records: RentRecord[];
  selectedRecords: Set<string>;
  onSelectRecord: (recordId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onMarkAsPaid: (recordId: string, amountDue: number) => void;
  onComingSoon: (feature: string) => void;
  statusColors: Record<string, string>;
}

export const RentCardList = ({ 
  records, 
  selectedRecords, 
  onSelectRecord, 
  onSelectAll, 
  onMarkAsPaid, 
  onComingSoon,
  statusColors 
}: RentCardListProps) => {
  const [openCards, setOpenCards] = useState<Set<string>>(new Set());

  const toggleCard = (recordId: string) => {
    const newOpenCards = new Set(openCards);
    if (newOpenCards.has(recordId)) {
      newOpenCards.delete(recordId);
    } else {
      newOpenCards.add(recordId);
    }
    setOpenCards(newOpenCards);
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No rent records found for this status.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Select All Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-muted/20">
        <Checkbox 
          checked={selectedRecords.size === records.length && records.length > 0} 
          onCheckedChange={onSelectAll} 
          aria-label="Select all" 
        />
        <span className="text-sm font-medium">
          {selectedRecords.size > 0 ? `${selectedRecords.size} selected` : 'Select all'}
        </span>
      </div>

      <ul className="space-y-3">
        {records.map((record) => {
          const isOpen = openCards.has(record.id);
          const isSelected = selectedRecords.has(record.id);

          return (
            <li key={record.id} className={cn(
              "bg-card border rounded-lg shadow-sm",
              isSelected && "ring-2 ring-primary/50"
            )}>
              <Collapsible open={isOpen} onOpenChange={() => toggleCard(record.id)}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        onSelectRecord(record.id, checked as boolean);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${record.tenants.name}`}
                      className="mt-0.5"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium text-sm">{record.tenants.name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {record.tenants.property_address}
                            {record.tenants.unit_number && ` - Unit ${record.tenants.unit_number}`}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm font-medium">${record.amount_due.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">
                              Due {format(new Date(record.due_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={statusColors[record.status] || "bg-secondary text-secondary-foreground"}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
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
                      {/* Contact Information */}
                      {(record.tenants.email || record.tenants.phone) && (
                        <div className="space-y-1">
                          <dt className="font-medium text-muted-foreground">Contact</dt>
                          <dd className="space-y-1">
                            {record.tenants.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="truncate">{record.tenants.email}</span>
                              </div>
                            )}
                            {record.tenants.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{record.tenants.phone}</span>
                              </div>
                            )}
                          </dd>
                        </div>
                      )}

                      {/* Payment Details */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <dt className="font-medium text-muted-foreground">Amount Due</dt>
                          <dd className="font-medium">${record.amount_due.toLocaleString()}</dd>
                        </div>
                        {record.late_fees > 0 && (
                          <div>
                            <dt className="font-medium text-muted-foreground">Late Fees</dt>
                            <dd className="text-destructive">+${record.late_fees.toLocaleString()}</dd>
                          </div>
                        )}
                      </div>

                      {/* Payment Information */}
                      {record.paid_date && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <dt className="font-medium text-muted-foreground">Paid Date</dt>
                            <dd className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {format(new Date(record.paid_date), 'MMM d, yyyy')}
                            </dd>
                          </div>
                          {record.payment_method && (
                            <div>
                              <dt className="font-medium text-muted-foreground">Payment Method</dt>
                              <dd className="flex items-center gap-1">
                                <Receipt className="h-3 w-3 text-muted-foreground" />
                                {record.payment_method.replace('_', ' ').toUpperCase()}
                              </dd>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {record.notes && (
                        <div>
                          <dt className="font-medium text-muted-foreground">Notes</dt>
                          <dd className="text-xs">{record.notes}</dd>
                        </div>
                      )}
                    </dl>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      {(record.status === 'pending' || record.status === 'overdue') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsPaid(record.id, record.amount_due);
                          }}
                          className="text-xs h-8"
                        >
                          Mark as Paid
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-auto">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(record.status === 'pending' || record.status === 'overdue') && (
                            <DropdownMenuItem onClick={() => onMarkAsPaid(record.id, record.amount_due)}>
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          {record.status === 'overdue' && (
                            <DropdownMenuItem onClick={() => onComingSoon("Legal notices")}>
                              Send Notice
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onComingSoon("Rent record details")}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onComingSoon("Edit rent records")}>
                            Edit Record
                          </DropdownMenuItem>
                          {record.tenants.phone && (
                            <DropdownMenuItem onClick={() => window.open(`tel:${record.tenants.phone}`)}>
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
    </div>
  );
};