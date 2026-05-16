'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Prediction } from '@/types';
import { getDiseaseInfo } from '@/lib/diseases';
import TreatmentPanel from './TreatmentPanel';
import { ScanResult } from '@/types';
import { addScan } from '@/lib/scanStorage';

interface Props {
  /** Full Teachable Machine cloud URL OR a local path like "/my_model/" */
  modelUrl?: string;
  onScanSaved?: (result: ScanResult) => void;
}

export default function LiveDetector({ modelUrl, onScanSaved }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const loopActiveRef = useRef(false);
  const lastSavedRef = useRef<number>(0);

  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [topResult, setTopResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [classCount, setClassCount] = useState(0);

  // ---- resolve the model base URL (same logic as lib) ----
  function resolveUrl(input: string): string {
    if (!input) return '/my_model/';
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return input.endsWith('/') ? input : input + '/';
    }
    const clean = input.replace(/^\.?\//, '');
    return `${window.location.origin}/${clean}${clean.endsWith('/') ? '' : '/'}`;
  }

  const stopLoop = useCallback(() => {
    loopActiveRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (webcamRef.current) {
      try { webcamRef.current.stop(); } catch (_) { }
      // Remove canvas from DOM
      if (containerRef.current) {
        const canvas = containerRef.current.querySelector('canvas');
        if (canvas) containerRef.current.removeChild(canvas);
      }
      webcamRef.current = null;
    }
    modelRef.current = null;
    setIsRunning(false);
    setPredictions([]);
    setTopResult(null);
  }, []);

  const loop = useCallback(async () => {
    if (!loopActiveRef.current || !webcamRef.current || !modelRef.current) return;
    webcamRef.current.update();

    try {
      const preds: Prediction[] = await modelRef.current.predict(webcamRef.current.canvas);
      const sorted = [...preds].sort((a, b) => b.probability - a.probability);
      setPredictions(sorted);

      const top = sorted[0];
      if (top && top.probability > 0.5) {
        const info = getDiseaseInfo(top.className);
        const result: ScanResult = {
          disease_name: top.className,
          confidence: top.probability,
          severity: info.severity,
          treatment: info.treatment,
          symptoms: info.symptoms,
          plant_type: info.plant,
          is_healthy: info.is_healthy,
          created_at: new Date().toISOString(),
        };
        setTopResult(result);
        // Save to history at most once every 10 seconds
        const now = Date.now();
        if (now - lastSavedRef.current > 10000) {
          lastSavedRef.current = now;
          addScan(result);
          onScanSaved?.(result);
        }
      }
    } catch (_) { }

    if (loopActiveRef.current) {
      rafRef.current = requestAnimationFrame(loop);
    }
  }, []);

  const startLive = useCallback(async () => {
    setError('');
    setIsLoading(true);

    try {
      // Dynamically import the Teachable Machine image library
      const tmImage = await import('@teachablemachine/image' as any);

      // 1. Load the model
      const base = modelUrl ? resolveUrl(modelUrl) : '/my_model/';
      let loadedModel: any;
      try {
        loadedModel = await tmImage.load(base + 'model.json', base + 'metadata.json');
      } catch (err) {
        console.warn('Real model not found, using mock mode:', err);
        loadedModel = null;
      }
      if (!loadedModel) {
        stopLoop();
        setError('Failed to load AI model. Please check your Teachable Machine URL in Settings.');
        setIsLoading(false);
        return;
      }
      modelRef.current = loadedModel;
      setClassCount(loadedModel.getTotalClasses());

      // 2. Setup Teachable Machine Webcam
      const webcam = new tmImage.Webcam(300, 300, true);
      await webcam.setup();
      await webcam.play();
      webcamRef.current = webcam;

      if (containerRef.current) {
        containerRef.current.appendChild(webcam.canvas);
      }

      loopActiveRef.current = true;
      setIsRunning(true);
      setIsLoading(false);
      rafRef.current = requestAnimationFrame(loop);
    } catch (err: any) {
      setError(err?.message || 'Failed to start camera. Check permissions.');
      setIsLoading(false);
    }
  }, [modelUrl, loop]);

  // Cleanup on unmount
  useEffect(() => () => { stopLoop(); }, [stopLoop]);

  // ---- UI helpers ----
  const pct = (p: number) => `${Math.round(p * 100)}%`;
  const barColor = (i: number, isHealthy: boolean) => {
    if (i !== 0) return 'var(--border-color)';
    return isHealthy
      ? 'linear-gradient(90deg, var(--color-healthy), #00cec9)'
      : 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Top banner: no model configured */}
      {!modelUrl && (
        <div style={{
          padding: '12px 16px', borderRadius: '12px',
          background: 'rgba(225,112,85,0.08)', border: '1px solid rgba(225,112,85,0.25)',
          display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px',
        }}>
          <span style={{ fontSize: '18px' }}>ℹ️</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            No model URL set — using <strong>local /my_model/</strong> or <strong>demo mode</strong>.{' '}
            <a href="/settings" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Configure in Settings →
            </a>
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>

        {/* LEFT: Camera panel */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              📹 Live Teachable Machine
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Continuous real-time prediction — no button needed
            </p>
          </div>

          {/* Webcam canvas container */}
          <div style={{
            position: 'relative',
            width: '300px', height: '300px',
            borderRadius: '16px', overflow: 'hidden',
            border: '2px solid var(--color-primary)',
            boxShadow: '0 0 0 4px rgba(108,92,231,0.15)',
            background: '#0f0e2e',
            margin: '0 auto 18px',
          }}>
            {/* The tmImage.Webcam canvas is appended here */}
            <div
              ref={containerRef}
              style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />

            {/* Placeholder when not running */}
            {!isRunning && !isLoading && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: '#0f0e2e',
              }}>
                <div style={{ fontSize: '52px', marginBottom: '12px' }}>📷</div>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                  Press Start to begin
                </span>
              </div>
            )}

            {/* Loading overlay */}
            {isLoading && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(15,14,46,0.85)', backdropFilter: 'blur(4px)',
              }}>
                <div style={{
                  width: '44px', height: '44px',
                  border: '3px solid rgba(255,255,255,0.2)',
                  borderTopColor: 'var(--color-primary)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  marginBottom: '12px',
                }} />
                <span style={{ color: 'white', fontSize: '13px' }}>Loading model...</span>
              </div>
            )}

            {/* LIVE badge */}
            {isRunning && (
              <div style={{
                position: 'absolute', top: '12px', left: '12px',
                background: 'rgba(214,48,49,0.9)', color: 'white',
                fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: 'white', display: 'inline-block',
                  animation: 'pulse-glow 1.5s ease infinite',
                }} />
                LIVE
              </div>
            )}

            {/* Scan corners */}
            {isRunning && ['tl', 'tr', 'bl', 'br'].map(pos => (
              <div key={pos} style={{
                position: 'absolute', width: '24px', height: '24px',
                borderColor: 'var(--color-primary)', borderStyle: 'solid',
                borderWidth: pos.includes('t') ? '3px 0 0' : '0 0 3px',
                borderRightWidth: pos.includes('r') ? '3px' : '0',
                borderLeftWidth: pos.includes('l') ? '3px' : '0',
                top: pos.includes('t') ? '12px' : 'auto',
                bottom: pos.includes('b') ? '12px' : 'auto',
                left: pos.includes('l') ? '12px' : 'auto',
                right: pos.includes('r') ? '12px' : 'auto',
                borderRadius: pos === 'tl' ? '4px 0 0 0' : pos === 'tr' ? '0 4px 0 0' : pos === 'bl' ? '0 0 0 4px' : '0 0 4px 0',
              }} />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', marginBottom: '14px',
              background: 'rgba(225,112,85,0.1)', border: '1px solid rgba(225,112,85,0.3)',
              color: 'var(--color-disease)', fontSize: '13px',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Start / Stop button */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {!isRunning ? (
              <button
                id="live-start-btn"
                className="btn btn-primary btn-lg"
                onClick={startLive}
                disabled={isLoading}
                style={{ minWidth: '180px', justifyContent: 'center' }}
              >
                {isLoading ? '⏳ Loading...' : '▶ Start'}
              </button>
            ) : (
              <button
                id="live-stop-btn"
                className="btn btn-ghost btn-lg"
                onClick={stopLoop}
                style={{ minWidth: '180px', justifyContent: 'center' }}
              >
                ⏹ Stop
              </button>
            )}
          </div>

          {/* Live predictions bars */}
          {predictions.length > 0 && (
            <div style={{ marginTop: '22px' }}>
              <h4 style={{
                fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)',
                textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px',
              }}>
                Live Predictions
              </h4>
              {predictions.map((p, i) => (
                <div key={p.className} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: i === 0 ? 700 : 400 }}>
                      {p.className}
                    </span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{pct(p.probability)}</span>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{
                      width: pct(p.probability),
                      background: barColor(i, topResult?.is_healthy ?? false),
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Treatment panel */}
        <TreatmentPanel result={topResult} />
      </div>
    </div>
  );
}
