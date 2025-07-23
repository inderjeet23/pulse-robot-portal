import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WelcomeModalProps {
  open: boolean;
  onSetupProperty: () => void;
}

export function WelcomeModal({ open, onSetupProperty }: WelcomeModalProps) {
  const handleExploreDemo = () => {
    console.log("Explore Demo clicked - placeholder functionality");
  };

  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to Pulse Robot!
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Let's get your properties set up in minutes.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={onSetupProperty} 
            className="w-full"
            size="lg"
          >
            Set Up My Property
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExploreDemo}
            className="w-full"
            size="lg"
          >
            Explore a Demo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}