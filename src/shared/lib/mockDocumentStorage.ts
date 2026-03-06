import { CandidateDocument } from '@/shared/types/entities';

const STORAGE_KEY = 'hrm8_candidate_documents';
const MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export interface DocumentUploadResult {
  success: boolean;
  document?: CandidateDocument;
  error?: string;
}

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
}

export function uploadDocument(
  candidateId: string,
  file: File,
  documentType: CandidateDocument['documentType'],
  uploadedBy: string
): Promise<DocumentUploadResult> {
  return new Promise((resolve) => {
    // Simulate upload delay
    setTimeout(() => {
      initializeStorage();

      // Check storage quota
      const currentSize = getCurrentStorageSize();
      if (currentSize + file.size > MAX_STORAGE_SIZE) {
        resolve({
          success: false,
          error: 'Storage quota exceeded. Please delete some files.',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        
        const newDocument: CandidateDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          candidateId,
          documentType,
          fileName: file.name,
          fileUrl: fileData, // Base64 string
          fileSize: file.size,
          uploadedBy,
          uploadedAt: new Date(),
        };

        const documents = getDocuments();
        documents.push(newDocument);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));

        resolve({
          success: true,
          document: newDocument,
        });
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file',
        });
      };

      reader.readAsDataURL(file);
    }, 500);
  });
}

export function getDocuments(): CandidateDocument[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data).map((d: any) => ({
    ...d,
    uploadedAt: new Date(d.uploadedAt),
  }));
}

export function getCandidateDocuments(candidateId: string): CandidateDocument[] {
  return getDocuments().filter(d => d.candidateId === candidateId);
}

export function deleteDocument(documentId: string): void {
  const documents = getDocuments();
  const filtered = documents.filter(d => d.id !== documentId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function downloadDocument(doc: CandidateDocument): void {
  const link = window.document.createElement('a');
  link.href = doc.fileUrl;
  link.download = doc.fileName;
  link.click();
}

export function getCurrentStorageSize(): number {
  const documents = getDocuments();
  return documents.reduce((total, doc) => total + doc.fileSize, 0);
}

export function getStorageQuota(): { used: number; total: number; percentage: number } {
  const used = getCurrentStorageSize();
  const total = MAX_STORAGE_SIZE;
  const percentage = (used / total) * 100;
  
  return { used, total, percentage };
}