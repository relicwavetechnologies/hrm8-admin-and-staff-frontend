import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { SystemSettingsService } from "@/shared/lib/hrm8/systemSettingsService";

export function IntegrationsSettingsTab() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [settings, setSettings] = useState({
        // Stripe
        stripePublishableKey: "",
        stripeSecretKey: "",
        stripeWebhookSecret: "",
        // OpenAI
        openaiApiKey: "",
        openaiModel: "gpt-4o",
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await SystemSettingsService.getAllSettings();
            setSettings({
                stripePublishableKey: data["stripe.publishableKey"] || "",
                stripeSecretKey: data["stripe.secretKey"] || "",
                stripeWebhookSecret: data["stripe.webhookSecret"] || "",
                openaiApiKey: data["openai.apiKey"] || "",
                openaiModel: data["openai.model"] || "gpt-4o",
            });
        } catch (error) {
            toast.error("Failed to load integration settings");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await SystemSettingsService.bulkUpdateSettings([
                { key: "stripe.publishableKey", value: settings.stripePublishableKey, isPublic: true }, // Pub key is public
                { key: "stripe.secretKey", value: settings.stripeSecretKey, isPublic: false },
                { key: "stripe.webhookSecret", value: settings.stripeWebhookSecret, isPublic: false },
                { key: "openai.apiKey", value: settings.openaiApiKey, isPublic: false },
                { key: "openai.model", value: settings.openaiModel, isPublic: false },
            ]);
            toast.success("Integration settings saved successfully");
        } catch (error) {
            toast.error("Failed to save settings");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const toggleShowKey = (key: string) => {
        setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Stripe Payments</CardTitle>
                    <CardDescription>
                        Configure Stripe for payments and billing.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="stripePublishableKey">Publishable Key</Label>
                        <Input
                            id="stripePublishableKey"
                            value={settings.stripePublishableKey}
                            onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                            placeholder="pk_test_..."
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="stripeSecretKey">Secret Key</Label>
                            <div className="relative">
                                <Input
                                    id="stripeSecretKey"
                                    type={showKeys['stripeSecretKey'] ? "text" : "password"}
                                    value={settings.stripeSecretKey}
                                    onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                                    placeholder="sk_test_..."
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => toggleShowKey('stripeSecretKey')}
                                >
                                    {showKeys['stripeSecretKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stripeWebhookSecret">Webhook Secret</Label>
                            <div className="relative">
                                <Input
                                    id="stripeWebhookSecret"
                                    type={showKeys['stripeWebhookSecret'] ? "text" : "password"}
                                    value={settings.stripeWebhookSecret}
                                    onChange={(e) => setSettings({ ...settings, stripeWebhookSecret: e.target.value })}
                                    placeholder="whsec_..."
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => toggleShowKey('stripeWebhookSecret')}
                                >
                                    {showKeys['stripeWebhookSecret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>AI Services (OpenAI)</CardTitle>
                    <CardDescription>
                        Configure AI capabilities for Smart Resume Parsing, Job Generation, and Scoring.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="openaiApiKey">API Key</Label>
                            <div className="relative">
                                <Input
                                    id="openaiApiKey"
                                    type={showKeys['openaiApiKey'] ? "text" : "password"}
                                    value={settings.openaiApiKey}
                                    onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                                    placeholder="sk-..."
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => toggleShowKey('openaiApiKey')}
                                >
                                    {showKeys['openaiApiKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="openaiModel">Default Model</Label>
                            <Input
                                id="openaiModel"
                                value={settings.openaiModel}
                                onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
                                placeholder="gpt-4o"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save All Settings
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
