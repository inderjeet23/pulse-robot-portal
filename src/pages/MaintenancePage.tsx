import { RequestsOverview } from "@/components/RequestsOverview";
import { useOutletContext } from "react-router-dom";

interface OutletContext {
  newMaintenanceRequestOpen: boolean;
  setNewMaintenanceRequestOpen: (open: boolean) => void;
}

const MaintenancePage = () => {
  const context = useOutletContext<OutletContext>();

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Maintenance Requests</h1>
        <p className="text-muted-foreground text-sm md:text-base">Manage and track all maintenance requests from tenants</p>
      </div>
      <RequestsOverview 
        newRequestDialogOpen={context?.newMaintenanceRequestOpen}
        setNewRequestDialogOpen={context?.setNewMaintenanceRequestOpen}
      />
    </div>
  );
};

export default MaintenancePage;