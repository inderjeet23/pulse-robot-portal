import { EnhancedRentOverview } from "@/components/EnhancedRentOverview";

const RentPage = () => {
  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Rent Management</h1>
        <p className="text-muted-foreground text-sm md:text-base">Track rent payments, overdue accounts, and send notices</p>
      </div>
      <EnhancedRentOverview />
    </div>
  );
};

export default RentPage;