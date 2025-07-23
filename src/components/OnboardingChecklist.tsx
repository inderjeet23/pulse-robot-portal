import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface OnboardingChecklistProps {
  hasProperties: boolean;
  hasTenants: boolean;
}

export function OnboardingChecklist({ hasProperties, hasTenants }: OnboardingChecklistProps) {
  const completedCount = [hasProperties, hasTenants].filter(Boolean).length;
  const totalCount = 4;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Welcome to Pulse Robot! 🎉</CardTitle>
            <CardDescription>
              Complete your setup to unlock the full potential of your property management dashboard.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {completedCount}/{totalCount} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <Checkbox checked={hasProperties} disabled />
          <span className={hasProperties ? "text-foreground" : "text-muted-foreground"}>
            Added your first property
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox checked={hasTenants} disabled />
          <span className={hasTenants ? "text-foreground" : "text-muted-foreground"}>
            Added your tenants
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox checked={false} disabled />
          <span className="text-muted-foreground">
            Customize your branding in Setup
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox checked={false} disabled />
          <span className="text-muted-foreground">
            Explore the Command Palette (Cmd+K)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}