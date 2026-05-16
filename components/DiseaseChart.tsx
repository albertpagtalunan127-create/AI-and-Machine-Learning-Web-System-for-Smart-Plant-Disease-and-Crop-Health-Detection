'use client';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';const WEEKLY_DATA = [
  { day: 'Sun', scans: 4,  healthy: 3, diseased: 1 },
  { day: 'Mon', scans: 9,  healthy: 6, diseased: 3 },
  { day: 'Tue', scans: 7,  healthy: 5, diseased: 2 },
  { day: 'Wed', scans: 12, healthy: 8, diseased: 4 },
  { day: 'Thu', scans: 8,  healthy: 7, diseased: 1 },
  { day: 'Fri', scans: 15, healthy: 11, diseased: 4 },
  { day: 'Sat', scans: 6,  healthy: 5, diseased: 1 },
];

const TREND_DATA = [
  { month: 'Jan', severity: 30 },
  { month: 'Feb', severity: 45 },
  { month: 'Mar', severity: 28 },
  { month: 'Apr', severity: 60 },
  { month: 'May', severity: 40 },
  { month: 'Jun', severity: 35 },
];


const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white', border: '1px solid var(--border-color)',
      borderRadius: '10px', padding: '10px 14px',
      boxShadow: 'var(--shadow-md)', fontSize: '12px',
    }}>
      <p style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, marginBottom: '2px' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

interface Props { data?: typeof WEEKLY_DATA; }

export function WeeklyScanChart({ data = WEEKLY_DATA }: Props) {
  return (
    <div className="card" style={{ padding: '22px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Daily Scans</h3>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '5px 12px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          This Week ▾
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="healthy" name="Healthy" fill="var(--color-healthy)" radius={[5, 5, 0, 0]} maxBarSize={28} />
          <Bar dataKey="diseased" name="Diseased" fill="var(--color-primary)" radius={[5, 5, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '12px' }}>
        {[{ color: 'var(--color-healthy)', label: 'Healthy' }, { color: 'var(--color-primary)', label: 'Diseased' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DiseaseTrendChart({ data = TREND_DATA }: { data?: typeof TREND_DATA }) {
  return (
    <div className="card" style={{ padding: '22px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Disease Severity Trend</h3>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
        Average severity score this year
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone" dataKey="severity" name="Severity"
            stroke="var(--color-primary)" strokeWidth={2.5}
            dot={{ fill: 'var(--color-primary)', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(108,92,231,0.06)', fontSize: '12px', color: 'var(--text-secondary)' }}>
        📈 Severity is <strong style={{ color: 'var(--color-healthy)' }}>12% lower</strong> compared to last month
      </div>
    </div>
  );
}
