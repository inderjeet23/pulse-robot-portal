import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface ComingSoonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

export function ComingSoonModal({ open, onOpenChange, feature = "This feature" }: ComingSoonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Coming Soon!</DialogTitle>
          <DialogDescription className="text-center">
            {feature} is currently under development. We're working hard to bring this to you soon.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          <Button onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}