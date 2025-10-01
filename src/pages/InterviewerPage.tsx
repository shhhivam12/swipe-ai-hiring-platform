import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Alert, 
  Table, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Statistic, 
  Row, 
  Col, 
  Progress, 
  Badge,
  Tooltip,
  message,
  Tabs,
  Empty
} from 'antd';
import { 
  TeamOutlined, 
  PlusOutlined, 
  EyeOutlined, 
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { theme } from '../styles/theme';
import { apiService } from '../services/api';
import supabaseService from '../services/supabaseService';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface Job {
  id: string;
  title: string;
  description: string;
  custom_questions: string[];
  status: 'active' | 'inactive';
  created_at: string;
  candidates_count: number;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  job_id: string;
  job_title: string;
  final_score: number;
  status: 'in_progress' | 'completed' | 'shortlisted' | 'rejected';
  completed_at: string;
  summary: string;
  answers: any[];
  scores: any[];
}

const InterviewerPage: React.FC = () => {
  const { userType } = useSelector((state: RootState) => state.user);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [candidateSearchTerm, setCandidateSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showJobCandidatesModal, setShowJobCandidatesModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Mock data for demonstration
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Fullstack Developer',
      description: 'React/Node.js developer position with 2+ years experience',
      custom_questions: ['What is your experience with microservices?', 'How do you handle state management in large applications?'],
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      candidates_count: 8
    },
    {
      id: '2',
      title: 'Frontend Developer',
      description: 'React specialist position focusing on modern web development',
      custom_questions: ['Describe your experience with React hooks', 'How do you optimize React performance?'],
      status: 'active',
      created_at: '2024-01-10T14:30:00Z',
      candidates_count: 5
    },
    {
      id: '3',
      title: 'Backend Developer',
      description: 'Node.js/Python backend developer for API development',
      custom_questions: ['Explain RESTful API design principles', 'How do you handle database optimization?'],
      status: 'inactive',
      created_at: '2024-01-05T09:15:00Z',
      candidates_count: 3
    }
  ];

  const mockCandidates: Candidate[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      job_id: '1',
      job_title: 'Fullstack Developer',
      final_score: 8.5,
      status: 'completed',
      completed_at: '2024-01-20T15:30:00Z',
      summary: 'Strong candidate with excellent technical skills and good communication.',
      answers: [],
      scores: []
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 (555) 987-6543',
      job_id: '1',
      job_title: 'Fullstack Developer',
      final_score: 7.2,
      status: 'shortlisted',
      completed_at: '2024-01-19T11:45:00Z',
      summary: 'Good technical knowledge with room for improvement in system design.',
      answers: [],
      scores: []
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+1 (555) 456-7890',
      job_id: '2',
      job_title: 'Frontend Developer',
      final_score: 6.8,
      status: 'completed',
      completed_at: '2024-01-18T16:20:00Z',
      summary: 'Decent frontend skills but lacks experience with modern frameworks.',
      answers: [],
      scores: []
    }
  ];

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        console.info('[InterviewerPage] Fetching jobs from Supabase');
        const realJobs = await supabaseService.getJobs();
        if (!isMounted) return;
        if (realJobs && realJobs.length > 0) {
          // Map Supabase job shape to local UI shape if needed
          const mapped = realJobs.map((j: any) => ({
            id: String(j.id ?? j.uuid ?? j.slug ?? j.title),
            title: j.title,
            description: j.description,
            custom_questions: j.custom_questions || [],
            status: 'active' as const,
            created_at: j.created_at || new Date().toISOString(),
            candidates_count: 0,
          }));
          // Fetch candidates per job from interviews table
          const interviewsByJob = await Promise.all(
            mapped.map(async (job) => {
              try {
                const interviews = await supabaseService.getInterviewsByJob(job.id);
                return { jobId: job.id, interviews: interviews || [] };
              } catch (e) {
                console.warn('[InterviewerPage] getInterviewsByJob failed', { jobId: job.id, e });
                return { jobId: job.id, interviews: [] };
              }
            })
          );

          // Flatten to candidates and attach counts
          const jobIdToCount: Record<string, number> = {};
          const allCandidates = interviewsByJob.flatMap(({ jobId, interviews }) => {
            jobIdToCount[jobId] = interviews.length;
            return (interviews as any[]).map((iv) => ({
              id: String(iv.id),
              name: iv.students?.name || 'Unknown',
              email: iv.students?.email || '',
              phone: iv.students?.phone || '',
              job_id: jobId,
              job_title: mapped.find(m => m.id === jobId)?.title || '',
              final_score: iv.final_score ?? 0,
              status: iv.status || 'in_progress',
              completed_at: iv.completed_at || new Date().toISOString(),
              summary: iv.summary || '',
              answers: iv.answers || [],
              scores: iv.scores || [],
            }));
          });

          const withCounts = mapped.map(j => ({ ...j, candidates_count: jobIdToCount[j.id] || 0 }));
          setJobs(withCounts);
          // Sort candidates by score (highest first)
          const sortedCandidates = (allCandidates as any[]).sort((a, b) => b.final_score - a.final_score);
          setCandidates(sortedCandidates);
          setFilteredCandidates(sortedCandidates);
          console.info('[InterviewerPage] Loaded jobs & candidates from Supabase', { jobs: withCounts.length, candidates: allCandidates.length });
        } else {
          console.warn('[InterviewerPage] No jobs from Supabase, falling back to mock');
          setJobs(mockJobs);
          const sortedMock = [...mockCandidates].sort((a, b) => b.final_score - a.final_score);
          setCandidates(sortedMock);
          setFilteredCandidates(sortedMock);
        }
      } catch (e) {
        console.warn('[InterviewerPage] Supabase fetch failed, using mock', e);
        if (isMounted) {
          setJobs(mockJobs);
          const sortedMock = [...mockCandidates].sort((a, b) => b.final_score - a.final_score);
          setCandidates(sortedMock);
          setFilteredCandidates(sortedMock);
        }
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Filter and search candidates
  useEffect(() => {
    let result = [...candidates];
    
    // Search filter
    if (candidateSearchTerm) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(candidateSearchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(candidateSearchTerm.toLowerCase()) ||
        c.job_title.toLowerCase().includes(candidateSearchTerm.toLowerCase())
      );
    }
    
    // Job filter
    if (jobFilter !== 'all') {
      result = result.filter(c => c.job_id === jobFilter);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }
    
    // Always sort by score (highest first)
    result.sort((a, b) => b.final_score - a.final_score);
    
    setFilteredCandidates(result);
  }, [candidates, candidateSearchTerm, jobFilter, statusFilter]);

  if (userType !== 'interviewer') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: theme.spacing.lg }}>
        <Alert
          message="Access Denied"
          description="This page is only accessible to interviewers. Please login as an interviewer to continue."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  const handleCreateJob = async (values: any) => {
    setLoading(true);
    try {
      // Create job in Supabase
      const jobData = {
        title: values.title,
        description: values.description,
        custom_questions: values.custom_questions || []
      };
      
      const createdJob = await supabaseService.createJob(jobData);
      
      if (createdJob) {
        // Add to local state
        const newJob: Job = {
          id: String(createdJob.id),
          title: createdJob.title,
          description: createdJob.description,
          custom_questions: createdJob.custom_questions || [],
          status: 'active',
          created_at: new Date().toISOString(),
          candidates_count: 0
        };
        setJobs([...jobs, newJob]);
        setShowJobModal(false);
        form.resetFields();
        message.success('Job created successfully!');
      } else {
        throw new Error('Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      message.error('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShortlistCandidate = async (candidate: Candidate) => {
    try {
      // Update candidate status
      const updatedCandidates = candidates.map(c => 
        c.id === candidate.id ? { ...c, status: 'shortlisted' as const } : c
      );
      setCandidates(updatedCandidates);
      
      // Send email notification
      await apiService.sendEmail({
        to: candidate.email,
        subject: 'Congratulations! You have been shortlisted',
        template: 'shortlist',
        candidate_name: candidate.name,
        job_title: candidate.job_title
      });
      
      message.success('Candidate shortlisted and email sent!');
    } catch (error) {
      message.error('Failed to shortlist candidate');
    }
  };

  const handleRejectCandidate = async (candidate: Candidate) => {
    try {
      // Update candidate status
      const updatedCandidates = candidates.map(c => 
        c.id === candidate.id ? { ...c, status: 'rejected' as const } : c
      );
      setCandidates(updatedCandidates);
      
      // Send email notification
      await apiService.sendEmail({
        to: candidate.email,
        subject: 'Interview Results Update',
        template: 'reject',
        candidate_name: candidate.name,
        job_title: candidate.job_title
      });
      
      message.success('Candidate rejected and email sent!');
    } catch (error) {
      message.error('Failed to reject candidate');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return theme.colors.success;
    if (score >= 6) return theme.colors.warning;
    return theme.colors.error;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'blue';
      case 'shortlisted': return 'green';
      case 'rejected': return 'red';
      case 'in_progress': return 'orange';
      default: return 'default';
    }
  };

  const jobColumns = [
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Job) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description.substring(0, 50)}...
          </Text>
        </div>
      ),
    },
    {
      title: 'Candidates',
      dataIndex: 'candidates_count',
      key: 'candidates_count',
      render: (count: number) => (
        <Badge count={count} style={{ backgroundColor: theme.colors.primary }} />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Job) => (
        <Space>
          <Tooltip title="View Candidates">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedJob(record);
                setShowJobCandidatesModal(true);
              }}
            >
              View
            </Button>
          </Tooltip>
          <Tooltip title="Edit Job">
            <Button size="small" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="Delete Job">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const candidateColumns = [
    {
      title: 'Candidate',
      key: 'candidate',
      render: (record: Candidate) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.email}
          </Text>
        </div>
      ),
    },
    {
      title: 'Job',
      dataIndex: 'job_title',
      key: 'job_title',
    },
    {
      title: 'Score',
      dataIndex: 'final_score',
      key: 'final_score',
      render: (score: number) => (
        <div style={{ textAlign: 'center' }}>
          <Progress
            type="circle"
            size={50}
            percent={(score / 10) * 100}
            strokeColor={getScoreColor(score)}
            format={() => (
              <Text strong style={{ color: getScoreColor(score), fontSize: 12 }}>
                {score}
              </Text>
            )}
          />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Completed',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Candidate) => (
        <Space>
          <Tooltip title="Review Details">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedCandidate(record);
                setShowCandidateModal(true);
              }}
            >
              Review
            </Button>
          </Tooltip>
          {record.status === 'completed' && (
            <>
              <Tooltip title="Shortlist">
                <Button 
                  size="small" 
                  type="primary"
                  style={{ backgroundColor: theme.colors.success, borderColor: theme.colors.success }}
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleShortlistCandidate(record)}
                >
                  Shortlist
                </Button>
              </Tooltip>
              <Tooltip title="Reject">
                <Button 
                  size="small" 
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleRejectCandidate(record)}
                >
                  Reject
                </Button>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === 'active').length,
    totalCandidates: candidates.length,
    shortlistedCandidates: candidates.filter(c => c.status === 'shortlisted').length,
    averageScore: candidates.length > 0 
      ? (candidates.reduce((sum, c) => sum + c.final_score, 0) / candidates.length).toFixed(1)
      : '0.0'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: theme.spacing.lg 
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: theme.spacing.xl,
          padding: theme.spacing.xl,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: theme.borderRadius.xxl,
          backdropFilter: 'blur(20px)',
          boxShadow: theme.shadows.xl,
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <TeamOutlined style={{ fontSize: 64, color: theme.colors.secondary, marginBottom: theme.spacing.lg }} />
          <Title level={2} style={{ 
            color: theme.colors.secondary,
            fontFamily: theme.fonts.secondary,
            marginBottom: theme.spacing.sm
          }}>
            Interviewer Dashboard
          </Title>
          <Paragraph style={{ fontSize: 18, color: theme.colors.gray[600], margin: 0 }}>
            Manage job postings, review candidates, and make data-driven hiring decisions with AI-powered insights.
          </Paragraph>
        </div>

        {/* Stats Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: theme.spacing.xl }}>
          <Col xs={12} sm={6}>
            <Card className="custom-card" style={{ textAlign: 'center', borderRadius: theme.borderRadius.xl, boxShadow: theme.shadows.md }}>
              <Statistic
                title="Total Jobs"
                value={stats.totalJobs}
                prefix={<FileTextOutlined style={{ color: theme.colors.primary }} />}
                valueStyle={{ color: theme.colors.primary }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="custom-card" style={{ textAlign: 'center', borderRadius: theme.borderRadius.xl, boxShadow: theme.shadows.md }}>
              <Statistic
                title="Active Jobs"
                value={stats.activeJobs}
                prefix={<CheckCircleOutlined style={{ color: theme.colors.success }} />}
                valueStyle={{ color: theme.colors.success }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="custom-card" style={{ textAlign: 'center', borderRadius: theme.borderRadius.xl, boxShadow: theme.shadows.md }}>
              <Statistic
                title="Total Candidates"
                value={stats.totalCandidates}
                prefix={<UserOutlined style={{ color: theme.colors.warning }} />}
                valueStyle={{ color: theme.colors.warning }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="custom-card" style={{ textAlign: 'center', borderRadius: theme.borderRadius.xl, boxShadow: theme.shadows.md }}>
              <Statistic
                title="Average Score"
                value={stats.averageScore}
                suffix="/10"
                prefix={<TrophyOutlined style={{ color: theme.colors.secondary }} />}
                valueStyle={{ color: theme.colors.secondary }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Tabs defaultActiveKey="jobs" size="large">
          <TabPane tab="Job Management" key="jobs">
            <div style={{ marginBottom: theme.spacing.lg, textAlign: 'right' }}>
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />}
                onClick={() => setShowJobModal(true)}
                style={{
                  background: theme.gradients.primary,
                  border: 'none',
                  borderRadius: theme.borderRadius.lg,
                  height: 52,
                  padding: '0 32px',
                  fontSize: 16,
                  fontWeight: 600,
                  boxShadow: theme.shadows.lg
                }}
              >
                Create New Job
              </Button>
            </div>

            <Card className="custom-card" style={{ borderRadius: theme.borderRadius.xl }}>
              <Title level={4} style={{ marginBottom: theme.spacing.lg }}>
                Active Jobs
              </Title>
              <Table
                columns={jobColumns}
                dataSource={jobs}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="middle"
              />
            </Card>
          </TabPane>

          <TabPane tab="Candidate Management" key="candidates">
            {/* Search and Filter */}
            <Card style={{ 
              marginBottom: theme.spacing.lg,
              borderRadius: theme.borderRadius.xl,
              boxShadow: theme.shadows.md
            }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Input
                  size="large"
                  placeholder="Search candidates by name, email, or job title..."
                  prefix={<SearchOutlined style={{ color: theme.colors.gray[400] }} />}
                  value={candidateSearchTerm}
                  onChange={(e) => setCandidateSearchTerm(e.target.value)}
                  allowClear
                  style={{ borderRadius: theme.borderRadius.md }}
                />
                <Space wrap>
                  <FilterOutlined style={{ color: theme.colors.gray[500] }} />
                  <Text type="secondary">Filter by:</Text>
                  <Select
                    value={jobFilter}
                    onChange={setJobFilter}
                    style={{ width: 200 }}
                    options={[
                      { label: 'All Jobs', value: 'all' },
                      ...jobs.map(j => ({ label: j.title, value: j.id }))
                    ]}
                  />
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 180 }}
                    options={[
                      { label: 'All Status', value: 'all' },
                      { label: 'Completed', value: 'completed' },
                      { label: 'Shortlisted', value: 'shortlisted' },
                      { label: 'Rejected', value: 'rejected' },
                      { label: 'In Progress', value: 'in_progress' }
                    ]}
                  />
                  <Text type="secondary" style={{ marginLeft: theme.spacing.md }}>
                    {filteredCandidates.length} {filteredCandidates.length === 1 ? 'candidate' : 'candidates'} • Sorted by score (highest first)
                  </Text>
                </Space>
              </Space>
            </Card>
            
            <Card className="custom-card" style={{ borderRadius: theme.borderRadius.xl }}>
              <Title level={4} style={{ marginBottom: theme.spacing.lg }}>
                All Candidates
              </Title>
              <Table
                columns={candidateColumns}
                dataSource={filteredCandidates}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="middle"
              />
            </Card>
          </TabPane>

          <TabPane tab="Analytics" key="analytics">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card className="custom-card" style={{ borderRadius: theme.borderRadius.xl }}>
                  <Title level={4}>Score Distribution</Title>
                  <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
                    <Empty description="Analytics coming soon..." />
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card className="custom-card" style={{ borderRadius: theme.borderRadius.xl }}>
                  <Title level={4}>Hiring Pipeline</Title>
                  <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
                    <Empty description="Analytics coming soon..." />
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>

        {/* Job Creation Modal */}
        <Modal
          title="Create New Job"
          open={showJobModal}
          onCancel={() => setShowJobModal(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateJob}
          >
            <Form.Item
              label="Job Title"
              name="title"
              rules={[{ required: true, message: 'Please enter job title!' }]}
            >
              <Input size="large" placeholder="e.g., Fullstack Developer" />
            </Form.Item>

            <Form.Item
              label="Job Description"
              name="description"
              rules={[{ required: true, message: 'Please enter job description!' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="Describe the role, requirements, and responsibilities..."
              />
            </Form.Item>

            <Form.Item
              label="Custom Questions (Optional)"
              name="custom_questions"
            >
              <Select
                mode="tags"
                placeholder="Add custom interview questions..."
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button onClick={() => setShowJobModal(false)}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<PlusOutlined />}
                >
                  Create Job
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Comprehensive Candidate Detail Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <UserOutlined style={{ fontSize: 24, color: theme.colors.primary }} />
              <span>Interview Details - {selectedCandidate?.name}</span>
            </div>
          }
          open={showCandidateModal}
          onCancel={() => setShowCandidateModal(false)}
          footer={null}
          width={1200}
          style={{ top: 20 }}
        >
          {selectedCandidate && (
            <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              {/* Candidate Info & Score */}
              <Row gutter={[24, 24]} style={{ marginBottom: theme.spacing.lg }}>
                <Col xs={24} md={12}>
                  <Card size="small" style={{ background: theme.colors.gray[50], borderRadius: theme.borderRadius.lg }}>
                    <Title level={5} style={{ marginBottom: theme.spacing.md }}>
                      <UserOutlined /> Candidate Information
                    </Title>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Name:</Text>
                        <Text strong>{selectedCandidate.name}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Email:</Text>
                        <Text>{selectedCandidate.email}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Phone:</Text>
                        <Text>{selectedCandidate.phone}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Position:</Text>
                        <Text strong>{selectedCandidate.job_title}</Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" style={{ background: theme.colors.gray[50], borderRadius: theme.borderRadius.lg }}>
                    <Title level={5} style={{ marginBottom: theme.spacing.md }}>
                      <TrophyOutlined /> Interview Performance
                    </Title>
                    <div style={{ textAlign: 'center' }}>
                      <Progress
                        type="circle"
                        size={120}
                        percent={(selectedCandidate.final_score / 10) * 100}
                        strokeColor={getScoreColor(selectedCandidate.final_score)}
                        format={() => (
                          <div>
                            <div style={{ fontSize: 32, fontWeight: 'bold', color: getScoreColor(selectedCandidate.final_score) }}>
                              {selectedCandidate.final_score}
                            </div>
                            <div style={{ fontSize: 14, color: theme.colors.gray[600] }}>out of 10</div>
                          </div>
                        )}
                      />
                      <div style={{ marginTop: theme.spacing.md }}>
                        <Tag color={getStatusColor(selectedCandidate.status)} style={{ fontSize: 14, padding: '4px 12px' }}>
                          {selectedCandidate.status.toUpperCase()}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ display: 'block', marginTop: theme.spacing.sm }}>
                        Completed: {new Date(selectedCandidate.completed_at).toLocaleString()}
                      </Text>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* AI Summary */}
              <Card style={{ marginBottom: theme.spacing.lg, background: theme.gradients.primary, border: 'none', borderRadius: theme.borderRadius.xl, boxShadow: theme.shadows.lg }}>
                <Title level={5} style={{ color: 'white', marginBottom: theme.spacing.md }}>
                  AI-Generated Summary
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.95)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
                  {selectedCandidate.summary || 'No summary available'}
                </Paragraph>
              </Card>

              {/* Question-by-Question Analysis */}
              <Card>
                <Title level={5} style={{ marginBottom: theme.spacing.lg }}>
                  Detailed Question Analysis
                </Title>
                {selectedCandidate.answers && selectedCandidate.answers.length > 0 ? (
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {selectedCandidate.answers.map((answer: any, index: number) => {
                      const score = selectedCandidate.scores?.[index];
                      return (
                        <Card 
                          key={index}
                          size="small"
                          style={{ 
                            background: theme.colors.gray[50],
                            border: `2px solid ${score?.score >= 7 ? theme.colors.success : score?.score >= 5 ? theme.colors.warning : theme.colors.error}`
                          }}
                        >
                          <Row gutter={[16, 16]}>
                            <Col span={24}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Text strong style={{ fontSize: 16 }}>Question {index + 1}</Text>
                                  <Tag color={answer.difficulty === 'easy' ? 'green' : answer.difficulty === 'medium' ? 'orange' : 'red'}>
                                    {answer.difficulty?.toUpperCase()}
                                  </Tag>
                                  <Text type="secondary">({answer.timeLimit}s)</Text>
                                </div>
                                {score && (
                                  <div style={{ 
                                    fontSize: 24, 
                                    fontWeight: 'bold', 
                                    color: score.score >= 7 ? theme.colors.success : score.score >= 5 ? theme.colors.warning : theme.colors.error 
                                  }}>
                                    {score.score}/10
                                  </div>
                                )}
                              </div>
                            </Col>
                            
                            <Col span={24}>
                              <div style={{ marginBottom: theme.spacing.md }}>
                                <Text strong style={{ display: 'block', marginBottom: 4 }}>Question:</Text>
                                <Paragraph style={{ 
                                  background: 'white', 
                                  padding: theme.spacing.sm, 
                                  borderRadius: 8,
                                  border: `1px solid ${theme.colors.gray[300]}`,
                                  margin: 0
                                }}>
                                  {answer.question}
                                </Paragraph>
                              </div>
                            </Col>

                            <Col xs={24} md={12}>
                              <div>
                                <Text strong style={{ display: 'block', marginBottom: 4, color: theme.colors.success }}>
                                  Expected Answer:
                                </Text>
                                <Paragraph style={{ 
                                  background: 'white', 
                                  padding: theme.spacing.sm, 
                                  borderRadius: 8,
                                  border: `1px solid ${theme.colors.success}`,
                                  margin: 0,
                                  fontSize: 13
                                }}>
                                  {score?.idealAnswer || 'Not available'}
                                </Paragraph>
                              </div>
                            </Col>

                            <Col xs={24} md={12}>
                              <div>
                                <Text strong style={{ display: 'block', marginBottom: 4, color: theme.colors.primary }}>
                                  Candidate's Answer:
                                </Text>
                                <Paragraph style={{ 
                                  background: 'white', 
                                  padding: theme.spacing.sm, 
                                  borderRadius: 8,
                                  border: `1px solid ${theme.colors.primary}`,
                                  margin: 0,
                                  fontSize: 13
                                }}>
                                  {answer.answer || 'No answer provided'}
                                </Paragraph>
                              </div>
                            </Col>

                            {score?.reason && (
                              <Col span={24}>
                                <div style={{ 
                                  background: 'white', 
                                  padding: theme.spacing.sm, 
                                  borderRadius: 8,
                                  borderLeft: `4px solid ${theme.colors.primary}`
                                }}>
                                  <Text strong>Evaluation: </Text>
                                  <Text>{score.reason}</Text>
                                </div>
                              </Col>
                            )}
                          </Row>
                        </Card>
                      );
                    })}
                  </Space>
                ) : (
                  <Empty description="No interview data available" />
                )}
              </Card>

              {/* Action Buttons */}
              {selectedCandidate.status === 'completed' && (
                <div style={{ textAlign: 'center', marginTop: theme.spacing.xl, paddingTop: theme.spacing.lg, borderTop: `2px solid ${theme.colors.gray[200]}` }}>
                  <Space size="large">
                    <Button 
                      type="primary"
                      size="large"
                      icon={<CheckCircleOutlined />}
                      onClick={() => {
                        handleShortlistCandidate(selectedCandidate);
                        setShowCandidateModal(false);
                      }}
                      style={{ 
                        background: theme.colors.success, 
                        borderColor: theme.colors.success,
                        height: 48,
                        padding: '0 32px',
                        fontSize: 16,
                        fontWeight: 600
                      }}
                    >
                      Shortlist Candidate
                    </Button>
                    <Button 
                      danger
                      size="large"
                      icon={<CloseCircleOutlined />}
                      onClick={() => {
                        handleRejectCandidate(selectedCandidate);
                        setShowCandidateModal(false);
                      }}
                      style={{ 
                        height: 48,
                        padding: '0 32px',
                        fontSize: 16,
                        fontWeight: 600
                      }}
                    >
                      Reject Candidate
                    </Button>
                  </Space>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Job Candidates Modal */}
        <Modal
          title={`Candidates for ${selectedJob?.title}`}
          open={showJobCandidatesModal}
          onCancel={() => setShowJobCandidatesModal(false)}
          footer={null}
          width={1000}
        >
          {selectedJob && (
            <div>
              <Card style={{ marginBottom: theme.spacing.lg, background: theme.colors.gray[50] }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Job Title:</Text> {selectedJob.title}
                  </Col>
                  <Col span={12}>
                    <Text strong>Total Candidates:</Text> {candidates.filter(c => c.job_id === selectedJob.id).length}
                  </Col>
                  <Col span={24}>
                    <Text strong>Description:</Text>
                    <Paragraph style={{ margin: '8px 0 0 0' }}>{selectedJob.description}</Paragraph>
                  </Col>
                </Row>
              </Card>

              <Table
                columns={candidateColumns}
                dataSource={candidates.filter(c => c.job_id === selectedJob.id)}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="middle"
                locale={{ emptyText: 'No candidates have applied for this position yet.' }}
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default InterviewerPage;
