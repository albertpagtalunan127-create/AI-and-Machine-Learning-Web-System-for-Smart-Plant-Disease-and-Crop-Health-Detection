export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    }}>
      {/* Left panel — branding */}
      <div style={{
        background: 'linear-gradient(135deg, #0f0e2e 0%, #1a1a3e 50%, #2d1b69 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background circles */}
        <div style={{
          position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,92,231,0.25) 0%, transparent 70%)',
          top: '-100px', right: '-100px',
        }} />
        <div style={{
          position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,184,148,0.15) 0%, transparent 70%)',
          bottom: '-80px', left: '-60px',
        }} />

        {/* Logo */}
        <div style={{ marginBottom: '48px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #6c5ce7, #00b894)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '36px',
            boxShadow: '0 8px 32px rgba(108,92,231,0.4)',
          }}>🌿</div>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
            PlantGuard AI
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>
            AI-Powered Plant Disease Detection
          </p>
        </div>

        {/* Feature list */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '340px' }}>
          {[
            { icon: '🔬', text: 'Real-time AI disease detection' },
            { icon: '📷', text: 'Live camera & photo upload' },
            { icon: '💊', text: 'Instant treatment recommendations' },
            { icon: '📊', text: 'Track plant health over time' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 18px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.07)',
              marginBottom: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <span style={{ fontSize: '22px' }}>{f.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: 500 }}>
                {f.text}
              </span>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: '24px', marginTop: '36px',
          position: 'relative', zIndex: 1,
        }}>
          {[
            { val: '38+', label: 'Disease Classes' },
            { val: '99%', label: 'Accuracy' },
            { val: '< 1s', label: 'Detection Time' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: '22px', fontWeight: 800 }}>{s.val}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px', background: '#f4f5fb',
      }}>
        {children}
      </div>
    </div>
  );
}
