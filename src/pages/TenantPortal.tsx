import { TenantRequestForm } from "@/components/TenantRequestForm";

const TenantPortal = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Maintenance Request Portal
          </h1>
          <p className="text-lg text-white/80">
            Submit your maintenance request and we'll get back to you promptly
          </p>
        </div>
        
        <TenantRequestForm />
      </div>
    </div>
  );
};

export default TenantPortal;