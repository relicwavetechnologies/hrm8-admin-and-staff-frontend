/**
 * Application Upload Service
 * Handles file uploads for job applications using Cloudinary
 */

import { apiClient } from './api';

export interface UploadFileResponse {
  url: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

class ApplicationUploadService {
  /**
   * Upload a file for application (resume, cover letter, or portfolio)
   */
  async uploadFile(
    file: File,
    type: 'resume' | 'coverLetter' | 'portfolio'
  ): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    // Use fetch directly for FormData
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const url = `${API_BASE_URL}/api/applications/upload`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Important for cookies
      // Don't set Content-Type header - browser will set it with boundary
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    return data.data;
  }

  /**
   * Delete an uploaded file
   */
  async deleteFile(publicId: string): Promise<void> {
    const response = await apiClient.delete(`/api/applications/upload/${publicId}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete file');
    }
  }
}

export const applicationUploadService = new ApplicationUploadService();








