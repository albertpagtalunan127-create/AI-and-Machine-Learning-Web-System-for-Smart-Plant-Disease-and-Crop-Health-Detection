export interface ScanResult {
  id?: string;
  user_id?: string;
  image_url?: string;
  disease_name: string;
  confidence: number;
  severity: 'none' | 'low' | 'medium' | 'high';
  treatment: string;
  symptoms: string;
  plant_type: string;
  is_healthy: boolean;
  created_at?: string;
}

export interface Prediction {
  className: string;
  probability: number;
}

export interface DiseaseInfo {
  name: string;
  plant: string;
  severity: 'none' | 'low' | 'medium' | 'high';
  symptoms: string;
  treatment: string;
  prevention: string;
  is_healthy: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  model_url?: string;
  farm_name?: string;
}

export interface StatsData {
  total_scans: number;
  healthy_count: number;
  disease_count: number;
  alert_count: number;
}

export interface ChartDataPoint {
  day: string;
  scans: number;
  healthy: number;
  diseased: number;
}
