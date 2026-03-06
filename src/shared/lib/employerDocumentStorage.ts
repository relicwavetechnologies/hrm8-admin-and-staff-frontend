import { EmployerDocument, DocumentType } from "@/shared/types/employerCRM";
import { createActivity } from "@/shared/lib/employerCRMStorage";

const STORAGE_KEY = 'employer_documents';

export function getEmployerDocuments(employerId: string, type?: DocumentType): EmployerDocument[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  const all = stored ? JSON.parse(stored) : [];
  let filtered = all.filter((d: EmployerDocument) => d.employerId === employerId);
  
  if (type) {
    filtered = filtered.filter((d: EmployerDocument) => d.type === type);
  }
  
  return filtered.sort((a: EmployerDocument, b: EmployerDocument) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export function getDocumentsByType(employerId: string): Record<DocumentType, EmployerDocument[]> {
  const documents = getEmployerDocuments(employerId);
  
  return {
    contract: documents.filter(d => d.type === 'contract'),
    proposal: documents.filter(d => d.type === 'proposal'),
    agreement: documents.filter(d => d.type === 'agreement'),
    invoice: documents.filter(d => d.type === 'invoice'),
    msa: documents.filter(d => d.type === 'msa'),
    other: documents.filter(d => d.type === 'other'),
  };
}

export function createDocument(
  documentData: Omit<EmployerDocument, 'id' | 'uploadedAt'>
): EmployerDocument {
  const stored = localStorage.getItem(STORAGE_KEY);
  const documents = stored ? JSON.parse(stored) : [];
  
  const newDocument: EmployerDocument = {
    ...documentData,
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    uploadedAt: new Date().toISOString(),
  };
  
  documents.push(newDocument);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  
  // Log activity
  createActivity(
    documentData.employerId,
    'document-uploaded',
    `Document uploaded: ${documentData.name}`,
    `Type: ${documentData.type}`,
    { documentId: newDocument.id, type: documentData.type, fileName: documentData.fileName }
  );
  
  return newDocument;
}

export function updateDocument(documentId: string, updates: Partial<EmployerDocument>): EmployerDocument | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  const documents = JSON.parse(stored);
  const index = documents.findIndex((d: EmployerDocument) => d.id === documentId);
  
  if (index === -1) return null;
  
  documents[index] = {
    ...documents[index],
    ...updates,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  return documents[index];
}

export function deleteDocument(documentId: string, employerId: string): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;
  
  const documents = JSON.parse(stored);
  const document = documents.find((d: EmployerDocument) => d.id === documentId);
  
  if (!document) return false;
  
  const filtered = documents.filter((d: EmployerDocument) => d.id !== documentId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  
  // Log activity
  createActivity(
    employerId,
    'document-uploaded', // Using generic type
    `Document deleted: ${document.name}`,
    undefined,
    { documentId, action: 'deleted' }
  );
  
  return true;
}

export function simulateFileUpload(file: File): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate mock file URL
      const mockUrl = `/documents/${Date.now()}_${file.name}`;
      resolve(mockUrl);
    }, 1000); // Simulate 1s upload
  });
}
