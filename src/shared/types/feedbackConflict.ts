export interface FeedbackConflict {
  feedbackId: string;
  field: string;
  localValue: unknown;
  remoteValue: unknown;
  localUser: string;
  remoteUser: string;
  localTimestamp: Date;
  remoteTimestamp: Date;
}

export interface ConflictResolution {
  feedbackId: string;
  field: string;
  chosenValue: unknown;
  resolution: 'keep-local' | 'accept-remote' | 'merge';
  resolvedBy: string;
  resolvedAt: Date;
}

export type ConflictDetectionResult = {
  hasConflicts: boolean;
  conflicts: FeedbackConflict[];
};
