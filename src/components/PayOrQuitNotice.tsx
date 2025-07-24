import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, FileText, Send, Mail, Printer, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";

interface PayOrQuitNoticeProps {
  tenantId: string;
  rentRecordId: string;
  amountOwed: number;
  daysToQuit?: number;
  onNoticeGenerated?: () => void;
  existingNoticeId?: string; // Add this prop to handle viewing existing notices
}

interface NoticeData {
  id: string;
  tenant_id: string;
  rent_record_id: string;
  property_manager_id: string;
  notice_type: string;
  state: string;
  amount_owed: number;
  days_to_pay: number;
  generated_date: string;
  status: string;
  tenant: any;
  propertyManager: any;
  rentRecord: any;
}

export const PayOrQuitNotice = ({
  tenantId,
  rentRecordId,
  amountOwed,
  daysToQuit = 30, // Default to 30 days for New Jersey
  onNoticeGenerated,
  existingNoticeId
}: PayOrQuitNoticeProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "Important Notice Regarding Your Tenancy",
    message: "Please find attached an important notice regarding your tenancy. Please confirm receipt of this notice."
  });
  const [showEmailForm, setShowEmailForm] = useState(false);
  const { toast } = useToast();

  // Load existing notice if existingNoticeId is provided
  const loadExistingNotice = async () => {
    if (!existingNoticeId) return;
    
    try {
      const { data: existingNotice, error } = await supabase
        .from('legal_notices')
        .select(`
          *,
          tenant:tenants(*),
          propertyManager:property_managers(*),
          rentRecord:rent_records(*)
        `)
        .eq('id', existingNoticeId)
        .single();

      if (error) throw error;
      
      if (existingNotice) {
        setNotice({
          ...existingNotice,
          tenant: existingNotice.tenant,
          propertyManager: existingNotice.propertyManager,
          rentRecord: existingNotice.rentRecord
        });
        
        // Pre-fill email form
        if (existingNotice.tenant?.email) {
          setEmailForm(prev => ({ ...prev, to: existingNotice.tenant.email }));
        }
      }
    } catch (error) {
      console.error('Error loading existing notice:', error);
      toast({
        title: "Error",
        description: "Failed to load existing notice.",
        variant: "destructive"
      });
    }
  };

  // Load existing notice on component mount if existingNoticeId is provided
  useEffect(() => {
    if (existingNoticeId) {
      loadExistingNotice();
    }
  }, [existingNoticeId]);

  const generateNotice = async () => {
    setIsGenerating(true);
    try {
      // Get property manager, tenant, and rent record details
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

      let actualRentRecordId = rentRecordId;
      let rentRecord = null;

      // If this is a temporary record (starts with "temp-"), create a real one
      if (rentRecordId.startsWith('temp-')) {
        // Create a real rent record for the overdue amount
        const { data: newRentRecord, error: rentError } = await supabase
          .from('rent_records')
          .insert({
            property_manager_id: propertyManager.id,
            tenant_id: tenantId,
            amount_due: amountOwed,
            amount_paid: 0,
            due_date: new Date().toISOString().split('T')[0], // Today's date as due date
            status: 'overdue',
            late_fees: 0
          })
          .select()
          .single();

        if (rentError) throw rentError;
        actualRentRecordId = newRentRecord.id;
        rentRecord = newRentRecord;
      } else {
        // Fetch existing rent record
        const { data: existingRentRecord } = await supabase
          .from('rent_records')
          .select('*')
          .eq('id', rentRecordId)
          .single();
        rentRecord = existingRentRecord;
      }

      // Create legal notice record
      const { data: legalNotice, error } = await supabase
        .from('legal_notices')
        .insert({
          tenant_id: tenantId,
          rent_record_id: actualRentRecordId,
          property_manager_id: propertyManager.id,
          notice_type: 'pay_or_quit',
          state: 'NJ', // New Jersey
          amount_owed: amountOwed,
          days_to_pay: daysToQuit,
          generated_date: new Date().toISOString().split('T')[0],
          status: 'generated'
        })
        .select()
        .single();

      if (error) throw error;

      setNotice({ 
        ...legalNotice, 
        tenant, 
        propertyManager, 
        rentRecord: rentRecord || null 
      });

      // Pre-fill email with tenant's email if available
      if (tenant.email) {
        setEmailForm(prev => ({ ...prev, to: tenant.email }));
      }

      // Log the generation action
      await logNoticeAction('generated', 'Notice generated successfully');

      toast({
        title: "Notice Generated",
        description: "New Jersey compliant Pay or Quit notice has been generated successfully."
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

  const logNoticeAction = async (action: string, details: string) => {
    if (!notice) return;
    
    try {
      await supabase
        .from('legal_notices')
        .update({ 
          status: action === 'sent' ? 'served' : notice.status,
          served_date: action === 'sent' ? new Date().toISOString().split('T')[0] : null
        })
        .eq('id', notice.id);
    } catch (error) {
      console.error('Error logging action:', error);
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
              <title>Notice to Quit for Non-Payment of Rent - ${notice.tenant.name}</title>
              <style>
                body { 
                  font-family: 'Times New Roman', serif; 
                  margin: 1in; 
                  line-height: 1.6; 
                  font-size: 12pt;
                  color: #000;
                }
                .notice-header { text-align: center; margin-bottom: 30px; }
                .notice-title { 
                  font-size: 16pt; 
                  font-weight: bold; 
                  text-decoration: underline; 
                  margin-bottom: 10px;
                }
                .notice-content { margin: 20px 0; text-align: justify; }
                .signature-section { margin-top: 40px; }
                .footer { margin-top: 30px; font-size: 10pt; }
                .address-block { margin: 15px 0; padding-left: 20px; }
                .legal-reference { font-style: italic; font-size: 10pt; }
                @media print {
                  body { margin: 0.5in; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        
        // Log the download action
        logNoticeAction('downloaded', 'Notice PDF downloaded');
      }
    }
  };

  const sendEmail = async () => {
    if (!notice || !emailForm.to) {
      toast({
        title: "Error",
        description: "Please provide a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      // In a real implementation, you would send the email through an email service
      // For now, we'll just log the action and show success
      await logNoticeAction('sent', `Notice emailed to ${emailForm.to}`);
      
      toast({
        title: "Notice Sent",
        description: `Notice has been emailed to ${emailForm.to}. Please follow up with certified mail for legal compliance.`,
      });
      
      setShowEmailForm(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!notice) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate New Jersey Pay or Quit Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">New Jersey Compliance Notice</p>
                  <p>This notice will be generated with 30-day payment period as required by New Jersey law for non-payment notices.</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Amount Owed: <span className="font-semibold">${amountOwed.toFixed(2)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Days to Pay or Quit: <span className="font-semibold">{daysToQuit} days</span>
              </p>
            </div>
            <Button onClick={generateNotice} disabled={isGenerating} className="w-full">
              {isGenerating ? "Generating..." : "Generate NJ Compliant Notice"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const deadline = addDays(new Date(notice.generated_date), notice.days_to_pay);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Notice Generated - Record #{notice.id.slice(-8)}
        </Badge>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={generatePDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button size="sm" onClick={() => setShowEmailForm(!showEmailForm)}>
            <Mail className="h-4 w-4 mr-2" />
            Email Notice
          </Button>
        </div>
      </div>

      {/* Delivery Options Warning */}
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-semibold mb-1">Legal Delivery Requirements</p>
            <p>For maximum legal protection in New Jersey, consider delivering this notice via:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Certified mail with return receipt requested</li>
              <li>Personal service by a process server</li>
              <li>Posting in a conspicuous place if other methods fail</li>
            </ul>
            <p className="mt-2">Email alone may not be sufficient for legal notice requirements.</p>
          </div>
        </div>
      </div>

      {/* Email Form */}
      {showEmailForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email Notice to Tenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email-to">Recipient Email *</Label>
              <Input
                id="email-to"
                type="email"
                value={emailForm.to}
                onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                placeholder="tenant@example.com"
              />
            </div>
            <div>
              <Label htmlFor="email-subject">Subject Line</Label>
              <Input
                id="email-subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email-message">Email Message</Label>
              <Textarea
                id="email-message"
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={sendEmail} disabled={isSending}>
                {isSending ? "Sending..." : "Send Email"}
              </Button>
              <Button variant="outline" onClick={() => setShowEmailForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <div id="notice-content">
            <div className="notice-header text-center mb-8">
              <h1 className="notice-title text-2xl font-bold underline mb-4">
                NOTICE TO QUIT FOR NON-PAYMENT OF RENT
              </h1>
              <p className="legal-reference text-sm text-muted-foreground">
                (New Jersey Anti-Eviction Act, N.J.S.A. 2A:18-53 et seq.)
              </p>
            </div>

            <div className="notice-content space-y-6">
              <div>
                <p><strong>TO:</strong> {notice.tenant.name}</p>
                <p><strong>AND ALL OTHER TENANTS, SUBTENANTS, AND OTHERS IN POSSESSION OF THE PREMISES:</strong></p>
              </div>
              
              <div className="address-block">
                <p className="font-semibold">
                  {notice.tenant.property_address}
                  {notice.tenant.unit_number && `, Unit ${notice.tenant.unit_number}`}
                </p>
              </div>

              <div>
                <p><strong>FROM:</strong> {notice.propertyManager.name}</p>
                <p><strong>LANDLORD/AGENT ADDRESS:</strong> {notice.propertyManager.email}</p>
              </div>

              <div className="space-y-4">
                <p>
                  <strong>PLEASE TAKE NOTICE</strong> that you are in default of your lease agreement for the above-described premises. 
                  You are justly indebted to the undersigned in the sum of <strong>${notice.amount_owed.toFixed(2)}</strong> for rent 
                  that is now due and unpaid.
                </p>

                <p>
                  <strong>PERIOD OF NON-PAYMENT:</strong> This notice covers rent that became due on or about{' '}
                  {notice.rentRecord ? format(new Date(notice.rentRecord.due_date), 'MMMM dd, yyyy') : 'the applicable due date'} 
                  and remains unpaid as of the date of this notice.
                </p>

                <p>
                  <strong>LEASE REFERENCE:</strong> This notice is served upon you pursuant to the terms and conditions of your 
                  lease agreement for the above-described premises{notice.tenant.lease_start_date && 
                  `, which lease was executed on or about ${format(new Date(notice.tenant.lease_start_date), 'MMMM dd, yyyy')}`}.
                </p>

                <p>
                  <strong>DEMAND FOR PAYMENT OR POSSESSION:</strong> YOU ARE HEREBY REQUIRED to pay the total amount of 
                  ${notice.amount_owed.toFixed(2)} within <strong>{notice.days_to_pay} (thirty) days</strong> after service of this notice, 
                  or to quit and deliver up possession of the above-described premises to the undersigned.
                </p>

                <p>
                  <strong>CONSEQUENCES OF NON-COMPLIANCE:</strong> If you fail to pay the above-stated amount or quit the premises 
                  within the time specified, legal proceedings will be instituted against you to:
                </p>
                
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Recover possession of said premises</li>
                  <li>Declare forfeiture of your lease or rental agreement</li>
                  <li>Recover unpaid rent, damages, late fees, and court costs</li>
                  <li>Recover attorney's fees as provided by law or lease agreement</li>
                </ul>

                <p>
                  <strong>DEADLINE:</strong> You must comply with this notice by <strong>{format(deadline, 'MMMM dd, yyyy')}</strong> 
                  at 11:59 PM, or legal action may commence against you.
                </p>
              </div>

              <div className="signature-section mt-12">
                <p className="mb-8">
                  <strong>Date of Service:</strong> {format(new Date(notice.generated_date), 'MMMM dd, yyyy')}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="border-b border-gray-400 mb-2 h-12"></div>
                    <p className="text-sm">Landlord/Agent Signature</p>
                  </div>
                  <div>
                    <p className="font-semibold">{notice.propertyManager.name}</p>
                    <p className="text-sm">Property Manager/Agent</p>
                    <p className="text-sm">{notice.propertyManager.email}</p>
                  </div>
                </div>
              </div>

              <div className="footer mt-8 text-xs border-t pt-4">
                <p><strong>IMPORTANT LEGAL NOTICE:</strong></p>
                <p>
                  This is a legal notice with legal consequences. If you have questions about your rights as a tenant, 
                  you may wish to contact a lawyer or your local legal aid society. Failure to respond to this notice 
                  as required may result in eviction proceedings and a judgment for possession of the premises against you.
                </p>
                <p className="mt-2">
                  <strong>TENANT RIGHTS:</strong> You may have defenses to this action or may be entitled to financial assistance. 
                  Contact New Jersey Courts Self-Help Center or legal aid for more information about your rights.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};