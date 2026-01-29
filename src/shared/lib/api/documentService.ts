/**
 * Document Service
 * Handles document parsing and job extraction API calls
 */

import { apiClient } from '../api';

export interface ExtractedJobData {
  title?: string;
  description?: string;
  requirements: string[];
  responsibilities: string[];
  qualifications?: string[];
  benefits?: string[];
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  department?: string;
}

export interface ParseDocumentResponse {
  extractedText: string;
  fullText: string;
  extractedData: ExtractedJobData;
  metadata?: {
    title?: string;
    author?: string;
    pages?: number;
    wordCount?: number;
  };
}

class DocumentService {
  /**
   * Parse document and extract job details
   */
  async parseDocument(file: File): Promise<{ success: boolean; data?: ParseDocumentResponse; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('document', file);

      // Use fetch directly for FormData to let browser set Content-Type with boundary
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const url = `${API_BASE_URL}/api/jobs/parse-document`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Important for cookies/auth
        // Don't set Content-Type header - browser will set it with boundary
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return data as { success: boolean; data?: ParseDocumentResponse; error?: string };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse document',
      };
    }
  }
}

export const documentService = new DocumentService();

