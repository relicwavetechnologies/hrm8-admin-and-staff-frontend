import { EmployerContact, ContactRole } from "@/shared/types/employerCRM";
import { createActivity } from "@/shared/lib/employerCRMStorage";

const STORAGE_KEY = 'employer_contacts';

export function getEmployerContacts(employerId: string): EmployerContact[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  const all = stored ? JSON.parse(stored) : [];
  return all
    .filter((c: EmployerContact) => c.employerId === employerId)
    .sort((a: EmployerContact, b: EmployerContact) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export function getPrimaryContact(employerId: string): EmployerContact | null {
  const contacts = getEmployerContacts(employerId);
  return contacts.find(c => c.isPrimary) || null;
}

export function createContact(
  contactData: Omit<EmployerContact, 'id' | 'createdAt' | 'updatedAt'>
): EmployerContact {
  const stored = localStorage.getItem(STORAGE_KEY);
  const contacts = stored ? JSON.parse(stored) : [];
  
  // If setting as primary, unset existing primary
  if (contactData.isPrimary) {
    contacts.forEach((c: EmployerContact) => {
      if (c.employerId === contactData.employerId && c.isPrimary) {
        c.isPrimary = false;
        c.updatedAt = new Date().toISOString();
      }
    });
  }
  
  const newContact: EmployerContact = {
    ...contactData,
    id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  contacts.push(newContact);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  
  // Log activity
  createActivity(
    contactData.employerId,
    'contact-added',
    `Contact added: ${contactData.firstName} ${contactData.lastName}`,
    contactData.title ? `Title: ${contactData.title}` : undefined,
    { contactId: newContact.id, roles: contactData.roles }
  );
  
  return newContact;
}

export function updateContact(contactId: string, updates: Partial<EmployerContact>): EmployerContact | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  const contacts = JSON.parse(stored);
  const index = contacts.findIndex((c: EmployerContact) => c.id === contactId);
  
  if (index === -1) return null;
  
  const contact = contacts[index];
  
  // If setting as primary, unset existing primary
  if (updates.isPrimary && !contact.isPrimary) {
    contacts.forEach((c: EmployerContact) => {
      if (c.employerId === contact.employerId && c.isPrimary && c.id !== contactId) {
        c.isPrimary = false;
        c.updatedAt = new Date().toISOString();
      }
    });
  }
  
  contacts[index] = {
    ...contact,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  
  // Log activity
  createActivity(
    contact.employerId,
    'contact-updated',
    `Contact updated: ${contacts[index].firstName} ${contacts[index].lastName}`
  );
  
  return contacts[index];
}

export function setPrimaryContact(contactId: string, employerId: string): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;
  
  const contacts = JSON.parse(stored);
  
  // Unset all primary contacts for this employer
  contacts.forEach((c: EmployerContact) => {
    if (c.employerId === employerId) {
      c.isPrimary = false;
      c.updatedAt = new Date().toISOString();
    }
  });
  
  // Set new primary
  const contact = contacts.find((c: EmployerContact) => c.id === contactId);
  if (!contact) return false;
  
  contact.isPrimary = true;
  contact.updatedAt = new Date().toISOString();
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  
  // Log activity
  createActivity(
    employerId,
    'contact-updated',
    `Primary contact set: ${contact.firstName} ${contact.lastName}`
  );
  
  return true;
}

export function deleteContact(contactId: string, employerId: string): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;
  
  const contacts = JSON.parse(stored);
  const employerContacts = contacts.filter((c: EmployerContact) => c.employerId === employerId);
  
  // Prevent deletion of last contact
  if (employerContacts.length === 1) {
    throw new Error("Cannot delete the last contact. Add another contact first.");
  }
  
  const contact = contacts.find((c: EmployerContact) => c.id === contactId);
  if (!contact) return false;
  
  // Prevent deletion of primary contact
  if (contact.isPrimary) {
    throw new Error("Cannot delete primary contact. Set another contact as primary first.");
  }
  
  const filtered = contacts.filter((c: EmployerContact) => c.id !== contactId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  
  // Log activity
  createActivity(
    employerId,
    'contact-removed',
    `Contact removed: ${contact.firstName} ${contact.lastName}`
  );
  
  return true;
}
