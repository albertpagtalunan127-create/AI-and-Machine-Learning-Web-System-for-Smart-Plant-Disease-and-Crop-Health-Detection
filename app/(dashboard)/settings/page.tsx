'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase';
import { clearCurrentUser } from '@/lib/scanStorage';

// Defined OUTSIDE the page component so React doesn't remount it on every keystroke
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [modelUrl, setModelUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [farmName, setFarmName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('modelUrl') || '';
    setModelUrl(stored); setSavedUrl(stored);
    const farm = localStorage.getItem('farmName') || '';
    setFarmName(farm);
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email || '');
        setFullName(data.user.user_metadata?.full_name || '');
      }
    });
  }, []);

  function showMsg(type: 'success' | 'error', text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  }

  function saveModel() {
    const trimmed = modelUrl.trim();
    if (!trimmed) {
      showMsg('error', 'Please enter a model URL or local path'); return;
    }
    localStorage.setItem('modelUrl', trimmed);
    setSavedUrl(trimmed);
    showMsg('success', 'Model URL saved!');
  }

  async function saveProfile() {
    setSaving(true);
    localStorage.setItem('farmName', farmName);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    setSaving(false);
    showMsg(error ? 'error' : 'success', error ? error.message : 'Profile updated!');
  }

  async function changePassword() {
    if (!currentPassword) { showMsg('error', 'Please enter your current password'); return; }
    if (!newPassword) { showMsg('error', 'Please enter a new password'); return; }
    if (newPassword.length < 6) { showMsg('error', 'Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { showMsg('error', 'Passwords do not match'); return; }
    if (newPassword === currentPassword) { showMsg('error', 'New password must be different from current password'); return; }
    setSavingPw(true);
    // Step 1: Re-authenticate with current password to verify identity
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (authError) {
      setSavingPw(false);
      showMsg('error', 'Incorrect current password');
      return;
    }
    // Step 2: Update to new password
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPw(false);
    if (error) {
      showMsg('error', error.message);
    } else {
      showMsg('success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }

  async function handleLogout() {
    clearCurrentUser(); // clear per-user scan scope
    await createClient().auth.signOut();
    window.location.href = '/login';
  }


  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Configure your AI model and account settings" />

      <div style={{ padding: '24px 28px', flex: 1, maxWidth: '780px' }}>
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>⚙️ Settings</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Manage your AI model, profile, and account</p>
        </div>

        {/* Toast */}
        {msg && (
          <div style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 999,
            padding: '14px 20px', borderRadius: '12px',
            background: msg.type === 'success' ? 'var(--color-healthy)' : 'var(--color-disease)',
            color: 'white', fontWeight: 600, fontSize: '14px',
            boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            {msg.type === 'success' ? '✅' : '❌'} {msg.text}
          </div>
        )}

        {/* AI Model */}
        <Section title="🤖 Teachable Machine AI Model">
          <div style={{ marginBottom: '16px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.15)', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--color-primary)' }}>Two ways to use your model:</strong>
            <ol style={{ paddingLeft: '18px', marginTop: '8px', lineHeight: '1.8' }}>
              <li><strong>Cloud (Teachable Machine)</strong> — Go to <a href="https://teachablemachine.withgoogle.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>teachablemachine.withgoogle.com</a>, train, Export → Upload, paste the shareable link below</li>
              <li><strong>Local files</strong> — Export → Download, put <code>model.json</code>, <code>metadata.json</code>, <code>weights.bin</code> inside <code>public/my_model/</code>, then enter <code>/my_model/</code> below</li>
            </ol>
          </div>
          <label className="input-label">Model URL or Local Path</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              id="model-url-input"
              type="text"
              className="input"
              placeholder="https://teachablemachine.withgoogle.com/models/XXXX/  or  /my_model/"
              value={modelUrl}
              onChange={e => setModelUrl(e.target.value)}
            />
            <button id="save-model-btn" className="btn btn-primary" onClick={saveModel} style={{ flexShrink: 0 }}>
              Save
            </button>
          </div>
          {savedUrl && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--color-healthy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ✅ Model configured: <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{savedUrl}</span>
            </div>
          )}
        </Section>

        {/* Profile */}
        <Section title="👤 Profile">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="input-label">Full Name</label>
              <input id="profile-name" type="text" className="input" placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input id="profile-email" type="email" className="input" value={email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label className="input-label">Farm / Organization Name</label>
            <input id="farm-name-input" type="text" className="input" placeholder="e.g. Green Valley Farm" value={farmName} onChange={e => setFarmName(e.target.value)} />
          </div>
          <button id="save-profile-btn" className="btn btn-primary" onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
        </Section>

        {/* Supabase setup */}
        <Section title="🗄️ Database Setup (Supabase)">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.7 }}>
            To enable full functionality (save scan history, user accounts), create a free Supabase project and run this SQL:
          </p>
          <pre style={{
            background: '#0f0e2e', color: '#a29bfe', padding: '16px',
            borderRadius: '10px', fontSize: '12px', overflowX: 'auto',
            lineHeight: 1.8, fontFamily: 'monospace',
          }}>{`CREATE TABLE scans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  image_url   TEXT,
  disease_name TEXT NOT NULL,
  confidence  FLOAT NOT NULL,
  severity    TEXT,
  treatment   TEXT,
  plant_type  TEXT,
  is_healthy  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own scans"
  ON scans FOR ALL USING (auth.uid() = user_id);`}</pre>
          <div style={{ marginTop: '14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Then update your <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: '4px' }}>.env.local</code> with your Supabase URL and anon key.
          </div>
        </Section>

        {/* Change Password */}
        <Section title="🔑 Change Password">
          {/* Current password row */}
          <div style={{ marginBottom: '16px' }}>
            <label className="input-label">Current Password</label>
            <div style={{ position: 'relative', maxWidth: '340px' }}>
              <input
                id="current-password-input"
                type={showCurrentPw ? 'text' : 'password'}
                className="input"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                style={{ paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(p => !p)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: 0,
                }}
              >{showCurrentPw ? '🙈' : '👁️'}</button>
            </div>
          </div>
          {/* New + Confirm row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="input-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="new-password-input"
                  type={showNewPw ? 'text' : 'password'}
                  className="input"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(p => !p)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: 0,
                  }}
                >{showNewPw ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <div>
              <label className="input-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirm-password-input"
                  type={showConfirmPw ? 'text' : 'password'}
                  className="input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(p => !p)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: 0,
                  }}
                >{showConfirmPw ? '🙈' : '👁️'}</button>
              </div>
            </div>
          </div>
          {/* Password strength indicator */}
          {newPassword.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      height: '4px', width: '40px', borderRadius: '2px',
                      background: newPassword.length >= i * 3
                        ? i <= 1 ? '#d63031' : i <= 2 ? '#e17055' : i <= 3 ? '#fdcb6e' : '#00b894'
                        : 'var(--border-color)',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {newPassword.length < 3 ? 'Too short' : newPassword.length < 6 ? 'Weak' : newPassword.length < 9 ? 'Fair' : newPassword.length < 12 ? 'Good' : 'Strong'}
                </span>
              </div>
            </div>
          )}
          <button
            id="change-password-btn"
            className="btn btn-primary"
            onClick={changePassword}
            disabled={savingPw}
          >
            {savingPw ? '⏳ Changing...' : '🔑 Change Password'}
          </button>
        </Section>

        {/* Danger zone */}
        <Section title="⚠️ Account">
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              id="logout-btn"
              className="btn btn-ghost"
              onClick={handleLogout}
            >
              🚪 Sign Out
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
