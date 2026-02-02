/**
 * Email Templates Management Page for HR Admin
 * Allows viewing and editing email templates for candidate communications
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/shared/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
    Mail,
    Plus,
    Search,
    MoreVertical,
    Edit,
    Copy,
    Trash2,
    Eye,
    Loader2,
    RefreshCw,
    FileText,
    CheckCircle,
    XCircle,
    Sparkles,
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { apiClient } from "@/shared/lib/apiClient";

// Types
interface EmailTemplate {
    id: string;
    companyId: string;
    jobId?: string | null;
    name: string;
    type: string;
    subject: string;
    body: string;
    variables: string[];
    isActive: boolean;
    isDefault: boolean;
    isAiGenerated: boolean;
    version: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

interface TemplateVariable {
    key: string;
    label: string;
    description: string;
    example: string;
    category: string;
}

// Email Template Types with labels
const EMAIL_TEMPLATE_TYPES: { value: string; label: string }[] = [
    { value: "APPLICATION_CONFIRMATION", label: "Application Confirmation" },
    { value: "INTERVIEW_INVITATION", label: "Interview Invitation" },
    { value: "REJECTION", label: "Rejection" },
    { value: "OFFER_EXTENDED", label: "Offer Extended" },
    { value: "OFFER_ACCEPTED", label: "Offer Accepted" },
    { value: "STAGE_CHANGE", label: "Stage Change" },
    { value: "REMINDER", label: "Reminder" },
    { value: "FOLLOW_UP", label: "Follow Up" },
    { value: "CUSTOM", label: "Custom" },
];

async function fetchTemplates(): Promise<EmailTemplate[]> {
    const res = await apiClient.get<EmailTemplate[]>("/api/email-templates");
    return res.data || [];
}

async function fetchVariables(): Promise<TemplateVariable[]> {
    const res = await apiClient.get<TemplateVariable[]>("/api/email-templates/variables");
    return res.data || [];
}

async function createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const res = await apiClient.post<EmailTemplate>("/api/email-templates", template);
    if (!res.data) throw new Error("Failed to create template");
    return res.data;
}

async function updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const res = await apiClient.put<EmailTemplate>(`/api/email-templates/${id}`, updates);
    if (!res.data) throw new Error("Failed to update template");
    return res.data;
}

async function deleteTemplateApi(id: string): Promise<void> {
    await apiClient.delete(`/api/email-templates/${id}`);
}

async function previewTemplate(id: string): Promise<{ subject: string; body: string }> {
    const res = await apiClient.post<{ subject: string; body: string }>(`/api/email-templates/${id}/preview`, {});
    if (!res.data) throw new Error("Failed to preview template");
    return res.data;
}

export default function AdminEmailTemplatesPage() {
    const { toast } = useToast();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [variables, setVariables] = useState<TemplateVariable[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Editor state
    const [editorOpen, setEditorOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [saving, setSaving] = useState(false);

    // Preview state
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<{ subject: string; body: string } | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        type: "CUSTOM",
        subject: "",
        body: "",
        isActive: true,
        isDefault: false,
    });

    // Load templates and variables
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [templatesData, variablesData] = await Promise.all([
                fetchTemplates(),
                fetchVariables(),
            ]);
            setTemplates(templatesData);
            setVariables(variablesData);
        } catch (error) {
            toast({
                title: "Error loading templates",
                description: "Please try again later",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Filter templates
    const filteredTemplates = templates.filter((t) => {
        const matchesSearch =
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || t.type === filterType;
        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "active" && t.isActive) ||
            (filterStatus === "inactive" && !t.isActive);
        return matchesSearch && matchesType && matchesStatus;
    });

    // Stats
    const stats = {
        total: templates.length,
        active: templates.filter((t) => t.isActive).length,
        defaults: templates.filter((t) => t.isDefault).length,
    };

    // Type color mapping
    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            APPLICATION_CONFIRMATION: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
            INTERVIEW_INVITATION: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
            OFFER_EXTENDED: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
            OFFER_ACCEPTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
            REJECTION: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
            STAGE_CHANGE: "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
            REMINDER: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
            FOLLOW_UP: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400",
            CUSTOM: "bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400",
        };
        return colors[type] || colors.CUSTOM;
    };

    const getTypeLabel = (type: string) => {
        const found = EMAIL_TEMPLATE_TYPES.find((t) => t.value === type);
        return found?.label || type.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
    };

    // Handlers
    const handleCreate = () => {
        setSelectedTemplate(null);
        setFormData({
            name: "",
            type: "CUSTOM",
            subject: "",
            body: "",
            isActive: true,
            isDefault: false,
        });
        setEditorOpen(true);
    };

    const handleEdit = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setFormData({
            name: template.name,
            type: template.type,
            subject: template.subject,
            body: template.body,
            isActive: template.isActive,
            isDefault: template.isDefault,
        });
        setEditorOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.subject || !formData.body) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);
        try {
            if (selectedTemplate) {
                await updateTemplate(selectedTemplate.id, formData);
                toast({
                    title: "Template Updated",
                    description: `"${formData.name}" has been updated successfully`,
                });
            } else {
                await createTemplate(formData);
                toast({
                    title: "Template Created",
                    description: `"${formData.name}" has been created`,
                });
            }
            setEditorOpen(false);
            loadData();
        } catch (error) {
            toast({
                title: "Error saving template",
                description: "Please try again",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDuplicate = async (template: EmailTemplate) => {
        try {
            await createTemplate({
                name: `${template.name} (Copy)`,
                type: template.type,
                subject: template.subject,
                body: template.body,
                isActive: template.isActive,
                isDefault: false,
            });
            toast({
                title: "Template Duplicated",
                description: `Created "${template.name} (Copy)"`,
            });
            loadData();
        } catch (error) {
            toast({
                title: "Error duplicating template",
                description: "Please try again",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (template: EmailTemplate) => {
        if (template.isDefault) {
            toast({
                title: "Cannot Delete",
                description: "Default templates cannot be deleted",
                variant: "destructive",
            });
            return;
        }

        if (!confirm(`Delete template "${template.name}"?`)) return;

        try {
            await deleteTemplateApi(template.id);
            toast({
                title: "Template Deleted",
                description: `"${template.name}" has been removed`,
            });
            loadData();
        } catch (error) {
            toast({
                title: "Error deleting template",
                description: "Please try again",
                variant: "destructive",
            });
        }
    };

    const handlePreview = async (template: EmailTemplate) => {
        setPreviewLoading(true);
        setPreviewOpen(true);
        try {
            const data = await previewTemplate(template.id);
            setPreviewData(data);
        } catch (error) {
            toast({
                title: "Error loading preview",
                description: "Please try again",
                variant: "destructive",
            });
            setPreviewOpen(false);
        } finally {
            setPreviewLoading(false);
        }
    };

    const insertVariable = (key: string) => {
        setFormData((prev) => ({
            ...prev,
            body: prev.body + `{{${key}}}`,
        }));
    };

    return (
        
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
                        <p className="text-muted-foreground">
                            Manage automated email templates for candidate communications
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={loadData} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                        <Button onClick={handleCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Template
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Default Templates</CardTitle>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.defaults}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {EMAIL_TEMPLATE_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    {(searchQuery || filterType !== "all" || filterStatus !== "all") && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchQuery("");
                                setFilterType("all");
                                setFilterStatus("all");
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Templates List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <Skeleton className="h-6 w-1/3 mb-2" />
                                    <Skeleton className="h-4 w-2/3 mb-3" />
                                    <Skeleton className="h-4 w-1/4" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTemplates.map((template) => (
                            <Card key={template.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">{template.name}</h3>
                                                <Badge className={getTypeColor(template.type)}>
                                                    {getTypeLabel(template.type)}
                                                </Badge>
                                                {template.isDefault && (
                                                    <Badge variant="outline">Default</Badge>
                                                )}
                                                {template.isAiGenerated && (
                                                    <Badge variant="secondary">
                                                        <Sparkles className="h-3 w-3 mr-1" />
                                                        AI
                                                    </Badge>
                                                )}
                                                {!template.isActive && (
                                                    <Badge variant="secondary">
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </div>

                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                                                <span className="font-medium">Subject:</span> {template.subject}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>Version {template.version}</span>
                                                <span>•</span>
                                                <span>{template.variables?.length || 0} variables</span>
                                                <span>•</span>
                                                <span>
                                                    Updated{" "}
                                                    {formatDistanceToNow(new Date(template.updatedAt), {
                                                        addSuffix: true,
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handlePreview(template)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Preview
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEdit(template)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {!template.isDefault && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(template)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {filteredTemplates.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {searchQuery || filterType !== "all" || filterStatus !== "all"
                                            ? "Try adjusting your filters"
                                            : "Create your first email template to get started"}
                                    </p>
                                    <Button onClick={handleCreate}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Template
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Editor Dialog */}
                <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedTemplate ? "Edit Template" : "Create Template"}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedTemplate
                                    ? "Update the email template details below"
                                    : "Create a new email template for candidate communications"}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-3 gap-6 max-h-[60vh] overflow-hidden">
                            {/* Form */}
                            <div className="col-span-2 space-y-4 overflow-y-auto pr-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Template Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                        placeholder="e.g., Interview Invitation"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Template Type *</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({ ...prev, type: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EMAIL_TEMPLATE_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject Line *</Label>
                                    <Input
                                        id="subject"
                                        value={formData.subject}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, subject: e.target.value }))
                                        }
                                        placeholder="e.g., Interview Invitation for {{jobTitle}}"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="body">Email Body *</Label>
                                    <Textarea
                                        id="body"
                                        value={formData.body}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, body: e.target.value }))
                                        }
                                        placeholder="Write your email template here. Use {{variableName}} for dynamic content."
                                        rows={12}
                                        className="font-mono text-sm"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) =>
                                                setFormData((prev) => ({ ...prev, isActive: checked }))
                                            }
                                        />
                                        <Label htmlFor="isActive">Active</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="isDefault"
                                            checked={formData.isDefault}
                                            onCheckedChange={(checked) =>
                                                setFormData((prev) => ({ ...prev, isDefault: checked }))
                                            }
                                        />
                                        <Label htmlFor="isDefault">Set as Default</Label>
                                    </div>
                                </div>
                            </div>

                            {/* Variables Panel */}
                            <div className="border-l pl-4">
                                <h4 className="font-semibold mb-3">Available Variables</h4>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Click to insert into email body
                                </p>
                                <ScrollArea className="h-[400px]">
                                    <div className="space-y-1">
                                        {variables.map((variable) => (
                                            <Button
                                                key={variable.key}
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-start text-left h-auto py-2"
                                                onClick={() => insertVariable(variable.key)}
                                            >
                                                <div>
                                                    <div className="font-mono text-xs text-primary">
                                                        {`{{${variable.key}}}`}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {variable.label}
                                                    </div>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditorOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {selectedTemplate ? "Update Template" : "Create Template"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Preview Dialog */}
                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Template Preview</DialogTitle>
                            <DialogDescription>
                                Preview with sample data
                            </DialogDescription>
                        </DialogHeader>

                        {previewLoading ? (
                            <div className="space-y-4 py-8">
                                <Skeleton className="h-6 w-2/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ) : previewData ? (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-muted-foreground">Subject</Label>
                                    <p className="font-semibold">{previewData.subject}</p>
                                </div>
                                <Separator />
                                <div>
                                    <Label className="text-muted-foreground">Body</Label>
                                    <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                                        {previewData.body}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </DialogContent>
                </Dialog>
            </div>
        
    );
}
