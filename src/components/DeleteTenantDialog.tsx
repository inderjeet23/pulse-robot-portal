import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Tenant {
  id: string;
  name: string;
  property_address: string;
  unit_number: string | null;
}

interface DeleteTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  onSuccess: () => void;
}

export function DeleteTenantDialog({
  open,
  onOpenChange,
  tenant,
  onSuccess,
}: DeleteTenantDialogProps) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!tenant?.id) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("tenants")
        .delete()
        .eq("id", tenant.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant deleted successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast({
        title: "Error",
        description: "Failed to delete tenant",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{tenant?.name}</span>?
              </p>
              {tenant && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  <p className="font-medium">Tenant Details:</p>
                  <p>• Name: {tenant.name}</p>
                  <p>• Property: {tenant.property_address}</p>
                  {tenant.unit_number && <p>• Unit: {tenant.unit_number}</p>}
                </div>
              )}
              <p className="text-destructive font-medium">
                Warning: This action cannot be undone. All associated rent records will also be deleted.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete Tenant
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}