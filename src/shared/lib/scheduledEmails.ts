export interface ScheduledEmail {
  id: string;
  emailType: string;
  message: string;
  recipientIds: string[];
  recipientCount: number;
  scheduledFor: Date;
  createdAt: Date;
  status: 'pending' | 'sent' | 'cancelled';
  sentAt?: Date;
  deliveryStatus?: 'delivered' | 'failed' | 'bounced';
  openedAt?: Date;
  clickedAt?: Date;
}

const STORAGE_KEY = "scheduled_emails";

export function getScheduledEmails(): ScheduledEmail[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const emails = JSON.parse(saved);
    // Convert date strings back to Date objects
    return emails.map((email: any) => ({
      ...email,
      scheduledFor: new Date(email.scheduledFor),
      createdAt: new Date(email.createdAt),
      sentAt: email.sentAt ? new Date(email.sentAt) : undefined,
      openedAt: email.openedAt ? new Date(email.openedAt) : undefined,
      clickedAt: email.clickedAt ? new Date(email.clickedAt) : undefined,
    }));
  } catch (error) {
    console.error("Error loading scheduled emails:", error);
    return [];
  }
}

export function scheduleEmail(
  emailType: string,
  message: string,
  recipientIds: string[],
  scheduledFor: Date
): ScheduledEmail {
  const scheduledEmails = getScheduledEmails();
  
  const newEmail: ScheduledEmail = {
    id: `scheduled-${Date.now()}`,
    emailType,
    message,
    recipientIds,
    recipientCount: recipientIds.length,
    scheduledFor,
    createdAt: new Date(),
    status: 'pending',
  };
  
  const updatedEmails = [...scheduledEmails, newEmail];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmails));
  
  return newEmail;
}

export function cancelScheduledEmail(id: string): void {
  const scheduledEmails = getScheduledEmails();
  const updatedEmails = scheduledEmails.map(email =>
    email.id === id ? { ...email, status: 'cancelled' as const } : email
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmails));
}

export function updateScheduledEmail(
  id: string,
  updates: {
    emailType?: string;
    message?: string;
    recipientIds?: string[];
    scheduledFor?: Date;
  }
): ScheduledEmail | null {
  const scheduledEmails = getScheduledEmails();
  const emailIndex = scheduledEmails.findIndex(email => email.id === id);
  
  if (emailIndex === -1) return null;
  
  const updatedEmail = {
    ...scheduledEmails[emailIndex],
    ...updates,
    recipientCount: updates.recipientIds?.length ?? scheduledEmails[emailIndex].recipientCount,
  };
  
  scheduledEmails[emailIndex] = updatedEmail;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduledEmails));
  
  return updatedEmail;
}

export function deleteScheduledEmail(id: string): void {
  const scheduledEmails = getScheduledEmails();
  const updatedEmails = scheduledEmails.filter(email => email.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmails));
}

export function getPendingScheduledEmails(): ScheduledEmail[] {
  return getScheduledEmails().filter(email => email.status === 'pending');
}

export function markEmailAsSent(id: string, deliveryStatus: 'delivered' | 'failed' | 'bounced' = 'delivered'): void {
  const scheduledEmails = getScheduledEmails();
  const updatedEmails = scheduledEmails.map(email =>
    email.id === id ? { 
      ...email, 
      status: 'sent' as const,
      sentAt: new Date(),
      deliveryStatus 
    } : email
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmails));
}

export function markEmailAsOpened(id: string): void {
  const scheduledEmails = getScheduledEmails();
  const updatedEmails = scheduledEmails.map(email =>
    email.id === id && !email.openedAt ? { 
      ...email, 
      openedAt: new Date()
    } : email
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmails));
}

export function markEmailAsClicked(id: string): void {
  const scheduledEmails = getScheduledEmails();
  const updatedEmails = scheduledEmails.map(email =>
    email.id === id && !email.clickedAt ? { 
      ...email, 
      clickedAt: new Date()
    } : email
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmails));
}

export function getSentEmails(): ScheduledEmail[] {
  return getScheduledEmails().filter(email => email.status === 'sent');
}
