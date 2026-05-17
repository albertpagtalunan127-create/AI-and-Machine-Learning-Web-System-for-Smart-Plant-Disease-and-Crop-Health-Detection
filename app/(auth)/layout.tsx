export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-root">
      {/* ── Left panel — branding (hidden on mobile) ── */}
      <div className="auth-hero">
        {/* Background blobs */}
        <div style={{
          position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,92,231,0.25) 0%, transparent 70%)',
          top: '-100px', right: '-100px', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,184,148,0.15) 0%, transparent 70%)',
          bottom: '-80px', left: '-60px', pointerEvents: 'none',
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
        <div style={{ display: 'flex', gap: '32px', marginTop: '36px', position: 'relative', zIndex: 1 }}>
          {[
            { val: '38+', label: 'Disease Classes' },
            { val: '99%', label: 'Accuracy' },
            { val: '< 1s', label: 'Detection Time' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: '22px', fontWeight: 800 }}>{s.val}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="auth-form-panel">
        {/* Mobile-only mini logo (shown instead of hero panel) */}
        <div className="auth-mobile-logo">
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6c5ce7, #00b894)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', boxShadow: '0 4px 16px rgba(108,92,231,0.35)',
            marginBottom: '8px',
          }}>🌿</div>
          <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>PlantGuard AI</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>AI-Powered Plant Disease Detection</div>
        </div>

        {children}
      </div>

      <style>{`
        /* Auth layout — two col desktop, single col mobile */
        .auth-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .auth-hero {
          background: linear-gradient(135deg, #0f0e2e 0%, #1a1a3e 50%, #2d1b69 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          position: relative;
          overflow: hidden;
        }
        .auth-form-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: #f4f5fb;
          min-height: 100vh;
          overflow-y: auto;
        }
        .auth-mobile-logo {
          display: none;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 32px;
        }

        /* ── Mobile: hide hero, show mini logo, single column ── */
        @media (max-width: 767px) {
          .auth-root {
            grid-template-columns: 1fr;
          }
          .auth-hero {
            display: none;
          }
          .auth-mobile-logo {
            display: flex;
          }
          .auth-form-panel {
            padding: 32px 20px;
            justify-content: flex-start;
            padding-top: 48px;
          }
        }
      `}</style>
    </div>
  );
}
