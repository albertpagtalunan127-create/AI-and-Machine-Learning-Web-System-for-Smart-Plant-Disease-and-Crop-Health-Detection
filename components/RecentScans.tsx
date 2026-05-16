'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScanResult } from '@/types';
import { loadScans } from '@/lib/scanStorage';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'Just now';
}

interface Props { scans?: ScanResult[]; limit?: number; showLink?: boolean; }

export default function RecentScans({ scans: propScans, limit = 5, showLink = true }: Props) {
  const [scans, setScans] = useState<ScanResult[]>();

  useEffect(() => {
    if (propScans && propScans.length > 0) {
      setScans(propScans.slice(0, limit));
      return;
    }
    const stored = loadScans();
    setScans(stored.slice(0, limit));
  }, [propScans, limit]);

  const displayed = scans ?? [];

  return (
    <div className="card" style={{ padding: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Scans</h3>
        </div>
        {showLink && (
          <Link href="/history" style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            View all →
          </Link>
        )}
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
        padding: '8px 12px', marginBottom: '4px',
        fontSize: '11px', fontWeight: 700, color: 'var(--text-light)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        <span>Disease / Plant</span>
        <span>Confidence</span>
        <span>Severity</span>
        <span>Time</span>
        <span style={{ textAlign: 'right' }}>Status</span>
      </div>

      {displayed.map((s, i) => (
        <div
          key={s.id || i}
          className="table-row"
          style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
            padding: '12px', borderRadius: '10px', alignItems: 'center',
            marginBottom: '4px',
          }}
        >
          {/* Disease + plant */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
              background: s.is_healthy ? 'rgba(0,184,148,0.12)' : 'rgba(214,48,49,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
            }}>
              {s.is_healthy ? '🌿' : '🦠'}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {s.disease_name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{s.plant_type}</div>
            </div>
          </div>

          {/* Confidence */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {Math.round(s.confidence * 100)}%
            </div>
            <div style={{ marginTop: '4px' }}>
              <div className="progress" style={{ width: '60px' }}>
                <div className="progress-fill" style={{
                  width: `${Math.round(s.confidence * 100)}%`,
                  background: s.confidence > 0.8 ? 'var(--color-primary)' : 'var(--color-warning)',
                }} />
              </div>
            </div>
          </div>

          {/* Severity */}
          <div>
            <span className={`badge badge-${s.severity === 'none' ? 'healthy' : s.severity === 'high' ? 'disease' : 'warning'}`}>
              {s.severity === 'none' ? 'None' : s.severity}
            </span>
          </div>

          {/* Time */}
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {s.created_at ? timeAgo(s.created_at) : '—'}
          </div>

          {/* Status */}
          <div style={{ textAlign: 'right' }}>
            <span className={`badge ${s.is_healthy ? 'badge-healthy' : 'badge-disease'}`}>
              {s.is_healthy ? 'Healthy' : 'Diseased'}
            </span>
          </div>
        </div>
      ))}

      {displayed.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌱</div>
          <p>No scans yet. <a href="/scan" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Start scanning!</a></p>
        </div>
      )}
    </div>
  );
}
