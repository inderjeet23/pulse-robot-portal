
import { NavLink, useLocation } from "react-router-dom";
import { MoreHorizontal, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { mainNavigation, analyticsNavigation, systemNavigation } from "@/config/navigation";

export function TopNav() {
  const location = useLocation();
  const getNavButtonClass = (isActive: boolean) =>
    cn(
      "h-10 px-4 py-2 transition-colors",
      isActive
        ? "bg-primary text-primary-foreground hover:bg-primary/90"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    );

  const allSecondaryNavigation = [...analyticsNavigation, ...systemNavigation];
  const isSecondaryActive = allSecondaryNavigation.some(
    (item) => item.url === location.pathname
  );

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          {/* Mobile Nav Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-6">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Main Navigation */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Main</h3>
                  <div className="space-y-1">
                    {mainNavigation.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <NavLink
                          key={item.title}
                          to={item.url}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-accent text-accent-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {item.title}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>

                {/* Business Intelligence */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Business Intelligence</h3>
                  <div className="space-y-1">
                    {analyticsNavigation.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <NavLink
                          key={item.title}
                          to={item.url}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-accent text-accent-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {item.title}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>

                {/* System & Support */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">System & Support</h3>
                  <div className="space-y-1">
                    {systemNavigation.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <NavLink
                          key={item.title}
                          to={item.url}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-accent text-accent-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {item.title}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Primary Navigation */}
            {mainNavigation.map((item) => {
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
              <DropdownMenuContent
                align="start"
                className="w-48 bg-background border shadow-lg"
              >
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                  Business Intelligence
                </div>
                {analyticsNavigation.map((item) => (
                  <DropdownMenuItem key={item.title} asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center px-2 py-1.5 text-sm cursor-pointer",
                          isActive && "bg-accent text-accent-foreground"
                        )
                      }
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.title}
                    </NavLink>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                  System & Support
                </div>
                {systemNavigation.map((item) => (
                  <DropdownMenuItem key={item.title} asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center px-2 py-1.5 text-sm cursor-pointer",
                          isActive && "bg-accent text-accent-foreground"
                        )
                      }
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.title}
                    </NavLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
