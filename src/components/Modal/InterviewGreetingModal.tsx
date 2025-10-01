import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, Space, Card, Radio, Spin } from 'antd';
import { SoundOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { theme } from '../../styles/theme';
import ttsService from '../../services/ttsService';

const { Title, Paragraph, Text } = Typography;

interface InterviewGreetingModalProps {
  visible: boolean;
  candidateName: string;
  jobTitle: string;
  totalQuestions: number;
  onStart: (language: 'en' | 'hi') => void;
}

const InterviewGreetingModal: React.FC<InterviewGreetingModalProps> = ({
  visible,
  candidateName,
  jobTitle,
  totalQuestions,
  onStart,
}) => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (visible) {
      // Auto-play greeting when modal opens
      playGreeting();
    }
    
    return () => {
      // Cleanup: stop any ongoing speech
      ttsService.stop();
    };
  }, [visible, language]);

  const playGreeting = async () => {
    setIsPlaying(true);
    try {
      await ttsService.speakGreeting(candidateName, jobTitle, totalQuestions, language);
      setHasPlayed(true);
    } catch (error) {
      console.error('Failed to play greeting:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleLanguageChange = (newLanguage: 'en' | 'hi') => {
    ttsService.stop();
    setLanguage(newLanguage);
    setHasPlayed(false);
  };

  const handleStart = () => {
    ttsService.stop();
    onStart(language);
  };

  const rules = language === 'en' ? [
    {
      icon: <FileTextOutlined style={{ fontSize: 24, color: theme.colors.primary }} />,
      title: 'Question Format',
      description: `You will be asked ${totalQuestions} questions relevant to the ${jobTitle} position.`
    },
    {
      icon: <SoundOutlined style={{ fontSize: 24, color: theme.colors.primary }} />,
      title: 'Audio Narration',
      description: 'Each question will be read aloud. The timer starts AFTER the narration completes.'
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 24, color: theme.colors.primary }} />,
      title: 'Time Limits',
      description: 'Each question has a specific time limit. Answer before time runs out!'
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: theme.colors.primary }} />,
      title: 'Submission',
      description: 'Submit your answer to move to the next question. You cannot go back.'
    },
  ] : [
    {
      icon: <FileTextOutlined style={{ fontSize: 24, color: theme.colors.primary }} />,
      title: 'प्रश्न प्रारूप',
      description: `आपसे ${jobTitle} पद से संबंधित ${totalQuestions} प्रश्न पूछे जाएंगे।`
    },
    {
      icon: <SoundOutlined style={{ fontSize: 24, color: theme.colors.primary }} />,
      title: 'ऑडियो वर्णन',
      description: 'प्रत्येक प्रश्न को जोर से पढ़ा जाएगा। वर्णन पूरा होने के बाद टाइमर शुरू होता है।'
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 24, color: theme.colors.primary }} />,
      title: 'समय सीमा',
      description: 'प्रत्येक प्रश्न की एक विशिष्ट समय सीमा है। समय समाप्त होने से पहले उत्तर दें!'
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: theme.colors.primary }} />,
      title: 'सबमिशन',
      description: 'अगले प्रश्न पर जाने के लिए अपना उत्तर सबमिट करें। आप वापस नहीं जा सकते।'
    },
  ];

  return (
    <Modal
      open={visible}
      closable={false}
      footer={null}
      width={800}
      centered
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ 
        background: theme.gradients.primary,
        padding: theme.spacing.xxl,
        borderRadius: theme.borderRadius.xl,
        textAlign: 'center',
      }}>
        <Title level={2} style={{ color: 'white', margin: 0, marginBottom: theme.spacing.sm }}>
          {language === 'en' ? `Welcome, ${candidateName}!` : `स्वागत है, ${candidateName}!`}
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 18 }}>
          {language === 'en' ? `${jobTitle} Interview` : `${jobTitle} इंटरव्यू`}
        </Text>
      </div>

      <div style={{ padding: theme.spacing.xxl }}>
        {/* Language Selection */}
        <Card style={{ marginBottom: theme.spacing.lg, background: theme.colors.gray[50] }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text strong>{language === 'en' ? 'Select Interview Language:' : 'इंटरव्यू भाषा चुनें:'}</Text>
            <Radio.Group 
              value={language} 
              onChange={(e) => handleLanguageChange(e.target.value)}
              size="large"
            >
              <Radio.Button value="en" style={{ marginRight: theme.spacing.sm }}>
                🇬🇧 English
              </Radio.Button>
              <Radio.Button value="hi">
                🇮🇳 हिन्दी (Hindi)
              </Radio.Button>
            </Radio.Group>
          </Space>
        </Card>

        {/* Audio Player */}
        <Card style={{ marginBottom: theme.spacing.lg, textAlign: 'center', background: theme.colors.primary, border: 'none' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {isPlaying ? (
              <>
                <Spin size="large" />
                <Text style={{ color: 'white', fontSize: 16 }}>
                  {language === 'en' ? '🔊 Playing greeting message...' : '🔊 स्वागत संदेश चल रहा है...'}
                </Text>
              </>
            ) : (
              <>
                <SoundOutlined style={{ fontSize: 48, color: 'white' }} />
                <Button 
                  type="default" 
                  size="large"
                  icon={<SoundOutlined />}
                  onClick={playGreeting}
                  style={{ background: 'white', color: theme.colors.primary, fontWeight: 600 }}
                >
                  {hasPlayed 
                    ? (language === 'en' ? '🔄 Replay Greeting' : '🔄 स्वागत संदेश फिर से सुनें')
                    : (language === 'en' ? '🔊 Play Greeting' : '🔊 स्वागत संदेश सुनें')
                  }
                </Button>
              </>
            )}
          </Space>
        </Card>

        <Title level={4} style={{ marginBottom: theme.spacing.lg }}>
          {language === 'en' ? '📋 Interview Guidelines' : '📋 इंटरव्यू दिशानिर्देश'}
        </Title>
        
        <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: theme.spacing.xl }}>
          {rules.map((rule, index) => (
            <Card 
              key={index}
              size="small"
              style={{ 
                background: theme.colors.gray[50],
                border: `2px solid ${theme.colors.primary}`,
                borderRadius: theme.borderRadius.lg
              }}
            >
              <Space align="start" size="middle">
                {rule.icon}
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>
                    {rule.title}
                  </Text>
                  <Text type="secondary">{rule.description}</Text>
                </div>
              </Space>
            </Card>
          ))}
        </Space>

        {/* Start Button */}
        <Button
          type="primary"
          size="large"
          block
          onClick={handleStart}
          disabled={isPlaying}
          style={{
            height: 60,
            fontSize: 18,
            fontWeight: 600,
            background: theme.gradients.primary,
            border: 'none',
            borderRadius: theme.borderRadius.xl,
            boxShadow: theme.shadows.lg
          }}
        >
          {language === 'en' ? '🚀 Start Interview' : '🚀 इंटरव्यू शुरू करें'}
        </Button>

        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: theme.spacing.md }}>
          {language === 'en' 
            ? '⚠️ The interview will enter fullscreen mode. Please ensure you are ready.'
            : '⚠️ इंटरव्यू फुलस्क्रीन मोड में प्रवेश करेगा। कृपया सुनिश्चित करें कि आप तैयार हैं।'
          }
        </Text>
      </div>
    </Modal>
  );
};

export default InterviewGreetingModal;
