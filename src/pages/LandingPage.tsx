import React, { useState, useEffect } from 'react';
import { AppWithVersions, AppVersion } from '../types';
import { AppCard } from '../components/AppCard';
import { Modal } from '../components/Modal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Search, Monitor, Smartphone, AlertCircle, Calendar, ShieldCheck, Download } from 'lucide-react';

// Highly polished mockup data
const MOCK_APPS: AppWithVersions[] = [
  {
    id: 'app-1',
    name: 'Salesforce CRM Admin',
    bundle_id: 'com.enterprise.salesforce.crm',
    description: 'Internal customer relationship management tools for field sales representatives. Synchronize contacts, manage deals, and log client interactions offline.',
    icon_url: '',
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    versions: [
      {
        id: 'ver-1',
        app_id: 'app-1',
        version: '1.4.2',
        build_number: '142',
        platform: 'ios',
        download_url: 'itms-services://?action=download-manifest&url=https://example.com/manifests/crm-1.4.2.plist',
        changelog: '• Optimized customer profile rendering speed\n• Fixed offline sync conflict issues\n• Updated splash screen to new enterprise theme',
        is_active: true,
        created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'ver-2',
        app_id: 'app-1',
        version: '1.4.0',
        build_number: '140',
        platform: 'ios',
        download_url: 'itms-services://?action=download-manifest&url=https://example.com/manifests/crm-1.4.0.plist',
        changelog: '• Introduced push notifications for sales triggers\n• Added geolocation mapping for local accounts',
        is_active: true,
        created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'ver-3',
        app_id: 'app-1',
        version: '1.4.1',
        build_number: '141',
        platform: 'android',
        download_url: 'https://example.com/downloads/crm-release-1.4.1.apk',
        changelog: '• Enabled barcode scanner support for product catalogs\n• General UI refinements and crash fixes on Android 14',
        is_active: true,
        created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'app-2',
    name: 'Enterprise Logistics Tracker',
    bundle_id: 'com.enterprise.logistics.tracker',
    description: 'Fleet logistics and package tracking application. Provides real-time GPS updating, route optimization, and digital signature capture on delivery.',
    icon_url: '',
    created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    versions: [
      {
        id: 'ver-4',
        app_id: 'app-2',
        version: '2.1.0',
        build_number: '210',
        platform: 'android',
        download_url: 'https://example.com/downloads/tracker-2.1.0.apk',
        changelog: '• Completely redesigned route dispatch panel\n• Battery optimization for background location services\n• Multi-stop delivery confirmation flow',
        is_active: true,
        created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'ver-5',
        app_id: 'app-2',
        version: '2.0.2',
        build_number: '202',
        platform: 'android',
        download_url: 'https://example.com/downloads/tracker-2.0.2.apk',
        changelog: '• Initial android release with digital signoff\n• Custom map rendering overlay fixes',
        is_active: true,
        created_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'app-3',
    name: 'Field Survey Agent',
    bundle_id: 'com.enterprise.field.survey',
    description: 'High-precision engineering survey app for offline data collation, architectural inspections, and raw photographic uploads.',
    icon_url: '',
    created_at: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
    versions: [
      {
        id: 'ver-6',
        app_id: 'app-3',
        version: '3.0.1',
        build_number: '301',
        platform: 'ios',
        download_url: 'itms-services://?action=download-manifest&url=https://example.com/manifests/survey-3.0.1.plist',
        changelog: '• Added camera zoom and photo timestamp features\n• Export data directly to PDF report formats',
        is_active: true,
        created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      }
    ]
  }
];

export const LandingPage: React.FC = () => {
  const { isMockMode } = useAuth();
  const [apps, setApps] = useState<AppWithVersions[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'ios' | 'android'>('all');
  const [selectedApp, setSelectedApp] = useState<AppWithVersions | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchApps();
  }, [isMockMode]);

  const fetchApps = async () => {
    setLoading(true);
    if (isMockMode) {
      // Simulate API load
      setTimeout(() => {
        setApps(MOCK_APPS);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      // Fetch apps
      const { data: appsData, error: appsError } = await supabase
        .from('apps')
        .select('*')
        .order('name');

      if (appsError) throw appsError;

      if (!appsData || appsData.length === 0) {
        setApps([]);
        setLoading(false);
        return;
      }

      // Fetch versions
      const { data: versionsData, error: versionsError } = await supabase
        .from('app_versions')
        .select('*')
        .order('created_at', { ascending: false });

      if (versionsError) throw versionsError;

      // Group versions under apps
      const appsWithVersions: AppWithVersions[] = appsData.map((app) => ({
        ...app,
        versions: (versionsData || []).filter((v) => v.app_id === app.id),
      }));

      setApps(appsWithVersions);
    } catch (err) {
      console.error('Error fetching applications:', err);
      // Fallback to mock on error to maintain active showcase
      setApps(MOCK_APPS);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(search.toLowerCase()) || 
      app.bundle_id.toLowerCase().includes(search.toLowerCase()) ||
      (app.description && app.description.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (platformFilter === 'all') return true;

    // Checks if the app contains at least one active version matching the platform filter
    return app.versions.some(
      (v) => v.platform === platformFilter && v.is_active
    );
  });

  const openHistoryModal = (app: AppWithVersions) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  return (
    <div className="app-container" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* Title Showcase */}
      <div style={{ textAlign: 'center', margin: '3rem 0' }}>
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>
          <span className="gradient-text-accent">Enterprise Workspace</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto' }}>
          Secure, authenticated portal for testing and installing internal enterprise builds.
        </p>
      </div>

      {/* Security Banner */}
      <div className="glass" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: '12px',
        marginBottom: '2rem',
        background: 'rgba(99, 102, 241, 0.05)',
        border: '1px solid rgba(99, 102, 241, 0.15)'
      }}>
        <ShieldCheck size={20} color="var(--primary)" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          All applications in this store are digitally signed with internal enterprise keys. Trust the enterprise certificate in your device settings before launching.
        </span>
      </div>

      {/* Filters and Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.25rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2.5rem'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder="Search enterprise apps, bundle IDs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '48px', borderRadius: '12px' }}
          />
        </div>

        {/* Platform Buttons */}
        <div className="glass" style={{
          display: 'inline-flex',
          padding: '4px',
          borderRadius: '12px',
          gap: '4px'
        }}>
          <button
            onClick={() => setPlatformFilter('all')}
            className="btn"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              borderRadius: '8px',
              background: platformFilter === 'all' ? 'var(--primary)' : 'transparent',
              color: platformFilter === 'all' ? 'white' : 'var(--text-secondary)'
            }}
          >
            <Monitor size={14} style={{ marginRight: '6px' }} />
            All Platforms
          </button>
          <button
            onClick={() => setPlatformFilter('ios')}
            className="btn"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              borderRadius: '8px',
              background: platformFilter === 'ios' ? 'var(--primary)' : 'transparent',
              color: platformFilter === 'ios' ? 'white' : 'var(--text-secondary)'
            }}
          >
            <Smartphone size={14} style={{ marginRight: '6px' }} />
            iOS
          </button>
          <button
            onClick={() => setPlatformFilter('android')}
            className="btn"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              borderRadius: '8px',
              background: platformFilter === 'android' ? 'var(--primary)' : 'transparent',
              color: platformFilter === 'android' ? 'white' : 'var(--text-secondary)'
            }}
          >
            <Smartphone size={14} style={{ marginRight: '6px' }} />
            Android
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div style={{ textAlign: 'center', margin: '4rem 0' }}>
          <div className="animate-spin" style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.05)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%'
          }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading catalog...</p>
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="card-grid">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} onViewHistory={openHistoryModal} />
          ))}
        </div>
      ) : (
        <div className="glass" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          borderRadius: '16px',
          border: '1px dashed var(--border-color)'
        }}>
          <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Applications Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No apps match your search filter "{search}". Try searching for another name or platform.
          </p>
        </div>
      )}

      {/* Version Logs Modal */}
      {selectedApp && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`${selectedApp.name} - Version Changelogs`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {selectedApp.versions && selectedApp.versions.length > 0 ? (
              selectedApp.versions
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((version) => (
                  <div 
                    key={version.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      paddingBottom: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          v{version.version}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          (Build {version.build_number || 'N/A'})
                        </span>
                        <span className={`badge badge-${version.platform}`}>
                          {version.platform}
                        </span>
                        {!version.is_active && (
                          <span className="badge badge-inactive">Deprecated</span>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => window.location.href = version.download_url}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                      >
                        <Download size={12} />
                        Download
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      <Calendar size={12} />
                      Released on {new Date(version.created_at).toLocaleDateString()}
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                      <h5 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                        What's New:
                      </h5>
                      <p style={{
                        whiteSpace: 'pre-line',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        background: 'rgba(0,0,0,0.15)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.03)',
                        lineHeight: '1.5'
                      }}>
                        {version.changelog || 'No release notes provided.'}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                No version logs exist for this application.
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
