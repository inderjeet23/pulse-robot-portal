import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Wrench, DollarSign, Users, Settings, HelpCircle, BarChart3, FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const primaryNavigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Tenants",
    url: "/tenants",
    icon: Users,
  },
  {
    title: "Maintenance",
    url: "/maintenance",
    icon: Wrench,
  },
  {
    title: "Rent",
    url: "/rent",
    icon: DollarSign,
  },
];

const secondaryNavigation = [
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Reports",
    url: "/reports", 
    icon: FileText,
  },
  {
    title: "Setup & Config",
    url: "/setup",
    icon: Settings,
  },
  {
    title: "FAQ",
    url: "/faq",
    icon: HelpCircle,
  },
];

export function TopNav() {
  const location = useLocation();

  const getNavButtonClass = (isActive: boolean) =>
    cn(
      "h-10 px-4 py-2 transition-colors",
      isActive
        ? "bg-primary text-primary-foreground hover:bg-primary/90"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    );

  const isSecondaryActive = secondaryNavigation.some(item => item.url === location.pathname);

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1 py-2">
          {/* Primary Navigation */}
          {primaryNavigation.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Button
                key={item.title}
                variant="ghost"
                className={getNavButtonClass(isActive)}
                asChild
              >
                <NavLink to={item.url}>
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.title}
                </NavLink>
              </Button>
            );
          })}

          {/* More Dropdown for Secondary Navigation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={getNavButtonClass(isSecondaryActive)}
              >
                <MoreHorizontal className="w-4 h-4 mr-2" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-background border shadow-lg">
              <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                Business Intelligence
              </div>
              <DropdownMenuItem asChild>
                <NavLink
                  to="/analytics"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-2 py-1.5 text-sm cursor-pointer",
                      isActive && "bg-accent text-accent-foreground"
                    )
                  }
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink
                  to="/reports"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-2 py-1.5 text-sm cursor-pointer",
                      isActive && "bg-accent text-accent-foreground"
                    )
                  }
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Reports
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                System & Support
              </div>
              <DropdownMenuItem asChild>
                <NavLink
                  to="/setup"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-2 py-1.5 text-sm cursor-pointer",
                      isActive && "bg-accent text-accent-foreground"
                    )
                  }
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Setup & Config
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink
                  to="/faq"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-2 py-1.5 text-sm cursor-pointer",
                      isActive && "bg-accent text-accent-foreground"
                    )
                  }
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  FAQ
                </NavLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}