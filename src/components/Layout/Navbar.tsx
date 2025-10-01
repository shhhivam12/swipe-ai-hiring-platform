import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Space, Dropdown, Menu } from 'antd';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { RootState } from '../../store';
import { setUserType, logout, UserType } from '../../store/slices/userSlice';
import { theme } from '../../styles/theme';

const { Header } = Layout;
const { Title } = Typography;

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRoleSelect = (role: UserType) => {
    dispatch(setUserType(role));
    if (role === 'student') {
      navigate('/interviewee');
    } else {
      navigate('/interviewer');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const roleMenu = (
    <Menu>
      <Menu.Item key="student" onClick={() => handleRoleSelect('student')}>
        <UserOutlined /> Login as Student
      </Menu.Item>
      <Menu.Item key="interviewer" onClick={() => handleRoleSelect('interviewer')}>
        <UserOutlined /> Login as Interviewer
      </Menu.Item>
    </Menu>
  );

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const isLandingPage = location.pathname === '/';

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: scrolled || !isLandingPage ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(0)',
      zIndex: 1000,
      width: scrolled || !isLandingPage ? '90%' : '95%',
      maxWidth: '1400px',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
    <Header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      background: scrolled || !isLandingPage
        ? 'rgba(255, 255, 255, 0.6)'
        : 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      boxShadow: 'rgba(34, 42, 53, 0.06) 0px 0px 24px, rgba(0, 0, 0, 0.05) 0px 1px 1px, rgba(34, 42, 53, 0.04) 0px 0px 0px 1px, rgba(34, 42, 53, 0.08) 0px 0px 4px, rgba(47, 48, 55, 0.05) 0px 16px 68px, rgba(255, 255, 255, 0.1) 0px 1px 0px inset',
      padding: '12px 24px',
      height: 'auto',
      borderRadius: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <img 
          src="/main_logo.png" 
          alt="Swipe AI" 
          style={{ 
            height: 40, 
            marginRight: 12,
            filter: scrolled || !isLandingPage ? 'none' : 'drop-shadow(0 2px 8px rgba(255,255,255,0.3))',
            transition: 'all 0.3s ease',
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <Title level={3} style={{ 
          margin: 0, 
          color: scrolled || !isLandingPage ? theme.colors.black : theme.colors.black,
          fontFamily: theme.fonts.secondary,
          fontWeight: 600,
          textShadow: 'none',
          transition: 'all 0.3s ease',
        }}>
        </Title>
      </div>

      <Space size="large">
        {!isAuthenticated ? (
          <Dropdown overlay={roleMenu} trigger={['click']}>
            <Button 
              type="primary" 
              icon={<UserOutlined />}
              style={{
                background: theme.gradients.primary,
                backdropFilter: 'blur(10px)',
                border: 'none',
                color: theme.colors.white,
                height: 44,
                borderRadius: theme.borderRadius.full,
                padding: '0 28px',
                fontWeight: 600,
                boxShadow: '0 4px 16px rgba(39, 84, 255, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Direct Login <DownOutlined />
            </Button>
          </Dropdown>
        ) : (
          <Space size="middle">
            <span style={{ 
              color: scrolled || !isLandingPage ? theme.colors.gray[700] : theme.colors.black,
              fontWeight: 500,
              textShadow: 'none',
              transition: 'all 0.3s ease',
            }}>
              {userType === 'student' ? '👨‍🎓 Student' : '👔 Interviewer'}
            </span>
            <Dropdown overlay={userMenu} trigger={['click']}>
              <Button 
                type="text" 
                icon={<UserOutlined />}
                style={{
                  color: theme.colors.primary,
                  background: scrolled || !isLandingPage 
                    ? `${theme.colors.primary}10` 
                    : theme.colors.white,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme.colors.gray[200]}`,
                  borderRadius: theme.borderRadius.md,
                  height: 40,
                  width: 40,
                  transition: 'all 0.3s ease',
                }}
              >
                <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        )}
      </Space>
    </Header>
    </div>
  );
};

export default Navbar;
