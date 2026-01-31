import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { JobCategoriesTab } from "@/shared/components/admin/settings/JobCategoriesTab";
import { JobTagsTab } from "@/shared/components/admin/settings/JobTagsTab";
import { GeneralSettingsTab } from "@/shared/components/admin/settings/GeneralSettingsTab";
import { IntegrationsSettingsTab } from "@/shared/components/admin/settings/IntegrationsSettingsTab";
import { EmailSettingsTab } from "@/shared/components/admin/settings/EmailSettingsTab";
import { useHrm8Auth } from "@/contexts/Hrm8AuthContext";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Hrm8SettingsPage() {
    const { hrm8User } = useHrm8Auth();
    const isGlobalAdmin = hrm8User?.role === 'GLOBAL_ADMIN';

    if (!isGlobalAdmin) {
        return (
            
                <div className="p-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Access denied. Only HRM8 Global Administrators can access settings.
                        </AlertDescription>
                    </Alert>
                </div>
            
        );
    }

    return (
        
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">HRM8 Settings</h1>
                    <p className="text-muted-foreground">Global system configuration and job board management</p>
                </div>

                <Tabs defaultValue="integrations" className="space-y-4">
                    <div className="overflow-x-auto -mx-1 px-1">
                        <TabsList className="inline-flex w-auto gap-1 rounded-full border bg-muted/40 px-1 py-1 shadow-sm">
                            <TabsTrigger
                                value="general"
                                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                General & Branding
                            </TabsTrigger>
                            <TabsTrigger
                                value="integrations"
                                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                Integrations
                            </TabsTrigger>
                            <TabsTrigger
                                value="email"
                                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                Email
                            </TabsTrigger>
                            <TabsTrigger
                                value="job-categories"
                                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                Job Categories
                            </TabsTrigger>
                            <TabsTrigger
                                value="job-tags"
                                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                Job Tags
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="general" className="mt-6">
                        <GeneralSettingsTab />
                    </TabsContent>

                    <TabsContent value="integrations" className="mt-6">
                        <IntegrationsSettingsTab />
                    </TabsContent>

                    <TabsContent value="email" className="mt-6">
                        <EmailSettingsTab />
                    </TabsContent>

                    <TabsContent value="job-categories" className="mt-6">
                        <JobCategoriesTab />
                    </TabsContent>

                    <TabsContent value="job-tags" className="mt-6">
                        <JobTagsTab />
                    </TabsContent>
                </Tabs>
            </div>
        
    );
}
