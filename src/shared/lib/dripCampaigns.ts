export interface DripEmail {
  id: string;
  name: string;
  emailType: string;
  message: string;
  delayDays: number;
  delayHours: number;
}

export interface DripCampaign {
  id: string;
  name: string;
  description: string;
  trigger: 'workflow_created' | 'status_change' | 'task_completed' | 'manual';
  triggerCondition?: {
    status?: string;
    taskId?: string;
  };
  emails: DripEmail[];
  isActive: boolean;
  targetDepartments: string[];
  createdAt: Date;
  stats: {
    totalEnrolled: number;
    activeEnrollments: number;
    completedEnrollments: number;
    emailsSent: number;
  };
}

export interface DripEnrollment {
  id: string;
  campaignId: string;
  workflowId: string;
  enrolledAt: Date;
  status: 'active' | 'completed' | 'paused';
  currentEmailIndex: number;
  scheduledEmails: {
    emailId: string;
    scheduledFor: Date;
    sent: boolean;
    sentAt?: Date;
  }[];
}

const CAMPAIGNS_KEY = "drip_campaigns";
const ENROLLMENTS_KEY = "drip_enrollments";

export function getDripCampaigns(): DripCampaign[] {
  try {
    const saved = localStorage.getItem(CAMPAIGNS_KEY);
    if (!saved) return [];
    const campaigns = JSON.parse(saved);
    return campaigns.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
    }));
  } catch (error) {
    console.error("Error loading drip campaigns:", error);
    return [];
  }
}

export function createDripCampaign(campaign: Omit<DripCampaign, 'id' | 'createdAt' | 'stats'>): DripCampaign {
  const campaigns = getDripCampaigns();
  
  const newCampaign: DripCampaign = {
    ...campaign,
    id: `drip-${Date.now()}`,
    createdAt: new Date(),
    stats: {
      totalEnrolled: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      emailsSent: 0,
    },
  };
  
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify([...campaigns, newCampaign]));
  return newCampaign;
}

export function updateDripCampaign(id: string, updates: Partial<DripCampaign>): void {
  const campaigns = getDripCampaigns();
  const updatedCampaigns = campaigns.map(campaign =>
    campaign.id === id ? { ...campaign, ...updates } : campaign
  );
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updatedCampaigns));
}

export function deleteDripCampaign(id: string): void {
  const campaigns = getDripCampaigns();
  const filteredCampaigns = campaigns.filter(c => c.id !== id);
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(filteredCampaigns));
}

export function getDripEnrollments(): DripEnrollment[] {
  try {
    const saved = localStorage.getItem(ENROLLMENTS_KEY);
    if (!saved) return [];
    const enrollments = JSON.parse(saved);
    return enrollments.map((e: any) => ({
      ...e,
      enrolledAt: new Date(e.enrolledAt),
      scheduledEmails: e.scheduledEmails.map((se: any) => ({
        ...se,
        scheduledFor: new Date(se.scheduledFor),
        sentAt: se.sentAt ? new Date(se.sentAt) : undefined,
      })),
    }));
  } catch (error) {
    console.error("Error loading drip enrollments:", error);
    return [];
  }
}

export function enrollInDripCampaign(campaignId: string, workflowId: string): DripEnrollment {
  const campaigns = getDripCampaigns();
  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) throw new Error("Campaign not found");

  const enrollments = getDripEnrollments();
  const enrolledAt = new Date();

  // Schedule all emails in the sequence
  const scheduledEmails = campaign.emails.map(email => {
    const scheduledFor = new Date(enrolledAt);
    scheduledFor.setDate(scheduledFor.getDate() + email.delayDays);
    scheduledFor.setHours(scheduledFor.getHours() + email.delayHours);

    return {
      emailId: email.id,
      scheduledFor,
      sent: false,
    };
  });

  const newEnrollment: DripEnrollment = {
    id: `enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    campaignId,
    workflowId,
    enrolledAt,
    status: 'active',
    currentEmailIndex: 0,
    scheduledEmails,
  };

  localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify([...enrollments, newEnrollment]));

  // Update campaign stats
  campaign.stats.totalEnrolled++;
  campaign.stats.activeEnrollments++;
  updateDripCampaign(campaignId, { stats: campaign.stats });

  return newEnrollment;
}

export function updateEnrollmentStatus(id: string, status: 'active' | 'completed' | 'paused'): void {
  const enrollments = getDripEnrollments();
  const updatedEnrollments = enrollments.map(e =>
    e.id === id ? { ...e, status } : e
  );
  localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(updatedEnrollments));

  // Update campaign stats
  const enrollment = enrollments.find(e => e.id === id);
  if (enrollment) {
    const campaigns = getDripCampaigns();
    const campaign = campaigns.find(c => c.id === enrollment.campaignId);
    if (campaign) {
      if (status === 'completed') {
        campaign.stats.activeEnrollments = Math.max(0, campaign.stats.activeEnrollments - 1);
        campaign.stats.completedEnrollments++;
      }
      updateDripCampaign(campaign.id, { stats: campaign.stats });
    }
  }
}

export function markDripEmailAsSent(enrollmentId: string, emailId: string): void {
  const enrollments = getDripEnrollments();
  const enrollment = enrollments.find(e => e.id === enrollmentId);
  if (!enrollment) return;

  enrollment.scheduledEmails = enrollment.scheduledEmails.map(se =>
    se.emailId === emailId ? { ...se, sent: true, sentAt: new Date() } : se
  );

  enrollment.currentEmailIndex++;

  // Check if all emails are sent
  if (enrollment.scheduledEmails.every(se => se.sent)) {
    enrollment.status = 'completed';
  }

  localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));

  // Update campaign stats
  const campaigns = getDripCampaigns();
  const campaign = campaigns.find(c => c.id === enrollment.campaignId);
  if (campaign) {
    campaign.stats.emailsSent++;
    updateDripCampaign(campaign.id, { stats: campaign.stats });
  }
}
