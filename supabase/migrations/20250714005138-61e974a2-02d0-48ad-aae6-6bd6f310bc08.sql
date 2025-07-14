-- Create maintenance requests table
CREATE TABLE public.maintenance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_manager_id UUID NOT NULL,
  tenant_name TEXT NOT NULL,
  tenant_email TEXT,
  tenant_phone TEXT,
  property_address TEXT NOT NULL,
  unit_number TEXT,
  request_type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Completed', 'Cancelled')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to TEXT, -- Contractor or maintenance person
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for maintenance requests
CREATE POLICY "Property managers can view their own requests" 
ON public.maintenance_requests 
FOR SELECT 
USING (property_manager_id IN (
  SELECT id FROM public.property_managers WHERE user_id = auth.uid()
));

CREATE POLICY "Property managers can create requests" 
ON public.maintenance_requests 
FOR INSERT 
WITH CHECK (property_manager_id IN (
  SELECT id FROM public.property_managers WHERE user_id = auth.uid()
));

CREATE POLICY "Property managers can update their own requests" 
ON public.maintenance_requests 
FOR UPDATE 
USING (property_manager_id IN (
  SELECT id FROM public.property_managers WHERE user_id = auth.uid()
));

CREATE POLICY "Property managers can delete their own requests" 
ON public.maintenance_requests 
FOR DELETE 
USING (property_manager_id IN (
  SELECT id FROM public.property_managers WHERE user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_maintenance_requests_updated_at
BEFORE UPDATE ON public.maintenance_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update completed_at when status changes to completed
CREATE OR REPLACE FUNCTION public.update_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
    NEW.completed_at = now();
  ELSIF NEW.status != 'Completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for completed_at updates
CREATE TRIGGER update_maintenance_requests_completed_at
BEFORE UPDATE ON public.maintenance_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_completed_at();