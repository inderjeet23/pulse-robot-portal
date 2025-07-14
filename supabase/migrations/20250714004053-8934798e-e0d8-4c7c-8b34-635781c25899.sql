-- Create property_managers table
CREATE TABLE public.property_managers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  routing_email TEXT,
  brand_color TEXT NOT NULL DEFAULT '#ff6b35',
  logo_url TEXT,
  bot_id TEXT NOT NULL UNIQUE DEFAULT concat('bot_', substr(md5(random()::text), 1, 8)),
  hosted_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Generate hosted_link based on bot_id
UPDATE public.property_managers SET hosted_link = concat('https://pulse-robot.com/chat/', bot_id) WHERE hosted_link IS NULL;

-- Create function to auto-generate hosted_link
CREATE OR REPLACE FUNCTION public.generate_hosted_link()
RETURNS TRIGGER AS $$
BEGIN
  NEW.hosted_link = concat('https://pulse-robot.com/chat/', NEW.bot_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate hosted_link
CREATE TRIGGER generate_hosted_link_trigger
  BEFORE INSERT OR UPDATE ON public.property_managers
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_hosted_link();

-- Enable Row Level Security
ALTER TABLE public.property_managers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own property manager record" 
ON public.property_managers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own property manager record" 
ON public.property_managers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own property manager record" 
ON public.property_managers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own property manager record" 
ON public.property_managers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_property_managers_updated_at
  BEFORE UPDATE ON public.property_managers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for property logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-logos', 'property-logos', true);

-- Create storage policies for logo uploads
CREATE POLICY "Users can view their own logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'property-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'property-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'property-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'property-logos' AND auth.uid()::text = (storage.foldername(name))[1]);