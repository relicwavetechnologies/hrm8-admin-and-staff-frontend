export type ManagedServiceUiPolicy =
  | 'HRM8_SHORTLISTING'
  | 'HRM8_FULL_SERVICE_HANDOFF'
  | 'DEFAULT';

export type ManagedPipelineOwner = 'CONSULTANT' | 'COMPANY' | null;

type ManagedJobLike = {
  managementType?: string | null;
  servicePackage?: string | null;
};

type ManagedApplicationLike = {
  managedPipelineOwner?: ManagedPipelineOwner | string | null;
  managed_pipeline_owner?: ManagedPipelineOwner | string | null;
  consultantActionType?: string | null;
  consultantActionedAt?: string | Date | null;
  consultantActionedBy?: string | null;
  consultantActionRoundId?: string | null;
  consultant_action_type?: string | null;
  consultant_actioned_at?: string | Date | null;
  shortlisted?: boolean | null;
  stage?: string | null;
  status?: string | null;
};

export function normalizeServicePackage(raw?: string | null): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');
}

export function resolveManagedServicePolicy(job?: ManagedJobLike | null): ManagedServiceUiPolicy {
  if (!job || job.managementType !== 'hrm8-managed') {
    return 'DEFAULT';
  }

  const normalizedServicePackage = normalizeServicePackage(job.servicePackage);
  if (normalizedServicePackage === 'shortlisting') {
    return 'HRM8_SHORTLISTING';
  }
  if (normalizedServicePackage === 'full-service') {
    return 'HRM8_FULL_SERVICE_HANDOFF';
  }
  return 'DEFAULT';
}

export function deriveManagedPipelineOwner(
  application?: ManagedApplicationLike | null,
  job?: ManagedJobLike | null
): ManagedPipelineOwner {
  if (!application || resolveManagedServicePolicy(job) !== 'HRM8_FULL_SERVICE_HANDOFF') {
    return null;
  }

  const persistedOwner = application.managedPipelineOwner ?? application.managed_pipeline_owner;
  if (persistedOwner === 'COMPANY' || persistedOwner === 'CONSULTANT') {
    return persistedOwner;
  }

  const normalizedStage = String(application.stage || '').toUpperCase();
  const normalizedStatus = String(application.status || '').toUpperCase();

  if (
    normalizedStage === 'OFFER_EXTENDED' ||
    normalizedStage === 'OFFER_ACCEPTED' ||
    normalizedStatus === 'HIRED'
  ) {
    return 'COMPANY';
  }

  return 'CONSULTANT';
}

export function getManagedServiceLockReason(args: {
  policy: ManagedServiceUiPolicy;
  isConsultantView: boolean;
  application: ManagedApplicationLike;
  job?: ManagedJobLike | null;
}): string | null {
  const { policy, isConsultantView, application, job } = args;

  if (policy === 'HRM8_SHORTLISTING') {
    const consultantActionedAt =
      application.consultantActionedAt ?? application.consultant_actioned_at;
    const consultantActionType =
      application.consultantActionType ?? application.consultant_action_type;

    if (isConsultantView) {
      return consultantActionedAt ? 'Shortlisting action already taken.' : null;
    }

    if (!consultantActionedAt) {
      return application.shortlisted ? null : 'Awaiting consultant shortlisting.';
    }

    if (consultantActionType === 'REJECTED') {
      return 'Consultant rejected this candidate.';
    }

    return null;
  }

  if (policy === 'HRM8_FULL_SERVICE_HANDOFF') {
    const owner = deriveManagedPipelineOwner(application, job);
    if (isConsultantView) {
      return owner === 'COMPANY'
        ? 'This candidate has been handed over to the company for offer management.'
        : null;
    }

    return owner === 'COMPANY'
      ? null
      : 'HRM8 consultant is managing this candidate until offer stage.';
  }

  return null;
}
