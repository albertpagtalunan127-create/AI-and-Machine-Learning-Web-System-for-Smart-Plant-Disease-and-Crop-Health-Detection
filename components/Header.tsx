'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { loadScans } from '@/lib/scanStorage';
import { ScanResult } from '@/types';

interface Props { title: string; }

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'Just now';
}

function buildNotifications(scans: ScanResult[]) {
  if (scans.length === 0) return [];

  const notifs: { icon: string; msg: string; time: string; color: string }[] = [];

  // High severity in last 24h
  const highSeverity = scans.filter(s =>
    !s.is_healthy && s.severity === 'high' &&
    Date.now() - new Date(s.created_at || '').getTime() < 86400000
  );
  if (highSeverity.length > 0) {
    const latest = highSeverity[0];
    notifs.push({
      icon: '🚨',
      msg: `High severity: ${latest.disease_name} detected`,
      time: timeAgo(latest.created_at || ''),
      color: 'var(--color-disease)',
    });
  }

  // Medium severity in last 24h
  const medSeverity = scans.filter(s =>
    !s.is_healthy && s.severity === 'medium' &&
    Date.now() - new Date(s.created_at || '').getTime() < 86400000
  );
  if (medSeverity.length > 0) {
    const latest = medSeverity[0];
    notifs.push({
      icon: '⚠️',
      msg: `${latest.disease_name} found in ${latest.plant_type}`,
      time: timeAgo(latest.created_at || ''),
      color: 'var(--color-warning)',
    });
  }

  // Healthy scans today
  const healthyToday = scans.filter(s =>
    s.is_healthy &&
    Date.now() - new Date(s.created_at || '').getTime() < 86400000
  );
  if (healthyToday.length > 0) {
    notifs.push({
      icon: '✅',
      msg: `${healthyToday.length} healthy plant${healthyToday.length > 1 ? 's' : ''} scanned today`,
      time: timeAgo(healthyToday[healthyToday.length - 1].created_at || ''),
      color: 'var(--color-healthy)',
    });
  }

  return notifs;
}

export default function Header({ title }: Props) {
  const router = useRouter();
  const [userName, setUserName] = useState('User');
  const [searchQ, setSearchQ] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<ReturnType<typeof buildNotifications>>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserName(data.user.user_metadata?.full_name?.split(' ')[0] || data.user.email?.split('@')[0] || 'User');
      }
    });
    // Load real notifications from scan history
    const scans = loadScans();
    setNotifications(buildNotifications(scans));
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search: navigate to history page with query on Enter
  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && searchQ.trim()) {
      router.push(`/history?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchQ('');
    }
  }

  const hasNotifs = notifications.length > 0;

  return (
    <header className="app-header" style={{
      height: '64px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      background: 'white', borderBottom: '1px solid var(--border-color)',
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Left: greeting */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <h1 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {greeting}, {userName}! 🌿
        </h1>
        <p className="header-subtitle" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </p>
      </div>

      {/* Right: search + notif + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>

        {/* Search — hidden on mobile via CSS class */}
        <div className="header-search-wrap" style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '14px', color: 'var(--text-light)',
          }}>🔍</span>
          <input
            id="header-search"
            type="text"
            placeholder="Search diseases… (Enter)"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            style={{
              padding: '9px 16px 9px 36px', borderRadius: '40px',
              border: '1.5px solid var(--border-color)',
              background: 'var(--bg-primary)', fontSize: '13px',
              color: 'var(--text-primary)', outline: 'none',
              width: '200px', transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Notification bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            id="header-notifications"
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'var(--bg-primary)', border: '1.5px solid var(--border-color)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', position: 'relative', transition: 'all 0.2s',
            }}
          >🔔
            {hasNotifs && (
              <span style={{
                position: 'absolute', top: '6px', right: '7px',
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'var(--color-disease)', border: '2px solid white',
              }} />
            )}
          </button>

          {notifOpen && (
            <div style={{
              position: 'absolute', top: '48px', right: 0,
              width: '310px', background: 'white', borderRadius: '16px',
              border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)',
              zIndex: 200, overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 18px', borderBottom: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Notifications</span>
                {hasNotifs && (
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px',
                    background: 'rgba(214,48,49,0.1)', color: 'var(--color-disease)',
                  }}>{notifications.length} new</span>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌿</div>
                  No notifications yet.<br />Start scanning plants!
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div
                    key={i}
                    onClick={() => { router.push('/history'); setNotifOpen(false); }}
                    style={{
                      padding: '14px 18px', display: 'flex', gap: '12px',
                      borderBottom: i < notifications.length - 1 ? '1px solid var(--border-color)' : 'none',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                  >
                    <span style={{ fontSize: '18px' }}>{n.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{n.msg}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>{n.time}</div>
                    </div>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: n.color, flexShrink: 0, marginTop: '5px' }} />
                  </div>
                ))
              )}

              <div style={{
                padding: '10px 18px', borderTop: '1px solid var(--border-color)',
                textAlign: 'center',
              }}>
                <Link
                  href="/history"
                  onClick={() => setNotifOpen(false)}
                  style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
                >
                  View all scan history →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <Link href="/settings" id="header-profile" style={{ textDecoration: 'none' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '15px', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(108,92,231,0.35)',
          }}>
            {userName[0]?.toUpperCase() || 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
}
