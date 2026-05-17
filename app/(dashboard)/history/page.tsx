'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import RecentScans from '@/components/RecentScans';
import { ScanResult } from '@/types';
import { loadScans, clearScans } from '@/lib/scanStorage';

const PLANTS = ['Plants', 'Mango'];
const STATUSES = ['All Status', 'Healthy', 'Diseased'];
const SEVERITIES = ['All Severity', 'None', 'Low', 'Medium', 'High'];

function HistoryContent() {
  const searchParams = useSearchParams();
  const [allScans, setAllScans] = useState<ScanResult[]>([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [plant, setPlant] = useState('All Plants');
  const [status, setStatus] = useState('All Status');
  const [severity, setSeverity] = useState('All Severity');
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setAllScans(loadScans());
    // Sync search from URL param (e.g. from header search)
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);

  const filtered = allScans.filter(s => {
    if (search && !s.disease_name.toLowerCase().includes(search.toLowerCase()) && !s.plant_type.toLowerCase().includes(search.toLowerCase())) return false;
    if (plant !== 'All Plants' && s.plant_type !== plant) return false;
    if (status === 'Healthy' && !s.is_healthy) return false;
    if (status === 'Diseased' && s.is_healthy) return false;
    if (severity !== 'All Severity' && s.severity !== severity.toLowerCase()) return false;
    return true;
  });

  function handleClear() {
    if (confirmClear) {
      clearScans();
      setAllScans([]);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  }

  const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      style={{
        padding: '9px 14px', borderRadius: '10px', border: '1.5px solid var(--border-color)',
        background: 'white', fontSize: '13px', color: 'var(--text-primary)',
        outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Browse all your plant scan history" />

      <div className="page-padding" style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              📋 Scan History
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {allScans.length === 0
                ? 'No scans yet — go scan a plant!'
                : `${filtered.length} of ${allScans.length} scans shown`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {allScans.length > 0 && (
              <button
                onClick={handleClear}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '12px', color: confirmClear ? 'var(--color-disease)' : undefined }}
              >
                {confirmClear ? '⚠️ Confirm Clear' : '🗑️ Clear History'}
              </button>
            )}
            <a href="/scan" className="btn btn-primary btn-sm">+ New Scan</a>
          </div>
        </div>

        {/* Summary chips */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Scans', val: allScans.length, color: 'var(--color-primary)' },
            { label: 'Healthy', val: allScans.filter(s => s.is_healthy).length, color: 'var(--color-healthy)' },
            { label: 'Diseased', val: allScans.filter(s => !s.is_healthy).length, color: 'var(--color-disease)' },
            { label: 'High Severity', val: allScans.filter(s => s.severity === 'high').length, color: 'var(--color-warning)' },
          ].map(c => (
            <div key={c.label} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '20px', background: 'white',
              border: '1px solid var(--border-color)', fontSize: '13px',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, display: 'inline-block' }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{c.val}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{c.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        {allScans.length > 0 && (
          <div style={{
            display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
            padding: '16px 18px', background: 'white', borderRadius: '14px',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
              <input
                id="history-search"
                type="text" placeholder="Search disease or plant..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '9px 14px 9px 36px', borderRadius: '10px',
                  border: '1.5px solid var(--border-color)', fontSize: '13px',
                  fontFamily: 'inherit', outline: 'none', color: 'var(--text-primary)',
                }}
              />
            </div>
            <Select value={plant} onChange={setPlant} options={PLANTS} />
            <Select value={status} onChange={setStatus} options={STATUSES} />
            <Select value={severity} onChange={setSeverity} options={SEVERITIES} />
            {(plant !== 'All Plants' || status !== 'All Status' || severity !== 'All Severity' || search) && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setPlant('All Plants'); setStatus('All Status'); setSeverity('All Severity'); setSearch(''); }}
              >✕ Clear</button>
            )}
          </div>
        )}

        {allScans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>🌱</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>No scans yet</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Your scan history will appear here once you start scanning plants.
            </p>
            <a href="/scan" className="btn btn-primary">🔬 Scan a Plant Now</a>
          </div>
        ) : (
          <RecentScans scans={filtered} limit={100} showLink={false} />
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
