import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Upload, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ConfigCard() {
  const [email, setEmail] = useState("manager@example.com");
  const [color, setColor] = useState("#ff6b35");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast({
      title: "Settings saved!",
      description: "Your configuration has been updated successfully.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Logo uploaded!",
        description: `${file.name} has been uploaded successfully.`,
      });
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
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save"}
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
                className="hidden"
                id="logo-upload"
              />
              <Button
                onClick={() => document.getElementById('logo-upload')?.click()}
                variant="outline"
                className="w-full justify-start"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
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