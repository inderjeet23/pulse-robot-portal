import { TenantManagement } from "@/components/TenantManagement";

const TenantsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tenant Management</h1>
        <p className="text-muted-foreground">Manage tenant information, leases, and contact details</p>
      </div>
      <TenantManagement />
    </div>
  );
};

export default TenantsPage;