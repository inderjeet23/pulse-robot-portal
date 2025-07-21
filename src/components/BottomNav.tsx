import { NavLink } from "react-router-dom";
import { LayoutDashboard, Wrench, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BottomNav = () => {
  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      to: "/",
    },
    {
      icon: Wrench,
      label: "Maintenance",
      to: "/maintenance",
    },
    {
      icon: DollarSign,
      label: "Rent",
      to: "/rent",
    },
    {
      icon: Users,
      label: "Tenants",
      to: "/tenants",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <nav className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-0 flex-1 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center justify-center h-12 w-full gap-1 p-1 ${
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium leading-none">{item.label}</span>
              </Button>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};