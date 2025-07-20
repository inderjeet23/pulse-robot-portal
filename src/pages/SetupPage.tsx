import { ConfigCard } from "@/components/ConfigCard";
import { EmbedCodeCard } from "@/components/EmbedCodeCard";
import { SetupGuide } from "@/components/SetupGuide";
import { FAQSection } from "@/components/FAQSection";
import { SupportCallout } from "@/components/SupportCallout";

const SetupPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Setup & Configuration</h1>
        <p className="text-muted-foreground">Configure your portal settings and integrate with your website</p>
      </div>
      
      <ConfigCard />
      <EmbedCodeCard />
      
      <div id="setup-guide">
        <SetupGuide />
      </div>
      
      <div id="faq">
        <FAQSection />
      </div>
      
      <div id="support">
        <SupportCallout />
      </div>
    </div>
  );
};

export default SetupPage;