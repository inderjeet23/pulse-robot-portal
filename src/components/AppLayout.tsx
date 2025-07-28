import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { TopNav } from "@/components/TopNav";

import { GlobalCommandPalette } from "./GlobalCommandPalette";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { WelcomeModal } from "@/components/WelcomeModal";
import { SetupWizard } from "@/components/SetupWizard";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

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
  const { propertyManager } = useAuth();
  const [newMaintenanceRequestOpen, setNewMaintenanceRequestOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  const handleNewMaintenanceRequest = () => {
    setNewMaintenanceRequestOpen(true);
  };

  // Check onboarding status when propertyManager loads
  useEffect(() => {
    if (propertyManager && !propertyManager.has_completed_onboarding) {
      setShowWelcomeModal(true);
    }
  }, [propertyManager]);

  const handleSetupProperty = () => {
    setShowWelcomeModal(false);
    setShowSetupWizard(true);
  };

  const handleOnboardingComplete = () => {
    setShowSetupWizard(false);
    // Refresh the auth context to get updated propertyManager data
    window.location.reload();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background">
        {/* Mobile Header with TopNav */}
        <div className="md:hidden">
          <Header title={currentTitle} />
          <TopNav />
        </div>

        {/* Desktop Layout with Sidebar */}
        <div className="hidden md:flex min-h-screen w-full">
          <AppSidebar />
          
          <div className="flex-1 flex flex-col">
            {/* Desktop Header */}
            <header className="h-12 flex items-center border-b bg-background px-4">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-lg font-semibold">{currentTitle}</h1>
            </header>
            
            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-6 space-y-6 max-w-7xl">
              <Outlet context={{ newMaintenanceRequestOpen, setNewMaintenanceRequestOpen }} />
            </main>
          </div>
        </div>

        {/* Mobile Content */}
        <main className="md:hidden container mx-auto px-2 py-4 space-y-4 max-w-7xl pb-24">
          <Outlet context={{ newMaintenanceRequestOpen, setNewMaintenanceRequestOpen }} />
        </main>

        
        <GlobalCommandPalette 
          open={open} 
          onOpenChange={setOpen}
          onNewMaintenanceRequest={handleNewMaintenanceRequest}
        />
        
        {/* Onboarding Modals */}
        <WelcomeModal 
          open={showWelcomeModal} 
          onSetupProperty={handleSetupProperty}
        />
        <SetupWizard 
          open={showSetupWizard} 
          onComplete={handleOnboardingComplete}
        />
      </div>
    </SidebarProvider>
  );
}