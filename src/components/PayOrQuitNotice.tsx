import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PayOrQuitNoticeProps {
  tenantId: string;
  rentRecordId: string;
  amountOwed: number;
  daysToQuit: number;
  onNoticeGenerated?: () => void;
}

export const PayOrQuitNotice = ({
  tenantId,
  rentRecordId,
  amountOwed,
  daysToQuit,
  onNoticeGenerated
}: PayOrQuitNoticeProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [notice, setNotice] = useState<any>(null);
  const { toast } = useToast();

  const generateNotice = async () => {
    setIsGenerating(true);
    try {
      // Get property manager and tenant details
      const { data: propertyManager } = await supabase
        .from('property_managers')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (!propertyManager || !tenant) {
        throw new Error('Failed to fetch required data');
      }

      // Create legal notice record
      const { data: legalNotice, error } = await supabase
        .from('legal_notices')
        .insert({
          tenant_id: tenantId,
          rent_record_id: rentRecordId,
          property_manager_id: propertyManager.id,
          notice_type: 'pay_or_quit',
          state: 'CA', // Default to CA, can be made configurable
          amount_owed: amountOwed,
          days_to_pay: daysToQuit,
          generated_date: new Date().toISOString().split('T')[0],
          status: 'generated'
        })
        .select()
        .single();

      if (error) throw error;

      setNotice({ ...legalNotice, tenant, propertyManager });
      toast({
        title: "Notice Generated",
        description: "Pay or quit notice has been generated successfully."
      });
      onNoticeGenerated?.();
    } catch (error) {
      console.error('Error generating notice:', error);
      toast({
        title: "Error",
        description: "Failed to generate notice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = () => {
    if (!notice) return;
    
    const printContent = document.getElementById('notice-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Pay or Quit Notice</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                .notice-header { text-align: center; margin-bottom: 30px; }
                .notice-title { font-size: 24px; font-weight: bold; text-decoration: underline; }
                .notice-content { margin: 20px 0; }
                .signature-section { margin-top: 40px; }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!notice) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Pay or Quit Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Amount Owed: <span className="font-semibold">${amountOwed.toFixed(2)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Days to Pay or Quit: <span className="font-semibold">{daysToQuit} days</span>
              </p>
            </div>
            <Button onClick={generateNotice} disabled={isGenerating} className="w-full">
              {isGenerating ? "Generating..." : "Generate Notice"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline">Notice Generated</Badge>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={generatePDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button size="sm">
            <Send className="h-4 w-4 mr-2" />
            Send Notice
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div id="notice-content">
            <div className="notice-header text-center mb-8">
              <h1 className="notice-title text-2xl font-bold underline mb-4">
                THREE (3) DAY NOTICE TO PAY RENT OR QUIT
              </h1>
              <p className="text-sm text-muted-foreground">
                (California Civil Code Section 1161)
              </p>
            </div>

            <div className="notice-content space-y-4">
              <p>
                <strong>TO:</strong> {notice.tenant.name}
              </p>
              
              <p>
                <strong>AND ALL OTHER TENANTS, SUBTENANTS, AND OTHERS IN POSSESSION OF THE PREMISES LOCATED AT:</strong>
              </p>
              
              <p className="ml-4 font-semibold">
                {notice.tenant.property_address}
                {notice.tenant.unit_number && `, Unit ${notice.tenant.unit_number}`}
              </p>

              <p className="mt-6">
                <strong>PLEASE TAKE NOTICE</strong> that you are justly indebted to the undersigned in the sum of 
                <strong> ${notice.amount_owed}</strong> for rent of said premises now due and unpaid.
              </p>

              <p>
                <strong>YOU ARE HEREBY REQUIRED</strong> to pay said rent in full within {notice.days_to_pay} days 
                after service on you of this notice or quit and deliver up the possession of the above-described 
                premises to the undersigned, or legal proceedings will be instituted against you to recover 
                possession of said premises, to declare the forfeiture of the lease or rental agreement under 
                which you occupy said premises and to recover rents and damages, together with court costs and 
                attorney's fees.
              </p>

              <div className="signature-section mt-12">
                <p className="mb-8">
                  <strong>Date:</strong> {format(new Date(notice.generated_date), 'MMMM dd, yyyy')}
                </p>
                
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="border-b border-gray-400 mb-2 h-8"></div>
                    <p className="text-sm">Landlord/Agent Signature</p>
                  </div>
                  <div>
                    <p className="font-semibold">{notice.propertyManager.name}</p>
                    <p className="text-sm text-muted-foreground">Property Manager</p>
                  </div>
                </div>
              </div>

              <div className="footer mt-8 text-xs text-muted-foreground">
                <p>
                  <strong>NOTICE:</strong> The lease or rental agreement under which you occupy these premises 
                  may contain additional provisions regarding nonpayment of rent, including but not limited to 
                  provisions that may result in your eviction for nonpayment of rent in less than three days.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};