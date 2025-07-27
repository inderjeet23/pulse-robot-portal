-- Create a webhook to trigger the maintenance workflow function when new maintenance requests are inserted
-- This uses pg_net extension to make HTTP requests

-- First, ensure pg_net extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to trigger the workflow
CREATE OR REPLACE FUNCTION trigger_maintenance_workflow()
RETURNS TRIGGER AS $$
BEGIN
  -- Make an HTTP request to the edge function
  PERFORM net.http_post(
    url := 'https://ijdpfmxedytpgwapvaph.supabase.co/functions/v1/maintenance-workflow-trigger',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZHBmbXhlZHl0cGd3YXB2YXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NDI5ODQsImV4cCI6MjA2ODAxODk4NH0.V43_-nKYIfGvQf7xQmcmIsBEr1t4CKAHICJRBSN5Knk"}'::jsonb,
    body := json_build_object(
      'type', 'INSERT',
      'table', 'maintenance_requests',
      'record', row_to_json(NEW),
      'old_record', NULL
    )::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on maintenance_requests table
CREATE TRIGGER maintenance_workflow_trigger
  AFTER INSERT ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_maintenance_workflow();