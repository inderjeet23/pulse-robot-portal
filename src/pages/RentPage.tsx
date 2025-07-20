import { RentOverview } from "@/components/RentOverview";

const RentPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Rent Management</h1>
        <p className="text-muted-foreground">Track rent payments, overdue accounts, and send notices</p>
      </div>
      <RentOverview />
    </div>
  );
};

export default RentPage;