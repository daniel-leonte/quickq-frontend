export interface Job {
  company: string;
  description: string;
  first_seen: string;
  job_level: string;
  job_link: string;
  job_type: string;
  location: string;
  skills: string[];
  title: string;
}

// Interview simulation types
export interface InterviewRequest {
  job: {
    title: string;
    description: string;
    skills: string[];
  };
}

export interface InterviewResponse {
  job_title: string;
  questions: string[];
  success: boolean;
  tech_skills: string[];
  total: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  type: 'question' | 'answer';
} 