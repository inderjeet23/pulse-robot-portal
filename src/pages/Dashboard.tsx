import { StatusCard } from "@/components/StatusCard";
import { MetricCard } from "@/components/MetricCard";
import { CompactKPI } from "@/components/CompactKPI";
import { ActionItem } from "@/components/ActionItem";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Wrench, Users, AlertTriangle, Home, Clock, Plus, Calendar, Receipt } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AddTenantDialog } from "@/components/AddTenantDialog";
import { RecordPaymentDialog } from "@/components/RecordPaymentDialog";
import { NewMaintenanceRequestDialog } from "@/components/NewMaintenanceRequestDialog";
import { ComingSoonModal } from "@/components/ComingSoonModal";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  overdueRentAmount: number;
  overdueTenantsCount: number;
  newRequests: number;
  totalTenants: number;
  leasesExpiringSoon: number;
  totalProperties: number;
  occupancyRate: number;
  avgResponseTime: number;
  hasProperties: boolean;
  hasTenants: boolean;
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
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    overdueRentAmount: 0,
    overdueTenantsCount: 0,
    newRequests: 0,
    totalTenants: 0,
    leasesExpiringSoon: 0,
    totalProperties: 0,
    occupancyRate: 95,
    avgResponseTime: 2.3,
    hasProperties: false,
    hasTenants: false,
  });
  const [loading, setLoading] = useState(true);
  const [addTenantOpen, setAddTenantOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [newMaintenanceOpen, setNewMaintenanceOpen] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState("");

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

      // Fetch properties
      const { data: properties } = await supabase
        .from("properties")
        .select("id")
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
        hasProperties: (properties?.length || 0) > 0,
        hasTenants: (tenants?.length || 0) > 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [propertyManager?.id]);

  const refreshData = () => {
    if (propertyManager?.id) {
      fetchStats();
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: "Add New Tenant",
      description: "Register a new tenant and lease",
      icon: Users,
      action: () => setAddTenantOpen(true),
      variant: "default"
    },
    {
      title: "Record Payment",
      description: "Log rent payment received",
      icon: Receipt,
      action: () => setRecordPaymentOpen(true),
      variant: "success"
    },
    {
      title: "Create Maintenance Request",
      description: "New maintenance issue",
      icon: Wrench,
      action: () => setNewMaintenanceOpen(true),
      variant: "warning"
    },
    {
      title: "Schedule Inspection",
      description: "Property inspection appointment",
      icon: Calendar,
      action: () => console.log("Schedule inspection - coming soon!"),
      variant: "default"
    },
  ];

  // Show onboarding checklist for new users
  const showOnboardingChecklist = propertyManager && !propertyManager.has_completed_onboarding;

  // Generate priority action items for mobile
  const getActionItems = () => {
    const items = [];
    
    if (stats.overdueTenantsCount > 0) {
      items.push({
        title: "Overdue Rent Payments",
        description: `${stats.overdueTenantsCount} tenant${stats.overdueTenantsCount > 1 ? 's' : ''} behind on rent`,
        icon: DollarSign,
        priority: "critical" as const,
        actionLabel: "Send Reminder",
        onAction: () => navigate("/rent"),
        value: `$${stats.overdueRentAmount.toLocaleString()}`,
        badge: `${stats.overdueTenantsCount} tenants`
      });
    }
    
    if (stats.newRequests > 0) {
      items.push({
        title: "New Maintenance Requests",
        description: "Requests need review and assignment",
        icon: Wrench,
        priority: stats.newRequests > 5 ? "critical" as const : stats.newRequests > 2 ? "high" as const : "medium" as const,
        actionLabel: "Review",
        onAction: () => navigate("/maintenance"),
        badge: `${stats.newRequests} new`
      });
    }
    
    if (stats.leasesExpiringSoon > 0) {
      items.push({
        title: "Lease Renewals Due",
        description: "Leases expiring in next 60 days",
        icon: Calendar,
        priority: stats.leasesExpiringSoon > 3 ? "high" as const : "medium" as const,
        actionLabel: "Contact",
        onAction: () => navigate("/tenants"),
        badge: `${stats.leasesExpiringSoon} expiring`
      });
    }
    
    return items;
  };

  const actionItems = getActionItems();

  return (
    <div className="space-y-6">
      {showOnboardingChecklist ? (
        <OnboardingChecklist 
          hasProperties={stats.hasProperties}
          hasTenants={stats.hasTenants}
        />
      ) : (
        <StatusCard />
      )}

      {/* Mobile KPI Grid - only visible on mobile */}
      <div className="block md:hidden">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <CompactKPI
            label="Overdue Rent"
            value={`$${stats.overdueRentAmount.toLocaleString()}`}
            icon={DollarSign}
            status={stats.overdueTenantsCount > 0 ? "critical" : "success"}
            trend={{ direction: 'down', percentage: 12 }}
            loading={loading}
            onClick={() => navigate("/rent")}
          />
          <CompactKPI
            label="New Requests"
            value={stats.newRequests}
            icon={Wrench}
            status={stats.newRequests > 5 ? "critical" : stats.newRequests > 0 ? "warning" : "success"}
            trend={{ direction: 'up', percentage: 8 }}
            loading={loading}
            onClick={() => navigate("/maintenance")}
          />
          <CompactKPI
            label="Leases Expiring"
            value={stats.leasesExpiringSoon}
            icon={AlertTriangle}
            status={stats.leasesExpiringSoon > 2 ? "warning" : "success"}
            trend={{ direction: 'down', percentage: 5 }}
            loading={loading}
            onClick={() => navigate("/tenants")}
          />
          <CompactKPI
            label="Total Tenants"
            value={stats.totalTenants}
            icon={Users}
            status="neutral"
            trend={{ direction: 'up', percentage: 2 }}
            loading={loading}
            onClick={() => navigate("/tenants")}
          />
        </div>

        {/* Mobile Action Items */}
        {actionItems.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Priority Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {actionItems.map((item, index) => (
                  <ActionItem key={index} {...item} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mobile Quick Actions - Compact Grid */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.slice(0, 4).map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-14 flex flex-col items-center justify-center space-y-1 text-xs"
                  onClick={action.action}
                >
                  <action.icon className="w-3.5 h-3.5" />
                  <span className="font-medium leading-none text-xs">{action.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Layout - hidden on mobile */}
      <div className="hidden md:block space-y-6">
        {/* Primary Metrics Grid - 2 rows, 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            label="Overdue Rent"
            value={`$${stats.overdueRentAmount.toLocaleString()}`}
            icon={DollarSign}
            status={stats.overdueTenantsCount > 0 ? "critical" : "success"}
            trend={{ direction: 'down', percentage: 12 }}
            loading={loading}
            onClick={() => navigate("/rent")}
          />

          <MetricCard
            label="New Requests"
            value={stats.newRequests}
            icon={Wrench}
            status={stats.newRequests > 5 ? "critical" : stats.newRequests > 0 ? "warning" : "success"}
            trend={{ direction: 'up', percentage: 8 }}
            loading={loading}
            onClick={() => navigate("/maintenance")}
          />

          <MetricCard
            label="Leases Expiring"
            value={stats.leasesExpiringSoon}
            icon={AlertTriangle}
            status={stats.leasesExpiringSoon > 2 ? "warning" : "success"}
            trend={{ direction: 'down', percentage: 5 }}
            loading={loading}
            onClick={() => navigate("/tenants")}
          />

          <MetricCard
            label="Total Properties"
            value={stats.totalProperties}
            icon={Home}
            status="neutral"
            trend={{ direction: 'up', percentage: 2 }}
            loading={loading}
            onClick={() => navigate("/tenants")}
          />

          <MetricCard
            label="Occupancy Rate"
            value={`${stats.occupancyRate}%`}
            icon={Users}
            status={stats.occupancyRate > 90 ? "success" : stats.occupancyRate > 80 ? "warning" : "critical"}
            trend={{ direction: 'up', percentage: 3 }}
            loading={loading}
            onClick={() => navigate("/tenants")}
          />

          <MetricCard
            label="Avg Response Time"
            value={`${stats.avgResponseTime}d`}
            icon={Clock}
            status={stats.avgResponseTime < 1 ? "success" : stats.avgResponseTime < 3 ? "warning" : "critical"}
            trend={{ direction: 'down', percentage: 15 }}
            loading={loading}
            onClick={() => navigate("/maintenance")}
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
                  className="h-16 flex flex-col items-center justify-center space-y-1 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-700 hover:scale-105 hover:shadow-lg group"
                  onClick={action.action}
                >
                  <action.icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  <div className="text-center">
                    <div className="text-xs font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground opacity-70">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Items */}
        <Card className={`${stats.overdueTenantsCount > 0 || stats.newRequests > 3 
          ? 'border-red-200 dark:border-red-800 animate-pulse-error' 
          : 'border-green-200 dark:border-green-800'}`}>
          <CardHeader className="pb-4">
            <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${
              stats.overdueTenantsCount > 0 || stats.newRequests > 3
                ? 'text-red-700 dark:text-red-400 animate-pulse'
                : 'text-green-700 dark:text-green-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
              {stats.overdueTenantsCount > 0 || stats.newRequests > 3 
                ? 'Requires Immediate Attention' 
                : 'System Status'}
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
                        <Button size="sm" variant="destructive" onClick={() => navigate("/rent")}>
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
                        <Button size="sm" variant="outline" onClick={() => navigate("/maintenance")}>
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
                      <Button size="sm" variant="outline" onClick={() => navigate("/tenants")}>
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
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate("/reports")}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <AddTenantDialog
          open={addTenantOpen}
          onOpenChange={setAddTenantOpen}
          onSuccess={refreshData}
        />
        <RecordPaymentDialog
          open={recordPaymentOpen}
          onOpenChange={setRecordPaymentOpen}
          onSuccess={refreshData}
        />
        <NewMaintenanceRequestDialog
          open={newMaintenanceOpen}
          onOpenChange={setNewMaintenanceOpen}
          onSuccess={refreshData}
        />
        <ComingSoonModal 
          open={isComingSoonOpen}
          onOpenChange={setIsComingSoonOpen}
          feature={comingSoonFeature}
        />
    </div>
  );
};

export default Dashboard;