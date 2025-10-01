import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface GenerateQuestionRequest {
  action: 'generate_question';
  difficulty: 'easy' | 'medium' | 'hard';
  job_context?: string;
  seed_questions?: string[];
}

export interface GenerateQuestionResponse {
  question: string;
  difficulty: string;
}

export interface ScoreAnswerRequest {
  question: string;
  ideal: string;
  candidate_answer: string;
}

export interface ScoreAnswerResponse {
  score: number;
  reason: string;
}

export interface GenerateSummaryRequest {
  answers: Array<{
    question: string;
    candidate_answer: string;
    score: number;
  }>;
  candidate: {
    name: string;
    email: string;
  };
  job: {
    title: string;
  };
}

export interface GenerateSummaryResponse {
  final_score: number;
  summary: string;
}

export const apiService = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Generate interview question
  generateQuestion: async (request: GenerateQuestionRequest): Promise<GenerateQuestionResponse> => {
    const response = await api.post('/generate', request);
    return response.data;
  },

  // Generate ideal answer
  generateIdealAnswer: async (question: string): Promise<{ ideal: string }> => {
    const response = await api.post('/generate', {
      action: 'generate_ideal',
      question,
    });
    return response.data;
  },

  // Generate batch questions (all 6 at once with ideal answers)
  generateBatchQuestions: async (data: {
    action: 'generate_batch';
    job_context: string;
    job_description: string;
    difficulties: Array<'easy' | 'medium' | 'hard'>;
  }): Promise<{ questions: Array<{ question: string; ideal_answer: string }> }> => {
    const response = await api.post('/generate', data);
    return response.data;
  },

  // Score candidate answer
  scoreAnswer: async (request: ScoreAnswerRequest): Promise<ScoreAnswerResponse> => {
    const response = await api.post('/score', request);
    return response.data;
  },

  // Evaluate all answers at once
  evaluateAnswers: async (data: {
    questions: Array<{
      question: string;
      ideal_answer: string;
      candidate_answer: string;
      difficulty: string;
    }>;
    job_title: string;
  }): Promise<{ evaluations: Array<{ score: number; reason: string }> }> => {
    const response = await api.post('/evaluate-answers', data);
    return response.data;
  },

  // Generate final summary
  generateSummary: async (request: GenerateSummaryRequest): Promise<GenerateSummaryResponse> => {
    const response = await api.post('/summary', request);
    return response.data;
  },

  // Send email notification
  sendEmail: async (data: {
    to: string;
    subject: string;
    template: 'shortlist' | 'reject';
    candidate_name: string;
    job_title: string;
  }) => {
    const response = await api.post('/send-email', data);
    return response.data;
  },

  // Job management
  getJobs: async () => {
    const response = await api.get('/jobs');
    return response.data;
  },

  createJob: async (data: {
    title: string;
    description: string;
    custom_questions: string[];
  }) => {
    const response = await api.post('/jobs', data);
    return response.data;
  },

  getCandidates: async (jobId: number) => {
    const response = await api.get(`/candidates/${jobId}`);
    return response.data;
  },

  // Parse resume file
  parseResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/parse-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

export default api;
