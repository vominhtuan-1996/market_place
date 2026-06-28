import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, LogOut, AppWindow, User } from 'lucide-react';

interface NavbarProps {
  currentTab: 'catalog' | 'cms' | 'login';
  setTab: (tab: 'catalog' | 'cms' | 'login') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab }) => {
  const { user, signOut, isMockMode } = useAuth();

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-color)',
      marginBottom: '1rem'
    }}>
      <div 
        onClick={() => setTab('catalog')} 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
        }}>
          <AppWindow size={20} color="white" />
        </div>
        <span className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>
          Enterprise Hub
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={() => setTab('catalog')}
          className={`btn ${currentTab === 'catalog' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          App Store
        </button>

        {user ? (
          <>
            <button 
              onClick={() => setTab('cms')}
              className={`btn ${currentTab === 'cms' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Shield size={14} />
              CMS Dashboard
            </button>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              borderLeft: '1px solid var(--border-color)',
              paddingLeft: '12px',
              marginLeft: '4px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.user_metadata?.name || 'Administrator'}
                </span>
                {isMockMode && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--secondary)', fontWeight: 700 }}>
                    MOCK DEV MODE
                  </span>
                )}
              </div>
              <button 
                onClick={signOut}
                className="btn btn-danger btn-sm"
                title="Log Out"
                style={{ padding: '6px' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={() => setTab('login')}
            className={`btn ${currentTab === 'login' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <User size={14} />
            Admin Login
          </button>
        )}
      </div>
    </nav>
  );
};
