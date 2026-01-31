import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { SystemSettingsService } from "@/shared/lib/hrm8/systemSettingsService";

export function GeneralSettingsTab() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        appName: "",
        supportEmail: "",
        primaryColor: "#0f172a",
        logoUrl: "",
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await SystemSettingsService.getAllSettings();
            setSettings({
                appName: data["branding.appName"] || "HRM8",
                supportEmail: data["branding.supportEmail"] || "",
                primaryColor: data["branding.primaryColor"] || "#0f172a",
                logoUrl: data["branding.logoUrl"] || "",
            });
        } catch (error) {
            toast.error("Failed to load settings");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await SystemSettingsService.bulkUpdateSettings([
                { key: "branding.appName", value: settings.appName, isPublic: true },
                { key: "branding.supportEmail", value: settings.supportEmail, isPublic: true },
                { key: "branding.primaryColor", value: settings.primaryColor, isPublic: true },
                { key: "branding.logoUrl", value: settings.logoUrl, isPublic: true },
            ]);
            toast.success("Branding settings saved successfully");
        } catch (error) {
            toast.error("Failed to save settings");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Platform Branding</CardTitle>
                    <CardDescription>
                        Customize the look and feel of your HRM8 platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="appName">Application Name</Label>
                            <Input
                                id="appName"
                                value={settings.appName}
                                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                                placeholder="e.g. HRM8 Enterprise"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supportEmail">Support Email</Label>
                            <Input
                                id="supportEmail"
                                value={settings.supportEmail}
                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                placeholder="support@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="primaryColor">Primary Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="primaryColor"
                                    type="color"
                                    className="w-12 p-1 h-10"
                                    value={settings.primaryColor}
                                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                />
                                <Input
                                    value={settings.primaryColor}
                                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="logoUrl">Logo URL (Public)</Label>
                            <Input
                                id="logoUrl"
                                value={settings.logoUrl}
                                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
