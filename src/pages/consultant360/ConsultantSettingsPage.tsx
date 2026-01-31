import { Bell, Shield, Lock, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Button } from "@/shared/components/ui/button";

export default function ConsultantSettingsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="max-w-4xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your application preferences and security</p>
                </div>

                {/* Account Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Account Settings
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Manage your profile and account details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Profile Visibility</Label>
                                <p className="text-sm text-muted-foreground">
                                    Allow recruiters to view your full profile
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <Button variant="outline" className="w-full sm:w-auto">
                            Edit Profile Details
                        </Button>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Manage how you receive alerts
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive emails about new job assignments
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Browser Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Show desktop alerts for messages
                                </p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Security
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Protect your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Two-Factor Authentication</Label>
                                <p className="text-sm text-muted-foreground">
                                    Add an extra layer of security to your account
                                </p>
                            </div>
                            <Button variant="outline" size="sm">Enable</Button>
                        </div>
                        <div className="mt-4">
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Lock className="mr-2 h-4 w-4" />
                                Change Password
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
