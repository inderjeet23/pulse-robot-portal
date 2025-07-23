import { StatusCard } from "@/components/StatusCard";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Wrench, Users, AlertTriangle, Home, Clock, Plus, Calendar, Receipt } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  overdueRentAmount: number;
  overdueTenantsCount: number;
  newRequests: number;
  totalTenants: number;
  leasesExpiringSoon: number;
  totalProperties: number;
  occupancyRate: number;
  avgResponseTime: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  variant: 'default' | 'success' | 'warning' | 'destructive';
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
    occupancyRate: 95,
    avgResponseTime: 2.3,
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
          occupancyRate: 95,
          avgResponseTime: 2.3,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [propertyManager?.id]);

  const quickActions: QuickAction[] = [
    {
      title: "Add New Tenant",
      description: "Register a new tenant and lease",
      icon: Users,
      action: () => console.log("Add tenant"),
      variant: "default"
    },
    {
      title: "Record Payment",
      description: "Log rent payment received",
      icon: Receipt,
      action: () => console.log("Record payment"),
      variant: "success"
    },
    {
      title: "Create Maintenance Request",
      description: "New maintenance issue",
      icon: Wrench,
      action: () => console.log("Create request"),
      variant: "warning"
    },
    {
      title: "Schedule Inspection",
      description: "Property inspection appointment",
      icon: Calendar,
      action: () => console.log("Schedule inspection"),
      variant: "default"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <StatusCard />

        {/* Primary Metrics Grid - 2 rows, 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            label="Overdue Rent"
            value={`$${stats.overdueRentAmount.toLocaleString()}`}
            icon={DollarSign}
            status={stats.overdueTenantsCount > 0 ? "critical" : "success"}
            trend={{ direction: 'down', percentage: 12 }}
            loading={loading}
            onClick={() => console.log("Navigate to rent management")}
          />

          <MetricCard
            label="New Requests"
            value={stats.newRequests}
            icon={Wrench}
            status={stats.newRequests > 5 ? "critical" : stats.newRequests > 0 ? "warning" : "success"}
            trend={{ direction: 'up', percentage: 8 }}
            loading={loading}
            onClick={() => console.log("Navigate to maintenance")}
          />

          <MetricCard
            label="Leases Expiring"
            value={stats.leasesExpiringSoon}
            icon={AlertTriangle}
            status={stats.leasesExpiringSoon > 2 ? "warning" : "success"}
            trend={{ direction: 'down', percentage: 5 }}
            loading={loading}
            onClick={() => console.log("Navigate to lease management")}
          />

          <MetricCard
            label="Total Properties"
            value={stats.totalProperties}
            icon={Home}
            status="neutral"
            trend={{ direction: 'up', percentage: 2 }}
            loading={loading}
            onClick={() => console.log("Navigate to properties")}
          />

          <MetricCard
            label="Occupancy Rate"
            value={`${stats.occupancyRate}%`}
            icon={Users}
            status={stats.occupancyRate > 90 ? "success" : stats.occupancyRate > 80 ? "warning" : "critical"}
            trend={{ direction: 'up', percentage: 3 }}
            loading={loading}
            onClick={() => console.log("Navigate to tenants")}
          />

          <MetricCard
            label="Avg Response Time"
            value={`${stats.avgResponseTime}d`}
            icon={Clock}
            status={stats.avgResponseTime < 2 ? "success" : stats.avgResponseTime < 4 ? "warning" : "critical"}
            trend={{ direction: 'down', percentage: 15 }}
            loading={loading}
            onClick={() => console.log("Navigate to performance")}
          />
        </div>

        {/* Quick Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <div className="text-center">
                    <div className="text-sm font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Urgent Items */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Requires Immediate Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.overdueTenantsCount > 0 || stats.newRequests > 3 ? (
                <div className="space-y-3">
                  {stats.overdueTenantsCount > 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-100">
                            {stats.overdueTenantsCount} Overdue Payment{stats.overdueTenantsCount > 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            ${stats.overdueRentAmount.toLocaleString()} total owed
                          </p>
                        </div>
                        <Button size="sm" variant="destructive">
                          View All
                        </Button>
                      </div>
                    </div>
                  )}
                  {stats.newRequests > 3 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-amber-900 dark:text-amber-100">
                            {stats.newRequests} Pending Maintenance
                          </p>
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            Review and assign priority
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">All caught up! No urgent items.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.leasesExpiringSoon > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Lease Renewals</p>
                        <p className="text-sm text-muted-foreground">
                          {stats.leasesExpiringSoon} leases expiring soon
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  </div>
                )}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Monthly Reports</p>
                      <p className="text-sm text-muted-foreground">
                        Due in 5 days
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;