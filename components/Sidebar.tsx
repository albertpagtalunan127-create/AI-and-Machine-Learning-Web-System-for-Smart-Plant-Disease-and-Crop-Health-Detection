'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const NAV = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { href: '/scan',      icon: '🔬', label: 'Scan Plant' },
  { href: '/history',   icon: '📋', label: 'History' },
  { href: '/reports',   icon: '📊', label: 'Reports' },
  { href: '/settings',  icon: '⚙️',  label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside style={{
      width: 'var(--sidebar-width)', minHeight: '100vh',
      background: 'var(--bg-sidebar)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, bottom: 0,
      zIndex: 100, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-healthy))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', flexShrink: 0,
            boxShadow: '0 4px 15px rgba(108,92,231,0.4)',
          }}>🌿</div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '13px', lineHeight: 1.3 }}>Smart Plant</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', lineHeight: 1.4 }}>Disease Detection System</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', padding: '0 8px', marginBottom: '8px', textTransform: 'uppercase' }}>
          Main Menu
        </div>
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 12px', borderRadius: '10px',
                marginBottom: '4px', textDecoration: 'none',
                color: active ? 'white' : 'rgba(255,255,255,0.6)',
                fontWeight: active ? 600 : 400, fontSize: '14px',
                background: active ? 'linear-gradient(90deg, rgba(108,92,231,0.35), rgba(108,92,231,0.08))' : 'transparent',
                borderRight: active ? '3px solid var(--color-primary)' : '3px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '18px', width: '22px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Subscribe card */}
      <div style={{ padding: '12px' }}>
        <div style={{
          borderRadius: '16px', padding: '20px 16px',
          background: 'linear-gradient(135deg, rgba(108,92,231,0.3), rgba(0,184,148,0.2))',
          border: '1px solid rgba(108,92,231,0.3)',
          textAlign: 'center', marginBottom: '12px',
        }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🌱</div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
            Add Your AI Model
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', marginBottom: '14px', lineHeight: 1.5 }}>
            Train on Teachable Machine & paste your model URL
          </div>
          <Link
            href="/settings"
            id="sidebar-setup-model"
            style={{
              display: 'block', padding: '9px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
              color: 'white', fontSize: '12px', fontWeight: 700,
              textDecoration: 'none', boxShadow: '0 4px 12px rgba(108,92,231,0.4)',
            }}
          >
            Setup Model →
          </Link>
        </div>

        {/* Logout */}
        <button
          id="sidebar-logout"
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.55)', fontSize: '13px', cursor: 'pointer',
            transition: 'all 0.2s', fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: '16px' }}>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
