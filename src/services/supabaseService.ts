import { createClient } from '@supabase/supabase-js';
import { Question, CandidateInfo } from '../store/slices/interviewSlice';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || '';

// Diagnostics: surface whether env vars are present (without leaking secrets)
try {
  const maskedKey = supabaseKey ? `${supabaseKey.slice(0, 4)}...${supabaseKey.slice(-4)}` : '(empty)';
  console.info(
    '[Supabase:init]',
    JSON.stringify({
      hasUrl: Boolean(supabaseUrl),
      hasKey: Boolean(supabaseKey),
      urlHost: (() => {
        try { return supabaseUrl ? new URL(supabaseUrl).host : '(none)'; } catch { return '(invalid)'; }
      })(),
      keyPreview: maskedKey,
    })
  );
} catch {}

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Data will only be stored locally.');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface InterviewRecord {
  id?: string;
  job_id: string;
  student_id: string;
  answers: any[];
  scores: any[];
  final_score: number;
  summary: string;
  status: 'in_progress' | 'completed' | 'shortlisted' | 'rejected';
  started_at?: string;
  completed_at?: string;
}

export interface StudentRecord {
  id?: string;
  name: string;
  email: string;
  phone: string;
  resume_url?: string;
}

export interface JobRecord {
  id?: string;
  title: string;
  description: string;
  custom_questions: string[];
}

export const supabaseService = {
  // Student management
  async createStudent(candidateInfo: CandidateInfo): Promise<StudentRecord | null> {
    console.info('[Supabase:createStudent] start', { usingSupabase: Boolean(supabase) });
    if (!supabase) {
      console.warn('Supabase not available, using mock data');
      return {
        id: 'mock-student-id',
        ...candidateInfo,
      };
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([candidateInfo])
        .select()
        .single();

      if (error) throw error;
      console.info('[Supabase:createStudent] success', { id: data?.id });
      return data;
    } catch (error) {
      console.error('[Supabase:createStudent] error', error);
      return null;
    }
  },

  async getStudent(email: string): Promise<StudentRecord | null> {
    console.info('[Supabase:getStudent] start', { usingSupabase: Boolean(supabase), email });
    if (!supabase) {
      console.warn('Supabase not available, using mock data');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      console.info('[Supabase:getStudent] complete', { found: Boolean(data) });
      return data;
    } catch (error) {
      console.error('[Supabase:getStudent] error', error);
      return null;
    }
  },

  // Job management
  async getJobs(): Promise<JobRecord[]> {
    console.info('[Supabase:getJobs] start', { usingSupabase: Boolean(supabase) });
    if (!supabase) {
      console.warn('Supabase not available, using mock data');
      return [
        {
          id: 'mock-job-1',
          title: 'Fullstack Developer',
          description: 'React/Node.js developer position',
          custom_questions: [],
        },
      ];
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.info('[Supabase:getJobs] success', { count: data?.length || 0 });
      return data || [];
    } catch (error) {
      console.error('[Supabase:getJobs] error', error);
      return [];
    }
  },

  async createJob(jobData: Omit<JobRecord, 'id'>): Promise<JobRecord | null> {
    console.info('[Supabase:createJob] start', { usingSupabase: Boolean(supabase) });
    if (!supabase) {
      console.warn('Supabase not available, using mock data');
      return {
        id: 'mock-job-' + Date.now(),
        ...jobData,
      };
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (error) throw error;
      console.info('[Supabase:createJob] success', { id: data?.id });
      return data;
    } catch (error) {
      console.error('[Supabase:createJob] error', error);
      return null;
    }
  },

  // Interview management
  async createInterview(interviewData: Omit<InterviewRecord, 'id'>): Promise<InterviewRecord | null> {
    console.info('[Supabase:createInterview] start', { usingSupabase: Boolean(supabase) });
    if (!supabase) {
      console.warn('Supabase not available, using mock data');
      return {
        id: 'mock-interview-' + Date.now(),
        ...interviewData,
      };
    }

    try {
      const { data, error } = await supabase
        .from('interviews')
        .insert([interviewData])
        .select()
        .single();

      if (error) throw error;
      console.info('[Supabase:createInterview] success', { id: data?.id });
      return data;
    } catch (error) {
      console.error('[Supabase:createInterview] error', error);
      return null;
    }
  },

  async updateInterview(interviewId: string, updates: Partial<InterviewRecord>): Promise<InterviewRecord | null> {
    console.info('[Supabase:updateInterview] start', { usingSupabase: Boolean(supabase), interviewId });
    if (!supabase) {
      console.warn('Supabase not available, using mock data');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('interviews')
        .update(updates)
        .eq('id', interviewId)
        .select()
        .single();

      if (error) throw error;
      console.info('[Supabase:updateInterview] success', { id: data?.id });
      return data;
    } catch (error) {
      console.error('[Supabase:updateInterview] error', error);
      return null;
    }
  },

  async getInterviewsByJob(jobId: string): Promise<InterviewRecord[]> {
    console.info('[Supabase:getInterviewsByJob] start', { usingSupabase: Boolean(supabase), jobId });
    if (!supabase) {
      console.warn('Supabase not available, using mock data');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          students (
            name,
            email,
            phone
          )
        `)
        .eq('job_id', jobId)
        .order('final_score', { ascending: false });

      if (error) throw error;
      console.info('[Supabase:getInterviewsByJob] success', { count: data?.length || 0 });
      return data || [];
    } catch (error) {
      console.error('[Supabase:getInterviewsByJob] error', error);
      return [];
    }
  },

  async getInterviewById(interviewId: string): Promise<InterviewRecord | null> {
    console.info('[Supabase:getInterviewById] start', { usingSupabase: Boolean(supabase), interviewId });
    if (!supabase) {
      console.warn('Supabase not available, using mock data');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          students (
            name,
            email,
            phone
          ),
          jobs (
            title,
            description
          )
        `)
        .eq('id', interviewId)
        .single();

      if (error) throw error;
      console.info('[Supabase:getInterviewById] success', { found: Boolean(data) });
      return data;
    } catch (error) {
      console.error('[Supabase:getInterviewById] error', error);
      return null;
    }
  },

  // Save interview progress
  async saveInterviewProgress(
    studentId: string,
    jobId: string,
    questions: Question[],
    currentQuestionIndex: number,
    isCompleted: boolean = false,
    summary?: string
  ): Promise<boolean> {
    console.info('[Supabase:saveInterviewProgress] start', { 
      usingSupabase: Boolean(supabase), 
      studentId, 
      jobId, 
      isCompleted,
      questionsCount: questions.length,
      hasSummary: Boolean(summary)
    });
    
    if (!supabase) {
      console.warn('[Supabase:saveInterviewProgress] Supabase not available, progress saved locally only');
      return true;
    }

    try {
      const answers = questions.map(q => ({
        question: q.question,
        answer: q.answer || '',
        difficulty: q.difficulty,
        timeLimit: q.timeLimit,
      }));

      const scores = questions.map(q => ({
        question: q.question,
        score: q.score || 0,
        reason: q.reason || '',
        idealAnswer: q.idealAnswer || '',
      }));

      const finalScore = questions.length > 0 
        ? questions.reduce((sum, q) => sum + (q.score || 0), 0) / questions.length 
        : 0;

      console.info('[Supabase:saveInterviewProgress] calculated data', {
        answersCount: answers.length,
        scoresCount: scores.length,
        finalScore: finalScore.toFixed(2),
        summaryLength: summary?.length || 0
      });

      const interviewData: any = {
        job_id: jobId,
        student_id: studentId,
        answers,
        scores,
        final_score: finalScore,
        status: isCompleted ? 'completed' : 'in_progress',
        completed_at: isCompleted ? new Date().toISOString() : null,
      };

      // Add summary if provided
      if (summary) {
        interviewData.summary = summary;
      }

      console.info('[Supabase:saveInterviewProgress] checking for existing interview...');
      
      // Check if interview already exists
      const { data: existingInterview, error: selectError } = await supabase
        .from('interviews')
        .select('id')
        .eq('job_id', jobId)
        .eq('student_id', studentId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('[Supabase:saveInterviewProgress] error checking existing interview', selectError);
      }

      if (existingInterview) {
        console.info('[Supabase:saveInterviewProgress] updating existing interview', { interviewId: existingInterview.id });
        
        // Update existing interview
        const { data: updateData, error: updateError } = await supabase
          .from('interviews')
          .update(interviewData)
          .eq('id', existingInterview.id)
          .select();

        if (updateError) {
          console.error('[Supabase:saveInterviewProgress] update error', updateError);
          throw updateError;
        }
        
        console.info('[Supabase:saveInterviewProgress] ✅ UPDATE SUCCESS', { 
          interviewId: existingInterview.id,
          finalScore: updateData?.[0]?.final_score,
          status: updateData?.[0]?.status
        });
      } else {
        console.info('[Supabase:saveInterviewProgress] creating new interview record...');
        
        // Create new interview
        const { data: insertData, error: insertError } = await supabase
          .from('interviews')
          .insert([interviewData])
          .select();

        if (insertError) {
          console.error('[Supabase:saveInterviewProgress] insert error', insertError);
          throw insertError;
        }
        
        console.info('[Supabase:saveInterviewProgress] ✅ INSERT SUCCESS', { 
          interviewId: insertData?.[0]?.id,
          finalScore: insertData?.[0]?.final_score,
          status: insertData?.[0]?.status
        });
      }

      console.info('[Supabase:saveInterviewProgress] ✅ COMPLETE - Data saved to Supabase successfully');
      return true;
    } catch (error: any) {
      console.error('[Supabase:saveInterviewProgress] ❌ ERROR', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        fullError: error
      });
      return false;
    }
  },

  // Upload resume to Supabase Storage
  async uploadResume(file: File, studentId: string): Promise<string | null> {
    console.info('[Supabase:uploadResume] start', { usingSupabase: Boolean(supabase), studentId, fileName: file?.name });
    if (!supabase) {
      console.warn('Supabase not available, using local URL');
      return URL.createObjectURL(file);
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${studentId}-resume-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      console.info('[Supabase:uploadResume] success', { fileName });
      return publicUrl;
    } catch (error) {
      console.error('[Supabase:uploadResume] error', error);
      return null;
    }
  },
};

export default supabaseService;
