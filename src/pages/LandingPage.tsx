import React, { useEffect, useState } from 'react';
import { Button, Typography, Row, Col, Space } from 'antd';
import { 
  RocketOutlined, 
  ThunderboltOutlined, 
  StarOutlined,
  ArrowRightOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  FileTextOutlined,
  MessageOutlined,
  CodeOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  LinkedinOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';
import FloatingEmoji from '../components/AnimatedEmojis/FloatingEmoji';
import './LandingPage.css';

const { Title, Paragraph, Text } = Typography;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToSection = (index: number) => {
    const sections = document.querySelectorAll('.full-section');
    sections[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  const techStack = [
    { icon: <CodeOutlined />, name: 'React', color: '#61DAFB' },
    { icon: <CodeOutlined />, name: 'TypeScript', color: '#3178C6' },
    { icon: <DatabaseOutlined />, name: 'Supabase', color: '#3ECF8E' },
    { icon: <CloudOutlined />, name: 'Flask', color: '#000000' },
    { icon: <ApiOutlined />, name: 'Groq AI', color: '#FF6B6B' },
    { icon: <CodeOutlined />, name: 'Redux', color: '#764ABC' },
  ];

  const workflowSteps = [
    { icon: <UserAddOutlined />, title: 'Sign Up', description: 'Create your account as a candidate or interviewer' },
    { icon: <FileTextOutlined />, title: 'Upload Resume', description: 'AI parses your resume and extracts key information' },
    { icon: <MessageOutlined />, title: 'AI Interview', description: 'Answer dynamically generated questions in real-time' },
    { icon: <CheckCircleOutlined />, title: 'Get Results', description: 'Receive instant feedback and evaluation scores' }
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* ==================== SECTION 1: HERO ==================== */}
      <section 
        className="full-section"
        style={{
          minHeight: '100vh',
          height: '100vh',
          background: theme.gradients.hero,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Animated Background Elements */}
        <div className="animated-bg">
          <div className="blob blob-1" style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }} />
          <div className="blob blob-2" style={{
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`
          }} />
          <div className="blob blob-3" style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }} />
        </div>

        {/* Floating Emojis */}
        <FloatingEmoji emoji="🚀" size={60} delay={0} left="5%" top="20%" />
        <FloatingEmoji emoji="💼" size={50} delay={1} left="85%" top="15%" />
        <FloatingEmoji emoji="🎯" size={55} delay={2} left="8%" top="65%" />
        <FloatingEmoji emoji="⭐" size={45} delay={1.5} left="90%" top="60%" />
        <FloatingEmoji emoji="💡" size={50} delay={0.5} left="0%" top="50%" />
        <FloatingEmoji emoji="🎓" size={55} delay={2.5} left="92%" top="85%" />
        <FloatingEmoji emoji="✨" size={40} delay={1.8} left="3%" top="85%" />
        <FloatingEmoji emoji="🔥" size={48} delay={0.8} left="92%" top="35%" />

        {/* Hero Content */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '60px 24px',
          position: 'relative',
          zIndex: 2,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
          }}
          className="hero-grid"
          >
            {/* Left Content */}
            <div className="hero-content" style={{ animation: 'fadeInLeft 1s ease-out' }}>
              <div style={{
                display: 'inline-block',
                background: '#DCFCE7',
                padding: '8px 20px',
                borderRadius: theme.borderRadius.full,
                marginBottom: '24px',
                border: '1px solid rgba(39, 84, 255, 0.2)',
              }}>
                <span style={{ 
                  color: 'black', 
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <ThunderboltOutlined /> AI-Powered Interview Platform
                </span>
              </div>

              <Title level={1} style={{
                fontSize: '64px',
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: '24px',
                background: 'linear-gradient(135deg, #000000 0%, #2754ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
               SwipeHiring - Revolutionize Your Hiring Process
              </Title>

              <Paragraph style={{
                fontSize: '20px',
                lineHeight: 1.7,
                color: theme.colors.gray[600],
                marginBottom: '40px',
                maxWidth: '540px',
              }}>
                Experience the future of recruitment with AI-driven interviews. 
                Smart, efficient, and unbiased candidate evaluation at scale.
              </Paragraph>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<RocketOutlined />}
                  onClick={() => navigate('/interviewee')}
                  style={{
                    height: '56px',
                    padding: '0 40px',
                    fontSize: '18px',
                    fontWeight: 600,
                    borderRadius: theme.borderRadius.full,
                    background: theme.gradients.primary,
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(39, 84, 255, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(39, 84, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(39, 84, 255, 0.3)';
                  }}
                >
                  Start Interview
                </Button>

                <Button
                  size="large"
                  icon={<StarOutlined />}
                  onClick={() => navigate('/interviewer')}
                  style={{
                    height: '56px',
                    padding: '0 40px',
                    fontSize: '18px',
                    fontWeight: 600,
                    borderRadius: theme.borderRadius.full,
                    background: 'white',
                    border: '2px solid #000',
                    color: '#000',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = '#000';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#000';
                  }}
                >
                  For Recruiters
                </Button>
              </div>

              {/* Stats */}
              <div style={{
                display: 'flex',
                gap: '48px',
                marginTop: '60px',
                flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: theme.colors.primary }}>
                    10K+
                  </div>
                  <div style={{ fontSize: '14px', color: theme.colors.gray[600] }}>
                    Interviews Conducted
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: theme.colors.primary }}>
                    95%
                  </div>
                  <div style={{ fontSize: '14px', color: theme.colors.gray[600] }}>
                    Accuracy Rate
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: theme.colors.primary }}>
                    500+
                  </div>
                  <div style={{ fontSize: '14px', color: theme.colors.gray[600] }}>
                    Candidates Selected
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="hero-image" style={{ 
              animation: 'fadeInRight 1s ease-out',
              position: 'relative',
            }}>
              <div style={{
                position: 'relative',
                borderRadius: theme.borderRadius.xxl,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                transform: 'perspective(1000px) rotateY(-5deg)',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateY(-5deg)';
              }}
              >
                <img 
                  src="/1.png" 
                  alt="AI Interview Platform"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.style.background = theme.gradients.primary;
                    e.currentTarget.parentElement!.style.minHeight = '500px';
                  }}
                />
              </div>

              {/* Floating Card */}
              <div className="floating-card" style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-40px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '20px 24px',
                borderRadius: theme.borderRadius.xl,
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                animation: 'float 3s ease-in-out infinite',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: theme.gradients.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}>
                    🤖
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#000' }}>
                      AI Analysis
                    </div>
                    <div style={{ fontSize: '13px', color: theme.colors.gray[600] }}>
                      Real-time evaluation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div 
            onClick={() => scrollToSection(1)}
            style={{
              cursor: 'pointer',
              animation: 'bounce 2s infinite',
              marginTop: '60px',
              textAlign: 'center',
            }}
          >
            <ArrowDownOutlined style={{ fontSize: 32, color: theme.colors.primary, opacity: 0.6 }} />
          </div>
        </div>
      </section>

      {/* ==================== SECTION 2: HOW IT WORKS ==================== */}
      <section 
        className="full-section"
        style={{ 
          minHeight: '100vh',
          background: theme.colors.white,
          padding: '100px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ maxWidth: 1200, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: theme.spacing.xxl }}>
            <Title level={2} style={{ 
              color: theme.colors.black,
              fontWeight: 800,
              fontSize: '3rem',
              marginBottom: theme.spacing.md
            }}>
              How It Works
            </Title>
            <Paragraph style={{ fontSize: 18, color: theme.colors.gray[600], maxWidth: 600, margin: '0 auto' }}>
              Simple, fast, and intelligent. Get started in minutes.
            </Paragraph>
          </div>

          {/* Video Section */}
          <div style={{ 
            marginBottom: theme.spacing.xxl,
            textAlign: 'center'
          }}>
            <div style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              maxWidth: 800,
              margin: '0 auto',
              borderRadius: theme.borderRadius.xl,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
              background: theme.colors.gray[100]
            }}>
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="How Swipe AI Works"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: theme.borderRadius.xl
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Workflow Steps */}
          <Row gutter={[32, 32]}>
            {workflowSteps.map((step, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <div style={{
                  textAlign: 'center',
                  padding: theme.spacing.lg,
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.secondary}15 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    fontSize: 32,
                    color: theme.colors.primary,
                    position: 'relative'
                  }}>
                    {step.icon}
                    <div style={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: theme.gradients.primary,
                      color: theme.colors.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700
                    }}>
                      {index + 1}
                    </div>
                  </div>
                  <Title level={5} style={{ marginBottom: theme.spacing.sm, fontWeight: 700 }}>
                    {step.title}
                  </Title>
                  <Text style={{ color: theme.colors.gray[600], fontSize: 14 }}>
                    {step.description}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>

          {/* Scroll Indicator */}
          <div 
            onClick={() => scrollToSection(2)}
            style={{
              cursor: 'pointer',
              animation: 'bounce 2s infinite',
              marginTop: '60px',
              textAlign: 'center',
            }}
          >
            <ArrowDownOutlined style={{ fontSize: 32, color: theme.colors.primary, opacity: 0.6 }} />
          </div>
        </div>
      </section>

      {/* ==================== SECTION 3: TECH STACK & CREATOR ==================== */}
      <section 
        className="full-section"
        style={{ 
          minHeight: '100vh',
          background: theme.colors.background,
          padding: '100px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ maxWidth: 1000, width: '100%', textAlign: 'center' }}>
          <Title level={2} style={{ 
            marginBottom: theme.spacing.xxl,
            color: theme.colors.black,
            fontWeight: 800,
            fontSize: '3rem'
          }}>
            Built with Modern Tech Stack
          </Title>

          <Row gutter={[32, 32]} justify="center" style={{ marginBottom: theme.spacing.xxl }}>
            {techStack.map((tech, index) => (
              <Col key={index}>
                <div style={{
                  padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
                  background: theme.colors.white,
                  borderRadius: theme.borderRadius.lg,
                  border: `1px solid ${theme.colors.gray[200]}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(39, 84, 255, 0.12)';
                  e.currentTarget.style.borderColor = theme.colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = theme.colors.gray[200];
                }}
                >
                  <span style={{ fontSize: 28, color: tech.color }}>{tech.icon}</span>
                  <Text strong style={{ color: theme.colors.gray[800], fontSize: 16 }}>{tech.name}</Text>
                </div>
              </Col>
            ))}
          </Row>

          {/* Creator Section */}
          <div style={{
            padding: theme.spacing.xxl,
            background: theme.colors.white,
            borderRadius: theme.borderRadius.xl,
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            maxWidth: 600,
            margin: '0 auto'
          }}>
            <div style={{ marginBottom: theme.spacing.lg }}>
              <img 
                src="/favicon.png" 
                alt="Creator" 
                style={{ 
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  marginBottom: theme.spacing.md,
                  boxShadow: '0 4px 16px rgba(39, 84, 255, 0.2)'
                }}
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            </div>
            
            <Title level={3} style={{ 
              marginBottom: theme.spacing.sm,
              color: theme.colors.black,
              fontWeight: 700
            }}>
              Crafted with Passion
            </Title>
            
            <Paragraph style={{ 
              fontSize: 17,
              color: theme.colors.gray[600],
              marginBottom: theme.spacing.lg
            }}>
              Designed and developed by{' '}
              <Text strong style={{ 
                color: theme.colors.primary,
                fontSize: 19,
                background: theme.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700
              }}>
                Shivam Mahendru
              </Text>
            </Paragraph>

            <Button 
              type="primary"
              size="large"
              icon={<LinkedinOutlined />}
              href="https://www.linkedin.com/in/shivam-mahendru-5b212b203"
              target="_blank"
              style={{
                height: 48,
                padding: '0 32px',
                borderRadius: theme.borderRadius.full,
                background: '#0A66C2',
                border: 'none',
                fontWeight: 600
              }}
            >
              Connect on LinkedIn
            </Button>

            <div style={{ marginTop: theme.spacing.xl }}>
              <Text style={{ color: theme.colors.gray[500], fontSize: 14 }}>
                © 2025 Swipe AI Interview Platform. All rights reserved.
              </Text>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
