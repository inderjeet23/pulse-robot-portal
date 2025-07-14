import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle } from "lucide-react";

export function SupportCallout() {
  const handleEmailSupport = () => {
    window.location.href = "mailto:support@pulserobot.com";
  };

  return (
    <Card className="bg-gradient-primary shadow-card border-0">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-primary-foreground mb-2">
          Need help?
        </h3>
        <p className="text-primary-foreground/90 mb-4">
          Email support@pulserobot.com — we respond the same day.
        </p>
        
        <Button
          onClick={handleEmailSupport}
          variant="secondary"
          className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          <Mail className="w-4 h-4" />
          Contact Support
        </Button>
      </CardContent>
    </Card>
  );
}