/**
 * Consultant Job Detail Page
 * Detailed view of an assigned job with workflow actions
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConsultantAuth } from '@/contexts/ConsultantAuthContext';
import { consultantService } from '@/shared/lib/consultant/consultantService';
import { ConsultantCandidateService, CandidatePipelineItem } from '@/shared/lib/consultant/consultantCandidateService';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Separator } from '@/shared/components/ui/separator';
import { Textarea } from '@/shared/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ArrowLeft, Building, MapPin, FileText, User } from 'lucide-react';
// import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
// import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { ApplicationPipeline } from '@/shared/components/applications/ApplicationPipeline';

export default function ConsultantJobDetailPage() {
    const { jobId } = useParams<{ jobId: string }>();
    const id = jobId; // Alias to keep existing code working
    const navigate = useNavigate();
    const { consultant } = useConsultantAuth();
    void consultant;
    
    const [loading, setLoading] = useState(true);
    const [jobData, setJobData] = useState<any>(null);
    const [candidates, setCandidates] = useState<CandidatePipelineItem[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    // Action states
    const [logOpen, setLogOpen] = useState(false);
    const [logType, setLogType] = useState('');
    const [logNotes, setLogNotes] = useState('');

    console.log('[JobDetail] Component rendered. ID param:', id);

    useEffect(() => {
        if (id) {
            console.log('[JobDetail] ID exists, loading data...');
            loadJobDetails();
            loadCandidates();
        } else {
            console.warn('[JobDetail] No ID found in params');
            setLoading(false);
        }
    }, [id]);

    const loadJobDetails = async () => {
        try {
            setLoading(true);
            if (!id) return;

            // Sanitize ID: The URL might contain spaces instead of hyphens due to some data issue
            // We manually fix it here to ensure the backend receives a valid UUID
            let cleanId = id;
            if (id.includes(' ') && !id.includes('-')) {
                cleanId = id.replace(/\s/g, '-');
                console.log(`[JobDetail] Sanitized ID in frontend: ${cleanId}`);
            }

            const response = await consultantService.getJobDetails(cleanId);
            console.log('[JobDetail] Response:', response);

            // Handle both response formats - backend returns job details directly in data
            const jobDetails = (response.data?.job) ? response.data : response.data;
            console.log('[JobDetail] Job details:', jobDetails);

            if (response.success && jobDetails) {
                setJobData(jobDetails);
            } else {
                toast.error('Failed to load job details');
                navigate('/consultant/jobs');
            }
        } catch (error) {
            console.error('[JobDetail] Error:', error);
            toast.error('Error loading job');
        } finally {
            setLoading(false);
        }
    };

    const loadCandidates = async () => {
        if (!id) return;
        setLoadingCandidates(true);
        try {
            let cleanId = id;
            if (id.includes(' ') && !id.includes('-')) {
                cleanId = id.replace(/\s/g, '-');
            }
            const data = await ConsultantCandidateService.getPipeline(cleanId);
            setCandidates(data);
        } catch (error) {
            console.error('Failed to load candidates:', error);
        } finally {
            setLoadingCandidates(false);
        }
    };

    const handleLogActivity = async () => {
        if (!id || !logType || !logNotes) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const res = await consultantService.logJobActivity(id, logType, logNotes);
            if (res.success) {
                toast.success('Activity logged');
                setLogOpen(false);
                setLogType('');
                setLogNotes('');
                loadJobDetails();
            } else {
                toast.error(res.error || 'Failed to log activity');
            }
        } catch (err) {
            toast.error('Failed to log activity');
        }
    };

    /*
    const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
        try {
            // Optimistic update?
            await ConsultantCandidateService.updateStatus(applicationId, newStatus);
            toast.success('Status updated');
            loadCandidates(); // Refresh
        } catch (error) {
            toast.error('Failed to update status');
        }
    };
    */

    const handleMessageCandidate = async (_candidateId: string, email: string) => {
        // We need to find or create conversation. 
        // For simplicity, navigate to messages page maybe with a query param?
        // Or create conversation directly then navigate.
        // Let's assume we can navigate to the conversation if it exists, or create new.
        // The ConsultantMessagesPage handles list. Ideally we create conversation here.
        // But for now, let's just push to messages.
        // Better UX: Create conversation via API then redirect.
        // We don't have that endpoint exposed in our service yet explicitly for 'ensureConversation'.
        // But 'sendMessage' creates it if not exists usually, or we use a specific 'createConversation' endpoint.
        // Let's just navigate to messages root for now or implement 'createConversation' in service later.
        navigate(`/consultant/messages`);
        toast.info(`Please start a chat with ${email}`);
    };
    void handleMessageCandidate;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!jobData) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold">Job not found</h2>
                <p className="text-muted-foreground">Unable to load job details for ID: {id}</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('..', { relative: 'path' })}>Back to Jobs</Button>
            </div>
        );
    }

    const { job, employer } = jobData;

    return (
        <div className="p-6 space-y-6">
            {/* Header with Back Button */}
            <div>
                <Button variant="ghost" className="mb-2 pl-0 hover:pl-2 transition-all" onClick={() => navigate('..', { relative: 'path' })}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Jobs
                </Button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <Building className="h-4 w-4" />
                            <span>{job.company?.name || 'Client Company'}</span>
                            <span className="text-gray-300 mx-1">|</span>
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                            <span className="text-gray-300 mx-1">|</span>
                            <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>{job.status}</Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={logOpen} onOpenChange={setLogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <FileText className="mr-2 h-4 w-4" /> Log Activity
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Log Activity</DialogTitle>
                                    <DialogDescription>Record a touchpoint or update for this job.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Activity Type</Label>
                                        <Select value={logType} onValueChange={setLogType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Call">Client Call</SelectItem>
                                                <SelectItem value="Email">Email Sent</SelectItem>
                                                <SelectItem value="Meeting">Meeting</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Notes</Label>
                                        <Textarea value={logNotes} onChange={e => setLogNotes(e.target.value)} placeholder="Details..." />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleLogActivity}>Save Log</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="candidates" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="details">Job Details</TabsTrigger>
                    <TabsTrigger value="candidates">Candidates ({candidates.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Job Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Salary Range</h4>
                                            <p className="text-sm font-medium">
                                                {job.salary_min ? `${job.salary_currency || 'USD'} ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()}` : 'Not specified'}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Work Arrangement</h4>
                                            <p className="text-sm font-medium capitalize">{job.work_arrangement?.toLowerCase().replace('_', ' ') || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                                        <div className="prose prose-sm max-w-none text-sm text-foreground/90" dangerouslySetInnerHTML={{ __html: job.description || 'No description' }} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Employer Contact</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{employer.contactName}</p>
                                            <p className="text-xs text-muted-foreground">Hiring Manager</p>
                                        </div>
                                    </div>
                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Email:</span>
                                            <span className="truncate max-w-[150px]">{employer.email}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="candidates" className="space-y-4">
                    {loadingCandidates ? (
                        <Card>
                            <CardContent className="py-10">
                                <div className="text-center">Loading pipeline...</div>
                            </CardContent>
                        </Card>
                    ) : (
                        <ApplicationPipeline
                            jobId={id}
                            jobTitle={job.title}
                            isConsultantView={true}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
