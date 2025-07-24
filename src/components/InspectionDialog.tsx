import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Home } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InspectionDialogProps {
  children: React.ReactNode;
  onInspectionScheduled?: () => void;
}

export const InspectionDialog = ({ children, onInspectionScheduled }: InspectionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    property_address: "",
    unit_number: "",
    tenant_name: "",
    tenant_email: "",
    tenant_phone: "",
    inspection_type: "",
    purpose: "",
    notes: ""
  });
  
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const scheduleInspection = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for the inspection.",
        variant: "destructive"
      });
      return;
    }

    setIsScheduling(true);
    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      // TODO: Integrate with inspections table once migration is approved
      console.log('Inspection scheduled:', {
        property_address: formData.property_address,
        unit_number: formData.unit_number,
        tenant_name: formData.tenant_name,
        inspection_type: formData.inspection_type,
        scheduled_date: scheduledDateTime.toISOString(),
        purpose: formData.purpose
      });

      toast({
        title: "Inspection Scheduled",
        description: `Inspection scheduled for ${format(scheduledDateTime, 'PPP')} at ${selectedTime}.`
      });

      // Reset form
      setFormData({
        property_address: "",
        unit_number: "",
        tenant_name: "",
        tenant_email: "",
        tenant_phone: "",
        inspection_type: "",
        purpose: "",
        notes: ""
      });
      setSelectedDate(undefined);
      setSelectedTime("");
      setOpen(false);
      onInspectionScheduled?.();
    } catch (error) {
      console.error('Error scheduling inspection:', error);
      toast({
        title: "Error",
        description: "Failed to schedule inspection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Schedule Property Inspection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Property Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_address">Property Address *</Label>
                <Input
                  id="property_address"
                  value={formData.property_address}
                  onChange={(e) => handleInputChange("property_address", e.target.value)}
                  placeholder="Enter property address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_number">Unit Number</Label>
                <Input
                  id="unit_number"
                  value={formData.unit_number}
                  onChange={(e) => handleInputChange("unit_number", e.target.value)}
                  placeholder="e.g., Apt 101"
                />
              </div>
            </div>
          </div>

          {/* Tenant Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Tenant Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenant_name">Tenant Name *</Label>
                <Input
                  id="tenant_name"
                  value={formData.tenant_name}
                  onChange={(e) => handleInputChange("tenant_name", e.target.value)}
                  placeholder="Enter tenant name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant_email">Tenant Email</Label>
                <Input
                  id="tenant_email"
                  type="email"
                  value={formData.tenant_email}
                  onChange={(e) => handleInputChange("tenant_email", e.target.value)}
                  placeholder="tenant@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant_phone">Tenant Phone</Label>
                <Input
                  id="tenant_phone"
                  value={formData.tenant_phone}
                  onChange={(e) => handleInputChange("tenant_phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Inspection Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Inspection Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inspection_type">Inspection Type *</Label>
                <Select onValueChange={(value) => handleInputChange("inspection_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inspection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine Inspection</SelectItem>
                    <SelectItem value="move_in">Move-in Inspection</SelectItem>
                    <SelectItem value="move_out">Move-out Inspection</SelectItem>
                    <SelectItem value="maintenance">Maintenance Inspection</SelectItem>
                    <SelectItem value="annual">Annual Inspection</SelectItem>
                    <SelectItem value="complaint">Complaint Investigation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose *</Label>
                <Input
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                  placeholder="Brief purpose of inspection"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold">Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Inspection Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Inspection Time *</Label>
                <Select onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {selectedTime || "Select time"}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any special instructions or notes for the inspection..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={scheduleInspection} disabled={isScheduling}>
              {isScheduling ? "Scheduling..." : "Schedule Inspection"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};