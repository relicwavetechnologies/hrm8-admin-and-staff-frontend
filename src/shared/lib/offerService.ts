export interface Offer {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  salary: number;
  currency: string;
  salaryPeriod: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual';
  startDate: string;
  benefits: string[];
  additionalTerms?: string;
  status: 'draft' | 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  sentDate?: string;
  responseDate?: string;
  expiryDate?: string;
  rejectionReason?: string;
  negotiationNotes?: string[];
  approvals: OfferApproval[];
  documents: OfferDocument[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferApproval {
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  timestamp?: string;
}

export interface OfferDocument {
  id: string;
  name: string;
  type: 'offer_letter' | 'contract' | 'benefits_summary' | 'other';
  url: string;
  uploadedAt: string;
}

// Mock data
const mockOffers: Offer[] = [
  {
    id: '1',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    candidateId: 'c1',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.j@email.com',
    salary: 135000,
    currency: 'USD',
    salaryPeriod: 'annual',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    benefits: [
      'Health Insurance',
      '401(k) Matching',
      'Unlimited PTO',
      'Remote Work Options',
      'Professional Development Budget',
    ],
    status: 'pending',
    sentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    approvals: [
      {
        approverId: 'a1',
        approverName: 'John Doe',
        approverRole: 'Hiring Manager',
        status: 'approved',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        approverId: 'a2',
        approverName: 'Jane Smith',
        approverRole: 'HR Director',
        status: 'approved',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    documents: [
      {
        id: 'd1',
        name: 'Offer Letter.pdf',
        type: 'offer_letter',
        url: '#',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdBy: 'u1',
    createdByName: 'Admin User',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    jobId: '2',
    jobTitle: 'Product Manager',
    candidateId: 'c3',
    candidateName: 'Emily Rodriguez',
    candidateEmail: 'emily.r@email.com',
    salary: 145000,
    currency: 'USD',
    salaryPeriod: 'annual',
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    benefits: [
      'Health Insurance',
      '401(k) Matching',
      'Equity Package',
      'Flexible Hours',
    ],
    status: 'accepted',
    sentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    responseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    approvals: [
      {
        approverId: 'a1',
        approverName: 'John Doe',
        approverRole: 'Hiring Manager',
        status: 'approved',
        timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    documents: [],
    createdBy: 'u1',
    createdByName: 'Admin User',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function getOffers(filters?: {
  jobId?: string;
  candidateId?: string;
  status?: Offer['status'];
}): Offer[] {
  let filtered = [...mockOffers];

  if (filters?.jobId) {
    filtered = filtered.filter((o) => o.jobId === filters.jobId);
  }
  if (filters?.candidateId) {
    filtered = filtered.filter((o) => o.candidateId === filters.candidateId);
  }
  if (filters?.status) {
    filtered = filtered.filter((o) => o.status === filters.status);
  }

  return filtered.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createOffer(
  offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>
): Offer {
  const newOffer: Offer = {
    ...offer,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockOffers.push(newOffer);
  return newOffer;
}

export function updateOffer(
  id: string,
  updates: Partial<Offer>
): Offer | null {
  const index = mockOffers.findIndex((o) => o.id === id);
  if (index === -1) return null;

  mockOffers[index] = {
    ...mockOffers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return mockOffers[index];
}

export function acceptOffer(id: string): Offer | null {
  return updateOffer(id, {
    status: 'accepted',
    responseDate: new Date().toISOString(),
  });
}

export function rejectOffer(id: string, reason?: string): Offer | null {
  return updateOffer(id, {
    status: 'rejected',
    responseDate: new Date().toISOString(),
    rejectionReason: reason,
  });
}

export function withdrawOffer(id: string): Offer | null {
  return updateOffer(id, { status: 'withdrawn' });
}

export function addNegotiationNote(id: string, note: string): Offer | null {
  const offer = mockOffers.find((o) => o.id === id);
  if (!offer) return null;

  const notes = [...(offer.negotiationNotes || []), note];
  return updateOffer(id, { negotiationNotes: notes });
}

export function getOfferStats(jobId?: string) {
  const offers = jobId ? getOffers({ jobId }) : mockOffers;

  return {
    total: offers.length,
    pending: offers.filter((o) => o.status === 'pending').length,
    accepted: offers.filter((o) => o.status === 'accepted').length,
    rejected: offers.filter((o) => o.status === 'rejected').length,
    withdrawn: offers.filter((o) => o.status === 'withdrawn').length,
    acceptanceRate: offers.length > 0
      ? Math.round((offers.filter((o) => o.status === 'accepted').length / offers.length) * 100)
      : 0,
  };
}
