import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  answer?: string;
  score?: number;
  idealAnswer?: string;
  reason?: string;
}

export interface CandidateInfo {
  name: string;
  email: string;
  phone: string;
  resumeUrl?: string;
}

export interface InterviewState {
  candidateInfo: CandidateInfo | null;
  questions: Question[];
  currentQuestionIndex: number;
  isInterviewStarted: boolean;
  isInterviewCompleted: boolean;
  finalScore?: number;
  summary?: string;
  timeRemaining: number;
  isTimerActive: boolean;
  resumeUploaded: boolean;
  resumeText?: string;
}

const initialState: InterviewState = {
  candidateInfo: null,
  questions: [],
  currentQuestionIndex: 0,
  isInterviewStarted: false,
  isInterviewCompleted: false,
  timeRemaining: 0,
  isTimerActive: false,
  resumeUploaded: false,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setCandidateInfo: (state, action: PayloadAction<CandidateInfo>) => {
      state.candidateInfo = action.payload;
    },
    setResumeUploaded: (state, action: PayloadAction<{ uploaded: boolean; text?: string; url?: string }>) => {
      state.resumeUploaded = action.payload.uploaded;
      state.resumeText = action.payload.text;
      if (state.candidateInfo) {
        state.candidateInfo.resumeUrl = action.payload.url;
      }
    },
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
    },
    startInterview: (state) => {
      state.isInterviewStarted = true;
      state.currentQuestionIndex = 0;
      state.timeRemaining = state.questions[0]?.timeLimit || 0;
      state.isTimerActive = true;
    },
    submitAnswer: (state, action: PayloadAction<{ questionIndex: number; answer: string; score?: number; idealAnswer?: string; reason?: string }>) => {
      const { questionIndex, answer, score, idealAnswer, reason } = action.payload;
      if (state.questions[questionIndex]) {
        state.questions[questionIndex].answer = answer;
        state.questions[questionIndex].score = score;
        state.questions[questionIndex].idealAnswer = idealAnswer;
        state.questions[questionIndex].reason = reason;
      }
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
        state.timeRemaining = state.questions[state.currentQuestionIndex]?.timeLimit || 0;
        state.isTimerActive = true;
      } else {
        state.isInterviewCompleted = true;
        state.isTimerActive = false;
      }
    },
    updateTimer: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
      if (action.payload <= 0) {
        state.isTimerActive = false;
      }
    },
    setTimerActive: (state, action: PayloadAction<boolean>) => {
      state.isTimerActive = action.payload;
    },
    completeInterview: (state, action: PayloadAction<{ finalScore: number; summary: string }>) => {
      state.isInterviewCompleted = true;
      state.finalScore = action.payload.finalScore;
      state.summary = action.payload.summary;
      state.isTimerActive = false;
    },
    resetInterview: (state) => {
      return initialState;
    },
    loadInterviewState: (state, action: PayloadAction<InterviewState>) => {
      return action.payload;
    },
  },
});

export const {
  setCandidateInfo,
  setResumeUploaded,
  setQuestions,
  startInterview,
  submitAnswer,
  nextQuestion,
  updateTimer,
  setTimerActive,
  completeInterview,
  resetInterview,
  loadInterviewState,
} = interviewSlice.actions;

export default interviewSlice.reducer;
