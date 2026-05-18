'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError('Connection failed. Please check your Supabase configuration in .env.local');
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      {/* Header */}
      <div style={{ marginBottom: '36px', textAlign: 'center' }}>
        {/* Branding Logo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '28px', textAlign: 'left' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-healthy))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', flexShrink: 0,
            boxShadow: '0 4px 15px rgba(108,92,231,0.4)',
          }}>🌿</div>
          <div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '16px', lineHeight: 1.2 }}>Smart Plant</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.4, fontWeight: 500 }}>Disease Detection System</div>
          </div>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Welcome back 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Sign in to your account
        </p>
      </div>

      <form onSubmit={handleLogin}>
        {/* Email */}
        <div style={{ marginBottom: '18px' }}>
          <label className="input-label">Email address</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>📧</span>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="input-label" style={{ margin: 0 }}>Password</label>
            <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔒</span>
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ paddingLeft: '42px', paddingRight: '48px' }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px',
              }}
            >{showPass ? '🙈' : '👁️'}</button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 'var(--radius-md)',
            background: 'rgba(214,48,49,0.08)', border: '1px solid rgba(214,48,49,0.2)',
            color: 'var(--color-disease)', fontSize: '13px', marginBottom: '18px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            ⚠️ {error}
          </div>
        )}

        <button
          id="login-btn"
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading ? (
            <><span className="animate-spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} /> Signing in...</>
          ) : '🌿 Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
        Don&apos;t have an account?{' '}
        <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          Create account
        </Link>
      </p>

      <style>{`
        .auth-card {
          width: 100%;
          max-width: 420px;
        }
        @media (max-width: 767px) {
          .auth-card {
            background: white;
            border-radius: 20px;
            padding: 28px 24px;
            box-shadow: 0 4px 24px rgba(108,92,231,0.10);
            border: 1px solid var(--border-color);
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
