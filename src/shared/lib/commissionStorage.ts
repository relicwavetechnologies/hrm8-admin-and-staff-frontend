import type { Commission, CommissionStatus, CommissionPayment } from '@/shared/types/commission';
import { createActivity } from './consultantCRMStorage';

const COMMISSIONS_KEY = 'commissions';
const PAYMENTS_KEY = 'commission_payments';

export function getAllCommissions(): Commission[] {
  const stored = localStorage.getItem(COMMISSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getConsultantCommissions(consultantId: string): Commission[] {
  const all = getAllCommissions();
  return all
    .filter(c => c.consultantId === consultantId)
    .sort((a, b) => new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime());
}

export function getCommissionById(id: string): Commission | undefined {
  return getAllCommissions().find(c => c.id === id);
}

export function addCommission(
  commission: Omit<Commission, 'id' | 'createdAt' | 'updatedAt'>
): Commission {
  const all = getAllCommissions();
  
  const newCommission: Commission = {
    ...commission,
    id: `commission_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  all.push(newCommission);
  localStorage.setItem(COMMISSIONS_KEY, JSON.stringify(all));
  
  createActivity(
    commission.consultantId,
    'commission-earned',
    `Commission earned: $${commission.commissionAmount.toLocaleString()}`,
    {
      entityType: commission.entityType,
      entityName: commission.entityName,
      status: commission.status,
    }
  );
  
  return newCommission;
}

export function updateCommission(
  id: string,
  updates: Partial<Commission>
): Commission | null {
  const all = getAllCommissions();
  const index = all.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  const oldStatus = all[index].status;
  
  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(COMMISSIONS_KEY, JSON.stringify(all));
  
  // Log status changes
  if (updates.status && updates.status !== oldStatus) {
    if (updates.status === 'approved') {
      createActivity(
        all[index].consultantId,
        'commission-earned',
        `Commission approved: $${all[index].commissionAmount.toLocaleString()}`,
        { approvedBy: updates.approvedByName }
      );
    } else if (updates.status === 'paid') {
      createActivity(
        all[index].consultantId,
        'commission-paid',
        `Commission paid: $${all[index].commissionAmount.toLocaleString()}`,
        { paymentDate: updates.paymentDate }
      );
    }
  }
  
  return all[index];
}

export function approveCommission(
  id: string,
  approvedBy: string,
  approvedByName: string
): boolean {
  const commission = updateCommission(id, {
    status: 'approved',
    approvedBy,
    approvedByName,
    approvedAt: new Date().toISOString(),
  });
  
  return commission !== null;
}

export function markCommissionPaid(
  id: string,
  paymentDate: string,
  paymentReference: string,
  paymentMethod: Commission['paymentMethod']
): boolean {
  const commission = updateCommission(id, {
    status: 'paid',
    paymentDate,
    paymentReference,
    paymentMethod,
  });
  
  return commission !== null;
}

export function disputeCommission(id: string, reason: string): boolean {
  const commission = updateCommission(id, {
    status: 'disputed',
    disputeReason: reason,
    disputedAt: new Date().toISOString(),
  });
  
  return commission !== null;
}

export function getCommissionsByStatus(
  consultantId: string,
  status: CommissionStatus
): Commission[] {
  return getConsultantCommissions(consultantId).filter(c => c.status === status);
}

export function getCommissionStats(consultantId: string) {
  const commissions = getConsultantCommissions(consultantId);
  
  return {
    total: commissions.length,
    totalEarned: commissions.reduce((sum, c) => sum + c.commissionAmount, 0),
    pending: commissions.filter(c => c.status === 'pending').length,
    pendingAmount: commissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.commissionAmount, 0),
    approved: commissions.filter(c => c.status === 'approved').length,
    approvedAmount: commissions
      .filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + c.commissionAmount, 0),
    paid: commissions.filter(c => c.status === 'paid').length,
    paidAmount: commissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.commissionAmount, 0),
    disputed: commissions.filter(c => c.status === 'disputed').length,
    disputedAmount: commissions
      .filter(c => c.status === 'disputed')
      .reduce((sum, c) => sum + c.commissionAmount, 0),
  };
}

// Payments
export function getAllPayments(): CommissionPayment[] {
  const stored = localStorage.getItem(PAYMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getConsultantPayments(consultantId: string): CommissionPayment[] {
  const all = getAllPayments();
  return all
    .filter(p => p.consultantId === consultantId)
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
}

export function addPayment(
  payment: Omit<CommissionPayment, 'id' | 'createdAt'>
): CommissionPayment {
  const all = getAllPayments();
  
  const newPayment: CommissionPayment = {
    ...payment,
    id: `payment_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  all.push(newPayment);
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(all));
  
  // Mark associated commissions as paid
  payment.commissionIds.forEach(commId => {
    markCommissionPaid(commId, payment.paymentDate, payment.reference, payment.method);
  });
  
  return newPayment;
}
