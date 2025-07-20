import { RequestsOverview } from "@/components/RequestsOverview";

const MaintenancePage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Maintenance Requests</h1>
        <p className="text-muted-foreground">Manage and track all maintenance requests from tenants</p>
      </div>
      <RequestsOverview />
    </div>
  );
};

export default MaintenancePage;