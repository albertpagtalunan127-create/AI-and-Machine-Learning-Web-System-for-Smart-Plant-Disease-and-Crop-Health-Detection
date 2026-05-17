'use client';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { createClient } from '@/lib/supabase';
import { setCurrentUser } from '@/lib/scanStorage';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Scope scan data to the logged-in user
    createClient().auth.getUser().then(({ data }) => {
      setCurrentUser(data.user?.id ?? null);
    });
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="main-content" style={{
        flex: 1,
        minWidth: 0,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {children}
      </main>
    </div>
  );
}
