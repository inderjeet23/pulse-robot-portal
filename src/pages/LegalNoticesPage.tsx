import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Plus, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { PayOrQuitNotice } from "@/components/PayOrQuitNotice";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface LegalNotice {
  id: string;
  tenant_id: string;
  rent_record_id: string;
  notice_type: string;
  state: string;
  amount_owed: number;
  days_to_pay: number;
  generated_date: string;
  served_date: string | null;
  status: string;
  tenant?: {
    name: string;
    property_address: string;
    unit_number: string | null;
  };
}

const LegalNoticesPage = () => {
  const { toast } = useToast();
  const [notices, setNotices] = useState<LegalNotice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<LegalNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedNotice, setSelectedNotice] = useState<LegalNotice | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    filterNotices();
  }, [notices, searchTerm, statusFilter]);

  const fetchNotices = async () => {
    try {
      const { data: propertyManager } = await supabase
        .from('property_managers')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!propertyManager) return;

      const { data, error } = await supabase
        .from('legal_notices')
        .select(`
          *,
          tenant:tenants(name, property_address, unit_number)
        `)
        .eq('property_manager_id', propertyManager.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      console.error('Error fetching legal notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotices = useCallback(() => {
    let filtered = notices;

    if (searchTerm) {
      filtered = filtered.filter(notice =>
        notice.tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.tenant?.property_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(notice => notice.status === statusFilter);
    }

    setFilteredNotices(filtered);
  }, [notices, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'default';
      case 'served': return 'secondary';
      case 'resolved': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'generated': return 'Generated';
      case 'served': return 'Served';
      case 'resolved': return 'Resolved';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  if (loading) {
    return <div className="p-6">Loading legal notices...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Legal Notices</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage pay or quit notices and legal documentation
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by tenant name or property..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="generated">Generated</SelectItem>
                  <SelectItem value="served">Served</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Legal Notices Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "No notices match your current filters."
                  : "You haven't generated any legal notices yet."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotices.map((notice) => (
            <Card key={notice.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {notice.tenant?.name}
                      </h3>
                      <Badge variant={getStatusColor(notice.status)}>
                        {getStatusText(notice.status)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {notice.tenant?.property_address}
                      {notice.tenant?.unit_number && `, Unit ${notice.tenant.unit_number}`}
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedNotice(notice)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Notice
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Legal Notice Details</DialogTitle>
                      </DialogHeader>
                      {selectedNotice && (
                        <PayOrQuitNotice
                          tenantId={selectedNotice.tenant_id}
                          rentRecordId={selectedNotice.rent_record_id}
                          amountOwed={selectedNotice.amount_owed}
                          daysToQuit={selectedNotice.days_to_pay}
                          onNoticeGenerated={() => {
                            fetchNotices();
                            toast({
                              title: "Notice Updated",
                              description: "Legal notice has been updated successfully.",
                            });
                          }}
                          existingNoticeId={selectedNotice.id}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Notice Type</p>
                    <p className="font-medium capitalize">
                      {notice.notice_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount Owed</p>
                    <p className="font-medium">${notice.amount_owed.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Generated Date</p>
                    <p className="font-medium">
                      {format(new Date(notice.generated_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Days to Pay</p>
                    <p className="font-medium">{notice.days_to_pay} days</p>
                  </div>
                </div>

                {notice.served_date && (
                  <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Served on:</span>{' '}
                      {format(new Date(notice.served_date), 'PPP')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LegalNoticesPage;