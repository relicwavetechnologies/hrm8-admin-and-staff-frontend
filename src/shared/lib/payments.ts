import { apiClient } from "./api";

export type UpgradeTier = "shortlisting" | "full_service" | "executive_search";

type CheckoutResponse = {
  checkoutUrl: string;
  sessionId: string;
};

export async function createUpgradeCheckoutSession(params: {
  tier: UpgradeTier;
  companyId: string;
  customerEmail?: string;
}) {
  return apiClient.post<CheckoutResponse>("/api/payments/upgrade-checkout", params);
}

export async function createJobCheckoutSession(params: {
  jobId: string;
  servicePackage: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search';
  companyId: string;
  customerEmail?: string;
}) {
  return apiClient.post<CheckoutResponse>("/api/payments/job-checkout", params);
}

type VerifyPaymentResponse = {
  paymentStatus: string;
  alreadyPaid?: boolean;
  verified?: boolean;
  published?: boolean;
};

export async function verifyJobPayment(params: {
  jobId: string;
  companyId: string;
}) {
  return apiClient.post<VerifyPaymentResponse>("/api/payments/verify-job-payment", params);
}






