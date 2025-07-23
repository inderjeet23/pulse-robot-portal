import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Search, User } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const { signOut } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="flex h-14 items-center px-4">
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-lg font-semibold">{title}</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCommandOpen(true)}
                className="relative w-40 justify-start text-sm text-muted-foreground"
              >
                <Search className="mr-2 h-4 w-4" />
                Search...
              </Button>
              
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={() => signOut()}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem>Dashboard</CommandItem>
            <CommandItem>Maintenance Requests</CommandItem>
            <CommandItem>Rent Management</CommandItem>
            <CommandItem>Tenants</CommandItem>
            <CommandItem>Setup & Config</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};