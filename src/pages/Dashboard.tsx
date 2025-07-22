import { Link } from "react-router-dom";
import { StatusCard } from "@/components/StatusCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, AlertTriangle, DollarSign, Wrench, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardStats {
  overdueRentAmount: number;
  overdueTenantsCount: number;
  newRequests: number;
  totalTenants: number;
  leasesExpiringSoon: number;
  overdueTenantsDetails: { name: string; property_address: string; unit_number: string | null }[];
  newRequestsDetails: { title: string; tenant_name: string; priority: string }[];
  leasesExpiringSoonDetails: { name: string; property_address: string; lease_end_date: string }[];
}

const Dashboard = () => {
  const { propertyManager } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    overdueRentAmount: 0,
    overdueTenantsCount: 0,
    newRequests: 0,
    totalTenants: 0,
    leasesExpiringSoon: 0,
    overdueTenantsDetails: [],
    newRequestsDetails: [],
    leasesExpiringSoonDetails: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!propertyManager?.id) return;

      try {
        // Fetch overdue rent records with tenant details
        const { data: overdueRent } = await supabase
          .from("rent_records")
          .select(`
            amount_due, 
            late_fees,
            tenant_id,
            tenants!inner (name, property_address, unit_number)
          `)
          .eq("property_manager_id", propertyManager.id)
          .eq("status", "overdue");

        // Fetch new maintenance requests with details
        const { data: newRequests } = await supabase
          .from("maintenance_requests")
          .select("title, tenant_name, priority")
          .eq("property_manager_id", propertyManager.id)
          .eq("status", "New");

        // Fetch total tenants with lease info
        const { data: tenants } = await supabase
          .from("tenants")
          .select("name, property_address, unit_number, lease_end_date")
          .eq("property_manager_id", propertyManager.id);

        // Calculate leases expiring in next 60 days
        const today = new Date();
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(today.getDate() + 60);
        
        const leasesExpiringSoon = tenants?.filter(tenant => {
          if (!tenant.lease_end_date) return false;
          const leaseEndDate = new Date(tenant.lease_end_date);
          return leaseEndDate >= today && leaseEndDate <= sixtyDaysFromNow;
        }).length || 0;

        // Calculate total overdue amount
        const overdueAmount = overdueRent?.reduce((sum, record) => 
          sum + (Number(record.amount_due) || 0) + (Number(record.late_fees) || 0), 0) || 0;

        // Get details for tooltips
        const overdueTenantsDetails = overdueRent?.map(record => ({
          name: record.tenants.name,
          property_address: record.tenants.property_address,
          unit_number: record.tenants.unit_number
        })) || [];

        const leasesExpiringSoonDetails = tenants?.filter(tenant => {
          if (!tenant.lease_end_date) return false;
          const leaseEndDate = new Date(tenant.lease_end_date);
          return leaseEndDate >= today && leaseEndDate <= sixtyDaysFromNow;
        }).map(tenant => ({
          name: tenant.name,
          property_address: tenant.property_address,
          lease_end_date: tenant.lease_end_date
        })) || [];

        setStats({
          overdueRentAmount: overdueAmount,
          overdueTenantsCount: overdueRent?.length || 0,
          newRequests: newRequests?.length || 0,
          totalTenants: tenants?.length || 0,
          leasesExpiringSoon,
          overdueTenantsDetails,
          newRequestsDetails: newRequests || [],
          leasesExpiringSoonDetails,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [propertyManager?.id]);

  if (loading) {
    return (
      <div className="space-y-8">
        <StatusCard />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <StatusCard />
      
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Rent</CardTitle>
                <DollarSign className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.overdueRentAmount.toLocaleString()}</div>
                {stats.overdueTenantsCount > 0 && (
                  <Badge variant="destructive" className="mt-1">
                    {stats.overdueTenantsCount} tenants
                  </Badge>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          {stats.overdueTenantsDetails.length > 0 && (
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">Overdue Tenants:</p>
                {stats.overdueTenantsDetails.slice(0, 5).map((tenant, i) => (
                  <div key={i} className="text-xs">
                    {tenant.name} - {tenant.property_address}
                    {tenant.unit_number && ` Unit ${tenant.unit_number}`}
                  </div>
                ))}
                {stats.overdueTenantsDetails.length > 5 && (
                  <div className="text-xs text-muted-foreground">
                    +{stats.overdueTenantsDetails.length - 5} more...
                  </div>
                )}
              </div>
            </TooltipContent>
          )}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tenants Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overdueTenantsCount}</div>
                {stats.overdueTenantsCount > 0 && (
                  <Badge variant="destructive" className="mt-1">Needs Attention</Badge>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          {stats.overdueTenantsDetails.length > 0 && (
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">Overdue Tenants:</p>
                {stats.overdueTenantsDetails.slice(0, 5).map((tenant, i) => (
                  <div key={i} className="text-xs">
                    {tenant.name} - {tenant.property_address}
                    {tenant.unit_number && ` Unit ${tenant.unit_number}`}
                  </div>
                ))}
                {stats.overdueTenantsDetails.length > 5 && (
                  <div className="text-xs text-muted-foreground">
                    +{stats.overdueTenantsDetails.length - 5} more...
                  </div>
                )}
              </div>
            </TooltipContent>
          )}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newRequests}</div>
                {stats.newRequests > 0 && (
                  <Badge variant="secondary" className="mt-1">Pending Review</Badge>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          {stats.newRequestsDetails.length > 0 && (
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">New Requests:</p>
                {stats.newRequestsDetails.slice(0, 5).map((request, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-medium">{request.title}</span> - {request.tenant_name}
                    <Badge variant="outline" className="ml-1 text-xs">{request.priority}</Badge>
                  </div>
                ))}
                {stats.newRequestsDetails.length > 5 && (
                  <div className="text-xs text-muted-foreground">
                    +{stats.newRequestsDetails.length - 5} more...
                  </div>
                )}
              </div>
            </TooltipContent>
          )}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leases Expiring</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.leasesExpiringSoon}</div>
                <p className="text-xs text-muted-foreground mt-1">Next 60 days</p>
                {stats.leasesExpiringSoon > 0 && (
                  <Badge variant="secondary" className="mt-1">Review Soon</Badge>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          {stats.leasesExpiringSoonDetails.length > 0 && (
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">Expiring Leases:</p>
                {stats.leasesExpiringSoonDetails.slice(0, 5).map((tenant, i) => (
                  <div key={i} className="text-xs">
                    {tenant.name} - {tenant.property_address}
                    <div className="text-muted-foreground">Expires: {new Date(tenant.lease_end_date).toLocaleDateString()}</div>
                  </div>
                ))}
                {stats.leasesExpiringSoonDetails.length > 5 && (
                  <div className="text-xs text-muted-foreground">
                    +{stats.leasesExpiringSoonDetails.length - 5} more...
                  </div>
                )}
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Maintenance Requests</CardTitle>
            <CardDescription>Latest requests requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {stats.newRequests > 0 
                  ? `${stats.newRequests} new requests awaiting review`
                  : "All requests are up to date"
                }
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/maintenance">
                  View All Requests <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rent Management</CardTitle>
            <CardDescription>Track payments and overdue accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {stats.overdueTenantsCount > 0 
                  ? `${stats.overdueTenantsCount} tenants with overdue rent`
                  : "All rent payments are current"
                }
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/rent">
                  Manage Rent <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;