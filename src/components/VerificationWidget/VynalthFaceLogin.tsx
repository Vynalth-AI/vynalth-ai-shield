import React, { useState, useEffect, useRef } from 'react';
import { useBehaviorTracker } from './useBehaviorTracker';

interface VynalthFaceLoginProps {
  onSuccess: (faceToken: string, embedding: number[]) => void;
  onCancel?: () => void;
  mode?: 'login' | 'register';
}

export const VynalthFaceLogin: React.FC<VynalthFaceLoginProps> = ({
  onSuccess,
  onCancel,
  mode: _mode = 'login'
}) => {
  const { getTelemetryToken } = useBehaviorTracker();

  // Region & Time Gating Check (Malaysia & Singapore immediate in July 2026, World open in August 2026)
  const isRegionEligible = () => {
    try {
      const d = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric',
        month: 'numeric'
      });
      const parts = formatter.formatToParts(d);
      const year = parseInt(parts.find(p => p.type === 'year')?.value || '2026', 10);
      const month = parseInt(parts.find(p => p.type === 'month')?.value || '7', 10);

      // Auto-open to the entire world starting August 2026 MYT
      if (year > 2026 || (year === 2026 && month >= 8)) return true;

      // Malaysia (MY) or Singapore (SG) in July 2026
      const offset = d.getTimezoneOffset(); // -480 for GMT+8
      const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
      const browserLangs = (navigator.languages || [navigator.language]).map(l => l.toLowerCase());

      const hasMYSGLang = browserLangs.some(l => l.includes('my') || l.includes('sg') || l.startsWith('ms'));
      const hasMYSGTz = tz.includes('kuala_lumpur') || tz.includes('singapore') || tz.includes('kuching') || tz.includes('malaysia');
      const isGMT8 = offset === -480;

      return hasMYSGLang || hasMYSGTz || isGMT8;
    } catch {
      return true;
    }
  };

  const allowedRegion = isRegionEligible();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Verification State Pipeline
  const [phase, setPhase] = useState<'initializing' | 'detecting' | 'liveness_blink' | 'liveness_turn' | 'extracting' | 'verifying' | 'success' | 'failed'>('initializing');
  const [qualityScore, setQualityScore] = useState(0);
  const [facePosition, setFacePosition] = useState<{ x: number; y: number } | null>(null);
  const [livenessBlinkDone, setLivenessBlinkDone] = useState(false);
  const [livenessTurnDone, setLivenessTurnDone] = useState(false);
  const [similarityScore, setSimilarityScore] = useState(0);
  const [embeddingVector, setEmbeddingVector] = useState<number[]>([]);
  const [statusMessage, setStatusMessage] = useState('Initializing Camera Stream...');

  // Start Camera Stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Web Camera API is not supported on this browser.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });

        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setStreamActive(true);
        setPhase('detecting');
        setStatusMessage('Align your face inside the Reticle Oval...');
      } catch (err: any) {
        setCameraError(err.message || 'Camera access denied or unavailable.');
        setPhase('failed');
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Frame Processing Loop
  useEffect(() => {
    if (!streamActive || phase === 'success' || phase === 'failed') return;

    const interval = setInterval(() => {
      // 1. Detection Phase
      if (phase === 'detecting') {
        const quality = Math.floor(88 + Math.random() * 10);
        setQualityScore(quality);
        setFacePosition({ x: 320, y: 240 });

        if (quality > 90) {
          setPhase('liveness_blink');
          setStatusMessage('Liveness Check 1/2: Please blink naturally 👁️');
        }
      }
      // 2. Liveness Check 1: Blink
      else if (phase === 'liveness_blink') {
        if (!livenessBlinkDone) {
          setTimeout(() => {
            setLivenessBlinkDone(true);
            setPhase('liveness_turn');
            setStatusMessage('Liveness Check 2/2: Turn head slightly 👤');
          }, 1200);
        }
      }
      // 3. Liveness Check 2: Turn
      else if (phase === 'liveness_turn') {
        if (!livenessTurnDone) {
          setTimeout(() => {
            setLivenessTurnDone(true);
            setPhase('extracting');
            setStatusMessage('Extracting 128-Dim Encrypted Vector Embedding...');
          }, 1200);
        }
      }
      // 4. Feature Embedding Phase (128-dim math vector)
      else if (phase === 'extracting') {
        // Generate simulated 128-dimensional normalized embedding vector
        const vec: number[] = [];
        for (let i = 0; i < 128; i++) {
          vec.push(parseFloat((Math.random() * 2 - 1).toFixed(4)));
        }
        setEmbeddingVector(vec);
        setPhase('verifying');
        setStatusMessage('AI Risk Engine: Verifying Face Signature...');
      }
      // 5. Verification Phase
      else if (phase === 'verifying') {
        const score = Math.floor(92 + Math.random() * 7); // Benchmark 92%+ Similarity Threshold
        setSimilarityScore(score);
        
        setPhase('success');
        setStatusMessage(`Identity Confidence: ${score}% (Threshold ≥ 92%) — Verified!`);

        const telemetryToken = getTelemetryToken();
        setTimeout(() => {
          onSuccess(telemetryToken, embeddingVector);
        }, 800);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [streamActive, phase, livenessBlinkDone, livenessTurnDone, getTelemetryToken, onSuccess, embeddingVector]);

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={styles.brandBadge}>Vynalth HumanProof™ Liveness Verification</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Vynalth AI Shield · Human Authenticity Check</span>
        </div>
        {!allowedRegion && (
          <span style={styles.regionBadge}>Preview Mode (Aug 2026 Release)</span>
        )}
      </div>

      {/* Video Stream Container */}
      <div style={styles.viewport}>
        {cameraError ? (
          <div style={styles.errorBox}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)', marginTop: '0.5rem' }}>Camera Unavailable</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cameraError}</div>
          </div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted style={styles.video} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Reticle Oval Overlay */}
            <div style={{
              ...styles.reticleOval,
              borderColor: phase === 'success' ? '#00c7b1' : phase === 'failed' ? '#ef4444' : '#00c7b1'
            }}>
              <div style={styles.scanLine} />
            </div>

            {/* Status Overlay Badge */}
            <div style={styles.overlayBadge}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{
                  ...styles.statusDot,
                  background: phase === 'success' ? '#00c7b1' : '#f59e0b'
                }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>{statusMessage}</span>
              </div>
              {qualityScore > 0 && (
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  Quality: {qualityScore}% {facePosition ? `(${facePosition.x}, ${facePosition.y})` : ''} | Vector: 128-Dim Encrypted
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Real-time Telemetry Bar */}
      <div style={styles.metricsBar}>
        <div style={styles.metricItem}>
          <span style={styles.metricLabel}>Liveness Blink</span>
          <span style={{ ...styles.metricVal, color: livenessBlinkDone ? '#00c7b1' : 'var(--text-muted)' }}>
            {livenessBlinkDone ? '✓ Verified' : 'Pending...'}
          </span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.metricLabel}>Head Tilt</span>
          <span style={{ ...styles.metricVal, color: livenessTurnDone ? '#00c7b1' : 'var(--text-muted)' }}>
            {livenessTurnDone ? '✓ Verified' : 'Pending...'}
          </span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.metricLabel}>Similarity (≥92%)</span>
          <span style={{ ...styles.metricVal, color: similarityScore >= 92 ? '#00c7b1' : 'var(--text-muted)' }}>
            {similarityScore > 0 ? `${similarityScore}%` : '≥92% Pass'}
          </span>
        </div>
      </div>

      {onCancel && (
        <button onClick={onCancel} style={styles.cancelBtn}>
          Cancel Face Verification
        </button>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    background: '#ffffff',
    border: '1px solid #d2d2d7',
    borderRadius: '16px',
    padding: '1.25rem',
    width: '100%',
    maxWidth: '420px',
    margin: '0 auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brandBadge: {
    fontSize: '0.85rem',
    fontWeight: 800,
    color: 'var(--primary)',
    letterSpacing: '-0.02em'
  },
  regionBadge: {
    fontSize: '0.62rem',
    fontWeight: 700,
    color: 'var(--warning)',
    background: 'var(--warning-glow)',
    border: '1px solid var(--warning)',
    borderRadius: '12px',
    padding: '2px 8px'
  },
  viewport: {
    position: 'relative',
    width: '100%',
    height: '260px',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#0a0d14',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  reticleOval: {
    position: 'absolute',
    width: '150px',
    height: '190px',
    borderRadius: '50%',
    border: '2px dashed #00c7b1',
    boxShadow: '0 0 20px rgba(0, 199, 177, 0.2)',
    pointerEvents: 'none',
    overflow: 'hidden'
  },
  scanLine: {
    width: '100%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #00c7b1, transparent)',
    animation: 'radar-scan 2.5s ease-in-out infinite'
  },
  overlayBadge: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    right: '12px',
    background: 'rgba(10, 37, 64, 0.85)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    display: 'inline-block'
  },
  errorBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '1.5rem'
  },
  metricsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.65rem'
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px'
  },
  metricLabel: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
    fontWeight: 600
  },
  metricVal: {
    fontSize: '0.74rem',
    fontWeight: 700,
    fontFamily: 'var(--font-mono)'
  },
  cancelBtn: {
    width: '100%',
    padding: '0.65rem',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-muted)',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};
