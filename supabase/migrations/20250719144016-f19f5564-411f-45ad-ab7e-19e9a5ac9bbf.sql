
-- Create tenants table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_manager_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  unit_number TEXT,
  property_address TEXT NOT NULL,
  rent_amount NUMERIC(10,2) NOT NULL,
  rent_due_date INTEGER NOT NULL DEFAULT 1, -- day of month (1-31)
  lease_start_date DATE,
  lease_end_date DATE,
  security_deposit NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rent_records table
CREATE TABLE public.rent_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  property_manager_id UUID NOT NULL,
  due_date DATE NOT NULL,
  amount_due NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  paid_date DATE,
  late_fees NUMERIC(10,2) DEFAULT 0,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rent_reminders table
CREATE TABLE public.rent_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rent_record_id UUID NOT NULL REFERENCES public.rent_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  property_manager_id UUID NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('pre_due', 'due_date', 'overdue')),
  sent_date TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN DEFAULT false,
  sms_sent BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create legal_notices table
CREATE TABLE public.legal_notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  rent_record_id UUID NOT NULL REFERENCES public.rent_records(id) ON DELETE CASCADE,
  property_manager_id UUID NOT NULL,
  notice_type TEXT NOT NULL DEFAULT 'pay_or_quit',
  state TEXT NOT NULL,
  amount_owed NUMERIC(10,2) NOT NULL,
  days_to_pay INTEGER NOT NULL DEFAULT 3,
  generated_date DATE NOT NULL DEFAULT CURRENT_DATE,
  served_date DATE,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'served', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property managers can view their own tenants"
  ON public.tenants FOR SELECT
  USING (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Property managers can create their own tenants"
  ON public.tenants FOR INSERT
  WITH CHECK (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Property managers can update their own tenants"
  ON public.tenants FOR UPDATE
  USING (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Property managers can delete their own tenants"
  ON public.tenants FOR DELETE
  USING (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

-- Add RLS policies for rent_records
ALTER TABLE public.rent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property managers can view their own rent records"
  ON public.rent_records FOR SELECT
  USING (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Property managers can create their own rent records"
  ON public.rent_records FOR INSERT
  WITH CHECK (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Property managers can update their own rent records"
  ON public.rent_records FOR UPDATE
  USING (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Property managers can delete their own rent records"
  ON public.rent_records FOR DELETE
  USING (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

-- Add RLS policies for rent_reminders
ALTER TABLE public.rent_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property managers can view their own rent reminders"
  ON public.rent_reminders FOR SELECT
  USING (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Property managers can create their own rent reminders"
  ON public.rent_reminders FOR INSERT
  WITH CHECK (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Property managers can update their own rent reminders"
  ON public.rent_reminders FOR UPDATE
  USING (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Property managers can delete their own rent reminders"
  ON public.rent_reminders FOR DELETE
  USING (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

-- Add RLS policies for legal_notices
ALTER TABLE public.legal_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property managers can view their own legal notices"
  ON public.legal_notices FOR SELECT
  USING (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Property managers can create their own legal notices"
  ON public.legal_notices FOR INSERT
  WITH CHECK (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Property managers can update their own legal notices"
  ON public.legal_notices FOR UPDATE
  USING (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Property managers can delete their own legal notices"
  ON public.legal_notices FOR DELETE
  USING (property_manager_id IN (
    SELECT id FROM property_managers WHERE user_id = auth.uid()
  ));

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rent_records_updated_at
  BEFORE UPDATE ON public.rent_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_notices_updated_at
  BEFORE UPDATE ON public.legal_notices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
