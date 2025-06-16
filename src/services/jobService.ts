import type { Job, InterviewRequest, InterviewResponse, FeedbackRequest, FeedbackResponse } from '../types/job';
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

  async getInterviewQuestions(job: Job): Promise<InterviewResponse> {
    try {
      const requestData: InterviewRequest = {
        job: {
          title: job.title,
          description: job.description,
          skills: job.skills
        }
      };

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.QUESTIONS), {
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.questions && Array.isArray(data.questions)) {
        return data as InterviewResponse;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching interview questions:', error);
      throw error;
    }
  },

  async getFeedback(feedbackRequest: FeedbackRequest): Promise<FeedbackResponse> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.FEEDBACK), {
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(feedbackRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.feedback) {
        return data as FeedbackResponse;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  }
}; 