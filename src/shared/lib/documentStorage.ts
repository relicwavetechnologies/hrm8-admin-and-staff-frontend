import type { Document, DocumentFolder, DocumentVersion, DocumentStats } from '@/shared/types/document';
import { mockDocuments, mockFolders } from '@/shared/data/mockDocumentData';

const DOCUMENTS_KEY = 'documents';
const FOLDERS_KEY = 'document_folders';
const VERSIONS_KEY = 'document_versions';

function initializeData() {
  if (!localStorage.getItem(DOCUMENTS_KEY)) {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(mockDocuments));
  }
  if (!localStorage.getItem(FOLDERS_KEY)) {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(mockFolders));
  }
}

export function getDocuments(): Document[] {
  initializeData();
  const stored = localStorage.getItem(DOCUMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'downloadCount'>): Document {
  const documents = getDocuments();
  const newDocument: Document = {
    ...document,
    
    viewCount: 0,
    downloadCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  documents.push(newDocument);
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
  return newDocument;
}

export function updateDocument(id: string, updates: Partial<Document>): Document | null {
  const documents = getDocuments();
  const index = documents.findIndex(d => d.id === id);
  if (index === -1) return null;
  
  documents[index] = {
    ...documents[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
  return documents[index];
}

export function getFolders(): DocumentFolder[] {
  initializeData();
  const stored = localStorage.getItem(FOLDERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveFolder(folder: Omit<DocumentFolder, 'id' | 'createdAt'>): DocumentFolder {
  const folders = getFolders();
  const newFolder: DocumentFolder = {
    ...folder,
    
    createdAt: new Date().toISOString(),
  };
  folders.push(newFolder);
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  return newFolder;
}

export function getVersions(documentId: string): DocumentVersion[] {
  const stored = localStorage.getItem(VERSIONS_KEY);
  const allVersions: DocumentVersion[] = stored ? JSON.parse(stored) : [];
  return allVersions.filter(v => v.documentId === documentId);
}

export function calculateDocumentStats(): DocumentStats {
  const documents = getDocuments();
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    totalDocuments: documents.length,
    activeDocuments: documents.filter(d => d.status === 'active').length,
    expiringDocuments: documents.filter(d => 
      d.expiryDate && new Date(d.expiryDate) <= thirtyDaysFromNow && new Date(d.expiryDate) > now
    ).length,
    totalStorage: documents.reduce((sum, d) => sum + d.fileSize, 0),
  };
}

export function getDocumentStats(): DocumentStats {
  return calculateDocumentStats();
}
