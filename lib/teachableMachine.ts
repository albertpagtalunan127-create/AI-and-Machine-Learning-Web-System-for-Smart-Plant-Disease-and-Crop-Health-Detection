import { Prediction } from '@/types';

let model: any = null;
let currentModelUrl = '';

/**
 * Resolve a model URL:
 * - If it's a full http/https URL → use as-is
 * - If it's a relative path like "./my_model/" or "/my_model/" → resolve against window.location.origin
 * - Falls back to the public folder: "/my_model/"
 */
export function resolveModelUrl(input: string): string {
  if (!input) return '';
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input.endsWith('/') ? input : input + '/';
  }
  // Relative path (e.g. "./my_model" or "/my_model")
  const clean = input.replace(/^\.?\//, '');
  return `${window.location.origin}/${clean}${clean.endsWith('/') ? '' : '/'}`;
}

export async function loadModel(modelUrl: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (model && currentModelUrl === modelUrl) return true;
  try {
    const tmImage = await import('@teachablemachine/image');
    const url = resolveModelUrl(modelUrl);
    model = await tmImage.load(url + 'model.json', url + 'metadata.json');
    currentModelUrl = modelUrl;
    return true;
  } catch (err) {
    console.error('Failed to load model:', err);
    model = null;
    return false;
  }
}

/** Load model from local File objects (e.g. file picker) */
export async function loadModelFromFiles(
  modelFile: File,
  metadataFile: File,
  weightsFiles: File[]
): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const tmImage = await import('@teachablemachine/image');
    model = await (tmImage as any).loadFromFiles(modelFile, metadataFile, weightsFiles);
    currentModelUrl = '__local__';
    return true;
  } catch (err) {
    console.error('Failed to load model from files:', err);
    model = null;
    return false;
  }
}

export async function predict(
  element: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): Promise<Prediction[]> {
  if (!model) throw new Error('Model not loaded');
  const predictions = await model.predict(element);
  return (predictions as Prediction[]).sort((a, b) => b.probability - a.probability);
}

export function getModel() {
  return model;
}

export function isModelLoaded() {
  return model !== null;
}

export function unloadModel() {
  model = null;
  currentModelUrl = '';
}

export function getTotalClasses(): number {
  return model ? model.getTotalClasses() : 0;
}
