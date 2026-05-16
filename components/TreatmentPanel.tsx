'use client';
import { useState } from 'react';
import { ScanResult } from '@/types';
import { getDiseaseInfo } from '@/lib/diseases';

interface AiAnalysis {
  symptoms: string;
  treatment: string[];
  prevention: string[];
  severity: string;
  urgency: string;
}

interface Props { result: ScanResult | null; }

export default function TreatmentPanel({ result }: Props) {
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showAi, setShowAi] = useState(false);

  async function fetchAiAnalysis() {
    if (!result) return;
    setAiLoading(true);
    setAiError('');
    setShowAi(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diseaseName: result.disease_name,
          plantType: result.plant_type,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI analysis failed');
      setAiAnalysis(data);
    } catch (err: any) {
      setAiError(err.message || 'Failed to get AI analysis');
    } finally {
      setAiLoading(false);
    }
  }

  if (!result) return (
    <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔬</div>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        No Scan Yet
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        Upload or capture a plant image to see disease detection results and AI-powered treatment recommendations here.
      </p>
    </div>
  );

  const info = getDiseaseInfo(result.disease_name);
  const confidencePct = Math.round(result.confidence * 100);
  const severityColors: Record<string, string> = {
    none: 'var(--color-healthy)', low: 'var(--color-info)',
    medium: 'var(--color-warning)', high: 'var(--color-disease)',
  };
  const sevColor = severityColors[result.severity] || 'var(--text-secondary)';

  // Use AI data if available, otherwise fall back to local database
  const symptoms = aiAnalysis?.symptoms || info.symptoms;
  const treatment = aiAnalysis?.treatment || info.treatment.split('\n').filter(Boolean);
  const prevention = aiAnalysis?.prevention || [info.prevention];

  return (
    <div className="card" style={{ padding: '22px', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{
        padding: '16px', borderRadius: '12px', marginBottom: '18px',
        background: result.is_healthy ? 'rgba(0,184,148,0.08)' : 'rgba(214,48,49,0.06)',
        border: `1px solid ${result.is_healthy ? 'rgba(0,184,148,0.2)' : 'rgba(214,48,49,0.15)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '28px' }}>{result.is_healthy ? '✅' : '🦠'}</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {result.disease_name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {result.plant_type} · Severity:{' '}
              <span style={{ color: sevColor, fontWeight: 600, textTransform: 'capitalize' }}>
                {result.severity === 'none' ? 'None' : result.severity}
              </span>
            </div>
          </div>
        </div>
        {/* Confidence bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Confidence</span>
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{confidencePct}%</span>
          </div>
          <div className="progress">
            <div className="progress-fill" style={{
              width: `${confidencePct}%`,
              background: `linear-gradient(90deg, var(--color-primary), var(--color-primary-light))`,
            }} />
          </div>
        </div>
      </div>

      {/* AI Analysis Button */}
      {!showAi && (
        <button
          id="ask-ai-btn"
          onClick={fetchAiAnalysis}
          style={{
            width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginBottom: '18px', transition: 'opacity 0.2s', fontFamily: 'inherit',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          ✨ Get AI Analysis
        </button>
      )}

      {/* AI loading */}
      {aiLoading && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px',
          padding: '14px 16px', borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08))',
          border: '1px solid rgba(102,126,234,0.2)',
        }}>
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            border: '2px solid rgba(102,126,234,0.3)', borderTopColor: '#667eea',
            animation: 'spin 0.8s linear infinite', flexShrink: 0,
          }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            GROQ AI is analyzing the disease...
          </span>
        </div>
      )}

      {/* AI error */}
      {aiError && (
        <div style={{
          padding: '12px 14px', borderRadius: '10px', marginBottom: '14px',
          background: 'rgba(225,112,85,0.08)', border: '1px solid rgba(225,112,85,0.25)',
          fontSize: '12px', color: 'var(--color-disease)',
          display: 'flex', gap: '8px', alignItems: 'flex-start',
        }}>
          <span style={{ flexShrink: 0 }}>⚠️</span>
          <div>
            {aiError}
            {aiError.includes('GROQ_API_KEY') && (
              <div style={{ marginTop: '6px' }}>
                Add <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: '3px' }}>GROQ_API_KEY=your_key</code> to <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: '3px' }}>.env.local</code>.{' '}
                <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>
                  Get a free key →
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Badge when active */}
      {aiAnalysis && !aiLoading && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '14px',
          padding: '8px 12px', borderRadius: '8px',
          background: 'linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08))',
          border: '1px solid rgba(102,126,234,0.2)',
        }}>
          <span style={{ fontSize: '12px', color: '#667eea', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
            ✨ AI-Powered Analysis
          </span>
          <button
            onClick={() => { setShowAi(false); setAiAnalysis(null); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'inherit' }}
          >
            ✕ Reset
          </button>
        </div>
      )}

      {/* Urgency note from AI */}
      {aiAnalysis?.urgency && (
        <div style={{
          padding: '10px 14px', borderRadius: '10px', marginBottom: '14px',
          background: result.is_healthy ? 'rgba(0,184,148,0.08)' : 'rgba(255,159,67,0.08)',
          border: `1px solid ${result.is_healthy ? 'rgba(0,184,148,0.2)' : 'rgba(255,159,67,0.2)'}`,
          fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6,
          display: 'flex', gap: '8px', alignItems: 'flex-start',
        }}>
          <span style={{ flexShrink: 0 }}>{result.is_healthy ? '💚' : '⚡'}</span>
          <span>{aiAnalysis.urgency}</span>
        </div>
      )}

      {/* Symptoms */}
      <Section icon="🔍" title="Symptoms">
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {symptoms}
        </p>
      </Section>

      {/* Treatment */}
      {!result.is_healthy && (
        <Section icon="💊" title="Treatment">
          {Array.isArray(treatment) ? treatment.map((line, i) => line.trim() && (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
              <span style={{
                color: 'var(--color-primary)', fontWeight: 700, flexShrink: 0,
                marginTop: '1px', fontSize: '12px',
                background: 'rgba(108,92,231,0.1)', borderRadius: '50%',
                width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {line.replace(/^(Step \d+:|^\d+\.)\s*/i, '')}
              </span>
            </div>
          )) : (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{treatment}</p>
          )}
        </Section>
      )}

      {/* Prevention */}
      <Section icon="🛡️" title="Prevention">
        {Array.isArray(prevention) ? prevention.map((tip, i) => tip.trim() && (
          <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--color-healthy)', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>✓</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip}</span>
          </div>
        )) : (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{prevention}</p>
        )}
      </Section>

      {/* Refresh AI button if already shown */}
      {showAi && !aiLoading && (
        <button
          onClick={fetchAiAnalysis}
          style={{
            width: '100%', padding: '10px', borderRadius: '10px',
            border: '1px solid rgba(102,126,234,0.25)',
            background: 'transparent', color: '#667eea',
            fontWeight: 600, fontSize: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            marginTop: '8px', transition: 'background 0.2s', fontFamily: 'inherit',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(102,126,234,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          🔄 Regenerate AI Analysis
        </button>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h4 style={{
        fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)',
        display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px',
      }}>
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}
