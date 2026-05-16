'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.fullName } },
      });
      if (error) { setError(error.message); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setError('Connection failed. Please check your Supabase configuration in .env.local');
      setLoading(false);
    }
  }

  if (success) return (
    <div style={{ textAlign: 'center', width: '100%', maxWidth: '420px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
      <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
        Account created!
      </h2>
      <p style={{ color: 'var(--text-secondary)' }}>Check your email to confirm, then you&apos;ll be redirected...</p>
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: '420px' }}>
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Create account 🌱
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Start protecting your plants with AI today
        </p>
      </div>

      <form onSubmit={handleRegister}>
        {[
          { label: 'Full Name', key: 'fullName', type: 'text', icon: '👤', placeholder: 'Your full name', id: 'reg-name' },
          { label: 'Email address', key: 'email', type: 'email', icon: '📧', placeholder: 'you@example.com', id: 'reg-email' },
          { label: 'Password', key: 'password', type: 'password', icon: '🔒', placeholder: 'Min. 6 characters', id: 'reg-password' },
          { label: 'Confirm Password', key: 'confirm', type: 'password', icon: '🔒', placeholder: 'Re-enter password', id: 'reg-confirm' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: '16px' }}>
            <label className="input-label">{f.label}</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>{f.icon}</span>
              <input
                id={f.id}
                type={f.type}
                className="input"
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={set(f.key)}
                required
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>
        ))}

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
          id="register-btn"
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
        >
          {loading ? 'Creating account...' : '🚀 Create Account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', marginTop: '24px' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
