'use client';
import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';

interface Props {
  onCapture: (imageSrc: string, videoEl: HTMLVideoElement) => void;
  isAnalyzing: boolean;
}

export default function WebcamCapture({ onCapture, isAnalyzing }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState('');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    const video = webcamRef.current?.video;
    if (imageSrc && video) {
      onCapture(imageSrc, video);
    }
  }, [onCapture]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {/* Camera feed */}
      <div style={{
        position: 'relative', borderRadius: '16px', overflow: 'hidden',
        width: '100%', maxWidth: '480px', aspectRatio: '4/3',
        background: '#0f0e2e', border: '2px solid var(--color-primary)',
        boxShadow: '0 0 0 4px rgba(108,92,231,0.15)',
      }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.92}
          videoConstraints={{ facingMode: 'environment', width: 480, height: 360 }}
          onUserMedia={() => setIsCameraReady(true)}
          onUserMediaError={(e) => setError('Camera access denied. Please allow camera permissions.')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* Scan overlay */}
        {isCameraReady && !isAnalyzing && (
          <>
            {/* Corner brackets */}
            {['tl','tr','bl','br'].map(pos => (
              <div key={pos} style={{
                position: 'absolute', width: '28px', height: '28px',
                borderColor: 'var(--color-primary)', borderStyle: 'solid',
                borderWidth: pos.includes('t') ? '3px 0 0' : '0 0 3px',
                borderRightWidth: pos.includes('r') ? '3px' : '0',
                borderLeftWidth: pos.includes('l') ? '3px' : '0',
                top: pos.includes('t') ? '16px' : 'auto',
                bottom: pos.includes('b') ? '16px' : 'auto',
                left: pos.includes('l') ? '16px' : 'auto',
                right: pos.includes('r') ? '16px' : 'auto',
                borderRadius: pos === 'tl' ? '4px 0 0 0' : pos === 'tr' ? '0 4px 0 0' : pos === 'bl' ? '0 0 0 4px' : '0 0 4px 0',
              }} />
            ))}
            {/* Animated scan line */}
            <div style={{
              position: 'absolute', left: '16px', right: '16px', height: '2px',
              background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
              animation: 'scanline 2s linear infinite',
            }} />
          </>
        )}

        {/* Analyzing overlay */}
        {isAnalyzing && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,14,46,0.75)', backdropFilter: 'blur(4px)',
          }}>
            <div style={{
              width: '48px', height: '48px', border: '3px solid rgba(255,255,255,0.2)',
              borderTopColor: 'var(--color-primary)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', marginBottom: '12px',
            }} />
            <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Analyzing...</span>
          </div>
        )}

        {/* Not ready */}
        {!isCameraReady && !error && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', background: '#0f0e2e',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📷</div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Starting camera...</span>
          </div>
        )}

        {/* Live badge */}
        {isCameraReady && (
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            background: 'rgba(214,48,49,0.9)', color: 'white',
            fontSize: '11px', fontWeight: 700, padding: '3px 10px',
            borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white', display: 'inline-block', animation: 'pulse-glow 1.5s ease infinite' }} />
            LIVE
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: 'var(--color-disease)', fontSize: '13px', textAlign: 'center' }}>⚠️ {error}</div>
      )}

      {/* Capture button */}
      <button
        id="webcam-capture-btn"
        onClick={capture}
        disabled={!isCameraReady || isAnalyzing}
        className="btn btn-primary btn-lg"
        style={{ minWidth: '200px', justifyContent: 'center' }}
      >
        {isAnalyzing ? '🔬 Analyzing...' : '📸 Capture & Analyze'}
      </button>
    </div>
  );
}
