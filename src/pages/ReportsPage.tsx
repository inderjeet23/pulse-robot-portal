import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Calendar as CalendarIcon, DollarSign, Wrench, Users, Home, Filter, Download } from "lucide-react";
import { format } from "date-fns";
import Papa from "papaparse";
import { cn } from "@/lib/utils";

interface ReportSummary {
  totalRecords: number;
  dateRange: string;
  totalValue?: number;
}

const ReportsPage = () => {
  const { propertyManager } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date(), // Today
  });
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [properties, setProperties] = useState<Array<{ address: string; count: number }>>([]);
  const [reportSummaries, setReportSummaries] = useState<{
    rent: ReportSummary;
    maintenance: ReportSummary;
    tenants: ReportSummary;
  }>({
    rent: { totalRecords: 0, dateRange: "", totalValue: 0 },
    maintenance: { totalRecords: 0, dateRange: "", totalValue: 0 },
    tenants: { totalRecords: 0, dateRange: "" },
  });

  const downloadCSV = (data: any[], fileName: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchProperties = async () => {
    if (!propertyManager?.id) return;

    try {
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select('property_address')
        .eq('property_manager_id', propertyManager.id);

      if (error) throw error;

      const propertyGroups = tenants?.reduce((acc, tenant) => {
        acc[tenant.property_address] = (acc[tenant.property_address] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setProperties(
        Object.entries(propertyGroups).map(([address, count]) => ({ address, count }))
      );
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchReportSummaries = async () => {
    if (!propertyManager?.id) return;

    try {
      // Build property filter
      const propertyFilter = selectedProperty !== "all" 
        ? { property_address: selectedProperty }
        : {};

      // Fetch rent records summary
      let rentQuery = supabase
        .from('rent_records')
        .select('amount_due, amount_paid, late_fees, due_date')
        .eq('property_manager_id', propertyManager.id)
        .gte('due_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('due_date', format(dateRange.to, 'yyyy-MM-dd'));

      if (selectedProperty !== "all") {
        rentQuery = rentQuery.in('tenant_id', 
          (await supabase
            .from('tenants')
            .select('id')
            .eq('property_manager_id', propertyManager.id)
            .eq('property_address', selectedProperty)
          ).data?.map(t => t.id) || []
        );
      }

      const { data: rentData } = await rentQuery;

      // Fetch maintenance requests summary
      let maintenanceQuery = supabase
        .from('maintenance_requests')
        .select('estimated_cost, actual_cost, created_at, property_address')
        .eq('property_manager_id', propertyManager.id)
        .gte('created_at', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('created_at', format(dateRange.to, 'yyyy-MM-dd'));

      if (selectedProperty !== "all") {
        maintenanceQuery = maintenanceQuery.eq('property_address', selectedProperty);
      }

      const { data: maintenanceData } = await maintenanceQuery;

      // Fetch tenants summary (for tenant information report)
      let tenantsQuery = supabase
        .from('tenants')
        .select('*')
        .eq('property_manager_id', propertyManager.id);

      if (selectedProperty !== "all") {
        tenantsQuery = tenantsQuery.eq('property_address', selectedProperty);
      }

      const { data: tenantsData } = await tenantsQuery;

      // Calculate summaries
      const rentTotal = rentData?.reduce((sum, record) => 
        sum + (Number(record.amount_due) || 0) + (Number(record.late_fees) || 0), 0) || 0;

      const maintenanceTotal = maintenanceData?.reduce((sum, record) => 
        sum + (Number(record.actual_cost) || Number(record.estimated_cost) || 0), 0) || 0;

      const dateRangeStr = `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`;

      setReportSummaries({
        rent: {
          totalRecords: rentData?.length || 0,
          dateRange: dateRangeStr,
          totalValue: rentTotal,
        },
        maintenance: {
          totalRecords: maintenanceData?.length || 0,
          dateRange: dateRangeStr,
          totalValue: maintenanceTotal,
        },
        tenants: {
          totalRecords: tenantsData?.length || 0,
          dateRange: selectedProperty !== "all" ? `Property: ${selectedProperty}` : "All Properties",
        },
      });
    } catch (error) {
      console.error('Error fetching report summaries:', error);
    }
  };

  const handleExportRentData = async () => {
    if (!propertyManager?.id) return;

    setLoading(true);
    try {
      let query = supabase
        .from('rent_records')
        .select(`
          *,
          tenants!inner(name, property_address, unit_number)
        `)
        .eq('property_manager_id', propertyManager.id)
        .gte('due_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('due_date', format(dateRange.to, 'yyyy-MM-dd'));

      if (selectedProperty !== "all") {
        query = query.eq('tenants.property_address', selectedProperty);
      }

      const { data, error } = await query;
      if (error) throw error;

      const csvData = data?.map(record => ({
        'Tenant Name': record.tenants.name,
        'Property Address': record.tenants.property_address,
        'Unit Number': record.tenants.unit_number || 'N/A',
        'Due Date': format(new Date(record.due_date), 'yyyy-MM-dd'),
        'Amount Due': record.amount_due,
        'Amount Paid': record.amount_paid || 0,
        'Late Fees': record.late_fees || 0,
        'Status': record.status,
        'Payment Method': record.payment_method || 'N/A',
        'Paid Date': record.paid_date ? format(new Date(record.paid_date), 'yyyy-MM-dd') : 'N/A',
        'Notes': record.notes || '',
      })) || [];

      const fileName = `rent_collection_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.csv`;
      downloadCSV(csvData, fileName);

      toast({
        title: "Success",
        description: `Rent collection report exported (${csvData.length} records)`,
      });
    } catch (error) {
      console.error('Error exporting rent data:', error);
      toast({
        title: "Error",
        description: "Failed to export rent data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportMaintenanceData = async () => {
    if (!propertyManager?.id) return;

    setLoading(true);
    try {
      let query = supabase
        .from('maintenance_requests')
        .select('*')
        .eq('property_manager_id', propertyManager.id)
        .gte('created_at', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('created_at', format(dateRange.to, 'yyyy-MM-dd'));

      if (selectedProperty !== "all") {
        query = query.eq('property_address', selectedProperty);
      }

      const { data, error } = await query;
      if (error) throw error;

      const csvData = data?.map(record => ({
        'Request ID': record.id,
        'Tenant Name': record.tenant_name,
        'Property Address': record.property_address,
        'Unit Number': record.unit_number || 'N/A',
        'Request Type': record.request_type,
        'Priority': record.priority,
        'Status': record.status,
        'Title': record.title,
        'Description': record.description,
        'Assigned To': record.assigned_to || 'N/A',
        'Estimated Cost': record.estimated_cost || 0,
        'Actual Cost': record.actual_cost || 0,
        'Created Date': format(new Date(record.created_at), 'yyyy-MM-dd'),
        'Completed Date': record.completed_at ? format(new Date(record.completed_at), 'yyyy-MM-dd') : 'N/A',
        'Notes': record.notes || '',
      })) || [];

      const fileName = `maintenance_requests_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.csv`;
      downloadCSV(csvData, fileName);

      toast({
        title: "Success",
        description: `Maintenance report exported (${csvData.length} records)`,
      });
    } catch (error) {
      console.error('Error exporting maintenance data:', error);
      toast({
        title: "Error",
        description: "Failed to export maintenance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportTenantData = async () => {
    if (!propertyManager?.id) return;

    setLoading(true);
    try {
      let query = supabase
        .from('tenants')
        .select('*')
        .eq('property_manager_id', propertyManager.id);

      if (selectedProperty !== "all") {
        query = query.eq('property_address', selectedProperty);
      }

      const { data, error } = await query;
      if (error) throw error;

      const csvData = data?.map(tenant => ({
        'Tenant Name': tenant.name,
        'Email': tenant.email || 'N/A',
        'Phone': tenant.phone || 'N/A',
        'Property Address': tenant.property_address,
        'Unit Number': tenant.unit_number || 'N/A',
        'Monthly Rent': tenant.rent_amount,
        'Rent Due Date': tenant.rent_due_date,
        'Security Deposit': tenant.security_deposit || 0,
        'Lease Start Date': tenant.lease_start_date ? format(new Date(tenant.lease_start_date), 'yyyy-MM-dd') : 'N/A',
        'Lease End Date': tenant.lease_end_date ? format(new Date(tenant.lease_end_date), 'yyyy-MM-dd') : 'N/A',
        'Notes': tenant.notes || '',
        'Created Date': format(new Date(tenant.created_at), 'yyyy-MM-dd'),
      })) || [];

      const fileName = `tenant_information_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadCSV(csvData, fileName);

      toast({
        title: "Success",
        description: `Tenant information exported (${csvData.length} records)`,
      });
    } catch (error) {
      console.error('Error exporting tenant data:', error);
      toast({
        title: "Error",
        description: "Failed to export tenant data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [propertyManager?.id]);

  useEffect(() => {
    fetchReportSummaries();
  }, [propertyManager?.id, dateRange, selectedProperty]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate and export detailed reports for your properties</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Customize your report data by selecting date ranges and properties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Range Picker */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "MMM d, yyyy") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange.to && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Property Filter */}
            <div className="space-y-2">
              <Label>Property</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.address} value={property.address}>
                      {property.address} ({property.count} tenant{property.count !== 1 ? 's' : ''})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rent Collection Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Rent Collection
            </CardTitle>
            <CardDescription>Payment records and collection data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Records</span>
                <Badge variant="secondary">{reportSummaries.rent.totalRecords}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="font-medium">${reportSummaries.rent.totalValue?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Period</span>
                <span className="text-xs">{reportSummaries.rent.dateRange}</span>
              </div>
            </div>
            <Separator />
            <Button 
              onClick={handleExportRentData} 
              disabled={loading || reportSummaries.rent.totalRecords === 0}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        {/* Maintenance Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-orange-600" />
              Maintenance Costs
            </CardTitle>
            <CardDescription>Maintenance requests and expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Records</span>
                <Badge variant="secondary">{reportSummaries.maintenance.totalRecords}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Cost</span>
                <span className="font-medium">${reportSummaries.maintenance.totalValue?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Period</span>
                <span className="text-xs">{reportSummaries.maintenance.dateRange}</span>
              </div>
            </div>
            <Separator />
            <Button 
              onClick={handleExportMaintenanceData} 
              disabled={loading || reportSummaries.maintenance.totalRecords === 0}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        {/* Tenant Information Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Tenant Information
            </CardTitle>
            <CardDescription>Complete tenant and lease data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Records</span>
                <Badge variant="secondary">{reportSummaries.tenants.totalRecords}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Scope</span>
                <span className="text-xs">{reportSummaries.tenants.dateRange}</span>
              </div>
            </div>
            <Separator />
            <Button 
              onClick={handleExportTenantData} 
              disabled={loading || reportSummaries.tenants.totalRecords === 0}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            About Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Rent Collection Report</h4>
              <p className="text-muted-foreground">
                Includes payment status, amounts due/paid, late fees, and payment methods for the selected date range.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Maintenance Report</h4>
              <p className="text-muted-foreground">
                Contains all maintenance requests, costs, completion status, and contractor assignments for the period.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tenant Information</h4>
              <p className="text-muted-foreground">
                Complete tenant directory with contact details, lease terms, and property assignments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;