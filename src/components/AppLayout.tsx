import { useState } from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import { LayoutDashboard, Wrench, DollarSign, Users, Settings, HelpCircle, BarChart3, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { GlobalCommandPalette } from "./GlobalCommandPalette";
import { useCommandPalette } from "@/hooks/useCommandPalette";

const mainNavigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Tenants",
    url: "/tenants",
    icon: Users,
  },
  {
    title: "Maintenance",
    url: "/maintenance",
    icon: Wrench,
  },
  {
    title: "Rent",
    url: "/rent",
    icon: DollarSign,
  },
];

const managementNavigation = [
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Reports",
    url: "/reports", 
    icon: FileText,
  },
];

const systemNavigation = [
  {
    title: "Setup & Config",
    url: "/setup",
    icon: Settings,
  },
  {
    title: "FAQ",
    url: "/faq",
    icon: HelpCircle,
  },
];

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/maintenance": "Maintenance Requests",
  "/rent": "Rent Management",
  "/tenants": "Tenant Management",
  "/setup": "Setup & Configuration",
  "/faq": "FAQ & Support",
};

export function AppLayout() {
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] || "Dashboard";
  const { open, setOpen } = useCommandPalette();
  const [newMaintenanceRequestOpen, setNewMaintenanceRequestOpen] = useState(false);

  const handleNewMaintenanceRequest = () => {
    setNewMaintenanceRequestOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="hidden md:flex">
          <SidebarContent className="py-4">
            {/* Core Operations */}
            <SidebarGroup>
              <SidebarGroupLabel>Core Operations</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainNavigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={({ isActive }) =>
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Business Intelligence */}
            <SidebarGroup>
              <SidebarGroupLabel>Business Intelligence</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {managementNavigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={({ isActive }) =>
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* System & Support */}
            <SidebarGroup>
              <SidebarGroupLabel>System & Support</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {systemNavigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={({ isActive }) =>
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="flex-1">
          <Header title={currentTitle} />
          <main className="container mx-auto px-4 py-8 space-y-8 max-w-7xl pb-20 md:pb-8">
            <Outlet context={{ newMaintenanceRequestOpen, setNewMaintenanceRequestOpen }} />
          </main>
        </SidebarInset>
      </div>
      <BottomNav />
      <GlobalCommandPalette 
        open={open} 
        onOpenChange={setOpen}
        onNewMaintenanceRequest={handleNewMaintenanceRequest}
      />
    </SidebarProvider>
  );
}