import React, { useState, useEffect } from 'react';
import { AppWithVersions, App, AppVersion } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Plus, Edit2, Trash2, Smartphone, Apple, Android, Globe, Info, AlertTriangle, Layers } from 'lucide-react';

export const CMSDashboard: React.FC = () => {
  const { isMockMode } = useAuth();
  const [apps, setApps] = useState<AppWithVersions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // App Modal States
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [appName, setAppName] = useState('');
  const [appBundleId, setAppBundleId] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [appIconUrl, setAppIconUrl] = useState('');

  // Version Modal States
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<AppVersion | null>(null);
  const [versionTargetApp, setVersionTargetApp] = useState<App | null>(null);
  const [versionNumber, setVersionNumber] = useState('');
  const [versionBuild, setVersionBuild] = useState('');
  const [versionPlatform, setVersionPlatform] = useState<'ios' | 'android'>('ios');
  const [versionUrl, setVersionUrl] = useState('');
  const [versionChangelog, setVersionChangelog] = useState('');
  const [versionIsActive, setVersionIsActive] = useState(true);

  // Selected App detail view (which app's versions are we viewing/managing?)
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [isMockMode]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    if (isMockMode) {
      // Simulate loading from local storage (or default mock data)
      const stored = localStorage.getItem('mock_db_apps');
      if (stored) {
        setApps(JSON.parse(stored));
      } else {
        // Init default mock storage
        const defaultMock = [
          {
            id: 'app-1',
            name: 'Salesforce CRM Admin',
            bundle_id: 'com.enterprise.salesforce.crm',
            description: 'Internal customer relationship management tools for field sales representatives.',
            icon_url: '',
            created_at: new Date().toISOString(),
            versions: [
              {
                id: 'ver-1',
                app_id: 'app-1',
                version: '1.4.2',
                build_number: '142',
                platform: 'ios' as const,
                download_url: 'itms-services://?action=download-manifest&url=https://example.com/manifests/crm-1.4.2.plist',
                changelog: '• Optimized customer profile rendering speed\n• Fixed offline sync conflict issues',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ]
          }
        ];
        localStorage.setItem('mock_db_apps', JSON.stringify(defaultMock));
        setApps(defaultMock);
      }
      setLoading(false);
      return;
    }

    try {
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

      const { data: versionsData, error: versionsError } = await supabase
        .from('app_versions')
        .select('*')
        .order('created_at', { ascending: false });

      if (versionsError) throw versionsError;

      const grouped: AppWithVersions[] = appsData.map((app) => ({
        ...app,
        versions: (versionsData || []).filter((v) => v.app_id === app.id),
      }));

      setApps(grouped);
      if (grouped.length > 0 && !selectedAppId) {
        setSelectedAppId(grouped[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync with database');
    } finally {
      setLoading(false);
    }
  };

  const saveMockState = (newApps: AppWithVersions[]) => {
    setApps(newApps);
    localStorage.setItem('mock_db_apps', JSON.stringify(newApps));
  };

  // Manage App Handlers
  const handleOpenAppModal = (app?: App) => {
    if (app) {
      setEditingApp(app);
      setAppName(app.name);
      setAppBundleId(app.bundle_id);
      setAppDescription(app.description || '');
      setAppIconUrl(app.icon_url || '');
    } else {
      setEditingApp(null);
      setAppName('');
      setAppBundleId('');
      setAppDescription('');
      setAppIconUrl('');
    }
    setIsAppModalOpen(true);
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!appName || !appBundleId) {
      setError('Name and Bundle ID are required.');
      return;
    }

    if (isMockMode) {
      if (editingApp) {
        // Edit Mode
        const updated = apps.map((a) => 
          a.id === editingApp.id 
            ? { ...a, name: appName, bundle_id: appBundleId, description: appDescription, icon_url: appIconUrl }
            : a
        );
        saveMockState(updated);
      } else {
        // Add Mode
        const newApp: AppWithVersions = {
          id: `app-${Math.random().toString(36).substr(2, 9)}`,
          name: appName,
          bundle_id: appBundleId,
          description: appDescription,
          icon_url: appIconUrl,
          created_at: new Date().toISOString(),
          versions: []
        };
        saveMockState([...apps, newApp]);
        setSelectedAppId(newApp.id);
      }
      setIsAppModalOpen(false);
      return;
    }

    // Supabase DB Actions
    try {
      if (editingApp) {
        const { error: updateErr } = await supabase
          .from('apps')
          .update({ name: appName, bundle_id: appBundleId, description: appDescription, icon_url: appIconUrl })
          .eq('id', editingApp.id);

        if (updateErr) throw updateErr;
      } else {
        const { data, error: insertErr } = await supabase
          .from('apps')
          .insert([{ name: appName, bundle_id: appBundleId, description: appDescription, icon_url: appIconUrl }])
          .select();

        if (insertErr) throw insertErr;
        if (data && data[0]) {
          setSelectedAppId(data[0].id);
        }
      }
      setIsAppModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Database error while saving App');
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!window.confirm('Are you sure you want to delete this application? All its version configurations will be lost.')) return;

    if (isMockMode) {
      const remaining = apps.filter((a) => a.id !== appId);
      saveMockState(remaining);
      if (selectedAppId === appId) {
        setSelectedAppId(remaining[0]?.id || null);
      }
      return;
    }

    try {
      const { error: delErr } = await supabase
        .from('apps')
        .delete()
        .eq('id', appId);

      if (delErr) throw delErr;
      if (selectedAppId === appId) {
        setSelectedAppId(null);
      }
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete app.');
    }
  };

  // Manage Version Handlers
  const handleOpenVersionModal = (targetApp: App, version?: AppVersion) => {
    setVersionTargetApp(targetApp);
    if (version) {
      setEditingVersion(version);
      setVersionNumber(version.version);
      setVersionBuild(version.build_number || '');
      setVersionPlatform(version.platform);
      setVersionUrl(version.download_url);
      setVersionChangelog(version.changelog || '');
      setVersionIsActive(version.is_active);
    } else {
      setEditingVersion(null);
      setVersionNumber('');
      setVersionBuild('');
      setVersionPlatform('ios');
      setVersionUrl('');
      setVersionChangelog('');
      setVersionIsActive(true);
    }
    setIsVersionModalOpen(true);
  };

  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!versionNumber || !versionUrl) {
      setError('Version and download link URL are required.');
      return;
    }

    if (!versionTargetApp) return;

    if (isMockMode) {
      if (editingVersion) {
        // Edit Version
        const updated = apps.map((app) => {
          if (app.id !== versionTargetApp.id) return app;
          return {
            ...app,
            versions: app.versions.map((v) => 
              v.id === editingVersion.id
                ? {
                    ...v,
                    version: versionNumber,
                    build_number: versionBuild,
                    platform: versionPlatform,
                    download_url: versionUrl,
                    changelog: versionChangelog,
                    is_active: versionIsActive,
                    updated_at: new Date().toISOString()
                  }
                : v
            )
          };
        });
        saveMockState(updated);
      } else {
        // Add Version
        const newVer: AppVersion = {
          id: `ver-${Math.random().toString(36).substr(2, 9)}`,
          app_id: versionTargetApp.id,
          version: versionNumber,
          build_number: versionBuild,
          platform: versionPlatform,
          download_url: versionUrl,
          changelog: versionChangelog,
          is_active: versionIsActive,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const updated = apps.map((app) => {
          if (app.id !== versionTargetApp.id) return app;
          return { ...app, versions: [newVer, ...app.versions] };
        });
        saveMockState(updated);
      }
      setIsVersionModalOpen(false);
      return;
    }

    // Supabase DB Actions
    try {
      if (editingVersion) {
        const { error: updateErr } = await supabase
          .from('app_versions')
          .update({
            version: versionNumber,
            build_number: versionBuild,
            platform: versionPlatform,
            download_url: versionUrl,
            changelog: versionChangelog,
            is_active: versionIsActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingVersion.id);

        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('app_versions')
          .insert([{
            app_id: versionTargetApp.id,
            version: versionNumber,
            build_number: versionBuild,
            platform: versionPlatform,
            download_url: versionUrl,
            changelog: versionChangelog,
            is_active: versionIsActive
          }]);

        if (insertErr) throw insertErr;
      }
      setIsVersionModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Database error while saving version configuration.');
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!window.confirm('Delete this version configuration? Users will no longer be able to install this specific build.')) return;

    if (isMockMode) {
      const updated = apps.map((app) => ({
        ...app,
        versions: app.versions.filter((v) => v.id !== versionId)
      }));
      saveMockState(updated);
      return;
    }

    try {
      const { error: delErr } = await supabase
        .from('app_versions')
        .delete()
        .eq('id', versionId);

      if (delErr) throw delErr;
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete version configuration.');
    }
  };

  const currentApp = apps.find((a) => a.id === selectedAppId);

  return (
    <div className="app-container" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>
            App Configuration Console
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage internal build releases, edit download manifests, and toggles for client deployment.
          </p>
        </div>
        <Button onClick={() => handleOpenAppModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          Create App
        </Button>
      </div>

      {error && (
        <div className="glass" style={{
          display: 'flex',
          gap: '10px',
          padding: '12px 18px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#f87171',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}

      {/* Main CMS Layout */}
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
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Syncing console data...</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="glass" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          borderRadius: '16px',
          border: '1px dashed var(--border-color)'
        }}>
          <Info size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Applications Initialized</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Get started by adding your first enterprise app.
          </p>
          <Button onClick={() => handleOpenAppModal()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} />
            Create Application
          </Button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Left App Sidebar */}
          <div className="glass" style={{
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0 8px 4px 8px', borderBottom: '1px solid var(--border-color)', textTransform: 'uppercase' }}>
              Applications ({apps.length})
            </span>
            {apps.map((app) => (
              <div 
                key={app.id}
                onClick={() => setSelectedAppId(app.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: selectedAppId === app.id ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  border: selectedAppId === app.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {app.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {app.bundle_id}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenAppModal(app); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                    title="Edit Metadata"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteApp(app.id); }}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                    title="Delete App"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Version Detail Area */}
          {currentApp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* App Summary Card */}
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>{currentApp.name}</h3>
                    <code style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{currentApp.bundle_id}</code>
                  </div>
                  <Button 
                    onClick={() => handleOpenVersionModal(currentApp)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={14} />
                    New Version Build
                  </Button>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {currentApp.description || 'No description configured for this app. Go to Edit App Metadata to fill in detail info.'}
                </p>
              </div>

              {/* Versions List Table */}
              <div>
                <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                  <Layers size={16} color="var(--primary)" />
                  Version Registries
                </h4>
                
                <div className="table-container">
                  {currentApp.versions && currentApp.versions.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Version (Build)</th>
                          <th>Platform</th>
                          <th>Status</th>
                          <th>Download URL</th>
                          <th>Released Date</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentApp.versions.map((ver) => (
                          <tr key={ver.id}>
                            <td style={{ fontWeight: 600 }}>
                              v{ver.version} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>({ver.build_number || 'N/A'})</span>
                            </td>
                            <td>
                              <span className={`badge badge-${ver.platform}`} style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                                {ver.platform === 'ios' ? <Apple size={10} /> : <Android size={10} />}
                                {ver.platform}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${ver.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                {ver.is_active ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <a href={ver.download_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem' }} title={ver.download_url}>
                                {ver.download_url}
                              </a>
                            </td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {new Date(ver.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleOpenVersionModal(currentApp, ver)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '6px' }}
                                  title="Edit Version"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteVersion(ver.id)}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '6px' }}
                                  title="Delete Version"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                      No versions configured for this app yet. Click "New Version Build" above to configure your first package installation manifest.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* App Form Modal */}
      <Modal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        title={editingApp ? 'Edit App Metadata' : 'Create Application'}
      >
        <form onSubmit={handleSaveApp}>
          <Input
            label="Application Name"
            placeholder="e.g. Sales Force CRM"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            required
          />
          <Input
            label="Bundle Identifier"
            placeholder="e.g. com.enterprise.salesforce"
            value={appBundleId}
            onChange={(e) => setAppBundleId(e.target.value)}
            required
            disabled={!!editingApp} // don't change bundle id on edit
          />
          <Input
            label="App Icon URL (Optional)"
            placeholder="https://example.com/icons/salesforce.png"
            value={appIconUrl}
            onChange={(e) => setAppIconUrl(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Enter a brief summary of the app's functions..."
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            isTextArea
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <Button type="button" variant="secondary" onClick={() => setIsAppModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingApp ? 'Update App' : 'Create App'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Version Form Modal */}
      {versionTargetApp && (
        <Modal
          isOpen={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
          title={editingVersion ? `Modify v${editingVersion.version} build` : `Add build version for ${versionTargetApp.name}`}
        >
          <form onSubmit={handleSaveVersion}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Version (Major.Minor.Patch)"
                placeholder="e.g. 1.0.0"
                value={versionNumber}
                onChange={(e) => setVersionNumber(e.target.value)}
                required
              />
              <Input
                label="Build Number"
                placeholder="e.g. 100"
                value={versionBuild}
                onChange={(e) => setVersionBuild(e.target.value)}
              />
            </div>
            
            <Input
              label="Operating System Platform"
              options={[
                { value: 'ios', label: 'Apple iOS (.plist manifest link)' },
                { value: 'android', label: 'Android OS (.apk direct download link)' }
              ]}
              value={versionPlatform}
              onChange={(e) => setVersionPlatform(e.target.value as 'ios' | 'android')}
            />

            <Input
              label={versionPlatform === 'ios' ? 'iOS plist Manifest Link (itms-services)' : 'Android Direct APK download Link'}
              placeholder={versionPlatform === 'ios' ? 'itms-services://?action=download-manifest&url=...' : 'https://cdn.enterprise.com/downloads/crm-v1.apk'}
              value={versionUrl}
              onChange={(e) => setVersionUrl(e.target.value)}
              required
            />

            <Input
              label="Changelog / Release Notes"
              placeholder="Detail list of bug fixes, features added, or compatibility revisions..."
              value={versionChangelog}
              onChange={(e) => setVersionChangelog(e.target.value)}
              isTextArea
            />

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
              <input
                id="active-toggle"
                type="checkbox"
                checked={versionIsActive}
                onChange={(e) => setVersionIsActive(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="active-toggle" className="form-label" style={{ cursor: 'pointer', marginBottom: 0 }}>
                Deploy to Production (Make active for client download)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <Button type="button" variant="secondary" onClick={() => setIsVersionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingVersion ? 'Update Build' : 'Release Build'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
