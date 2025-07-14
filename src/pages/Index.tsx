import { Header } from "@/components/Header";
import { StatusCard } from "@/components/StatusCard";
import { EmbedCodeCard } from "@/components/EmbedCodeCard";
import { ConfigCard } from "@/components/ConfigCard";
import { SetupGuide } from "@/components/SetupGuide";
import { FAQSection } from "@/components/FAQSection";
import { SupportCallout } from "@/components/SupportCallout";
import { RequestsOverview } from "@/components/RequestsOverview";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        {/* Dashboard Hero */}
        <StatusCard />
        
        {/* Maintenance Requests */}
        <RequestsOverview />
        
        {/* Widget Embed Code */}
        <EmbedCodeCard />
        
        {/* Configuration Panel */}
        <ConfigCard />
        
        {/* Setup Guide */}
        <SetupGuide />
        
        {/* FAQ Section */}
        <FAQSection />
        
        {/* Support Callout */}
        <SupportCallout />
      </main>
      
      {/* Footer spacing */}
      <div className="h-16" />
    </div>
  );
};

export default Index;
