import { DiseaseInfo } from '@/types';

export const DISEASE_DATABASE: Record<string, DiseaseInfo> = {
  'Mango Anthracnose': {
    name: 'Mango Anthracnose', plant: 'Mango', severity: 'high',
    symptoms: 'Black irregular spots on leaves, flowers, and fruits. Premature fruit drop. Dark sunken lesions on ripe fruit.',
    treatment: '1. Apply copper-based fungicide or Mancozeb at flowering.\n2. Remove and destroy infected plant parts.\n3. Avoid overhead irrigation.\n4. Spray Carbendazim after harvest.',
    prevention: 'Prune for air circulation. Use resistant varieties. Apply preventive fungicide during flowering.',
    is_healthy: false,
  },
  'Mango Powdery Mildew': {
    name: 'Mango Powdery Mildew', plant: 'Mango', severity: 'medium',
    symptoms: 'White powdery coating on young leaves, flowers, and fruits. Flower and fruit drop.',
    treatment: '1. Apply sulfur-based fungicide or Triadimefon.\n2. Spray wettable sulfur (0.2%) at 15-day intervals.\n3. Remove heavily infected parts.',
    prevention: 'Plant in well-ventilated areas. Avoid excessive nitrogen fertilizer. Monitor during flowering.',
    is_healthy: false,
  },
  'Mango Healthy': {
    name: 'Healthy Plant', plant: 'Mango', severity: 'none',
    symptoms: 'No disease symptoms detected. Plant appears healthy with normal green coloration.',
    treatment: 'No treatment needed. Continue regular care routine.',
    prevention: 'Maintain regular watering, proper fertilization, and pest monitoring.',
    is_healthy: true,
  },
};

export function getDiseaseInfo(className: string): DiseaseInfo {
  // Try exact match first
  if (DISEASE_DATABASE[className]) return DISEASE_DATABASE[className];
  // Try partial match
  const key = Object.keys(DISEASE_DATABASE).find(k =>
    k.toLowerCase().includes(className.toLowerCase()) ||
    className.toLowerCase().includes(k.toLowerCase().split(' ')[0])
  );
  if (key) return DISEASE_DATABASE[key];
  // Default unknown
  const isHealthy = className.toLowerCase().includes('healthy');
  return {
    name: className,
    plant: 'Unknown',
    severity: isHealthy ? 'none' : 'medium',
    symptoms: isHealthy ? 'No symptoms detected.' : 'Consult an agricultural expert for diagnosis.',
    treatment: isHealthy ? 'No treatment needed.' : 'Consult your local agricultural extension office.',
    prevention: 'Practice good crop hygiene and regular monitoring.',
    is_healthy: isHealthy,
  };
}


