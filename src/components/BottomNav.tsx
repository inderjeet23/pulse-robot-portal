import { NavLink } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNavigation } from "@/config/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";

export const BottomNav = () => {
  const primaryNavItems = mainNavigation.slice(0, 4);
  const secondaryNavItems = mainNavigation.slice(4);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <nav className="bg-background/80 backdrop-blur-lg border border-border/20 rounded-full shadow-lg px-2 py-3">
        <div className="flex items-center justify-around">
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
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
                  <span className="text-xs font-medium leading-none">{item.title}</span>
                </>
              )}
            </NavLink>
          ))}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>More Options</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                {secondaryNavItems.map((item) => (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center p-2 rounded-md",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted/50"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.title}</span>
                  </NavLink>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
};
