import { ScanResult } from '@/types';

const BASE_KEY = 'plantguard_scans';
const MAX_SCANS = 100;

let currentUserId: string | null = null;

/** Call this after login with the Supabase user ID */
export function setCurrentUser(userId: string | null) {
  currentUserId = userId;
}

/** Returns the localStorage key scoped to the current user */
function storageKey(): string {
  return currentUserId ? `${BASE_KEY}_${currentUserId}` : BASE_KEY;
}

export function saveScans(scans: ScanResult[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(), JSON.stringify(scans));
}

export function loadScans(): ScanResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    return JSON.parse(raw) as ScanResult[];
  } catch {
    return [];
  }
}

export function addScan(result: ScanResult): ScanResult[] {
  const existing = loadScans();
  const newScan: ScanResult = {
    ...result,
    id: crypto.randomUUID(),
    created_at: result.created_at || new Date().toISOString(),
  };
  // Newest first, keep max 100
  const updated = [newScan, ...existing].slice(0, MAX_SCANS);
  saveScans(updated);
  return updated;
}

export function clearScans(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(storageKey());
}

/** Call on logout to reset the user context */
export function clearCurrentUser(): void {
  currentUserId = null;
}
