import { Link } from "react-router-dom";
import { StatusCard } from "@/components/StatusCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, AlertTriangle, DollarSign, Wrench, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  overdueRent: number;
  newRequests: number;
  totalTenants: number;
  totalRevenue: number;
}

const Dashboard = () => {
  const { propertyManager } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    overdueRent: 0,
    newRequests: 0,
    totalTenants: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!propertyManager?.id) return;

      try {
        // Fetch overdue rent records
        const { data: overdueRent } = await supabase
          .from("rent_records")
          .select("*")
          .eq("property_manager_id", propertyManager.id)
          .eq("status", "overdue");

        // Fetch new maintenance requests
        const { data: newRequests } = await supabase
          .from("maintenance_requests")
          .select("*")
          .eq("property_manager_id", propertyManager.id)
          .eq("status", "New");

        // Fetch total tenants
        const { data: tenants } = await supabase
          .from("tenants")
          .select("*")
          .eq("property_manager_id", propertyManager.id);

        // Fetch total revenue (paid rent)
        const { data: paidRent } = await supabase
          .from("rent_records")
          .select("amount_paid")
          .eq("property_manager_id", propertyManager.id)
          .eq("status", "paid");

        const totalRevenue = paidRent?.reduce((sum, record) => 
          sum + (Number(record.amount_paid) || 0), 0) || 0;

        setStats({
          overdueRent: overdueRent?.length || 0,
          newRequests: newRequests?.length || 0,
          totalTenants: tenants?.length || 0,
          totalRevenue,
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tenants</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdueRent}</div>
            {stats.overdueRent > 0 && (
              <Badge variant="destructive" className="mt-1">Needs Attention</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Requests</CardTitle>
            <Wrench className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newRequests}</div>
            {stats.newRequests > 0 && (
              <Badge variant="secondary" className="mt-1">Pending Review</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTenants}</div>
            <p className="text-xs text-muted-foreground mt-1">Active leases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Collected rent</p>
          </CardContent>
        </Card>
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
                {stats.overdueRent > 0 
                  ? `${stats.overdueRent} tenants with overdue rent`
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