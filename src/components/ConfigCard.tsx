import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Upload, Palette, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function ConfigCard() {
  const { toast } = useToast();
  const { propertyManager, updatePropertyManager, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [color, setColor] = useState("#ff6b35");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (propertyManager) {
      setEmail(propertyManager.routing_email || "");
      setColor(propertyManager.brand_color);
    }
  }, [propertyManager]);

  if (authLoading || !propertyManager) {
    return (
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    
    const { error } = await updatePropertyManager({
      routing_email: email,
      brand_color: color,
    });
    
    setSaving(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !propertyManager) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyManager.user_id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property-logos')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('property-logos')
        .getPublicUrl(fileName);

      await updatePropertyManager({
        logo_url: urlData.publicUrl,
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Configuration */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Where should tenant maintenance requests be sent?
          </Label>
          <div className="flex space-x-2">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@example.com"
              className="flex-1"
            />
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="shadow-button"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Branding Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Branding options (optional):</h3>
          
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Upload your logo:
            </Label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="logo-upload"
              />
              <Button
                onClick={() => document.getElementById('logo-upload')?.click()}
                variant="outline"
                className="w-full justify-start"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
            </div>
            {propertyManager.logo_url && (
              <div className="mt-4">
                <Label className="text-sm font-medium text-foreground">Current Logo:</Label>
                <div className="mt-2 p-2 border rounded-md bg-accent/10">
                  <img 
                    src={propertyManager.logo_url} 
                    alt="Current logo"
                    className="max-h-20 max-w-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label htmlFor="color" className="text-sm font-medium text-foreground">
              Choose your assistant's primary color:
            </Label>
            <div className="flex items-center space-x-3">
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 rounded-lg border-2 border-border cursor-pointer"
              />
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Palette className="w-4 h-4" />
                <span>{color}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}