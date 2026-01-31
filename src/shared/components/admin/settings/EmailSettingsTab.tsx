import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { SystemSettingsService } from "@/shared/lib/hrm8/systemSettingsService";

export function EmailSettingsTab() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        provider: "smtp",
        smtpHost: "",
        smtpPort: "587",
        smtpUser: "",
        smtpPass: "",
        fromEmail: "",
        fromName: "",
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await SystemSettingsService.getAllSettings();
            setSettings({
                provider: data["email.provider"] || "smtp",
                smtpHost: data["email.smtpHost"] || "",
                smtpPort: data["email.smtpPort"] || "587",
                smtpUser: data["email.smtpUser"] || "",
                smtpPass: data["email.smtpPass"] || "",
                fromEmail: data["email.fromEmail"] || "",
                fromName: data["email.fromName"] || "HRM8 System",
            });
        } catch (error) {
            toast.error("Failed to load email settings");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await SystemSettingsService.bulkUpdateSettings([
                { key: "email.provider", value: settings.provider, isPublic: false },
                { key: "email.smtpHost", value: settings.smtpHost, isPublic: false },
                { key: "email.smtpPort", value: settings.smtpPort, isPublic: false },
                { key: "email.smtpUser", value: settings.smtpUser, isPublic: false },
                { key: "email.smtpPass", value: settings.smtpPass, isPublic: false },
                { key: "email.fromEmail", value: settings.fromEmail, isPublic: false },
                { key: "email.fromName", value: settings.fromName, isPublic: false },
            ]);
            toast.success("Email settings saved successfully");
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
                    <CardTitle>Email Configuration</CardTitle>
                    <CardDescription>
                        Configure how the system sends transactional emails.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Email Provider</Label>
                        <Select
                            value={settings.provider}
                            onValueChange={(val) => setSettings({ ...settings, provider: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="smtp">SMTP Server (Recommended)</SelectItem>
                                <SelectItem value="sendgrid">SendGrid API</SelectItem>
                                <SelectItem value="aws_ses">AWS SES</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fromName">Sender Name</Label>
                            <Input
                                id="fromName"
                                value={settings.fromName}
                                onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                                placeholder="HRM8 System"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fromEmail">Sender Email</Label>
                            <Input
                                id="fromEmail"
                                value={settings.fromEmail}
                                onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                                placeholder="notifications@yourdomain.com"
                            />
                        </div>
                    </div>

                    {settings.provider === 'smtp' && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="smtpHost">SMTP Host</Label>
                                    <Input
                                        id="smtpHost"
                                        value={settings.smtpHost}
                                        onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                                        placeholder="smtp.gmail.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpPort">SMTP Port</Label>
                                    <Input
                                        id="smtpPort"
                                        value={settings.smtpPort}
                                        onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                                        placeholder="587"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="smtpUser">Username</Label>
                                    <Input
                                        id="smtpUser"
                                        value={settings.smtpUser}
                                        onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpPass">Password</Label>
                                    <Input
                                        id="smtpPass"
                                        type="password"
                                        value={settings.smtpPass}
                                        onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Email Settings
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
