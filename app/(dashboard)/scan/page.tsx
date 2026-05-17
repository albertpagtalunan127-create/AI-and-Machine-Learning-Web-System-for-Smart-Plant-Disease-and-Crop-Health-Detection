'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import DiseaseDetector from '@/components/DiseaseDetector';
import dynamic from 'next/dynamic';

const LiveDetector = dynamic(() => import('@/components/LiveDetector'), { ssr: false });

export default function ScanPage() {
  const [savedScans, setSavedScans] = useState(0);
  const [pageTab, setPageTab] = useState<'detector' | 'live'>('detector');
  const [modelUrl, setModelUrl] = useState('');

  // Read from localStorage only on the client after mount (fixes hydration mismatch)
  useEffect(() => {
    const stored = localStorage.getItem('modelUrl');
    setModelUrl(stored || process.env.NEXT_PUBLIC_DEFAULT_MODEL_URL || '');
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
      <Header title="Detect plant diseases using AI" />

      <div className="page-padding" style={{ flex: 1, minWidth: 0 }}>

        {/* ── Page title row ── */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                🔬 Plant Disease Scanner
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                AI-powered detection using your Teachable Machine model
              </p>
            </div>

            {/* Right controls */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {savedScans > 0 && (
                <div style={{
                  padding: '6px 14px', borderRadius: '20px',
                  background: 'rgba(0,184,148,0.1)', border: '1px solid rgba(0,184,148,0.25)',
                  fontSize: '12px', color: 'var(--color-healthy)', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  ✅ {savedScans} scan{savedScans > 1 ? 's' : ''} today
                </div>
              )}
              <a href="/settings" className="btn btn-ghost btn-sm" style={{ fontSize: '12px' }}>
                ⚙️ Settings
              </a>
            </div>
          </div>
        </div>

        {/* ── Mode toggle tabs ── */}
        <div style={{
          display: 'flex', gap: '4px',
          background: 'white', borderRadius: '12px', padding: '4px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          width: 'fit-content', marginBottom: '20px',
        }}>
          {([
            ['detector', '🔬', 'Scan Mode'],
            ['live',     '📹', 'Live Mode'],
          ] as const).map(([key, icon, label]) => (
            <button
              key={key}
              id={`page-tab-${key}`}
              onClick={() => setPageTab(key)}
              style={{
                padding: '8px 18px', borderRadius: '9px', border: 'none',
                fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                background: pageTab === key
                  ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
                  : 'transparent',
                color: pageTab === key ? 'white' : 'var(--text-secondary)',
                boxShadow: pageTab === key ? '0 2px 8px rgba(108,92,231,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>

        {/* ── How it works (Scan Mode only) ── */}
        {pageTab === 'detector' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}>
            {[
              { step: '1', icon: '📸', title: 'Capture or Upload', desc: 'Take a photo or upload an existing plant image' },
              { step: '2', icon: '🤖', title: 'AI Analysis', desc: 'Teachable Machine model analyzes the image instantly' },
              { step: '3', icon: '💊', title: 'Get Treatment', desc: 'Receive diagnosis and AI-powered treatment recommendations' },
            ].map(s => (
              <div key={s.step} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '14px 16px', borderRadius: '12px',
                background: 'white', border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '13px', fontWeight: 800,
                }}>{s.step}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                    {s.icon} {s.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Live mode info banner ── */}
        {pageTab === 'live' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px',
            padding: '14px 18px', borderRadius: '12px',
            background: 'rgba(108,92,231,0.05)', border: '1px solid rgba(108,92,231,0.18)',
          }}>
            <span style={{ fontSize: '26px', flexShrink: 0 }}>📹</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                Live Continuous Mode
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Real-time detection using Teachable Machine Webcam API. Place your model files in{' '}
                <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: '4px', fontSize: '11px' }}>
                  public/my_model/
                </code>{' '}
                or configure a cloud URL in Settings.
              </div>
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        {pageTab === 'detector' ? (
          <DiseaseDetector
            modelUrl={modelUrl}
            onScanSaved={() => setSavedScans(p => p + 1)}
          />
        ) : (
          <LiveDetector
            modelUrl={modelUrl}
            onScanSaved={() => setSavedScans(p => p + 1)}
          />
        )}
      </div>
    </div>
  );
}
