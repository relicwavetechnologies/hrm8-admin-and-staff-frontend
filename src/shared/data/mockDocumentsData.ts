import { EmployerDocument, DocumentType } from "@/shared/types/employerCRM";
import { mockEmployers } from "./mockTableData";

const documentTypes: { type: DocumentType; names: string[] }[] = [
  { type: 'msa', names: ['Master Service Agreement 2024', 'MSA - Recruitment Services', 'Service Agreement'] },
  { type: 'contract', names: ['Recruitment Contract', 'Service Contract', 'Vendor Agreement'] },
  { type: 'proposal', names: ['Recruitment Services Proposal', 'Service Proposal Q1', 'Partnership Proposal'] },
  { type: 'agreement', names: ['Signed Agreement', 'Partnership Agreement', 'Collaboration Agreement'] },
  { type: 'invoice', names: ['Invoice #001', 'Invoice #002', 'Monthly Invoice'] },
  { type: 'other', names: ['Terms & Conditions', 'Privacy Policy', 'Data Processing Agreement'] },
];

const uploaderNames = ["Admin User", "Sarah Johnson", "Michael Chen", "Emily Rodriguez", "System Admin"];

// Generate 3-7 documents per employer
export const mockDocuments: EmployerDocument[] = mockEmployers.flatMap(employer => {
  const count = Math.floor(Math.random() * 5) + 3; // 3-7 documents
  const usedTypes = new Set<DocumentType>();
  
  return Array.from({ length: count }, (_, i) => {
    // Try to get a type we haven't used yet
    let typeGroup = documentTypes[Math.floor(Math.random() * documentTypes.length)];
    let attempts = 0;
    while (usedTypes.has(typeGroup.type) && attempts < 10) {
      typeGroup = documentTypes[Math.floor(Math.random() * documentTypes.length)];
      attempts++;
    }
    usedTypes.add(typeGroup.type);
    
    const name = typeGroup.names[Math.floor(Math.random() * typeGroup.names.length)];
    const extension = typeGroup.type === 'invoice' ? 'pdf' : ['pdf', 'docx', 'xlsx'][Math.floor(Math.random() * 3)];
    const fileName = `${name.toLowerCase().replace(/\s+/g, '_')}.${extension}`;
    
    const daysAgo = Math.floor(Math.random() * 180);
    const uploadedAt = new Date();
    uploadedAt.setDate(uploadedAt.getDate() - daysAgo);
    
    // File size between 50KB and 2MB
    const fileSize = Math.floor(Math.random() * (2 * 1024 * 1024 - 50 * 1024)) + 50 * 1024;
    
    const uploaderName = uploaderNames[Math.floor(Math.random() * uploaderNames.length)];
    
    return {
      id: `doc_${employer.id}_${i}`,
      employerId: employer.id,
      type: typeGroup.type,
      name,
      fileName,
      fileSize,
      fileUrl: `/documents/${fileName}`,
      uploadedBy: `user_${Math.floor(Math.random() * 5)}`,
      uploadedByName: uploaderName,
      uploadedAt: uploadedAt.toISOString(),
      notes: i === 0 ? 'Latest version - fully executed' : undefined,
    };
  });
});

export function initializeMockDocuments() {
  if (!localStorage.getItem('employer_documents')) {
    localStorage.setItem('employer_documents', JSON.stringify(mockDocuments));
  }
}
