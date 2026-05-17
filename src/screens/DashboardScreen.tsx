import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';

const { width } = Dimensions.get('window');

interface ScanRecord {
  id: string;
  disease_name: string;
  confidence: number;
  created_at: string;
  status: 'healthy' | 'diseased' | 'unknown';
}

const RECENT_SCANS_MOCK: ScanRecord[] = [
  { id: '1', disease_name: 'Tomato Late Blight', confidence: 0.92, created_at: '2026-05-16', status: 'diseased' },
  { id: '2', disease_name: 'Healthy Leaf', confidence: 0.97, created_at: '2026-05-15', status: 'healthy' },
  { id: '3', disease_name: 'Corn Rust', confidence: 0.85, created_at: '2026-05-14', status: 'diseased' },
];

export default function DashboardScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [totalScans] = useState(12);
  const [healthyCount] = useState(8);
  const [diseasedCount] = useState(4);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => { await supabase.auth.signOut(); },
      },
    ]);
  }

  const greetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Farmer';

  return (
    <LinearGradient colors={['#0d1b2a', '#1a2e47', '#0f3a2a']} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <View style={styles.blob1} />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greetingTime()},</Text>
              <Text style={styles.userName}>{firstName} 🌿</Text>
            </View>
            <TouchableOpacity style={styles.avatar} onPress={handleLogout}>
              <Text style={styles.avatarText}>{firstName[0].toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          {/* Summary Banner */}
          <LinearGradient
            colors={['rgba(34,197,94,0.25)', 'rgba(16,163,74,0.15)']}
            style={styles.banner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View>
              <Text style={styles.bannerTitle}>Farm Status</Text>
              <Text style={styles.bannerSub}>Last scan: Today, 10:32 AM</Text>
            </View>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>✅ Good</Text>
            </View>
          </LinearGradient>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderColor: 'rgba(147,197,253,0.2)' }]}>
              <LinearGradient colors={['rgba(59,130,246,0.2)', 'rgba(37,99,235,0.1)']} style={styles.statGrad}>
                <Text style={styles.statIcon}>🔬</Text>
                <Text style={styles.statValue}>{totalScans}</Text>
                <Text style={styles.statLabel}>Total Scans</Text>
              </LinearGradient>
            </View>
            <View style={[styles.statCard, { borderColor: 'rgba(74,222,128,0.2)' }]}>
              <LinearGradient colors={['rgba(34,197,94,0.2)', 'rgba(16,163,74,0.1)']} style={styles.statGrad}>
                <Text style={styles.statIcon}>✅</Text>
                <Text style={styles.statValue}>{healthyCount}</Text>
                <Text style={styles.statLabel}>Healthy</Text>
              </LinearGradient>
            </View>
            <View style={[styles.statCard, { borderColor: 'rgba(252,165,165,0.2)' }]}>
              <LinearGradient colors={['rgba(239,68,68,0.2)', 'rgba(185,28,28,0.1)']} style={styles.statGrad}>
                <Text style={styles.statIcon}>⚠️</Text>
                <Text style={styles.statValue}>{diseasedCount}</Text>
                <Text style={styles.statLabel}>Diseased</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Scan')}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              style={styles.scanBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.scanBtnContent}>
                <View style={styles.scanBtnIcon}>
                  <Text style={styles.scanBtnIconText}>📷</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scanBtnTitle}>Start New Scan</Text>
                  <Text style={styles.scanBtnSub}>Point camera at your plant</Text>
                </View>
                <Text style={styles.scanBtnArrow}>→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {[
              { icon: '📊', label: 'Analytics', color: 'rgba(147,51,234,0.2)', border: 'rgba(167,139,250,0.25)' },
              { icon: '📜', label: 'History', color: 'rgba(234,179,8,0.15)', border: 'rgba(252,211,77,0.25)' },
              { icon: '💊', label: 'Treatment', color: 'rgba(239,68,68,0.15)', border: 'rgba(252,165,165,0.25)' },
              { icon: '⚙️', label: 'Settings', color: 'rgba(100,116,139,0.2)', border: 'rgba(148,163,184,0.25)' },
            ].map((action) => (
              <TouchableOpacity key={action.label} activeOpacity={0.75}>
                <View style={[styles.quickAction, { backgroundColor: action.color, borderColor: action.border }]}>
                  <Text style={styles.quickActionIcon}>{action.icon}</Text>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Scans */}
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          <View style={styles.scanList}>
            {RECENT_SCANS_MOCK.map((scan) => (
              <View key={scan.id} style={styles.scanItem}>
                <View style={[
                  styles.scanDot,
                  { backgroundColor: scan.status === 'healthy' ? '#22c55e' : '#ef4444' }
                ]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.scanName}>{scan.disease_name}</Text>
                  <Text style={styles.scanDate}>{scan.created_at}</Text>
                </View>
                <View style={[
                  styles.scanBadge,
                  { backgroundColor: scan.status === 'healthy' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }
                ]}>
                  <Text style={[
                    styles.scanBadgeText,
                    { color: scan.status === 'healthy' ? '#4ade80' : '#fca5a5' }
                  ]}>
                    {Math.round(scan.confidence * 100)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Sign out */}
          <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
            <Text style={styles.signOutText}>↩  Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  blob1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(34,197,94,0.08)',
    top: -100,
    right: -100,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  greeting: { color: '#94a3b8', fontSize: 14 },
  userName: { color: '#ffffff', fontSize: 24, fontWeight: '800', marginTop: 2 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },

  banner: {
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
  },
  bannerTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  bannerSub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  bannerBadge: {
    backgroundColor: 'rgba(34,197,94,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bannerBadgeText: { color: '#4ade80', fontWeight: '700', fontSize: 13 },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statGrad: {
    padding: 14,
    alignItems: 'center',
  },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2, textAlign: 'center' },

  scanBtn: {
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  scanBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  scanBtnIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBtnIconText: { fontSize: 24 },
  scanBtnTitle: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
  scanBtnSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  scanBtnArrow: { color: '#ffffff', fontSize: 22, fontWeight: '700' },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  quickAction: {
    width: (width - 80) / 4,
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionIcon: { fontSize: 22, marginBottom: 4 },
  quickActionLabel: { color: '#cbd5e1', fontSize: 10, fontWeight: '600', textAlign: 'center' },

  scanList: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  scanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  scanDot: { width: 10, height: 10, borderRadius: 5 },
  scanName: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  scanDate: { color: '#64748b', fontSize: 12, marginTop: 2 },
  scanBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scanBadgeText: { fontSize: 12, fontWeight: '700' },

  signOutBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  signOutText: { color: '#fca5a5', fontWeight: '600', fontSize: 15 },
});
