import { StatusCard } from "@/components/StatusCard";
import { MetricCard } from "@/components/MetricCard";
import { RecentMaintenance } from "@/components/RecentMaintenance";
import { RentOverviewCard } from "@/components/RentOverviewCard";
import { DollarSign, Wrench, Users, AlertTriangle, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TooltipProvider } from "@/components/ui/tooltip";

interface DashboardStats {
  overdueRentAmount: number;
  overdueTenantsCount: number;
  newRequests: number;
  totalTenants: number;
  leasesExpiringSoon: number;
  totalProperties: number;
  previousPeriodStats?: {
    overdueRentAmount: number;
    newRequests: number;
    totalTenants: number;
    leasesExpiringSoon: number;
  };
}

const Dashboard = () => {
  const { propertyManager } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    overdueRentAmount: 0,
    overdueTenantsCount: 0,
    newRequests: 0,
    totalTenants: 0,
    leasesExpiringSoon: 0,
    totalProperties: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!propertyManager?.id) return;

      try {
        // Fetch overdue rent records
        const { data: overdueRent } = await supabase
          .from("rent_records")
          .select("amount_due, late_fees")
          .eq("property_manager_id", propertyManager.id)
          .eq("status", "overdue");

        // Fetch new maintenance requests
        const { data: newRequests } = await supabase
          .from("maintenance_requests")
          .select("id")
          .eq("property_manager_id", propertyManager.id)
          .eq("status", "New");

        // Fetch tenants
        const { data: tenants } = await supabase
          .from("tenants")
          .select("id, lease_end_date, property_address")
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

        // Count unique properties
        const uniqueProperties = new Set(tenants?.map(t => t.property_address) || []).size;

        setStats({
          overdueRentAmount: overdueAmount,
          overdueTenantsCount: overdueRent?.length || 0,
          newRequests: newRequests?.length || 0,
          totalTenants: tenants?.length || 0,
          leasesExpiringSoon,
          totalProperties: uniqueProperties,
          previousPeriodStats: {
            overdueRentAmount: overdueAmount * 0.8, // Mock previous period data
            newRequests: (newRequests?.length || 0) * 1.2,
            totalTenants: (tenants?.length || 0) * 0.95,
            leasesExpiringSoon: leasesExpiringSoon * 0.7
          }
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [propertyManager?.id]);

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.round(Math.abs(change)),
      label: "from last month"
    };
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Main Container */}
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-heading font-semibold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your properties today.
            </p>
          </div>

          <StatusCard />

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Overdue Rent"
              value={`$${stats.overdueRentAmount.toLocaleString()}`}
              icon={DollarSign}
              status={stats.overdueTenantsCount > 0 ? "error" : "success"}
              trend={stats.previousPeriodStats ? calculateTrend(stats.overdueRentAmount, stats.previousPeriodStats.overdueRentAmount) : undefined}
              subtitle={stats.overdueTenantsCount > 0 ? `${stats.overdueTenantsCount} tenant${stats.overdueTenantsCount > 1 ? 's' : ''} overdue` : "All current"}
              loading={loading}
              onClick={() => console.log("Navigate to rent management")}
            />

            <MetricCard
              title="New Requests"
              value={stats.newRequests}
              icon={Wrench}
              status={stats.newRequests > 5 ? "warning" : stats.newRequests > 0 ? "neutral" : "success"}
              trend={stats.previousPeriodStats ? calculateTrend(stats.newRequests, stats.previousPeriodStats.newRequests) : undefined}
              subtitle={stats.newRequests > 0 ? "Pending review" : "All caught up"}
              loading={loading}
              onClick={() => console.log("Navigate to maintenance")}
            />

            <MetricCard
              title="Total Tenants"
              value={stats.totalTenants}
              icon={Users}
              status="success"
              trend={stats.previousPeriodStats ? calculateTrend(stats.totalTenants, stats.previousPeriodStats.totalTenants) : undefined}
              subtitle="Active leases"
              loading={loading}
              onClick={() => console.log("Navigate to tenants")}
            />

            <MetricCard
              title="Leases Expiring"
              value={stats.leasesExpiringSoon}
              icon={AlertTriangle}
              status={stats.leasesExpiringSoon > 0 ? "warning" : "success"}
              trend={stats.previousPeriodStats ? calculateTrend(stats.leasesExpiringSoon, stats.previousPeriodStats.leasesExpiringSoon) : undefined}
              subtitle="Next 60 days"
              loading={loading}
              onClick={() => console.log("Navigate to lease management")}
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentMaintenance />
            <RentOverviewCard />
          </div>

          {/* Additional Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border bg-card transition-all duration-200 hover:shadow-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Properties</p>
                  <p className="text-2xl font-semibold font-mono">{stats.totalProperties}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border bg-card transition-all duration-200 hover:shadow-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                  <p className="text-2xl font-semibold font-mono">95%</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border bg-card transition-all duration-200 hover:shadow-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-semibold font-mono">2.3d</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Dashboard;