import React from 'react';
import { AppWithVersions, AppVersion } from '../types';
import { Download, History, Apple, Android } from 'lucide-react';
import { Button } from './Button';

interface AppCardProps {
  app: AppWithVersions;
  onViewHistory: (app: AppWithVersions) => void;
}

export const AppCard: React.FC<AppCardProps> = ({ app, onViewHistory }) => {
  // Sort versions to get the latest active version for iOS and Android
  const getLatestActiveVersion = (platform: 'ios' | 'android'): AppVersion | undefined => {
    return app.versions
      .filter((v) => v.platform === platform && v.is_active)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };

  const latestIos = getLatestActiveVersion('ios');
  const latestAndroid = getLatestActiveVersion('android');

  const handleDownload = (url: string) => {
    window.location.href = url;
  };

  // Generate a beautiful gradient placeholder icon if icon_url is empty
  const renderIcon = () => {
    if (app.icon_url) {
      return (
        <img 
          src={app.icon_url} 
          alt={app.name} 
          style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
          onError={(e) => {
            // fallback if image fails to load
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.icon-fallback') as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      );
    }

    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="card glass" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Card Header */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="icon-wrapper" style={{ overflow: 'hidden', position: 'relative' }}>
          {renderIcon()}
          <div 
            className="icon-fallback" 
            style={{
              display: app.icon_url ? 'none' : 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.1rem',
              fontFamily: 'var(--font-display)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            {getInitials(app.name)}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.name}
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {app.bundle_id}
          </span>
        </div>
      </div>

      {/* Description */}
      <p style={{ 
        color: 'var(--text-secondary)', 
        fontSize: '0.875rem', 
        marginBottom: '1.5rem',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        height: '4.2em' // constant height to align elements below
      }}>
        {app.description || 'No description provided for this application.'}
      </p>

      {/* Platforms and Download triggers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
        {/* iOS Version block */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.02)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Apple size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>iOS</span>
            {latestIos ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>v{latestIos.version}</span>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>N/A</span>
            )}
          </div>
          {latestIos ? (
            <button 
              onClick={() => handleDownload(latestIos.download_url)}
              className="btn btn-primary btn-sm"
              style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              <Download size={12} />
              Install
            </button>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Unavailable</span>
          )}
        </div>

        {/* Android Version block */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.02)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Android size={16} color="#34d399" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Android</span>
            {latestAndroid ? (
              <span style={{ fontSize: '0.8rem', color: '#34d399' }}>v{latestAndroid.version}</span>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>N/A</span>
            )}
          </div>
          {latestAndroid ? (
            <button 
              onClick={() => handleDownload(latestAndroid.download_url)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              <Download size={12} />
              Download
            </button>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Unavailable</span>
          )}
        </div>

        {/* View version history link */}
        <button 
          onClick={() => onViewHistory(app)}
          className="btn btn-secondary btn-sm"
          style={{ 
            marginTop: '8px', 
            background: 'transparent', 
            border: '1px dashed var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <History size={14} />
          View Changelogs & History
        </button>
      </div>
    </div>
  );
};
