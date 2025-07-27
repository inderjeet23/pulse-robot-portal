import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import MaintenancePage from "./pages/MaintenancePage";
import RentPage from "./pages/RentPage";
import TenantsPage from "./pages/TenantsPage";
import AutomationPage from "./pages/AutomationPage";
import SetupPage from "./pages/SetupPage";
import ReportsPage from "./pages/ReportsPage";
import LegalNoticesPage from "./pages/LegalNoticesPage";
import FAQSection from "./pages/FAQSection";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import TenantPortal from "./pages/TenantPortal";
import UpdatePassword from "./pages/UpdatePassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/tenant" element={<TenantPortal />} />
            <Route path="/update-password" element={
              <ProtectedRoute>
                <UpdatePassword />
              </ProtectedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="maintenance" element={<MaintenancePage />} />
              <Route path="rent" element={<RentPage />} />
              <Route path="tenants" element={<TenantsPage />} />
              <Route path="automation" element={<AutomationPage />} />
              <Route path="setup" element={<SetupPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="legal-notices" element={<LegalNoticesPage />} />
              <Route path="faq" element={<FAQSection />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
