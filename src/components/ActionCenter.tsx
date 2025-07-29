import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface ActionCenterProps {
  overdueCount: number;
  maintenanceCount: number;
}

export function ActionCenter({ overdueCount, maintenanceCount }: ActionCenterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          You have <a href="#" className="font-bold text-red-500">{overdueCount} tenants overdue</a> and <a href="#" className="font-bold text-blue-500">{maintenanceCount} new maintenance requests</a>.
        </CardTitle>
      </CardHeader>
    </Card>
  );
}