import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import { GlobalCommandPalette } from "./GlobalCommandPalette";
import { useCommandPalette } from "@/hooks/useCommandPalette";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/maintenance": "Maintenance Requests",
  "/rent": "Rent Management",
  "/tenants": "Tenant Management",
  "/setup": "Setup & Configuration",
  "/faq": "FAQ & Support",
  "/analytics": "Analytics",
  "/reports": "Reports",
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
    <div className="min-h-screen bg-background">
      <Header title={currentTitle} />
      <TopNav />
      <main className="container mx-auto px-4 py-8 space-y-6 max-w-7xl pb-20 md:pb-8">
        <Outlet context={{ newMaintenanceRequestOpen, setNewMaintenanceRequestOpen }} />
      </main>
      <BottomNav />
      <GlobalCommandPalette 
        open={open} 
        onOpenChange={setOpen}
        onNewMaintenanceRequest={handleNewMaintenanceRequest}
      />
    </div>
  );
}