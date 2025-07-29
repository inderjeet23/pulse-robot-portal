import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface ActionCenterProps {
  overdueCount: number;
  maintenanceCount: number;
}

export function ActionCenter({ overdueCount, maintenanceCount }: ActionCenterProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">
          You have{" "}
          <a href="#" className="text-blue-600 hover:underline">
            {overdueCount} tenants overdue
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:underline">
            {maintenanceCount} new maintenance requests
          </a>
          .
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
