import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaintenanceRequest {
  id: string;
  property_manager_id: string;
  request_type: string;
  title: string;
  description: string;
  property_address: string;
  unit_number?: string;
  tenant_name: string;
  tenant_email?: string;
  priority: string;
}

interface WorkflowRule {
  id: string;
  user_id: string;
  trigger_type: string;
  trigger_conditions: any;
  action_type: string;
  action_details: any;
  is_active: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Maintenance workflow trigger started');
    
    const payload = await req.json();
    console.log('Received payload:', JSON.stringify(payload, null, 2));

    // Extract the new maintenance request from the webhook payload
    const maintenanceRequest: MaintenanceRequest = payload.record;
    
    if (!maintenanceRequest) {
      console.error('No maintenance request found in payload');
      return new Response(JSON.stringify({ error: 'No maintenance request in payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing maintenance request:', maintenanceRequest.id);

    // Get the property manager's user_id
    const { data: propertyManager, error: pmError } = await supabase
      .from('property_managers')
      .select('user_id')
      .eq('id', maintenanceRequest.property_manager_id)
      .maybeSingle();

    if (pmError) {
      console.error('Error fetching property manager:', pmError);
      throw pmError;
    }

    if (!propertyManager) {
      console.log('Property manager not found for ID:', maintenanceRequest.property_manager_id);
      return new Response(JSON.stringify({ message: 'Property manager not found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Property manager user_id:', propertyManager.user_id);

    // Query for matching workflow rules
    const { data: workflows, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', propertyManager.user_id)
      .eq('trigger_type', 'new_maintenance_request')
      .eq('is_active', true);

    if (workflowError) {
      console.error('Error fetching workflows:', workflowError);
      throw workflowError;
    }

    console.log(`Found ${workflows?.length || 0} active workflows for user`);

    if (!workflows || workflows.length === 0) {
      console.log('No active workflows found for this user');
      return new Response(JSON.stringify({ message: 'No active workflows found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check each workflow for matching conditions
    for (const workflow of workflows) {
      console.log('Checking workflow:', workflow.id);
      
      const triggerConditions = workflow.trigger_conditions || {};
      let isMatch = true;

      // Check if the request type/category matches the workflow conditions
      if (triggerConditions.category && triggerConditions.category !== maintenanceRequest.request_type) {
        console.log(`Category mismatch: expected ${triggerConditions.category}, got ${maintenanceRequest.request_type}`);
        isMatch = false;
      }

      // Check priority if specified in conditions
      if (triggerConditions.priority && triggerConditions.priority !== maintenanceRequest.priority) {
        console.log(`Priority mismatch: expected ${triggerConditions.priority}, got ${maintenanceRequest.priority}`);
        isMatch = false;
      }

      if (!isMatch) {
        console.log('Workflow conditions not met, skipping');
        continue;
      }

      console.log('Workflow conditions matched, executing action');

      // Execute the action
      if (workflow.action_type === 'send_email_to_vendor') {
        await executeEmailAction(workflow, maintenanceRequest);
      } else {
        console.log('Unknown action type:', workflow.action_type);
      }
    }

    return new Response(JSON.stringify({ message: 'Workflows processed successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in maintenance-workflow-trigger:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

async function executeEmailAction(workflow: WorkflowRule, maintenanceRequest: MaintenanceRequest) {
  try {
    const actionDetails = workflow.action_details || {};
    const vendorEmail = actionDetails.vendor_email;

    if (!vendorEmail) {
      console.error('No vendor email specified in workflow action details');
      return;
    }

    console.log('Sending email to vendor:', vendorEmail);

    // Create email content
    const subject = `New Maintenance Request: ${maintenanceRequest.title}`;
    const emailContent = `
      <h2>New Maintenance Request</h2>
      <p><strong>Property:</strong> ${maintenanceRequest.property_address}</p>
      ${maintenanceRequest.unit_number ? `<p><strong>Unit:</strong> ${maintenanceRequest.unit_number}</p>` : ''}
      <p><strong>Request Type:</strong> ${maintenanceRequest.request_type}</p>
      <p><strong>Priority:</strong> ${maintenanceRequest.priority}</p>
      <p><strong>Title:</strong> ${maintenanceRequest.title}</p>
      <p><strong>Description:</strong> ${maintenanceRequest.description}</p>
      <p><strong>Tenant:</strong> ${maintenanceRequest.tenant_name}</p>
      ${maintenanceRequest.tenant_email ? `<p><strong>Tenant Email:</strong> ${maintenanceRequest.tenant_email}</p>` : ''}
      
      <hr>
      <p><em>This email was sent automatically by your property management workflow system.</em></p>
    `;

    const emailResponse = await resend.emails.send({
      from: "Property Management <onboarding@resend.dev>",
      to: [vendorEmail],
      subject: subject,
      html: emailContent,
    });

    console.log('Email sent successfully:', emailResponse);

    // Log the action execution (optional - you could create a workflow_executions table)
    console.log(`Workflow ${workflow.id} executed: email sent to ${vendorEmail}`);

  } catch (error) {
    console.error('Error executing email action:', error);
    throw error;
  }
}

serve(handler);