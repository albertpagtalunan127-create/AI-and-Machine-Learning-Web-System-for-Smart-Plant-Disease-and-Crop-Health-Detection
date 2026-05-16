interface Props {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  colorClass: 'stat-orange' | 'stat-green' | 'stat-blue' | 'stat-purple';
  trend?: number; // percentage change
  progress?: number; // 0-100
}

export default function StatsCard({ title, value, subtitle, icon, colorClass, trend, progress }: Props) {
  const colors: Record<string, { main: string; bg: string }> = {
    'stat-orange': { main: '#ff7043', bg: 'rgba(255,112,67,0.1)' },
    'stat-green':  { main: 'var(--color-healthy)',  bg: 'rgba(0,184,148,0.1)' },
    'stat-blue':   { main: 'var(--color-info)',      bg: 'rgba(9,132,227,0.1)' },
    'stat-purple': { main: 'var(--color-primary)',   bg: 'rgba(108,92,231,0.1)' },
  };
  const c = colors[colorClass];

  return (
    <div className="card" style={{ padding: '20px 22px', flex: 1, minWidth: '0' }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{
          fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>{title}</div>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', flexShrink: 0,
        }}>{icon}</div>
      </div>

      {/* Value */}
      <div style={{ fontSize: '34px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '6px' }}>
        {value}
      </div>

      {subtitle && (
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          {subtitle}
        </div>
      )}

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="progress" style={{ marginBottom: '8px' }}>
          <div
            className="progress-fill"
            style={{ width: `${progress}%`, background: c.main }}
          />
        </div>
      )}

      {/* Trend */}
      {trend !== undefined && (
        <div style={{
          fontSize: '12px', fontWeight: 600,
          color: trend >= 0 ? 'var(--color-healthy)' : 'var(--color-disease)',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
        </div>
      )}
    </div>
  );
}
