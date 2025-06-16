import type { Job } from '../types/job';
import { API_CONFIG, buildApiUrl } from '../config/api';

export interface JobSearchParams {
  query: string;
  limit?: number;
  tech_skills?: string[];
  job_level?: string;
}

export interface JobApiResponse {
  jobs: Job[];
  total: number;
}

export const jobService = {
  async searchJobs(params: JobSearchParams): Promise<JobApiResponse> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.JOBS), {
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.jobs && Array.isArray(data.jobs)) {
        return {
          jobs: data.jobs as Job[],
          total: data.total
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },
}; 