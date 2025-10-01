import React from 'react';
import { Layout as AntLayout } from 'antd';
import Navbar from './Navbar';
import { theme } from '../../styles/theme';

const { Header, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AntLayout style={{ minHeight: '100vh', background: theme.colors.gray[50] }}>
      <Header style={{ 
        position: 'fixed', 
        zIndex: 1000, 
        width: '100%',
        background: theme.colors.white,
        boxShadow: theme.shadows.sm,
        borderBottom: `1px solid ${theme.colors.gray[200]}`,
      }}>
        <Navbar />
      </Header>
      <Content style={{ 
        marginTop: 64, 
        padding: theme.spacing.lg,
        minHeight: 'calc(100vh - 64px)',
      }}>
        {children}
      </Content>
    </AntLayout>
  );
};

export default Layout;
