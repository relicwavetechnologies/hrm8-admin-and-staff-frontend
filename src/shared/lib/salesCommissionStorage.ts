import { SalesCommission, CommissionStatus } from '@/shared/types/salesCommission';

const STORAGE_KEY = 'sales_commissions';

function initializeMockData(): SalesCommission[] {
  return [
    {
      id: 'comm-001',
      salesAgentId: 'agent-001',
      salesAgentName: 'Sarah Johnson',
      opportunityId: 'opp-001',
      opportunityName: 'TechCorp - Enterprise ATS',
      employerId: 'emp-001',
      employerName: 'TechCorp Industries',
      dealValue: 850000,
      commissionRate: 10,
      commissionAmount: 85000,
      status: 'paid',
      calculatedAt: '2024-01-15T10:00:00Z',
      approvedAt: '2024-01-20T14:30:00Z',
      paidAt: '2024-02-01T09:00:00Z',
      paymentMethod: 'Direct Deposit',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-02-01T09:00:00Z',
    },
    {
      id: 'comm-002',
      salesAgentId: 'agent-002',
      salesAgentName: 'Michael Chen',
      opportunityId: 'opp-002',
      opportunityName: 'GlobalRetail - HRMS Upgrade',
      employerId: 'emp-002',
      employerName: 'GlobalRetail Corp',
      dealValue: 450000,
      commissionRate: 8,
      commissionAmount: 36000,
      status: 'approved',
      calculatedAt: '2024-02-10T11:00:00Z',
      approvedAt: '2024-02-15T16:00:00Z',
      createdAt: '2024-02-10T11:00:00Z',
      updatedAt: '2024-02-15T16:00:00Z',
    },
    {
      id: 'comm-003',
      salesAgentId: 'agent-003',
      salesAgentName: 'Emily Rodriguez',
      opportunityId: 'opp-003',
      opportunityName: 'HealthPlus - RPO Contract',
      employerId: 'emp-003',
      employerName: 'HealthPlus Medical',
      dealValue: 1200000,
      commissionRate: 12,
      commissionAmount: 144000,
      status: 'pending',
      calculatedAt: '2024-03-01T09:00:00Z',
      createdAt: '2024-03-01T09:00:00Z',
      updatedAt: '2024-03-01T09:00:00Z',
    },
    {
      id: 'comm-004',
      salesAgentId: 'agent-001',
      salesAgentName: 'Sarah Johnson',
      opportunityId: 'opp-004',
      opportunityName: 'FinanceGroup - ATS Subscription',
      employerId: 'emp-004',
      employerName: 'FinanceGroup LLC',
      dealValue: 320000,
      commissionRate: 10,
      commissionAmount: 32000,
      status: 'paid',
      calculatedAt: '2024-02-20T13:00:00Z',
      approvedAt: '2024-02-22T10:00:00Z',
      paidAt: '2024-03-05T09:00:00Z',
      paymentMethod: 'Wire Transfer',
      createdAt: '2024-02-20T13:00:00Z',
      updatedAt: '2024-03-05T09:00:00Z',
    },
    {
      id: 'comm-005',
      salesAgentId: 'agent-004',
      salesAgentName: 'David Park',
      opportunityId: 'opp-005',
      opportunityName: 'Manufacturing Inc - Recruitment Service',
      employerId: 'emp-005',
      employerName: 'Manufacturing Inc',
      dealValue: 580000,
      commissionRate: 9,
      commissionAmount: 52200,
      status: 'pending',
      calculatedAt: '2024-03-10T14:00:00Z',
      createdAt: '2024-03-10T14:00:00Z',
      updatedAt: '2024-03-10T14:00:00Z',
    },
    {
      id: 'comm-006',
      salesAgentId: 'agent-002',
      salesAgentName: 'Michael Chen',
      opportunityId: 'opp-006',
      opportunityName: 'EduTech - Enterprise Package',
      employerId: 'emp-006',
      employerName: 'EduTech Solutions',
      dealValue: 750000,
      commissionRate: 11,
      commissionAmount: 82500,
      status: 'approved',
      calculatedAt: '2024-03-05T12:00:00Z',
      approvedAt: '2024-03-08T15:00:00Z',
      createdAt: '2024-03-05T12:00:00Z',
      updatedAt: '2024-03-08T15:00:00Z',
    },
    {
      id: 'comm-007',
      salesAgentId: 'agent-005',
      salesAgentName: 'Jessica Martinez',
      opportunityId: 'opp-007',
      opportunityName: 'RetailChain - Multi-location ATS',
      employerId: 'emp-007',
      employerName: 'RetailChain USA',
      dealValue: 420000,
      commissionRate: 8,
      commissionAmount: 33600,
      status: 'paid',
      calculatedAt: '2024-01-25T11:00:00Z',
      approvedAt: '2024-01-28T14:00:00Z',
      paidAt: '2024-02-10T09:00:00Z',
      paymentMethod: 'Direct Deposit',
      createdAt: '2024-01-25T11:00:00Z',
      updatedAt: '2024-02-10T09:00:00Z',
    },
    {
      id: 'comm-008',
      salesAgentId: 'agent-003',
      salesAgentName: 'Emily Rodriguez',
      opportunityId: 'opp-008',
      opportunityName: 'LogisticsPro - HRMS Integration',
      employerId: 'emp-008',
      employerName: 'LogisticsPro Inc',
      dealValue: 380000,
      commissionRate: 9,
      commissionAmount: 34200,
      status: 'pending',
      calculatedAt: '2024-03-12T10:00:00Z',
      createdAt: '2024-03-12T10:00:00Z',
      updatedAt: '2024-03-12T10:00:00Z',
    },
    {
      id: 'comm-009',
      salesAgentId: 'agent-001',
      salesAgentName: 'Sarah Johnson',
      opportunityId: 'opp-009',
      opportunityName: 'MediaGroup - Recruitment Platform',
      employerId: 'emp-009',
      employerName: 'MediaGroup International',
      dealValue: 690000,
      commissionRate: 10,
      commissionAmount: 69000,
      status: 'approved',
      calculatedAt: '2024-03-08T13:00:00Z',
      approvedAt: '2024-03-11T16:00:00Z',
      createdAt: '2024-03-08T13:00:00Z',
      updatedAt: '2024-03-11T16:00:00Z',
    },
    {
      id: 'comm-010',
      salesAgentId: 'agent-004',
      salesAgentName: 'David Park',
      opportunityId: 'opp-010',
      opportunityName: 'Construction Co - ATS + HRMS Bundle',
      employerId: 'emp-010',
      employerName: 'Construction Co',
      dealValue: 520000,
      commissionRate: 9,
      commissionAmount: 46800,
      status: 'paid',
      calculatedAt: '2024-02-05T12:00:00Z',
      approvedAt: '2024-02-08T11:00:00Z',
      paidAt: '2024-02-20T09:00:00Z',
      paymentMethod: 'Check',
      createdAt: '2024-02-05T12:00:00Z',
      updatedAt: '2024-02-20T09:00:00Z',
    },
  ];
}

export function getAllCommissions(): SalesCommission[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const mockData = initializeMockData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
    return mockData;
  }
  return JSON.parse(stored);
}

export function getCommissionById(id: string): SalesCommission | undefined {
  const commissions = getAllCommissions();
  return commissions.find(c => c.id === id);
}

export function getCommissionsByAgent(agentId: string): SalesCommission[] {
  const commissions = getAllCommissions();
  return commissions.filter(c => c.salesAgentId === agentId);
}

export function getCommissionsByStatus(status: CommissionStatus): SalesCommission[] {
  const commissions = getAllCommissions();
  return commissions.filter(c => c.status === status);
}

export function createCommission(data: Omit<SalesCommission, 'id' | 'createdAt' | 'updatedAt'>): SalesCommission {
  const commissions = getAllCommissions();
  const newCommission: SalesCommission = {
    ...data,
    id: `comm-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  commissions.push(newCommission);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(commissions));
  return newCommission;
}

export function updateCommission(id: string, updates: Partial<SalesCommission>): SalesCommission | null {
  const commissions = getAllCommissions();
  const index = commissions.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  commissions[index] = {
    ...commissions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(commissions));
  return commissions[index];
}

export function deleteCommission(id: string): boolean {
  const commissions = getAllCommissions();
  const filtered = commissions.filter(c => c.id !== id);
  if (filtered.length === commissions.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function getCommissionStats() {
  const commissions = getAllCommissions();
  
  const totalEarned = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.commissionAmount, 0);
  
  const pending = commissions
    .filter(c => c.status === 'pending' || c.status === 'approved')
    .reduce((sum, c) => sum + c.commissionAmount, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const paidThisMonth = commissions
    .filter(c => {
      if (c.status !== 'paid' || !c.paidAt) return false;
      const paidDate = new Date(c.paidAt);
      return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear;
    })
    .reduce((sum, c) => sum + c.commissionAmount, 0);
  
  const paidCommissions = commissions.filter(c => c.status === 'paid');
  const averageCommission = paidCommissions.length > 0
    ? totalEarned / paidCommissions.length
    : 0;
  
  return {
    totalEarned,
    pending,
    paidThisMonth,
    averageCommission,
    totalCommissions: commissions.length,
    paidCount: paidCommissions.length,
    pendingCount: commissions.filter(c => c.status === 'pending').length,
    approvedCount: commissions.filter(c => c.status === 'approved').length,
  };
}
