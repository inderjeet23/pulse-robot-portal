import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  Home,
  Wrench,
  DollarSign,
  Users,
  Settings,
  Plus,
  Search,
  UserPlus,
  HelpCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Tenant {
  id: string;
  name: string;
  property_address: string;
  unit_number: string | null;
}

interface GlobalCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewMaintenanceRequest: () => void;
}

export function GlobalCommandPalette({ 
  open, 
  onOpenChange, 
  onNewMaintenanceRequest 
}: GlobalCommandPaletteProps) {
  const navigate = useNavigate();
  const { propertyManager } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch tenants when dialog opens
  useEffect(() => {
    if (open && propertyManager?.id) {
      fetchTenants();
    }
  }, [open, propertyManager?.id]);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, property_address, unit_number')
        .eq('property_manager_id', propertyManager!.id)
        .order('name');

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommand = (command: string, value?: string) => {
    onOpenChange(false);
    
    switch (command) {
      case 'navigate':
        navigate(value!);
        break;
      case 'new-maintenance':
        onNewMaintenanceRequest();
        break;
      case 'tenant':
        // Navigate to tenant details (we'll need to create this page)
        navigate(`/tenants?tenant=${value}`);
        break;
    }
  };

  const navigationItems = [
    { label: "Go to Dashboard", value: "/", icon: Home },
    { label: "Go to Maintenance", value: "/maintenance", icon: Wrench },
    { label: "Go to Rent Management", value: "/rent", icon: DollarSign },
    { label: "Go to Tenants", value: "/tenants", icon: Users },
    { label: "Go to Setup", value: "/setup", icon: Settings },
    { label: "Go to FAQ", value: "/faq", icon: HelpCircle },
  ];

  const actionItems = [
    { label: "New Maintenance Request", command: "new-maintenance", icon: Plus },
    { label: "Add New Tenant", value: "/tenants?new=true", icon: UserPlus },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search tenants..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.value}
                onSelect={() => handleCommand('navigate', item.value)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {actionItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.command || item.value}
                onSelect={() => 
                  item.command 
                    ? handleCommand(item.command) 
                    : handleCommand('navigate', item.value)
                }
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Find Tenant">
          {loading ? (
            <CommandItem disabled>
              <Search className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading tenants...</span>
            </CommandItem>
          ) : (
            tenants.map((tenant) => (
              <CommandItem
                key={tenant.id}
                onSelect={() => handleCommand('tenant', tenant.id)}
              >
                <Users className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{tenant.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tenant.property_address}
                    {tenant.unit_number && ` - Unit ${tenant.unit_number}`}
                  </span>
                </div>
              </CommandItem>
            ))
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}