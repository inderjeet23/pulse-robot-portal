import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function StatusCard() {
  const { propertyManager, loading } = useAuth();
  
  if (loading || !propertyManager) {
    return (
      <Card className="bg-gradient-card shadow-card border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-24">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLive = propertyManager.routing_email && propertyManager.bot_id;
  const managerName = propertyManager.name;
  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardContent className="p-6">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome, {managerName} 👋
          </h1>
          <p className="text-muted-foreground">
            Here's everything you need to get your virtual assistant up and running:
          </p>
        </div>

        <div className="flex items-center space-x-3 p-4 rounded-lg bg-accent/50">
          {isLive ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-foreground">Assistant is LIVE and ready to help tenants.</p>
                <p className="text-sm text-muted-foreground">Your virtual assistant is actively responding to tenant requests.</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-destructive" />
              <div>
                <p className="font-semibold text-foreground">Assistant is NOT LIVE</p>
                <p className="text-sm text-muted-foreground">Complete the setup below to activate your assistant.</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}