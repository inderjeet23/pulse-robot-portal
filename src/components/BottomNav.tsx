import { NavLink } from "react-router-dom";
import { LayoutDashboard, Wrench, DollarSign, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <nav className="bg-background/80 backdrop-blur-lg border border-border/20 rounded-full shadow-lg px-2 py-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center px-3 py-2 rounded-full transition-all duration-200 min-w-0 flex-1",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("h-5 w-5 mb-1", isActive && "scale-110")} />
                  <span className="text-xs font-medium leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};