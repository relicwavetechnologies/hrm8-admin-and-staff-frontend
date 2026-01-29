/**
 * Calendar Integration Service
 * Handles Google Calendar and Outlook Calendar integrations
 */

export type CalendarProvider = 'google' | 'outlook';

export interface CalendarIntegration {
  id: string;
  provider: CalendarProvider;
  email: string;
  connected: boolean;
  connectedAt?: string;
  lastSync?: string;
  defaultCalendarId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees: string[];
  meetingLink?: string;
}

// Mock storage for integrations
const STORAGE_KEY = 'calendar_integrations';

export function getCalendarIntegrations(): CalendarIntegration[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveCalendarIntegration(integration: CalendarIntegration): void {
  const integrations = getCalendarIntegrations();
  const index = integrations.findIndex(i => i.provider === integration.provider);

  if (index >= 0) {
    integrations[index] = integration;
  } else {
    integrations.push(integration);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(integrations));
}

export function disconnectCalendarIntegration(provider: CalendarProvider): void {
  const integrations = getCalendarIntegrations().filter(i => i.provider !== provider);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(integrations));
}

export function getCalendarIntegration(provider: CalendarProvider): CalendarIntegration | undefined {
  return getCalendarIntegrations().find(i => i.provider === provider);
}

/**
 * Initiate OAuth flow for calendar provider
 */
export async function connectCalendarProvider(provider: CalendarProvider): Promise<void> {
  // Mock OAuth flow - in production this would be a real OAuth implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const integration: CalendarIntegration = {
        id: `${provider}-${Date.now()}`,
        provider,
        email: `user@${provider === 'google' ? 'gmail.com' : 'outlook.com'}`,
        connected: true,
        connectedAt: new Date().toISOString(),
        lastSync: new Date().toISOString(),
        defaultCalendarId: 'primary',
      };

      saveCalendarIntegration(integration);
      resolve();
    }, 1500);
  });
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  provider: CalendarProvider,
  event: Omit<CalendarEvent, 'id'>
): Promise<CalendarEvent> {
  const integration = getCalendarIntegration(provider);

  if (!integration || !integration.connected) {
    throw new Error(`${provider} calendar is not connected`);
  }

  // Mock event creation - in production this would use the provider's API
  const createdEvent: CalendarEvent = {
    id: `event-${Date.now()}`,
    ...event,
  };

  console.log('Creating calendar event via', provider, createdEvent);

  return new Promise((resolve) => {
    setTimeout(() => resolve(createdEvent), 1000);
  });
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  provider: CalendarProvider,
  eventId: string,
  updates: Partial<CalendarEvent>
): Promise<CalendarEvent> {
  const integration = getCalendarIntegration(provider);

  if (!integration || !integration.connected) {
    throw new Error(`${provider} calendar is not connected`);
  }

  // Mock update - in production this would use the provider's API
  console.log('Updating calendar event via', provider, eventId, updates);

  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: eventId, ...updates } as CalendarEvent), 1000);
  });
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  provider: CalendarProvider,
  eventId: string
): Promise<void> {
  const integration = getCalendarIntegration(provider);

  if (!integration || !integration.connected) {
    throw new Error(`${provider} calendar is not connected`);
  }

  // Mock deletion - in production this would use the provider's API
  console.log('Deleting calendar event via', provider, eventId);

  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
}

/**
 * Get available time slots for scheduling
 */
export async function getAvailableTimeSlots(
  provider: CalendarProvider,
  startDate: string,
  _endDate: string,
  duration: number // in minutes
): Promise<Array<{ start: string; end: string }>> {
  const integration = getCalendarIntegration(provider);

  if (!integration || !integration.connected) {
    throw new Error(`${provider} calendar is not connected`);
  }

  // Mock availability - in production this would check actual calendar
  const mockSlots = [
    {
      start: new Date(startDate).toISOString(),
      end: new Date(new Date(startDate).getTime() + duration * 60000).toISOString(),
    },
  ];

  return new Promise((resolve) => {
    setTimeout(() => resolve(mockSlots), 1000);
  });
}

/**
 * Sync calendar events
 */
export async function syncCalendar(provider: CalendarProvider): Promise<void> {
  const integration = getCalendarIntegration(provider);

  if (!integration || !integration.connected) {
    throw new Error(`${provider} calendar is not connected`);
  }

  // Mock sync - in production this would fetch events from the provider
  integration.lastSync = new Date().toISOString();
  saveCalendarIntegration(integration);

  return new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
}
