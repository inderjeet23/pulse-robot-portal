import { useState } from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import { LayoutDashboard, Wrench, DollarSign, Users, Settings, HelpCircle } from "lucide-react";
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

const navigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
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
  {
    title: "Tenants",
    url: "/tenants",
    icon: Users,
  },
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Property Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
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
            <Outlet />
          </main>
        </SidebarInset>
      </div>
      <BottomNav />
    </SidebarProvider>
  );
}