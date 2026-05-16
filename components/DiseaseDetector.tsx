'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ScanResult, Prediction } from '@/types';
import { loadModel, predict, isModelLoaded } from '@/lib/teachableMachine';
import { getDiseaseInfo } from '@/lib/diseases';
import { addScan } from '@/lib/scanStorage';
import TreatmentPanel from './TreatmentPanel';

const WebcamCapture = dynamic(() => import('./WebcamCapture'), { ssr: false });

interface Props {
  modelUrl?: string;
  onScanSaved?: (result: ScanResult) => void;
}

export default function DiseaseDetector({ modelUrl, onScanSaved }: Props) {
  const [tab, setTab] = useState<'upload' | 'camera'>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [scanError, setScanError] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!modelUrl) return;
    setModelStatus('loading');
    loadModel(modelUrl)
      .then(ok => setModelStatus(ok ? 'ready' : 'error'))
      .catch(() => setModelStatus('error'));
  }, [modelUrl]);

  const runPrediction = useCallback(async (
    element: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    filename?: string
  ) => {
    setIsAnalyzing(true);
    setScanError('');
    try {
      if (!isModelLoaded()) {
        throw new Error('No AI model loaded. Please configure your Teachable Machine URL in Settings.');
      }
      const preds = await predict(element);
      setPredictions(preds);
      const top = preds[0];
      const info = getDiseaseInfo(top.className);
      const scanResult: ScanResult = {
        disease_name: top.className,
        confidence: top.probability,
        severity: info.severity,
        treatment: info.treatment,
        symptoms: info.symptoms,
        plant_type: info.plant,
        is_healthy: info.is_healthy,
        created_at: new Date().toISOString(),
      };
      setResult(scanResult);
      addScan(scanResult);
      onScanSaved?.(scanResult);
    } catch (err: any) {
      setScanError(err?.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [onScanSaved]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null); setPredictions([]);
    const img = new Image();
    img.onload = () => runPrediction(img, file.name);
    img.src = url;
  }, [runPrediction]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleWebcamCapture = useCallback((_src: string, video: HTMLVideoElement) => {
    setPreviewUrl(_src);
    setResult(null); setPredictions([]);
    runPrediction(video);
  }, [runPrediction]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      {/* Model status banner */}
      {!modelUrl && (
        <div style={{
          padding: '12px 16px', borderRadius: '12px',
          background: 'rgba(225,112,85,0.08)', border: '1px solid rgba(225,112,85,0.25)',
          display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px',
        }}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            No AI model configured. Running in <strong>demo mode</strong> with mock predictions.{' '}
            <a href="/settings" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Add your Teachable Machine URL →</a>
          </span>
        </div>
      )}

      {/* Scan error */}
      {scanError && (
        <div style={{
          padding: '12px 16px', borderRadius: '12px',
          background: 'rgba(214,48,49,0.08)', border: '1px solid rgba(214,48,49,0.25)',
          display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px',
        }}>
          <span style={{ fontSize: '18px' }}>❌</span>
          <span style={{ color: 'var(--color-disease)' }}>
            {scanError}{' '}
            {scanError.includes('model') && (
              <a href="/settings" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Go to Settings →</a>
            )}
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', minWidth: 0 }}>
        {/* Left: scanner */}
        <div className="card" style={{ padding: '22px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', background: 'var(--bg-primary)', borderRadius: '10px', padding: '4px' }}>
            {(['upload', 'camera'] as const).map(t => (
              <button
                key={t}
                id={`scan-tab-${t}`}
                onClick={() => { setTab(t); setResult(null); setPreviewUrl(null); setPredictions([]); }}
                style={{
                  flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
                  fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  background: tab === t ? 'white' : 'transparent',
                  color: tab === t ? 'var(--color-primary)' : 'var(--text-secondary)',
                  boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {t === 'upload' ? '📁 Upload Photo' : '📷 Live Camera'}
              </button>
            ))}
          </div>

          {tab === 'upload' ? (
            <div>
              {/* Drop zone */}
              <div
                className={`upload-zone${isDragging ? ' drag-over' : ''}`}
                style={{ padding: '40px 24px', textAlign: 'center', cursor: 'pointer', position: 'relative' }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    ref={imgRef}
                    src={previewUrl}
                    alt="Preview"
                    style={{ maxHeight: '220px', maxWidth: '100%', borderRadius: '10px', objectFit: 'contain' }}
                  />
                ) : (
                  <>
                    <div style={{ fontSize: '52px', marginBottom: '12px' }}>🌿</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Drop plant image here
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      or click to browse — JPG, PNG, WEBP
                    </div>
                    <span className="btn btn-secondary btn-sm">Browse Files</span>
                  </>
                )}
                <input
                  id="file-upload-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>

              {previewUrl && !isAnalyzing && !result && (
                <button
                  id="analyze-btn"
                  className="btn btn-primary"
                  onClick={() => { if (imgRef.current) runPrediction(imgRef.current); }}
                  style={{ marginTop: '14px', width: '100%', justifyContent: 'center' }}
                >🔬 Analyze Disease</button>
              )}

              {isAnalyzing && (
                <div style={{ marginTop: '14px', textAlign: 'center', padding: '16px' }}>
                  <div style={{
                    width: '36px', height: '36px', border: '3px solid var(--border-color)',
                    borderTopColor: 'var(--color-primary)', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 10px',
                  }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Analyzing plant health...</p>
                </div>
              )}
            </div>
          ) : (
            <WebcamCapture onCapture={handleWebcamCapture} isAnalyzing={isAnalyzing} />
          )}

          {/* Predictions breakdown */}
          {predictions.length > 0 && !isAnalyzing && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                All Predictions
              </h4>
              {predictions.slice(0, 4).map((p, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: i === 0 ? 700 : 400 }}>{p.className}</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{Math.round(p.probability * 100)}%</span>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{
                      width: `${Math.round(p.probability * 100)}%`,
                      background: i === 0 ? 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))' : 'var(--border-color)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: treatment */}
        <TreatmentPanel result={result} />
      </div>
    </div>
  );
}
