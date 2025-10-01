import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ConfigProvider } from 'antd';
import { store, persistor } from './store';
import Layout from './components/Layout/Layout';
import IntervieweePage from './pages/IntervieweePage';
import InterviewerPage from './pages/InterviewerPage';
import LandingPage from './pages/LandingPage';
import './styles/global.css';
import './styles/responsive.css';

// Custom Ant Design theme
const antdTheme = {
  token: {
    colorPrimary: '#2754ff',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    borderRadius: 16,
  },
};

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider theme={antdTheme}>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/interviewee" element={<IntervieweePage />} />
                <Route path="/interviewer" element={<InterviewerPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Router>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
