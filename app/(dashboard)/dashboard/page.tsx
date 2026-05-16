'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import RecentScans from '@/components/RecentScans';
import { WeeklyScanChart, DiseaseTrendChart } from '@/components/DiseaseChart';
import { loadScans } from '@/lib/scanStorage';
import { ScanResult } from '@/types';
import { createClient } from '@/lib/supabase';

const ALERTS = [
  { time: '9:30',  label: 'Late Blight Alert', color: '#d63031', zone: 'Zone A' },
  { time: '11:00', label: 'Scan Schedule',      color: '#6c5ce7', zone: 'Zone B' },
  { time: '14:00', label: 'Treatment Due',       color: '#e17055', zone: 'Zone C' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildWeeklyData(scans: ScanResult[]) {
  // Build last-7-days buckets by day-of-week
  const now = Date.now();
  const buckets: Record<string, { day: string; scans: number; healthy: number; diseased: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const key = DAYS[d.getDay()];
    buckets[key] = { day: key, scans: 0, healthy: 0, diseased: 0 };
  }
  scans.forEach(s => {
    const t = new Date(s.created_at || '').getTime();
    if (now - t <= 7 * 86400000) {
      const key = DAYS[new Date(t).getDay()];
      if (buckets[key]) {
        buckets[key].scans++;
        s.is_healthy ? buckets[key].healthy++ : buckets[key].diseased++;
      }
    }
  });
  return Object.values(buckets);
}

export default function DashboardPage() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [userName, setUserName] = useState('Farm User');
  const [farmName, setFarmName] = useState('');
  const [topDiseases, setTopDiseases] = useState<{ name: string; count: number; pct: number; color: string }[]>([]);

  const DISEASE_COLORS = ['var(--color-disease)', 'var(--color-warning)', 'var(--color-info)', 'var(--color-primary-light)'];

  useEffect(() => {
    // Load scans
    const stored = loadScans();
    setScans(stored);
    setWeeklyData(buildWeeklyData(stored));

    // Build top diseases
    const map: Record<string, number> = {};
    stored.filter(s => !s.is_healthy).forEach(s => {
      map[s.disease_name] = (map[s.disease_name] || 0) + 1;
    });
    const total = stored.filter(s => !s.is_healthy).length || 1;
    const top = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count], i) => ({
        name,
        count,
        pct: Math.round((count / total) * 100),
        color: DISEASE_COLORS[i % DISEASE_COLORS.length],
      }));
    setTopDiseases(top);

    // Load user info
    const farm = localStorage.getItem('farmName') || '';
    setFarmName(farm);
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserName(data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Farm User');
      }
    });
  }, []);

  // Computed stats
  const total = scans.length;
  const healthyCount = scans.filter(s => s.is_healthy).length;
  const diseasedCount = total - healthyCount;
  const healthPct = total > 0 ? Math.round((healthyCount / total) * 100) : 0;

  // High severity scans in last 7 days = "active alerts"
  const recentAlerts = scans.filter(s => {
    const t = new Date(s.created_at || '').getTime();
    return !s.is_healthy && s.severity === 'high' && Date.now() - t <= 7 * 86400000;
  }).length;

  const initial = userName.charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Here's your farm health overview today" />

      <div style={{ padding: '24px 28px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

          {/* ── Main column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <StatsCard
                title="Total Scans"    value={total}
                icon="🔬" colorClass="stat-orange"
                progress={Math.min(total, 100)}
                subtitle="All time"
              />
              <StatsCard
                title="Healthy Plants" value={healthyCount}
                icon="🌿" colorClass="stat-green"
                progress={healthPct}
                subtitle={`${healthPct}% healthy rate`}
              />
              <StatsCard
                title="Diseases Found" value={diseasedCount}
                icon="🦠" colorClass="stat-blue"
                progress={total > 0 ? Math.round((diseasedCount / total) * 100) : 0}
                subtitle={`${new Set(scans.filter(s => !s.is_healthy).map(s => s.disease_name)).size} unique types`}
              />
              <StatsCard
                title="Active Alerts"  value={recentAlerts}
                icon="🚨" colorClass="stat-purple"
                progress={Math.min(recentAlerts * 10, 100)}
                subtitle="High severity (7d)"
              />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
              <WeeklyScanChart data={weeklyData.length > 0 ? weeklyData : undefined} />
              <DiseaseTrendChart />
            </div>

            {/* Recent scans — pass real loaded scans directly */}
            <RecentScans scans={scans} limit={5} showLink={true} />
          </div>

          {/* ── Right panel ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Profile card */}
            <div className="card" style={{ padding: '22px', textAlign: 'center' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 12px',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-healthy))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', color: 'white', fontWeight: 800,
                boxShadow: '0 4px 16px rgba(108,92,231,0.35)',
              }}>{initial}</div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>{userName}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {farmName || 'Plant Health Manager'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                {[
                  { val: total,        label: 'Scans' },
                  { val: diseasedCount, label: 'Diseases' },
                  { val: recentAlerts, label: 'Alerts' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{s.val}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>Quick Actions</h3>
              {[
                { href: '/scan',     icon: '🔬', label: 'Scan a Plant',       color: 'var(--color-primary)' },
                { href: '/history',  icon: '📋', label: 'View Scan History',  color: 'var(--color-info)' },
                { href: '/reports',  icon: '📊', label: 'Generate Report',    color: 'var(--color-healthy)' },
                { href: '/settings', icon: '🤖', label: 'Configure AI Model', color: 'var(--color-warning)' },
              ].map(a => (
                <a key={a.href} href={a.href} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '10px', marginBottom: '6px',
                  textDecoration: 'none', transition: 'background 0.15s',
                  background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                }}>
                  <span style={{ fontSize: '18px' }}>{a.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{a.label}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-light)', fontSize: '12px' }}>→</span>
                </a>
              ))}
            </div>

            {/* Today's Alerts */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
                Today&apos;s Alerts
              </h3>
              {ALERTS.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  marginBottom: '10px', padding: '8px 10px', borderRadius: '10px',
                  background: 'var(--bg-primary)',
                }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', minWidth: '36px' }}>{a.time}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{a.zone}</div>
                  </div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                </div>
              ))}
            </div>

            {/* Top Diseases — real data */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>Top Diseases</h3>
              {topDiseases.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px 0' }}>
                  🌿 No diseases detected yet
                </div>
              ) : (
                topDiseases.map(d => (
                  <div key={d.name} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{d.name}</span>
                      <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{d.count} cases</span>
                    </div>
                    <div className="progress">
                      <div className="progress-fill" style={{ width: `${d.pct}%`, background: d.color }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
