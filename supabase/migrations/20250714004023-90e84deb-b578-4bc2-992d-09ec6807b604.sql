-- Create property_managers table
CREATE TABLE public.property_managers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  routing_email TEXT,
  brand_color TEXT NOT NULL DEFAULT '#ff6b35',
  logo_url TEXT,
  bot_id TEXT NOT NULL UNIQUE DEFAULT 'bot_' || generate_random_string(12),
  hosted_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.property_managers ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own property manager profile" 
ON public.property_managers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own property manager profile" 
ON public.property_managers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own property manager profile" 
ON public.property_managers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own property manager profile" 
ON public.property_managers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to generate random string
CREATE OR REPLACE FUNCTION generate_random_string(length INTEGER)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

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

-- Create function to generate hosted link
CREATE OR REPLACE FUNCTION generate_hosted_link()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hosted_link IS NULL OR NEW.hosted_link = '' THEN
    NEW.hosted_link = 'https://pulse-robot.com/chat/' || NEW.bot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic hosted link generation
CREATE TRIGGER generate_property_manager_hosted_link
BEFORE INSERT OR UPDATE ON public.property_managers
FOR EACH ROW
EXECUTE FUNCTION generate_hosted_link();

-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('property-logos', 'property-logos', true);

-- Create policies for logo uploads
CREATE POLICY "Users can view all logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'property-logos');

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