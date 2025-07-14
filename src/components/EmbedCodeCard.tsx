import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function EmbedCodeCard() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const embedCode = `<script>
  window.lovableSettings = { botId: 'YOUR-BOT-ID' };
</script>
<script src="https://cdn.lovable.ai/widget.js" async></script>`;

  const hostedLink = "https://pulserobot.ai/your-assistant-link";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const openHostedLink = () => {
    window.open(hostedLink, '_blank');
  };

  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Widget Embed Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Embed Code */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Widget embed code:
          </label>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code className="text-muted-foreground">{embedCode}</code>
            </pre>
            <Button
              onClick={copyToClipboard}
              size="sm"
              className="absolute top-2 right-2 shadow-button"
              disabled={copied}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Hosted Link */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Your standalone hosted link:
          </label>
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm text-muted-foreground break-all">
              {hostedLink}
            </code>
            <Button
              onClick={openHostedLink}
              size="sm"
              variant="outline"
              className="shrink-0"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}