/**
 * Consultant Assignment Request Service
 * API service for pending consultant assignment requests
 */

import { apiClient } from '@/shared/lib/apiClient';

export interface ConsultantAssignmentRequest {
  id: string;
  company_id: string;
  job_id: string;
  region_id: string | null;
  status: string;
  created_at: string;
  company: {
    id: string;
    name: string;
    region_id: string | null;
    suggested_consultant_id?: string | null;
    suggested_consultant?: {
      id: string;
      first_name: string;
      last_name: string;
      email?: string;
      source?: string;
    } | null;
  };
  job: {
    id: string;
    title: string;
    status: string;
    service_package: string | null;
    hiring_mode: string | null;
  };
  region: { id: string; name: string; code: string } | null;
}

export interface ConsultantAssignmentReviewContext {
  request: {
    id: string;
    status: string;
    companyId: string;
    jobId: string;
    regionId?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    assignedAt?: string | null;
    region?: { id: string; name: string; code: string } | null;
  };
  companyContext: {
    id: string;
    name: string;
    website?: string | null;
    billing_currency?: string | null;
    pricing_peg?: string | null;
    created_at?: string | null;
  } | null;
  conversionContext: {
    request: {
      id: string;
      status: string;
      company_name: string;
      email: string;
      phone?: string | null;
      website?: string | null;
      country?: string | null;
      city?: string | null;
      region_id?: string | null;
      created_at?: string | null;
      reviewed_at?: string | null;
      converted_at?: string | null;
      agent_notes?: string | null;
      intent_snapshot?: Record<string, unknown> | null;
    } | null;
    leadMilestones: {
      lead_created_at?: string | null;
      lead_confirmed_at?: string | null;
      lead_status?: string | null;
      lead_source?: string | null;
    };
    conversionMilestones: {
      request_submitted_at?: string | null;
      reviewed_at?: string | null;
      converted_at?: string | null;
    };
  };
  assignmentContext: {
    conversionSource?: string | null;
    pendingConsultantAssignment: boolean;
    suggestedConsultant?: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string;
      source?: string;
    } | null;
    assignedConsultant?: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string;
    } | null;
  };
  jobContext: {
    id: string;
    title: string;
    description?: string | null;
    location?: string | null;
    status: string;
    setupType?: string | null;
    managementType?: string | null;
    servicePackage?: string | null;
    hiringMode?: string | null;
    paymentStatus?: string | null;
    paymentAmount?: number | null;
    paymentCurrency?: string | null;
    postedAt?: string | null;
  };
  financials?: {
    paymentStatus?: string;
    paymentAmount?: number;
    paymentCurrency?: string;
    servicePackage?: string;
    billId?: string | null;
    billNumber?: string | null;
    billStatus?: string | null;
    billAmount?: number | null;
    billTaxAmount?: number | null;
    billTotalAmount?: number | null;
    billCurrency?: string | null;
    billDueDate?: string | null;
    billPaidAt?: string | null;
    billCreatedAt?: string | null;
    paymentMethod?: string | null;
    paymentAttemptId?: string | null;
    accountingRef?: string | null;
    accountingSyncedAt?: string | null;
    provider?: string | null;
    providerTransactionId?: string | null;
    checkoutType?: string | null;
    xeroInvoiceId?: string | null;
    xeroInvoiceNumber?: string | null;
  };
  dataCompleteness: {
    preAssignmentReviewComplete: boolean;
    financialEvidenceAvailable: boolean;
  };
}

class ConsultantAssignmentRequestService {
  async listPending(scope: 'my_regions' | 'all' = 'my_regions') {
    const params = new URLSearchParams();
    params.append('scope', scope);
    return apiClient.get<{ requests: ConsultantAssignmentRequest[] }>(
      `/api/hrm8/consultant-assignment-requests?${params.toString()}`
    );
  }

  async assign(
    requestId: string,
    consultantId: string,
    skipRegionCheck = true
  ) {
    return apiClient.post<{ success: boolean; jobId: string; consultantId: string }>(
      `/api/hrm8/consultant-assignment-requests/${requestId}/assign`,
      { consultantId, skipRegionCheck }
    );
  }

  async getReviewContext(requestId: string) {
    return apiClient.get<{ context: ConsultantAssignmentReviewContext }>(
      `/api/hrm8/consultant-assignment-requests/${requestId}/review-context`
    );
  }
}

export const consultantAssignmentRequestService = new ConsultantAssignmentRequestService();
