/**
 * Company API Service
 * Client-side service for company-related API calls
 */

export interface CompanyStats {
    employeeCount: number;
    jobsPostedThisMonth: number;
    activeJobs: number;
    applicationsThisMonth: number;
}

class CompanyService {
    private baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/companies`;

    async getCompanyStats(companyId: string): Promise<CompanyStats> {
        const url = `${this.baseUrl}/${companyId}/stats`;

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch company stats: ${response.status}`);
        }

        const data = await response.json();
        return data.data;
    }
}

export const companyService = new CompanyService();
