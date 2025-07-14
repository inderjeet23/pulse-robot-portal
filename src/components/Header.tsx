import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

export function Header() {
  const { signOut } = useAuth();

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">*</span>
          </div>
          <span className="text-xl font-bold text-foreground">Pulse Robot</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-foreground hover:text-primary transition-colors">
            Dashboard
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Setup Guide
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            FAQ
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Support
          </a>
        </nav>

        {/* Log Out Button */}
        <Button variant="outline" size="sm" className="gap-2" onClick={signOut}>
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log Out</span>
        </Button>
      </div>
    </header>
  );
}