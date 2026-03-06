export interface ReviewNotification {
  id: string;
  type: 'review' | 'vote' | 'comment' | 'reply';
  applicationId: string;
  applicationTitle: string;
  candidateName: string;
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  link: string;
}

export interface ApplicationFollower {
  userId: string;
  applicationId: string;
  followedAt: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

const NOTIFICATIONS_KEY = 'review_notifications';
const FOLLOWERS_KEY = 'application_followers';

// Notifications
export function getNotifications(_userId: string): ReviewNotification[] {
  const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
  return notifications;
}

export function getUnreadCount(userId: string): number {
  const notifications = getNotifications(userId);
  return notifications.filter(n => !n.isRead).length;
}

export function markAsRead(notificationId: string): void {
  const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
  const updated = notifications.map((n: ReviewNotification) =>
    n.id === notificationId ? { ...n, isRead: true } : n
  );
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

export function markAllAsRead(_userId: string): void {
  const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
  const updated = notifications.map((n: ReviewNotification) => ({ ...n, isRead: true }));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

export function createNotification(
  notification: Omit<ReviewNotification, 'id' | 'createdAt' | 'isRead'>
): ReviewNotification {
  const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
  const newNotification: ReviewNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random()}`,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  notifications.unshift(newNotification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  return newNotification;
}

// Followers
export function followApplication(
  userId: string,
  applicationId: string,
  options: { emailNotifications?: boolean; inAppNotifications?: boolean } = {}
): void {
  const followers = JSON.parse(localStorage.getItem(FOLLOWERS_KEY) || '[]');

  // Remove existing follow if any
  const filtered = followers.filter(
    (f: ApplicationFollower) => !(f.userId === userId && f.applicationId === applicationId)
  );

  filtered.push({
    userId,
    applicationId,
    followedAt: new Date().toISOString(),
    emailNotifications: options.emailNotifications ?? true,
    inAppNotifications: options.inAppNotifications ?? true,
  });

  localStorage.setItem(FOLLOWERS_KEY, JSON.stringify(filtered));
}

export function unfollowApplication(userId: string, applicationId: string): void {
  const followers = JSON.parse(localStorage.getItem(FOLLOWERS_KEY) || '[]');
  const filtered = followers.filter(
    (f: ApplicationFollower) => !(f.userId === userId && f.applicationId === applicationId)
  );
  localStorage.setItem(FOLLOWERS_KEY, JSON.stringify(filtered));
}

export function isFollowing(userId: string, applicationId: string): boolean {
  const followers = JSON.parse(localStorage.getItem(FOLLOWERS_KEY) || '[]');
  return followers.some(
    (f: ApplicationFollower) => f.userId === userId && f.applicationId === applicationId
  );
}

export function getFollowers(applicationId: string): ApplicationFollower[] {
  const followers = JSON.parse(localStorage.getItem(FOLLOWERS_KEY) || '[]');
  return followers.filter((f: ApplicationFollower) => f.applicationId === applicationId);
}

export function updateNotificationPreferences(
  userId: string,
  applicationId: string,
  preferences: { emailNotifications?: boolean; inAppNotifications?: boolean }
): void {
  const followers = JSON.parse(localStorage.getItem(FOLLOWERS_KEY) || '[]');
  const updated = followers.map((f: ApplicationFollower) =>
    f.userId === userId && f.applicationId === applicationId
      ? { ...f, ...preferences }
      : f
  );
  localStorage.setItem(FOLLOWERS_KEY, JSON.stringify(updated));
}

// Notification creation helpers
export function notifyReviewAdded(
  applicationId: string,
  candidateName: string,
  jobTitle: string,
  reviewerId: string,
  reviewerName: string,
  reviewerAvatar?: string
): void {
  const followers = getFollowers(applicationId);

  followers.forEach((follower) => {
    if (follower.userId !== reviewerId && follower.inAppNotifications) {
      createNotification({
        type: 'review',
        applicationId,
        applicationTitle: `${jobTitle} - ${candidateName}`,
        candidateName,
        actorId: reviewerId,
        actorName: reviewerName,
        actorAvatar: reviewerAvatar,
        content: `${reviewerName} added a review`,
        link: `/applications/${applicationId}`,
      });

      // Mock email sending - would be replaced with actual edge function call
      if (follower.emailNotifications) {
        console.log(`[Mock Email] Sending review notification to user ${follower.userId}`);
      }
    }
  });
}

export function notifyVoteAdded(
  applicationId: string,
  candidateName: string,
  jobTitle: string,
  voterId: string,
  voterName: string,
  decision: string,
  voterAvatar?: string
): void {
  const followers = getFollowers(applicationId);

  followers.forEach((follower) => {
    if (follower.userId !== voterId && follower.inAppNotifications) {
      createNotification({
        type: 'vote',
        applicationId,
        applicationTitle: `${jobTitle} - ${candidateName}`,
        candidateName,
        actorId: voterId,
        actorName: voterName,
        actorAvatar: voterAvatar,
        content: `${voterName} voted to ${decision}`,
        link: `/applications/${applicationId}`,
      });

      if (follower.emailNotifications) {
        console.log(`[Mock Email] Sending vote notification to user ${follower.userId}`);
      }
    }
  });
}

export function notifyCommentAdded(
  applicationId: string,
  candidateName: string,
  jobTitle: string,
  commenterId: string,
  commenterName: string,
  commentPreview: string,
  isReply: boolean = false,
  commenterAvatar?: string
): void {
  const followers = getFollowers(applicationId);

  followers.forEach((follower) => {
    if (follower.userId !== commenterId && follower.inAppNotifications) {
      createNotification({
        type: isReply ? 'reply' : 'comment',
        applicationId,
        applicationTitle: `${jobTitle} - ${candidateName}`,
        candidateName,
        actorId: commenterId,
        actorName: commenterName,
        actorAvatar: commenterAvatar,
        content: `${commenterName} ${isReply ? 'replied' : 'commented'}: ${commentPreview.substring(0, 50)}...`,
        link: `/applications/${applicationId}`,
      });

      if (follower.emailNotifications) {
        console.log(`[Mock Email] Sending comment notification to user ${follower.userId}`);
      }
    }
  });
}
