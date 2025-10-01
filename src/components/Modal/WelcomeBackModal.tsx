import React from 'react';
import { Modal, Button, Typography, Space, Card, Progress } from 'antd';
import { PlayCircleOutlined, ReloadOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { theme } from '../../styles/theme';

const { Title, Paragraph, Text } = Typography;

interface WelcomeBackModalProps {
  visible: boolean;
  onResume: () => void;
  onStartNew: () => void;
}

const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({ visible, onResume, onStartNew }) => {
  const { candidateInfo, questions, currentQuestionIndex, isInterviewStarted, finalScore } = useSelector((state: RootState) => state.interview);

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const completedQuestions = questions.filter(q => q.answer).length;

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={3} style={{ color: theme.colors.primary, margin: 0 }}>
            Welcome Back!
          </Title>
        </div>
      }
      open={visible}
      footer={null}
      width={600}
      centered
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Paragraph style={{ fontSize: 16, marginBottom: theme.spacing.lg }}>
            Hello <strong>{candidateInfo?.name}</strong>! We found your previous interview session.
          </Paragraph>
        </div>

        <Card style={{ background: theme.colors.gray[50] }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0 }}>Interview Progress</Title>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Questions Completed</Text>
              <Text strong>{completedQuestions} / {questions.length}</Text>
            </div>
            
            <Progress 
              percent={progress} 
              strokeColor={theme.colors.primary}
              showInfo={false}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">Current Question</Text>
              <Text type="secondary">{currentQuestionIndex + 1} of {questions.length}</Text>
            </div>
          </Space>
        </Card>

        {isInterviewStarted && (
          <Card style={{ background: theme.colors.gray[50] }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Title level={5} style={{ margin: 0 }}>Interview Status</Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                <ClockCircleOutlined style={{ color: theme.colors.primary }} />
                <Text>Interview in progress</Text>
              </div>
              <Text type="secondary">
                You were on question {currentQuestionIndex + 1} when you left.
              </Text>
            </Space>
          </Card>
        )}

        {finalScore && (
          <Card style={{ background: theme.colors.gray[50] }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Title level={5} style={{ margin: 0 }}>Previous Results</Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                <Text strong style={{ fontSize: 18, color: theme.colors.primary }}>
                  Final Score: {finalScore}/10
                </Text>
              </div>
              <Text type="secondary">
                You completed a previous interview session.
              </Text>
            </Space>
          </Card>
        )}

        <div style={{ display: 'flex', gap: theme.spacing.md, justifyContent: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={onResume}
            style={{ minWidth: 150 }}
          >
            Resume Interview
          </Button>
          
          <Button
            size="large"
            icon={<ReloadOutlined />}
            onClick={onStartNew}
            style={{ minWidth: 150 }}
          >
            Start New Interview
          </Button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Your progress is automatically saved. You can resume anytime.
          </Text>
        </div>
      </Space>
    </Modal>
  );
};

export default WelcomeBackModal;
