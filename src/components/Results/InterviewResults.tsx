import React from 'react';
import { Card, Typography, Space, Progress, Button, Row, Col, Statistic } from 'antd';
import { TrophyOutlined, CheckCircleOutlined, StarOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { theme } from '../../styles/theme';

const { Title, Paragraph, Text } = Typography;

interface InterviewResultsProps {
  onStartNew: () => void;
}

const InterviewResults: React.FC<InterviewResultsProps> = ({ onStartNew }) => {
  const { candidateInfo, questions } = useSelector((state: RootState) => state.interview);

  const completedQuestions = questions.filter(q => q.answer).length;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Success Header */}
      <div style={{ textAlign: 'center', marginBottom: theme.spacing.xxl }}>
        <CheckCircleOutlined style={{ 
          fontSize: 80, 
          color: theme.colors.success, 
          marginBottom: theme.spacing.lg 
        }} />
        <Title level={1} style={{ color: theme.colors.primary, marginBottom: theme.spacing.sm }}>
          Thank You!
        </Title>
        <Title level={3} style={{ fontWeight: 400, color: theme.colors.gray[700] }}>
          Your Interview Has Been Submitted Successfully
        </Title>
      </div>

      {/* Main Message Card */}
      <Card 
        className="custom-card" 
        style={{ 
          marginBottom: theme.spacing.xl,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
        }}
      >
        <div style={{ textAlign: 'center', padding: theme.spacing.lg }}>
          <Title level={4} style={{ color: 'white', marginBottom: theme.spacing.md }}>
            Dear {candidateInfo?.name},
          </Title>
          <Paragraph style={{ fontSize: 16, color: 'rgba(255,255,255,0.95)', lineHeight: 1.8, marginBottom: 0 }}>
            Thank you for taking the time to complete this interview. Your responses have been recorded and will be carefully reviewed by our recruitment team.
          </Paragraph>
        </div>
      </Card>

      {/* Interview Summary */}
      <Card className="custom-card" style={{ marginBottom: theme.spacing.xl }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4} style={{ marginBottom: theme.spacing.md }}>
              Interview Summary
            </Title>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Questions Answered"
                  value={completedQuestions}
                  suffix={`/ ${questions.length}`}
                  prefix={<CheckCircleOutlined style={{ color: theme.colors.success }} />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Status"
                  value="Under Review"
                  valueStyle={{ color: theme.colors.primary, fontSize: 20 }}
                />
              </Col>
            </Row>
          </div>

          <div style={{ 
            background: theme.colors.gray[50], 
            padding: theme.spacing.lg, 
            borderRadius: 12,
            borderLeft: `4px solid ${theme.colors.primary}`
          }}>
            <Title level={5} style={{ marginBottom: theme.spacing.sm }}>
              📧 What Happens Next?
            </Title>
            <Space direction="vertical" size="small">
              <Text>• Our team will review your responses within 3-5 business days</Text>
              <Text>• You will receive an email notification at <strong>{candidateInfo?.email}</strong></Text>
              <Text>• If shortlisted, we'll contact you with details for the next round</Text>
              <Text>• Please check your spam folder if you don't see our email</Text>
            </Space>
          </div>

          <div style={{ 
            background: '#fff3cd', 
            padding: theme.spacing.md, 
            borderRadius: 8,
            border: '1px solid #ffc107'
          }}>
            <Text strong style={{ color: '#856404' }}>
              ⚠️ Important: Please do not refresh or close this page until you've noted down your submission confirmation.
            </Text>
          </div>
        </Space>
      </Card>

      {/* Action Button */}
      <Card className="custom-card">
        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={5}>Explore More Opportunities</Title>
            <Paragraph type="secondary">
              Want to apply for other positions? Browse our job listings and submit more applications.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              onClick={onStartNew}
              style={{ 
                minWidth: 250,
                height: 48,
                fontSize: 16,
                borderRadius: 8,
              }}
            >
              View More Jobs
            </Button>
          </Space>
        </div>
      </Card>

      {/* Footer Note */}
      <div style={{ textAlign: 'center', marginTop: theme.spacing.xl, padding: theme.spacing.lg }}>
        <Text type="secondary" style={{ fontSize: 14 }}>
          For any queries, please contact us at <a href="mailto:support@company.com">support@company.com</a>
        </Text>
      </div>
    </div>
  );
};

export default InterviewResults;
