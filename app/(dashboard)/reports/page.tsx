'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { WeeklyScanChart, DiseaseTrendChart } from '@/components/DiseaseChart';
import { ScanResult } from '@/types';
import { loadScans, clearScans } from '@/lib/scanStorage';

function statCard(label: string, value: string | number, icon: string, color: string) {
  return (
    <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</div>
      </div>
    </div>
  );
}

function toWeeklyData(scans: ScanResult[]) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const map: Record<string, { scans: number; healthy: number; diseased: number }> = {};
  days.forEach(d => { map[d] = { scans: 0, healthy: 0, diseased: 0 }; });
  const now = Date.now();
  scans.forEach(s => {
    const age = now - new Date(s.created_at || '').getTime();
    if (age > 7 * 86400000) return;
    const day = days[new Date(s.created_at || '').getDay()];
    map[day].scans++;
    if (s.is_healthy) map[day].healthy++; else map[day].diseased++;
  });
  return days.map(d => ({ day: d, ...map[d] }));
}

function exportCSV(scans: ScanResult[]) {
  const header = 'Disease,Plant,Confidence,Severity,Healthy,Date';
  const rows = scans.map(s =>
    `"${s.disease_name}","${s.plant_type}",${Math.round(s.confidence * 100)}%,${s.severity},${s.is_healthy},"${s.created_at}"`
  );
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `plantguard_report_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

export default function ReportsPage() {
  const [scans, setScans] = useState<ScanResult[]>([]);

  useEffect(() => { setScans(loadScans()); }, []);

  const total = scans.length;
  const healthy = scans.filter(s => s.is_healthy).length;
  const diseased = total - healthy;
  const healthRate = total > 0 ? Math.round((healthy / total) * 100) : 0;
  const highSeverity = scans.filter(s => s.severity === 'high').length;
  const weeklyData = toWeeklyData(scans);

  // Disease breakdown
  const diseaseCounts: Record<string, number> = {};
  scans.filter(s => !s.is_healthy).forEach(s => {
    diseaseCounts[s.disease_name] = (diseaseCounts[s.disease_name] || 0) + 1;
  });
  const topDiseases = Object.entries(diseaseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Analytics & Reports" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>Farm Analytics</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Based on {total} scan{total !== 1 ? 's' : ''} from your history</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {total > 0 && (
              <button
                onClick={() => exportCSV(scans)}
                className="btn btn-secondary btn-sm"
              >📥 Export CSV</button>
            )}
            {total > 0 && (
              <button
                onClick={() => { clearScans(); setScans([]); }}
                className="btn btn-sm"
                style={{ background: 'rgba(214,48,49,0.08)', color: 'var(--color-disease)', border: '1px solid rgba(214,48,49,0.2)' }}
              >🗑️ Clear Data</button>
            )}
          </div>
        </div>

        {total === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>No data yet</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Start scanning plants to see your analytics here.</p>
            <a href="/scan" className="btn btn-primary">🔬 Scan a Plant</a>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {statCard('Total Scans', total, '🔬', 'var(--color-primary)')}
              {statCard('Health Rate', `${healthRate}%`, '💚', 'var(--color-healthy)')}
              {statCard('Diseased Plants', diseased, '🦠', 'var(--color-disease)')}
              {statCard('High Severity', highSeverity, '🚨', 'var(--color-warning)')}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <WeeklyScanChart data={weeklyData} />
              <DiseaseTrendChart />
            </div>

            {/* Top diseases */}
            {topDiseases.length > 0 && (
              <div className="card" style={{ padding: '22px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px' }}>Top Detected Diseases</h3>
                {topDiseases.map(([name, count], i) => (
                  <div key={name} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{i + 1}. {name}</span>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{count} scan{count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="progress">
                      <div className="progress-fill" style={{
                        width: `${Math.round((count / diseased) * 100)}%`,
                        background: i === 0 ? 'var(--color-disease)' : 'var(--color-primary)',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
