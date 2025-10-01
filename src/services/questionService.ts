import { apiService } from './api';
import { Question } from '../store/slices/interviewSlice';

export class QuestionService {
  private static instance: QuestionService;
  private questions: Question[] = [];

  public static getInstance(): QuestionService {
    if (!QuestionService.instance) {
      QuestionService.instance = new QuestionService();
    }
    return QuestionService.instance;
  }

  public async generateInterviewQuestions(jobTitle?: string, jobDescription?: string): Promise<Question[]> {
    try {
      const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard'];
      const timeLimits = [20, 20, 60, 60, 120, 120]; // seconds
      
      const jobContext = jobTitle || 'Software Development';
      
      console.log(`[QuestionService] Generating questions for: ${jobContext}`);

      try {
        // SINGLE API CALL - Generate all 6 questions with ideal answers at once
        const response = await apiService.generateBatchQuestions({
          action: 'generate_batch',
          job_context: jobContext,
          job_description: jobDescription || '',
          difficulties,
        });

        // Parse the batch response
        const questions: Question[] = response.questions.map((q: any, i: number) => ({
          id: `q-${i + 1}`,
          question: q.question,
          difficulty: difficulties[i],
          timeLimit: timeLimits[i],
          idealAnswer: q.ideal_answer,
        }));

        console.log(`[QuestionService] Successfully generated ${questions.length} questions`);
        this.questions = questions;
        return questions;
      } catch (error) {
        console.error('Failed to generate batch questions, falling back to individual calls:', error);
        
        // Fallback: Generate questions individually if batch fails
        const questions: Question[] = [];
        for (let i = 0; i < 6; i++) {
          const difficulty = difficulties[i];
          const timeLimit = timeLimits[i];

          try {
            const response = await apiService.generateQuestion({
              action: 'generate_question',
              difficulty,
              job_context: jobContext,
            });

            const idealAnswer = await this.generateIdealAnswer(response.question);

            questions.push({
              id: `q-${i + 1}`,
              question: response.question,
              difficulty,
              timeLimit,
              idealAnswer,
            });
          } catch (error) {
            console.error(`Failed to generate ${difficulty} question:`, error);
            questions.push(this.getMockQuestion(i, difficulty, timeLimit));
          }
        }

        this.questions = questions;
        return questions;
      }
    } catch (error) {
      console.error('Failed to generate questions:', error);
      return this.getMockQuestions();
    }
  }

  public async generateIdealAnswer(question: string): Promise<string> {
    try {
      const response = await apiService.generateIdealAnswer(question);
      return response.ideal;
    } catch (error) {
      console.error('Failed to generate ideal answer:', error);
      return this.getMockIdealAnswer(question);
    }
  }

  public async scoreAnswer(question: string, idealAnswer: string, candidateAnswer: string): Promise<{ score: number; reason: string }> {
    try {
      const response = await apiService.scoreAnswer({
        question,
        ideal: idealAnswer,
        candidate_answer: candidateAnswer,
      });
      return response;
    } catch (error) {
      console.error('Failed to score answer:', error);
      return this.getMockScore(question, candidateAnswer);
    }
  }

  public async evaluateAllAnswers(questions: Question[], jobTitle: string): Promise<Question[]> {
    try {
      // Prepare batch evaluation request
      const evaluationData = questions.map(q => ({
        question: q.question,
        ideal_answer: q.idealAnswer || '',
        candidate_answer: q.answer || '',
        difficulty: q.difficulty,
      }));

      // Call backend to evaluate all answers at once
      const response = await apiService.evaluateAnswers({
        questions: evaluationData,
        job_title: jobTitle,
      });

      // Map scores back to questions
      const evaluatedQuestions = questions.map((q, idx) => ({
        ...q,
        score: response.evaluations[idx]?.score || 0,
        reason: response.evaluations[idx]?.reason || 'No evaluation available',
      }));

      return evaluatedQuestions;
    } catch (error) {
      console.error('Failed to evaluate answers:', error);
      // Fallback: return questions with default scores
      return questions.map(q => ({
        ...q,
        score: q.answer && q.answer.trim().length > 20 ? 5 : 0,
        reason: 'Evaluation pending',
      }));
    }
  }

  public async generateFinalSummary(answers: Array<{ question: string; candidate_answer: string; score: number }>, candidate: { name: string; email: string }, job: { title: string }): Promise<{ final_score: number; summary: string }> {
    try {
      console.log('[questionService] Requesting summary from backend...', {
        answersCount: answers.length,
        candidateName: candidate.name,
        jobTitle: job.title
      });
      
      const response = await apiService.generateSummary({
        answers,
        candidate,
        job,
      });
      
      console.log('[questionService] ✅ Summary received from backend:', {
        finalScore: response.final_score,
        summaryLength: response.summary?.length,
        summaryPreview: response.summary?.substring(0, 100) + '...'
      });
      
      return response;
    } catch (error) {
      console.error('[questionService] ❌ Failed to generate summary:', error);
      return this.getMockSummary(answers, candidate);
    }
  }

  private getMockQuestions(): Question[] {
    return [
      {
        id: 'q-1',
        question: 'What is React and how does it differ from vanilla JavaScript?',
        difficulty: 'easy',
        timeLimit: 20,
      },
      {
        id: 'q-2',
        question: 'Explain the concept of state in React applications.',
        difficulty: 'easy',
        timeLimit: 20,
      },
      {
        id: 'q-3',
        question: 'How do you handle side effects in React? Explain useEffect hook.',
        difficulty: 'medium',
        timeLimit: 60,
      },
      {
        id: 'q-4',
        question: 'What is the difference between controlled and uncontrolled components?',
        difficulty: 'medium',
        timeLimit: 60,
      },
      {
        id: 'q-5',
        question: 'Design a scalable state management solution for a large React application.',
        difficulty: 'hard',
        timeLimit: 120,
      },
      {
        id: 'q-6',
        question: 'Explain the React reconciliation process and how it affects performance.',
        difficulty: 'hard',
        timeLimit: 120,
      },
    ];
  }

  private getMockQuestion(index: number, difficulty: 'easy' | 'medium' | 'hard', timeLimit: number): Question {
    const mockQuestions = {
      easy: [
        'What is React and how does it differ from vanilla JavaScript?',
        'Explain the concept of state in React applications.',
        'What are React components and how do you create them?',
        'What is JSX and why is it used in React?',
      ],
      medium: [
        'How do you handle side effects in React? Explain useEffect hook.',
        'What is the difference between controlled and uncontrolled components?',
        'Explain React hooks and their benefits over class components.',
        'How do you optimize React application performance?',
      ],
      hard: [
        'Design a scalable state management solution for a large React application.',
        'Explain the React reconciliation process and how it affects performance.',
        'How would you implement a custom hook for data fetching with caching?',
        'Design a component architecture for a real-time collaborative application.',
      ],
    };

    const questions = mockQuestions[difficulty];
    const question = questions[index % questions.length];

    return {
      id: `q-${index + 1}`,
      question,
      difficulty,
      timeLimit,
    };
  }

  private getMockIdealAnswer(question: string): string {
    const mockAnswers: { [key: string]: string } = {
      'What is React and how does it differ from vanilla JavaScript?': 'React is a JavaScript library for building user interfaces, particularly web applications. Unlike vanilla JavaScript which manipulates the DOM directly, React uses a virtual DOM for efficient updates and provides a component-based architecture for reusable UI elements.',
      'Explain the concept of state in React applications.': 'State in React is a JavaScript object that represents the current condition of a component. It allows components to manage and track changes to data over time, triggering re-renders when updated. State is local to the component and can be managed using useState hook in functional components.',
      'How do you handle side effects in React? Explain useEffect hook.': 'Side effects in React are handled using the useEffect hook. It allows you to perform operations like data fetching, subscriptions, or manually changing the DOM after the component renders. useEffect takes a function and an optional dependency array to control when the effect runs.',
      'What is the difference between controlled and uncontrolled components?': 'Controlled components have their form data controlled by React state, where the component state is the single source of truth. Uncontrolled components store their form data in the DOM itself, using refs to access the values. Controlled components provide better control and validation.',
      'Design a scalable state management solution for a large React application.': 'For large React applications, consider using Redux Toolkit with RTK Query for server state, Context API for local state, and custom hooks for component logic. Implement proper state normalization, use selectors for derived state, and consider code splitting with lazy loading.',
      'Explain the React reconciliation process and how it affects performance.': 'Reconciliation is React\'s algorithm for comparing the current virtual DOM tree with the previous one to determine what changes need to be made to the actual DOM. It uses a diffing algorithm that compares elements by type and key, minimizing DOM manipulations for better performance.',
    };

    return mockAnswers[question] || 'This is a comprehensive answer that demonstrates understanding of the concept and provides practical examples.';
  }

  private getMockScore(question: string, candidateAnswer: string): { score: number; reason: string } {
    // Simple scoring based on answer length and keywords
    const answerLength = candidateAnswer.length;
    const hasKeywords = this.checkKeywords(question, candidateAnswer);
    
    let score = 5; // Base score
    
    if (answerLength > 50) score += 1;
    if (answerLength > 100) score += 1;
    if (hasKeywords) score += 2;
    if (answerLength > 200) score += 1;
    
    score = Math.min(score, 10); // Cap at 10
    
    const reasons = [
      'Good understanding of the concept.',
      'Demonstrates practical knowledge.',
      'Well-structured response.',
      'Shows depth of understanding.',
      'Comprehensive answer with examples.',
    ];
    
    return {
      score,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
    };
  }

  private checkKeywords(question: string, answer: string): boolean {
    const keywords = {
      'react': ['react', 'component', 'jsx', 'virtual dom'],
      'state': ['state', 'useState', 'setState', 'mutable'],
      'effect': ['useEffect', 'side effect', 'lifecycle'],
      'component': ['component', 'props', 'render'],
      'performance': ['performance', 'optimization', 'memo', 'callback'],
      'architecture': ['architecture', 'pattern', 'structure', 'design'],
    };

    const questionLower = question.toLowerCase();
    const answerLower = answer.toLowerCase();

    for (const [key, words] of Object.entries(keywords)) {
      if (questionLower.includes(key)) {
        return words.some(word => answerLower.includes(word));
      }
    }

    return false;
  }

  private getMockSummary(answers: Array<{ question: string; candidate_answer: string; score: number }>, candidate: { name: string; email: string }): { final_score: number; summary: string } {
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
    const finalScore = totalScore / answers.length;
    
    const summary = `${candidate.name} demonstrated ${finalScore >= 8 ? 'excellent' : finalScore >= 6 ? 'good' : 'fair'} technical knowledge during the interview. The candidate showed understanding of React concepts and provided thoughtful responses to both basic and advanced questions. Overall performance indicates ${finalScore >= 8 ? 'strong potential' : finalScore >= 6 ? 'good potential' : 'room for improvement'} for the role.`;
    
    return {
      final_score: Math.round(finalScore * 10) / 10,
      summary,
    };
  }
}

export const questionService = QuestionService.getInstance();
