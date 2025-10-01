import React, { useState, useEffect } from 'react';
import { Alert, Spin, Card, Button, Typography, Input, Select, Space } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setQuestions, startInterview, resetInterview, completeInterview, setCandidateInfo } from '../store/slices/interviewSlice';
import { questionService } from '../services/questionService';
import supabaseService from '../services/supabaseService';
import ResumeUpload from '../components/ResumeUpload/ResumeUpload';
import ChatInterface from '../components/Chat/ChatInterface';
import InterviewResults from '../components/Results/InterviewResults';
import WelcomeBackModal from '../components/Modal/WelcomeBackModal';
import { theme } from '../styles/theme';

const { Title, Text } = Typography;

const IntervieweePage: React.FC = () => {
  const dispatch = useDispatch();
  const { userType } = useSelector((state: RootState) => state.user);
  const { 
    candidateInfo, 
    isInterviewCompleted,
    isInterviewStarted,
    questions,
    finalScore,
    summary,
  } = useSelector((state: RootState) => state.interview);

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'jobs' | 'resume' | 'interview' | 'results'>('jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'date'>('title');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  // Check for existing interview state on mount
  useEffect(() => {
    // If there's an ongoing interview (not completed), show welcome back modal
    if (candidateInfo && isInterviewStarted && !isInterviewCompleted && questions && questions.length > 0) {
      setShowWelcomeBack(true);
    } else {
      loadJobs();
    }
  }, []);

  // Load jobs on mount
  useEffect(() => {
    if (!showWelcomeBack) {
      loadJobs();
    }
  }, [showWelcomeBack]);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const fetchedJobs = await supabaseService.getJobs();
      const sortedJobs = (fetchedJobs || []).sort((a: any, b: any) => 
        a.title.localeCompare(b.title)
      );
      setJobs(sortedJobs);
      setFilteredJobs(sortedJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort jobs
  useEffect(() => {
    let result = [...jobs];
    
    // Search filter
    if (searchTerm) {
      result = result.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });
    
    setFilteredJobs(result);
  }, [jobs, searchTerm, sortBy]);

  if (userType !== 'student') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: theme.spacing.lg }}>
        <Alert
          message="Access Denied"
          description="This page is only accessible to students. Please login as a student to continue."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  const handleSelectJob = (job: any) => {
    setSelectedJob(job);
    // Save to localStorage for recovery if needed
    localStorage.setItem('currentJob', JSON.stringify(job));
    console.log('[IntervieweePage] Job selected and saved to localStorage:', job);
    // Reset interview state for fresh start
    dispatch(resetInterview());
    setCurrentStep('resume');
  };

  const handleResumeComplete = async () => {
    setIsLoading(true);
    try {
      // Generate interview questions based on selected job
      const jobTitle = selectedJob?.title || 'Software Development';
      const jobDescription = selectedJob?.description || '';
      
      console.log(`[IntervieweePage] Generating questions for: ${jobTitle}`);
      
      const generatedQuestions = await questionService.generateInterviewQuestions(jobTitle, jobDescription);
      dispatch(setQuestions(generatedQuestions));
      dispatch(startInterview());
      setCurrentStep('interview');
    } catch (error) {
      console.error('Failed to start interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewInterview = () => {
    dispatch(resetInterview());
    setSelectedJob(null);
    setCurrentStep('jobs');
    setShowWelcomeBack(false);
    loadJobs();
  };

  const handleResumeInterview = () => {
    setShowWelcomeBack(false);
    setCurrentStep('interview');
  };

  const handleInterviewComplete = async (interviewData: { finalScore: number; summary: string; questions: any[] }) => {
    console.log('[IntervieweePage] handleInterviewComplete called', {
      finalScore: interviewData.finalScore,
      summaryLength: interviewData.summary?.length,
      questionsCount: interviewData.questions?.length,
      candidateEmail: candidateInfo?.email,
      jobId: selectedJob?.id
    });

    console.log('[IntervieweePage] 🔍 DEBUGGING STATE:', {
      candidateInfo: candidateInfo,
      selectedJob: selectedJob,
      hasCandidateInfo: Boolean(candidateInfo),
      hasSelectedJob: Boolean(selectedJob),
      candidateInfoKeys: candidateInfo ? Object.keys(candidateInfo) : 'null',
      selectedJobKeys: selectedJob ? Object.keys(selectedJob) : 'null'
    });

    try {
      // CRITICAL FIX: If selectedJob is missing, try to get it from localStorage or create a fallback
      let jobToSave = selectedJob;
      
      if (!jobToSave) {
        console.warn('[IntervieweePage] ⚠️ selectedJob is missing! Attempting recovery...');
        
        // Try to get from localStorage
        const savedJobStr = localStorage.getItem('currentJob');
        if (savedJobStr) {
          try {
            jobToSave = JSON.parse(savedJobStr);
            console.log('[IntervieweePage] ✅ Recovered job from localStorage:', jobToSave);
          } catch (e) {
            console.error('[IntervieweePage] Failed to parse saved job:', e);
          }
        }
        
        // If still no job, create a fallback job entry
        if (!jobToSave) {
          console.warn('[IntervieweePage] ⚠️ Creating fallback job entry...');
          // Try to get job from Supabase using the first available job
          const allJobs = await supabaseService.getJobs();
          if (allJobs && allJobs.length > 0) {
            jobToSave = allJobs[0]; // Use first available job as fallback
            console.log('[IntervieweePage] ✅ Using first available job as fallback:', jobToSave);
          } else {
            // Last resort: create a mock job
            jobToSave = {
              id: 'fallback-job-' + Date.now(),
              title: 'General Position',
              description: 'Interview completed'
            };
            console.warn('[IntervieweePage] ⚠️ Using mock job as last resort');
          }
        }
      }

      // Save to database
      if (candidateInfo && jobToSave) {
        console.log('[IntervieweePage] Saving interview data to Supabase...', {
          candidateName: candidateInfo.name,
          candidateEmail: candidateInfo.email,
          jobId: jobToSave.id,
          jobTitle: jobToSave.title
        });
        
        // First, ensure student exists in database
        let student = await supabaseService.getStudent(candidateInfo.email);
        console.log('[IntervieweePage] Student lookup result:', { found: Boolean(student), studentId: student?.id });
        
        if (!student) {
          console.log('[IntervieweePage] Creating new student record...');
          student = await supabaseService.createStudent(candidateInfo);
          console.log('[IntervieweePage] Student created:', { studentId: student?.id });
        }

        if (student) {
          console.log('[IntervieweePage] Calling saveInterviewProgress...', {
            studentId: student.id,
            jobId: jobToSave.id,
            questionsCount: interviewData.questions.length,
            isCompleted: true,
            hasSummary: Boolean(interviewData.summary)
          });
          
          // Save interview data with summary
          const saveResult = await supabaseService.saveInterviewProgress(
            student.id!,
            jobToSave.id,
            interviewData.questions,
            interviewData.questions.length - 1,
            true,
            interviewData.summary  // Pass the summary
          );
          
          console.log('[IntervieweePage] Save result:', { success: saveResult });
          
          if (saveResult) {
            console.log('[IntervieweePage] ✅ Interview data saved successfully to Supabase!');
            // Clean up localStorage after successful save
            localStorage.removeItem('currentJob');
          } else {
            console.error('[IntervieweePage] ❌ Failed to save interview data to Supabase');
          }
        } else {
          console.error('[IntervieweePage] ❌ Failed to create/get student record');
        }
      } else {
        console.error('[IntervieweePage] ❌ CRITICAL: Missing candidateInfo or job', {
          hasCandidateInfo: Boolean(candidateInfo),
          hasJob: Boolean(jobToSave),
          candidateInfo: candidateInfo,
          job: jobToSave
        });
      }

      // Update Redux state
      dispatch(completeInterview({
        finalScore: interviewData.finalScore,
        summary: interviewData.summary,
      }));

      console.log('[IntervieweePage] Moving to results page...');
      setCurrentStep('results');
    } catch (error: any) {
      console.error('[IntervieweePage] ❌ Error in handleInterviewComplete:', {
        message: error?.message,
        stack: error?.stack,
        fullError: error
      });
      // Still show results even if save fails
      setCurrentStep('results');
    }
  };

  const renderCurrentStep = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: 'center', padding: theme.spacing.xxl }}>
          <Spin size="large" />
          <p style={{ marginTop: theme.spacing.lg }}>Preparing your interview...</p>
        </div>
      );
    }

    switch (currentStep) {
      case 'jobs':
        return (
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Card style={{ 
              marginBottom: theme.spacing.xl, 
              textAlign: 'center', 
              background: theme.gradients.primary, 
              border: 'none',
              borderRadius: theme.borderRadius.xl,
              boxShadow: theme.shadows.xl
            }}>
              <Title level={2} style={{ color: 'white', margin: 0 }}>Available Positions</Title>
              <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 16 }}>Select a position to start your AI interview</Text>
            </Card>
            
            {/* Search and Filter */}
            <Card style={{ 
              marginBottom: theme.spacing.lg,
              borderRadius: theme.borderRadius.xl,
              boxShadow: theme.shadows.md
            }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Input
                  size="large"
                  placeholder="Search jobs by title or description..."
                  prefix={<SearchOutlined style={{ color: theme.colors.gray[400] }} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                  style={{ borderRadius: theme.borderRadius.md }}
                />
                <Space>
                  <FilterOutlined style={{ color: theme.colors.gray[500] }} />
                  <Text type="secondary">Sort by:</Text>
                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    style={{ width: 200 }}
                    options={[
                      { label: 'Job Title (A-Z)', value: 'title' },
                      { label: 'Date Posted', value: 'date' }
                    ]}
                  />
                  <Text type="secondary" style={{ marginLeft: theme.spacing.md }}>
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'position' : 'positions'} found
                  </Text>
                </Space>
              </Space>
            </Card>
            
            {filteredJobs.length === 0 ? (
              <Card style={{ 
                textAlign: 'center', 
                padding: theme.spacing.xxl,
                borderRadius: theme.borderRadius.xl
              }}>
                <Text type="secondary">
                  {searchTerm ? 'No jobs match your search criteria.' : 'No jobs available at the moment.'}
                </Text>
              </Card>
            ) : (
              <div className="job-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: theme.spacing.lg }}>
                {filteredJobs.map((job: any) => (
                  <Card
                    key={job.id}
                    hoverable
                    style={{ 
                      borderRadius: theme.borderRadius.xl,
                      boxShadow: theme.shadows.md,
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(0,0,0,0.06)',
                      background: theme.gradients.card
                    }}
                    bodyStyle={{ padding: theme.spacing.lg }}
                  >
                    <Title level={4} style={{ marginBottom: theme.spacing.sm, color: theme.colors.primary }}>
                      {job.title}
                    </Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: theme.spacing.lg }}>
                      {job.description}
                    </Text>
                    <Button 
                      type="primary" 
                      size="large" 
                      block
                      onClick={() => handleSelectJob(job)}
                      style={{ 
                        borderRadius: theme.borderRadius.md,
                        background: theme.gradients.primary,
                        border: 'none',
                        height: 48,
                        fontWeight: 600,
                        boxShadow: theme.shadows.md
                      }}
                    >
                      Apply Now
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'resume':
        return (
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Card style={{ 
              marginBottom: theme.spacing.lg, 
              textAlign: 'center',
              borderRadius: theme.borderRadius.xl,
              background: theme.gradients.card,
              boxShadow: theme.shadows.lg
            }}>
              <Title level={3}>Applying for: {selectedJob?.title}</Title>
              <Text type="secondary">{selectedJob?.description}</Text>
            </Card>
            <ResumeUpload onComplete={handleResumeComplete} />
          </div>
        );
      
      case 'interview':
        return <ChatInterface onInterviewComplete={handleInterviewComplete} selectedJob={selectedJob} />;
      
      case 'results':
        return <InterviewResults onStartNew={handleStartNewInterview} />;
      
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: theme.colors.gray[50], padding: theme.spacing.lg }}>
      <WelcomeBackModal
        visible={showWelcomeBack}
        onResume={handleResumeInterview}
        onStartNew={handleStartNewInterview}
      />
      {renderCurrentStep()}
    </div>
  );
};

export default IntervieweePage;
