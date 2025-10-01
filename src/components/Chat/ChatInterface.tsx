import React, { useState, useEffect, useRef } from 'react';
import { SendOutlined, ClockCircleOutlined, CheckCircleOutlined, SoundOutlined, PauseCircleOutlined, PlayCircleOutlined, ForwardOutlined } from '@ant-design/icons';
import { Card, Input, Button, Typography, Progress, message, Spin, Slider, Space as AntSpace } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { submitAnswer, nextQuestion, updateTimer, setTimerActive } from '../../store/slices/interviewSlice';
import { questionService } from '../../services/questionService';
import ttsService from '../../services/ttsService';
import InterviewGreetingModal from '../Modal/InterviewGreetingModal';
import { theme } from '../../styles/theme';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

interface ChatInterfaceProps {
  onInterviewComplete: (data: { finalScore: number; summary: string; questions: any[] }) => void;
  selectedJob?: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onInterviewComplete, selectedJob }) => {
  const dispatch = useDispatch();
  const { questions, currentQuestionIndex, timeRemaining, isTimerActive, isInterviewCompleted, candidateInfo } = useSelector((state: RootState) => state.interview);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');
  const [isNarrating, setIsNarrating] = useState(false);
  const [hasNarrated, setHasNarrated] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentQuestionIndex] || null;

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      ttsService.stop();
      exitFullscreen();
    };
  }, []);

  useEffect(() => {
    if (currentQuestion && !isInterviewCompleted && !showGreeting) {
      setCurrentAnswer('');
      setHasNarrated(false);
      // Narrate the question before starting timer
      narrateQuestion();
    }
  }, [currentQuestionIndex, currentQuestion, isInterviewCompleted, showGreeting]);

  useEffect(() => {
    if (isInterviewCompleted) {
      handleFinalCompletion();
    }
  }, [isInterviewCompleted]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        const newTime = timeRemaining - 1;
        dispatch(updateTimer(newTime));
        
        if (newTime <= 0) {
          dispatch(setTimerActive(false));
          handleAutoSubmit();
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining, dispatch]);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    try {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.log('Fullscreen error:', err));
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      console.log('Fullscreen not supported:', err);
    }
  };

  const exitFullscreen = () => {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(err => console.log('Exit fullscreen error:', err));
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
        setIsFullscreen(false);
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.log('Exit fullscreen error:', err);
    }
  };

  const handleGreetingComplete = (language: 'en' | 'hi') => {
    setSelectedLanguage(language);
    setShowGreeting(false);
    enterFullscreen();
    // Initialize timer for first question
    if (currentQuestion) {
      dispatch(updateTimer(currentQuestion.timeLimit));
    }
    // Start narrating first question
    setTimeout(() => {
      narrateQuestion();
    }, 500);
  };

  const narrateQuestion = async () => {
    if (hasNarrated || !currentQuestion) return;
    
    setIsNarrating(true);
    setIsPaused(false);
    // Pause timer while narrating
    dispatch(setTimerActive(false));
    
    try {
      const intro = selectedLanguage === 'en'
        ? `Question ${currentQuestionIndex + 1} of ${questions.length}. ${currentQuestion.question}`
        : `प्रश्न ${currentQuestionIndex + 1} का ${questions.length}। ${currentQuestion.question}`;
      
      await ttsService.speak(intro, selectedLanguage, { rate: ttsSpeed });
      setHasNarrated(true);
      // Start timer after narration completes
      dispatch(setTimerActive(true));
    } catch (error) {
      console.error('Failed to narrate question:', error);
      // Start timer anyway if narration fails
      dispatch(setTimerActive(true));
    } finally {
      setIsNarrating(false);
      setIsPaused(false);
    }
  };

  const replayQuestion = () => {
    ttsService.stop();
    setHasNarrated(false);
    setIsPaused(false);
    narrateQuestion();
  };

  const handlePauseTTS = () => {
    if (isPaused) {
      ttsService.resume();
      setIsPaused(false);
    } else {
      ttsService.pause();
      setIsPaused(true);
    }
  };

  const handleSkipTTS = () => {
    ttsService.stop();
    setIsNarrating(false);
    setIsPaused(false);
    setHasNarrated(true);
    // Start timer immediately
    dispatch(setTimerActive(true));
  };

  const handleAutoSubmit = async () => {
    if (!currentAnswer.trim()) {
      setCurrentAnswer('No answer provided - time expired');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    await handleSubmit();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const handleSubmit = async () => {
    if (!currentAnswer.trim()) {
      message.error('Please enter your answer before submitting!');
      return;
    }

    // Stop any ongoing narration
    ttsService.stop();
    setIsSubmitting(true);
    
    try {
      // Just save the answer without scoring
      dispatch(submitAnswer({
        questionIndex: currentQuestionIndex,
        answer: currentAnswer,
        score: undefined, // No score yet
        reason: undefined,
      }));
      
      // Show success message
      message.success('Answer submitted successfully!');
      
      // Move to next question or complete interview
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          dispatch(nextQuestion());
        } else {
          // Interview completed, trigger final processing
          dispatch(nextQuestion()); // This will set isInterviewCompleted to true
        }
      }, 500);
      
    } catch (error) {
      message.error('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalCompletion = async () => {
    console.log('[ChatInterface] handleFinalCompletion started', {
      questionsCount: questions.length,
      candidateName: candidateInfo?.name,
      jobTitle: selectedJob?.title
    });

    try {
      // Exit fullscreen before processing
      exitFullscreen();

      console.log('[ChatInterface] Evaluating all answers with AI...');
      // Now evaluate all answers using LLM
      const evaluatedQuestions = await questionService.evaluateAllAnswers(
        questions,
        selectedJob?.title || 'Position'
      );

      console.log('[ChatInterface] Evaluation complete', {
        evaluatedCount: evaluatedQuestions.length,
        scores: evaluatedQuestions.map(q => q.score)
      });

      // Calculate final score from evaluated answers
      const finalScore = evaluatedQuestions.length > 0 
        ? evaluatedQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / evaluatedQuestions.length 
        : 0;

      console.log('[ChatInterface] Final score calculated:', finalScore.toFixed(2));

      console.log('[ChatInterface] Generating professional summary...');
      // Generate professional summary
      const summaryData = await questionService.generateFinalSummary(
        evaluatedQuestions.map(q => ({
          question: q.question,
          candidate_answer: q.answer || '',
          score: q.score || 0,
        })),
        { name: candidateInfo?.name || '', email: candidateInfo?.email || '' },
        { title: selectedJob?.title || 'Position' }
      );

      console.log('[ChatInterface] Summary generated', {
        finalScore: summaryData.final_score,
        summaryLength: summaryData.summary?.length
      });

      const completionData = {
        finalScore: summaryData.final_score || finalScore,
        summary: summaryData.summary || 'Interview completed successfully.',
        questions: evaluatedQuestions,
      };

      console.log('[ChatInterface] ✅ Calling onInterviewComplete with data:', {
        finalScore: completionData.finalScore,
        summaryLength: completionData.summary.length,
        questionsWithScores: completionData.questions.length
      });

      // Pass data to parent with evaluated questions
      onInterviewComplete(completionData);
    } catch (error: any) {
      console.error('[ChatInterface] ❌ Failed to evaluate interview:', {
        message: error?.message,
        stack: error?.stack,
        fullError: error
      });
      exitFullscreen();
      // Still pass the data even if evaluation fails
      onInterviewComplete({
        finalScore: 0,
        summary: 'Interview completed. Evaluation in progress.',
        questions,
      });
    }
  };

  if (!currentQuestion) {
    return (
      <Card className="custom-card">
        <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          <Title level={3}>Loading interview questions...</Title>
        </div>
      </Card>
    );
  }

  // Show greeting modal first
  if (showGreeting) {
    return (
      <InterviewGreetingModal
        visible={showGreeting}
        candidateName={candidateInfo?.name || 'Candidate'}
        jobTitle={selectedJob?.title || 'Position'}
        totalQuestions={questions.length}
        onStart={handleGreetingComplete}
      />
    );
  }

  const completedQuestions = questions.slice(0, currentQuestionIndex);
  const progressPercentage = (currentQuestionIndex / questions.length) * 100;

  return (
    <div 
      ref={containerRef}
      style={{ 
        minHeight: '100vh',
        background: theme.gradients.primary,
        padding: `${theme.spacing.md} ${theme.spacing.sm}`,
        position: 'relative',
      }}
      className="interview-container"
    >
      {/* Header with Progress */}
      <div style={{ 
        maxWidth: 1400, 
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: theme.borderRadius.lg,
        padding: `${theme.spacing.md} ${theme.spacing.sm}`,
        marginBottom: theme.spacing.md,
        boxShadow: theme.shadows.xl,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}
      className="interview-header"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm, flexWrap: 'wrap', gap: theme.spacing.sm }}>
          <div>
            <Title level={4} style={{ margin: 0, color: theme.colors.primary, fontSize: '18px' }}>
              {selectedJob?.title || 'Interview'}
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>Question {currentQuestionIndex + 1} of {questions.length}</Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, marginBottom: 4 }}>
              <ClockCircleOutlined style={{ 
                fontSize: 24,
                color: isNarrating ? theme.colors.gray[400] : timeRemaining < 30 ? theme.colors.error : theme.colors.success 
              }} />
              <Text strong style={{ 
                color: isNarrating ? theme.colors.gray[400] : timeRemaining < 30 ? theme.colors.error : theme.colors.success,
                fontSize: 32,
                fontWeight: 700,
              }}>
                {isNarrating ? '⏸️' : formatTime(timeRemaining)}
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {isNarrating ? '🔊 Narrating...' : `${getDifficultyLabel(currentQuestion.difficulty)} • ${formatTime(currentQuestion.timeLimit)} limit`}
            </Text>
          </div>
        </div>
        
        <Progress
          percent={progressPercentage}
          strokeColor={{
            '0%': '#667eea',
            '100%': '#764ba2',
          }}
          showInfo={false}
          strokeWidth={8}
          style={{ marginBottom: theme.spacing.sm }}
          trailColor="rgba(0,0,0,0.06)"
        />
        
        {/* Question Status Indicators */}
        <div style={{ display: 'flex', gap: 8, marginTop: theme.spacing.md }}>
          {questions.map((q, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                background: idx < currentQuestionIndex 
                  ? theme.colors.success 
                  : idx === currentQuestionIndex 
                  ? theme.colors.primary 
                  : theme.colors.gray[300],
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: theme.spacing.md }}
        className="interview-content"
      >
        {/* Question Panel */}
        <Card style={{ 
          borderRadius: theme.borderRadius.xxl,
          boxShadow: theme.shadows.xl,
          height: 'fit-content',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
            <Title level={3} style={{ color: theme.colors.primary, margin: 0 }}>
              Question {currentQuestionIndex + 1}
            </Title>
            <Button
              icon={<SoundOutlined />}
              onClick={replayQuestion}
              disabled={isNarrating}
              size="small"
              type="text"
              style={{ color: theme.colors.primary }}
            >
              {isNarrating ? 'Playing...' : 'Replay'}
            </Button>
          </div>
          
          {isNarrating && (
            <div style={{ 
              padding: theme.spacing.md, 
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: theme.borderRadius.lg,
              marginBottom: theme.spacing.md,
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: theme.spacing.sm }}>
                <Spin size="small" style={{ marginRight: theme.spacing.sm }} />
                <Text strong style={{ color: theme.colors.primary }}>🔊 Narrating... Timer starts after</Text>
              </div>
              
              {/* TTS Controls */}
              <AntSpace direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: theme.spacing.sm, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button 
                    size="small"
                    icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                    onClick={handlePauseTTS}
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button 
                    size="small"
                    icon={<ForwardOutlined />}
                    onClick={handleSkipTTS}
                  >
                    Skip
                  </Button>
                </div>
                <div style={{ padding: '0 16px' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Speed: {ttsSpeed}x</Text>
                  <Slider 
                    min={0.5} 
                    max={2} 
                    step={0.1} 
                    value={ttsSpeed}
                    onChange={setTtsSpeed}
                    tooltip={{ formatter: (value) => `${value}x` }}
                  />
                </div>
              </AntSpace>
            </div>
          )}
          
          <Paragraph style={{ 
            fontSize: 18, 
            lineHeight: 1.9, 
            color: theme.colors.gray[800],
            background: theme.colors.gray[50],
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            border: `2px solid ${theme.colors.gray[200]}`
          }}>
            {currentQuestion.question}
          </Paragraph>
          
          {/* Completed Questions Summary */}
          {completedQuestions.length > 0 && (
            <div style={{ marginTop: theme.spacing.xl, paddingTop: theme.spacing.lg, borderTop: `2px solid ${theme.colors.gray[200]}` }}>
              <Text strong style={{ display: 'block', marginBottom: theme.spacing.md }}>Completed Questions:</Text>
              {completedQuestions.map((q, idx) => (
                <div key={idx} style={{ 
                  marginBottom: theme.spacing.sm,
                  padding: theme.spacing.sm,
                  background: theme.colors.gray[50],
                  borderRadius: theme.borderRadius.md,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 12 }}>Q{idx + 1}</Text>
                  <CheckCircleOutlined style={{ color: theme.colors.success }} />
                </div>
              ))}</div>
          )}
        </Card>

        {/* Answer Panel */}
        <Card style={{ 
          borderRadius: theme.borderRadius.xxl,
          boxShadow: theme.shadows.xl,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}>
          <Title level={4} style={{ marginBottom: theme.spacing.lg }}>Your Answer</Title>
          <TextArea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={isNarrating ? "Please wait for the question narration to complete..." : "Type your detailed answer here..."}
            rows={14}
            disabled={isSubmitting || !isTimerActive || isNarrating}
            style={{ 
              fontSize: 16,
              lineHeight: 1.7,
              borderRadius: theme.borderRadius.lg,
              marginBottom: theme.spacing.lg,
              border: `2px solid ${isNarrating ? theme.colors.gray[300] : theme.colors.primary}`,
              padding: theme.spacing.md,
              transition: 'all 0.3s ease'
            }}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <Text type="secondary">
              {currentAnswer.length} characters
            </Text>
            <Text type={timeRemaining < 30 ? 'danger' : 'secondary'}>
              {timeRemaining < 30 ? '⚠️ Time running out!' : '✓ Keep going'}
            </Text>
          </div>
          
          <Button
            type="primary"
            size="large"
            block
            icon={<SendOutlined />}
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!currentAnswer.trim() || !isTimerActive || isNarrating}
            style={{ 
              height: 60,
              fontSize: 18,
              fontWeight: 600,
              borderRadius: theme.borderRadius.xl,
              background: theme.gradients.primary,
              border: 'none',
              boxShadow: theme.shadows.lg,
              transition: 'all 0.3s ease'
            }}
          >
            {isSubmitting ? 'Submitting...' : isNarrating ? '⏳ Wait for narration...' : currentQuestionIndex < questions.length - 1 ? 'Submit & Next Question' : 'Submit Final Answer'}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ChatInterface;
