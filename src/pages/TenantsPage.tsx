import { TenantManagement } from "@/components/TenantManagement";

const TenantsPage = () => {
  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Tenant Management</h1>
        <p className="text-muted-foreground text-sm md:text-base">Manage tenant information, leases, and contact details</p>
      </div>
      <TenantManagement />
    </div>
  );
};

export default TenantsPage;