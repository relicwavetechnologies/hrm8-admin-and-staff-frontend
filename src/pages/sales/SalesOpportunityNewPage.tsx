import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/hooks/use-toast';
import { salesService } from '@/shared/services/salesService';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function SalesOpportunityNewPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        estimatedValue: '',
        stage: 'prospecting',
        probability: '20',
        expectedCloseDate: '',
        type: 'new-business',
        description: ''
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.companyName || !formData.estimatedValue) {
            toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                name: formData.name,
                employerName: formData.companyName, // Backend expects employerName or companyId
                estimatedValue: parseFloat(formData.estimatedValue),
                stage: formData.stage,
                probability: parseInt(formData.probability),
                expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate).toISOString() : undefined,
                type: formData.type,
                description: formData.description
            };

            const response = await salesService.createOpportunity(payload);

            if (response.success) {
                toast({ title: "Success", description: "Opportunity created successfully" });
                navigate('/sales-agent/pipeline');
            } else {
                toast({ title: "Error", description: response.error || "Failed to create opportunity", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">New Opportunity</h1>
                    <p className="text-muted-foreground">Create a new sales opportunity in your pipeline</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Opportunity Details</CardTitle>
                    <CardDescription>Enter the basic information about the deal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Opportunity Name <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="name" 
                                    placeholder="e.g. Acme Corp Contract" 
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company / Client <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="companyName" 
                                    placeholder="e.g. Acme Inc." 
                                    value={formData.companyName}
                                    onChange={(e) => handleChange('companyName', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estimatedValue">Estimated Value ($) <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="estimatedValue" 
                                    type="number"
                                    placeholder="0.00" 
                                    value={formData.estimatedValue}
                                    onChange={(e) => handleChange('estimatedValue', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="probability">Probability (%)</Label>
                                <Input 
                                    id="probability" 
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.probability}
                                    onChange={(e) => handleChange('probability', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stage">Stage</Label>
                                <Select value={formData.stage} onValueChange={(val) => handleChange('stage', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="prospecting">Prospecting</SelectItem>
                                        <SelectItem value="qualification">Qualification</SelectItem>
                                        <SelectItem value="proposal">Proposal</SelectItem>
                                        <SelectItem value="negotiation">Negotiation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={formData.type} onValueChange={(val) => handleChange('type', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new-business">New Business</SelectItem>
                                        <SelectItem value="expansion">Expansion</SelectItem>
                                        <SelectItem value="renewal">Renewal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                                <Input 
                                    id="expectedCloseDate" 
                                    type="date"
                                    value={formData.expectedCloseDate}
                                    onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description / Notes</Label>
                            <Textarea 
                                id="description" 
                                placeholder="Add any details..." 
                                rows={3}
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Opportunity
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
