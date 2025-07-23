import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import { GlobalCommandPalette } from "./GlobalCommandPalette";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { WelcomeModal } from "@/components/WelcomeModal";
import { SetupWizard } from "@/components/SetupWizard";
import { useAuth } from "@/contexts/AuthContext";

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
  );
}