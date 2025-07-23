-- Add onboarding tracking column to property_managers table
ALTER TABLE public.property_managers 
ADD COLUMN has_completed_onboarding BOOLEAN NOT NULL DEFAULT false;

-- Create properties table for multi-property support
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_manager_id UUID NOT NULL,
  address TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on properties table
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policies for properties table
CREATE POLICY "Property managers can view their own properties" 
ON public.properties 
FOR SELECT 
USING (property_manager_id IN (
  SELECT property_managers.id
  FROM property_managers
  WHERE property_managers.user_id = auth.uid()
));

CREATE POLICY "Property managers can create their own properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (property_manager_id IN (
  SELECT property_managers.id
  FROM property_managers
  WHERE property_managers.user_id = auth.uid()
));

CREATE POLICY "Property managers can update their own properties" 
ON public.properties 
FOR UPDATE 
USING (property_manager_id IN (
  SELECT property_managers.id
  FROM property_managers
  WHERE property_managers.user_id = auth.uid()
));

CREATE POLICY "Property managers can delete their own properties" 
ON public.properties 
FOR DELETE 
USING (property_manager_id IN (
  SELECT property_managers.id
  FROM property_managers
  WHERE property_managers.user_id = auth.uid()
));

-- Add trigger for updating properties updated_at
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();