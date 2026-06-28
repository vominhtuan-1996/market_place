import React, { useState } from 'react';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CMSDashboard } from './pages/CMSDashboard';

const AppContent: React.FC = () => {
  const [tab, setTab] = useState<'catalog' | 'cms' | 'login'>('catalog');
  const { user } = useAuthContext();

  const handleLoginSuccess = () => {
    setTab('cms');
  };

  const renderPage = () => {
    switch (tab) {
      case 'catalog':
        return <LandingPage />;
      case 'login':
        if (user) {
          setTab('cms');
          return <CMSDashboard />;
        }
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case 'cms':
        if (!user) {
          return <LoginPage onLoginSuccess={handleLoginSuccess} />;
        }
        return <CMSDashboard />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentTab={tab} setTab={setTab} />
      
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>

      <footer className="glass" style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.5rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.8rem',
        marginTop: '3rem',
        background: 'rgba(3, 7, 18, 0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', gap: '10px' }}>
          <span>© {new Date().getFullYear()} Enterprise Systems Inc. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Secure Portal</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-muted)' }}>Internal Use Only</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
