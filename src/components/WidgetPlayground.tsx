import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ShieldConfig } from '../types';
import { VerificationWidget } from './VerificationWidget/VerificationWidget';
import { getApiBaseUrl } from '../lib/api';

interface WidgetPlaygroundProps {
  config: ShieldConfig;
  onAddLog: (method: 'behavioral_telemetry' | 'captcha_3d' | 'biometric_scan' | 'cryptographic_pow', status: 'passed' | 'flagged' | 'blocked', score: number) => void;
}

// ─── Biometrics helpers ───────────────────────────────────────────────
function computeCanvasHash(): string {
  try {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    if (!ctx) return 'unavailable';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('VitaShield🛡️', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('VitaShield🛡️', 4, 17);
    const data = c.toDataURL();
    let h = 0;
    for (let i = 0; i < data.length; i++) { h = (Math.imul(31, h) + data.charCodeAt(i)) | 0; }
    return `0x${Math.abs(h).toString(16).padStart(8, '0')}`;
  } catch { return 'blocked'; }
}

function computeWebGLInfo(): { vendor: string; renderer: string; } {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return { vendor: 'unavailable', renderer: 'unavailable' };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return { vendor: gl.getParameter(gl.VENDOR), renderer: gl.getParameter(gl.RENDERER) };
    return {
      vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL),
      renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL),
    };
  } catch { return { vendor: 'blocked', renderer: 'blocked' }; }
}

export const WidgetPlayground: React.FC<WidgetPlaygroundProps> = ({ config, onAddLog }) => {
  const [formType, setFormType] = useState<'signup' | 'login' | 'ai_apps' | 'crypto'>('signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('100');
  const [address, setAddress] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [prompt, setPrompt] = useState('Generate an optimized React table component.');
  
  const [widgetState, setWidgetState] = useState<'idle' | 'running' | 'interactive' | 'success' | 'failed'>('idle');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [realResponseJson, setRealResponseJson] = useState<any>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // ─── Biometrics state ─────────────────────────────────────────────
  const [keystrokeSamples, setKeystrokeSamples] = useState<{dwell: number; flight: number; key: string}[]>([]);
  const [mousePoints, setMousePoints] = useState<{x: number; y: number}[]>([]);
  const [touchVelocity, setTouchVelocity] = useState<number[]>([]);
  const [trustScore, setTrustScore] = useState(72);
  const [fingerprint, setFingerprint] = useState<{canvas: string; webglVendor: string; webglRenderer: string; platform: string; language: string; cores: number; memory: number | string; timezone: string; screen: string}>({
    canvas: '—', webglVendor: '—', webglRenderer: '—',
    platform: navigator.platform || '—',
    language: navigator.language || '—',
    cores: navigator.hardwareConcurrency || 0,
    memory: (navigator as any).deviceMemory || '—',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${screen.width}×${screen.height} @${window.devicePixelRatio}x`,
  });
  const lastKeyUp = useRef<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const labRef = useRef<HTMLDivElement>(null);

  // Compute fingerprints once on mount
  useEffect(() => {
    const canvas = computeCanvasHash();
    const { vendor, renderer } = computeWebGLInfo();
    setFingerprint(f => ({ ...f, canvas, webglVendor: vendor, webglRenderer: renderer }));
  }, []);

  // Keystroke dynamics listener
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const now = performance.now();
    const flight = lastKeyUp.current > 0 ? now - lastKeyUp.current : 0;
    const keyDownTime = now;
    const handleUp = () => {
      const dwell = performance.now() - keyDownTime;
      lastKeyUp.current = performance.now();
      setKeystrokeSamples(prev => {
        const next = [...prev.slice(-19), { dwell: Math.round(dwell), flight: Math.round(flight), key: e.key.length === 1 ? e.key : `[${e.key}]` }];
        // Update trust score based on keystroke variance
        if (next.length >= 4) {
          const dwells = next.map(s => s.dwell);
          const avg = dwells.reduce((a,b) => a+b, 0) / dwells.length;
          const variance = dwells.reduce((a,b) => a + Math.pow(b - avg, 2), 0) / dwells.length;
          const std = Math.sqrt(variance);
          // Human std typically 20-80ms; bots <5ms
          const humanFactor = Math.min(100, Math.max(0, std * 1.5));
          setTrustScore(prev => Math.round(prev * 0.7 + humanFactor * 0.3));
        }
        return next;
      });
      window.removeEventListener('keyup', handleUp);
    };
    window.addEventListener('keyup', handleUp, { once: true });
  }, []);

  // Mouse movement capture (on lab panel only)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = labRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 300;
    const y = ((e.clientY - rect.top) / rect.height) * 120;
    setMousePoints(prev => {
      const next = [...prev.slice(-59), { x: Math.max(0, Math.min(300, x)), y: Math.max(0, Math.min(120, y)) }];
      return next;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch gesture simulation on mobile
  let lastTouchX = 0;
  let lastTouchTime = 0;
  const handleTouchMove = (e: React.TouchEvent) => {
    const now = performance.now();
    const dx = e.touches[0].clientX - lastTouchX;
    const dt = now - lastTouchTime;
    if (dt > 0) {
      const vel = Math.abs(dx / dt) * 100;
      setTouchVelocity(prev => [...prev.slice(-9), Math.round(vel)]);
    }
    lastTouchX = e.touches[0].clientX;
    lastTouchTime = now;
  };

  useEffect(() => {
    if (terminalEndRef.current) terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const addTerminalLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleRealVerify = async (token: string) => {
    setWidgetState('running');
    setTerminalLogs([]);
    setRealResponseJson(null);
    addTerminalLog('CLIENT SDK: Real-time telemetry token generated successfully.');
    addTerminalLog(`TOKEN SCHEMA: ${token.substring(0, 50)}...`);
    addTerminalLog('SECURE GATEWAY: Connection initialized. Uploading encrypted kinetics packet...');

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, secret: 'vms_sec_live_9c0f73b18274d8a21f7c' })
      });

      let result: any;
      if (response.status === 403) {
        result = await response.json();
      } else if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      } else {
        result = await response.json();
      }

      setRealResponseJson(result);
      
      if (response.status === 403) {
        addTerminalLog('SECURE GATEWAY: [ALERT] HTTP 403 Forbidden - Anomaly Block Gate triggered!');
        addTerminalLog(`RISK ENGINE: Classification -> BLOCK. Risk Score: ${result.scores?.risk_score || 95}/100`);
        if (result.detection_details?.device_anomalies?.length > 0) addTerminalLog(`ANOMALIES DETECTED: ${JSON.stringify(result.detection_details.device_anomalies)}`);
        if (result.detection_details?.behavior_flags?.length > 0) addTerminalLog(`BEHAVIOR FLAGS: ${JSON.stringify(result.detection_details.behavior_flags)}`);
        addTerminalLog('SECURE GATEWAY: Decision -> BLOCK. Connection dropped by gateway firewall.');
        setWidgetState('failed');
        onAddLog('behavioral_telemetry', 'blocked', result.scores?.risk_score || 95);
        return;
      }

      addTerminalLog(`RISK ENGINE: Classification -> ${result.decision?.toUpperCase()}. Risk: ${result.scores?.risk_score || 0}/100, Trust: ${result.scores?.trust_score || 0}/100`);
      if (result.detection_details?.device_anomalies?.length > 0) addTerminalLog(`ANOMALIES: ${JSON.stringify(result.detection_details.device_anomalies)}`);
      if (result.detection_details?.behavior_flags?.length > 0) addTerminalLog(`FLAGS: ${JSON.stringify(result.detection_details.behavior_flags)}`);

      if (result.success) {
        addTerminalLog('SECURE GATEWAY: Decision -> ALLOW. Transaction successfully authorized!');
        setWidgetState('success');
        onAddLog('behavioral_telemetry', 'passed', result.scores?.risk_score || 0);
      } else {
        const dec = result.decision || 'block';
        addTerminalLog(`SECURE GATEWAY: Decision -> ${dec.toUpperCase()}. Blocked.`);
        setWidgetState('failed');
        onAddLog('behavioral_telemetry', dec === 'challenge' ? 'flagged' : 'blocked', result.scores?.risk_score || 95);
      }
    } catch (error: any) {
      addTerminalLog(`SECURE GATEWAY: Verification call failed: ${error.message}`);
      setWidgetState('failed');
    }
  };

  const startVerification = (e: React.FormEvent) => {
    e.preventDefault();
    addTerminalLog('CLIENT SDK: Form submit triggered. Real-time behavior verification is active.');
  };

  const resetForm = () => setWidgetState('idle');

  // ─── SVG path builder for mouse trajectory ─────────────────────────
  const buildPath = (pts: {x:number;y:number}[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cp1x = pts[i-1].x + (pts[i].x - pts[i-1].x) / 3;
      const cp1y = pts[i-1].y;
      const cp2x = pts[i].x - (pts[i].x - pts[i-1].x) / 3;
      const cp2y = pts[i].y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i].x} ${pts[i].y}`;
    }
    return d;
  };

  // ─── Trust Score colour ───────────────────────────────────────────
  const scoreColor = trustScore >= 70 ? '#10b981' : trustScore >= 40 ? '#f59e0b' : '#ef4444';
  const scoreLabel = trustScore >= 70 ? 'HUMAN' : trustScore >= 40 ? 'SUSPICIOUS' : 'BOT';
  const scoreDash = (trustScore / 100) * 251; // circumference ≈ 251 for r=40

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">Verification Widget Playground</h1>
          <p style={styles.subtitle}>Test how VitaShield renders and behaves inside mock web transaction routers.</p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Left Column: Form Simulator */}
        <div className="glass-panel" style={styles.formPanel}>
          <div style={styles.formPanelHeader}>
            <span style={styles.panelTitle}>Target Form Simulator</span>
            <select 
              value={formType} 
              onChange={(e) => { setFormType(e.target.value as any); resetForm(); }}
              style={styles.formSelector}
            >
              <option value="signup">Secure Signup Demo (Anti-Spam / Registration)</option>
              <option value="login">Secure Login Demo (Anti-Credential Stuffing)</option>
              <option value="ai_apps">Bot Detection Sandbox (API Protection Demo)</option>
              <option value="crypto">Crypto Web3 Demo (Anti-Sybil Airdrop Claim)</option>
            </select>
          </div>

          <form onSubmit={startVerification} style={styles.form}>
            {formType === 'signup' && (
              <>
                <div className="input-group">
                  <label className="input-label">Social Username</label>
                  <input required type="text" placeholder="vitamind_fan" value={username} onChange={e=>setUsername(e.target.value)} className="input-field" />
                </div>
                <div className="input-group">
                  <label className="input-label">User Description (Bio)</label>
                  <textarea placeholder="AI researcher and developer..." value={email} onChange={e=>setEmail(e.target.value)} className="input-field" style={{ height: '70px', resize: 'none' }} />
                </div>
              </>
            )}
            {formType === 'login' && (
              <>
                <div className="input-group">
                  <label className="input-label">User Account Email</label>
                  <input required type="email" placeholder="admin@sleepsomno.com" value={email} onChange={e=>setEmail(e.target.value)} className="input-field" />
                </div>
                <div className="input-group">
                  <label className="input-label">Secure Passcode</label>
                  <input required type="password" placeholder="••••••••••••" className="input-field" />
                </div>
              </>
            )}
            {formType === 'ai_apps' && (
              <>
                <div className="input-group">
                  <label className="input-label">LLM API Query Prompt</label>
                  <textarea required value={prompt} onChange={e=>setPrompt(e.target.value)} className="input-field" style={{ height: '70px', resize: 'none' }} />
                </div>
                <div className="input-group">
                  <label className="input-label">Max Token Output Limit</label>
                  <input required type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="input-field" />
                </div>
              </>
            )}
            {formType === 'crypto' && (
              <>
                <div className="input-group">
                  <label className="input-label">Web3 Wallet Address</label>
                  <input required type="text" value={address} onChange={e=>setAddress(e.target.value)} className="input-field" />
                </div>
                <div className="input-group">
                  <label className="input-label">Airdrop Tokens to Claim ($VMD)</label>
                  <input required type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="input-field" />
                </div>
              </>
            )}

            <div style={styles.widgetContainerOuter}>
              <VerificationWidget
                siteKey="vms_pub_live_9c0f73b18274d8a21f7c"
                onVerify={handleRealVerify}
                themePrimary={config.themePrimary}
                themeBg="rgba(13, 20, 35, 0.55)"
                themeText={config.themeText}
              />
              <div style={{ marginTop: '0.65rem', fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center', lineHeight: 1.4 }}>
                <span>🛡️</span>
                <span>免责声明：我们使用匿名行为数据改进 AI 模型以抵抗机器人攻击，<strong>但绝不出售个人健康信息</strong>。</span>
              </div>
            </div>

            <div style={styles.actionRow}>
              {widgetState === 'success' ? (
                <button type="button" onClick={resetForm} style={styles.actionBtnSecondary}>Reset Playground</button>
              ) : (
                <button type="submit" disabled={widgetState === 'running'} style={styles.actionBtnPrimary}>
                  {widgetState === 'running' ? 'Verifying Session...' : 'Secure Submit Request'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Live API Log Console */}
        <div className="glass-panel" style={styles.consolePanel}>
          <div style={styles.consoleHeader}>
            <div style={styles.consoleIndicatorRow}>
              <span style={styles.consoleDot} />
              <span style={styles.consoleTitle}>Shield Edge Log Terminal</span>
            </div>
            <button onClick={() => setTerminalLogs([])} style={styles.clearBtn}>Clear Terminal</button>
          </div>
          <div style={styles.consoleBody}>
            {terminalLogs.length === 0 ? (
              <div style={styles.consoleEmpty}>Waiting for form submission triggers...</div>
            ) : (
              <div style={styles.consoleOutput}>
                {terminalLogs.map((log, idx) => (
                  <div key={idx} style={styles.consoleLine}>{log}</div>
                ))}
                {realResponseJson && (
                  <div style={styles.jsonOutput}>
                    <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#10B981' }}>
                      {`// POST /v1/verify response payload:\n` + JSON.stringify(realResponseJson, null, 2)}
                    </pre>
                  </div>
                )}
                <div ref={terminalEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BEHAVIORAL BIOMETRICS LABORATORY
      ══════════════════════════════════════════════════════════════════ */}
      <div
        ref={labRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0 }}>
              🧬 Behavioral Biometrics Laboratory
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
              Live telemetry from your current session — type anything, move your mouse, or swipe to see the engine classify you in real time.
            </p>
          </div>
          {/* Trust Score Gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
            <svg width={90} height={90} viewBox="0 0 90 90">
              <circle cx={45} cy={45} r={40} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
              <circle
                cx={45} cy={45} r={40}
                fill="none" stroke={scoreColor} strokeWidth={8}
                strokeDasharray={`${scoreDash} ${251 - scoreDash}`}
                strokeDashoffset={62.75}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease' }}
              />
              <text x={45} y={43} textAnchor="middle" fill="#f1f5f9" fontSize={16} fontWeight={800}>{trustScore}</text>
              <text x={45} y={57} textAnchor="middle" fill={scoreColor} fontSize={9} fontWeight={700}>{scoreLabel}</text>
            </svg>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>AI Trust Score</span>
          </div>
        </div>

        {/* Lab Grid: 3 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>

          {/* ── 1. Keystroke Dynamics ── */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Keystroke Dynamics</p>
                <p style={{ margin: '0.1rem 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Type anywhere to measure</p>
              </div>
              <span style={{ fontSize: '1.2rem' }}>⌨️</span>
            </div>

            {/* Dwell Time Histogram */}
            <div style={{ height: 64, display: 'flex', alignItems: 'flex-end', gap: 3, marginBottom: '0.6rem' }}>
              {keystrokeSamples.length === 0 ? (
                <div style={{ color: 'var(--text-dark)', fontSize: '0.75rem', margin: 'auto' }}>Type to see dwell times…</div>
              ) : (
                keystrokeSamples.map((s, i) => {
                  const h = Math.min(64, Math.max(6, (s.dwell / 200) * 64));
                  const isLatest = i === keystrokeSamples.length - 1;
                  return (
                    <div key={i} title={`${s.key}: ${s.dwell}ms dwell`} style={{ flex: 1, height: h, background: isLatest ? '#38bdf8' : 'rgba(56,189,248,0.3)', borderRadius: '3px 3px 0 0', minWidth: 6, transition: 'height 0.2s', cursor: 'default' }} />
                  );
                })
              )}
            </div>

            {keystrokeSamples.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                {[
                  { label: 'Avg Dwell', value: Math.round(keystrokeSamples.reduce((a,s)=>a+s.dwell,0)/keystrokeSamples.length) + 'ms' },
                  { label: 'Avg Flight', value: Math.round(keystrokeSamples.filter(s=>s.flight>0).reduce((a,s)=>a+s.flight,0)/Math.max(1,keystrokeSamples.filter(s=>s.flight>0).length)) + 'ms' },
                  { label: 'Samples', value: keystrokeSamples.length },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '0.4rem 0.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', fontFamily: 'var(--font-mono)' }}>{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 2. Mouse Trajectory Visualizer ── */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mouse Trajectory</p>
                <p style={{ margin: '0.1rem 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Move your mouse over this panel</p>
              </div>
              <span style={{ fontSize: '1.2rem' }}>🖱️</span>
            </div>
            <svg
              ref={svgRef}
              width="100%" height={120}
              viewBox="0 0 300 120"
              style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, cursor: 'crosshair' }}
            >
              <defs>
                <linearGradient id="traj-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={1} />
                </linearGradient>
              </defs>
              {mousePoints.length > 1 && (
                <path d={buildPath(mousePoints)} fill="none" stroke="url(#traj-grad)" strokeWidth={2} strokeLinecap="round" />
              )}
              {mousePoints.length > 0 && (
                <>
                  <circle cx={mousePoints[mousePoints.length - 1].x} cy={mousePoints[mousePoints.length - 1].y} r={4} fill="#818cf8" />
                  <circle cx={mousePoints[mousePoints.length - 1].x} cy={mousePoints[mousePoints.length - 1].y} r={8} fill="rgba(129,140,248,0.2)" />
                </>
              )}
              {mousePoints.length === 0 && (
                <text x={150} y={65} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize={12}>Move cursor here</text>
              )}
            </svg>
            {mousePoints.length > 5 && (() => {
              // compute straightness ratio
              const first = mousePoints[0], last = mousePoints[mousePoints.length-1];
              const straight = Math.sqrt(Math.pow(last.x-first.x,2)+Math.pow(last.y-first.y,2));
              let pathLen = 0;
              for (let i=1; i<mousePoints.length; i++) pathLen += Math.sqrt(Math.pow(mousePoints[i].x-mousePoints[i-1].x,2)+Math.pow(mousePoints[i].y-mousePoints[i-1].y,2));
              const ratio = straight > 0 ? pathLen/straight : 1;
              const isHuman = ratio > 1.08;
              return (
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Path ratio: <strong style={{ color: '#f1f5f9' }}>{ratio.toFixed(3)}</strong></span>
                  <span style={{ color: isHuman ? '#10b981' : '#ef4444', fontWeight: 700 }}>{isHuman ? '✓ Human curvature' : '✗ Abnormally straight'}</span>
                </div>
              );
            })()}
          </div>

          {/* ── 3. Device & Hardware Fingerprint ── */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Hardware Fingerprint</p>
                <p style={{ margin: '0.1rem 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Canvas · WebGL · Device signals</p>
              </div>
              <span style={{ fontSize: '1.2rem' }}>🔬</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Canvas Hash', value: fingerprint.canvas, mono: true },
                { label: 'WebGL Vendor', value: fingerprint.webglVendor, mono: false },
                { label: 'GPU Renderer', value: fingerprint.webglRenderer.substring(0, 36) + (fingerprint.webglRenderer.length > 36 ? '…' : ''), mono: false },
                { label: 'CPU Cores', value: String(fingerprint.cores), mono: true },
                { label: 'RAM (GB)', value: String(fingerprint.memory), mono: true },
                { label: 'Screen', value: fingerprint.screen, mono: true },
                { label: 'Timezone', value: fingerprint.timezone, mono: false },
                { label: 'Language', value: fingerprint.language, mono: true },
              ].map(({ label, value, mono }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize: '0.74rem', color: '#f59e0b', fontFamily: mono ? 'var(--font-mono)' : 'inherit', fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Touch / Gesture Velocity (mobile-style demo) ── */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Touch & Gesture Velocity</p>
              <p style={{ margin: '0.1rem 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Swipe on mobile or interact below to simulate — measures acceleration variance unique to human motor control</p>
            </div>
            <span style={{ fontSize: '1.2rem' }}>👆</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
            {touchVelocity.length === 0
              ? <div style={{ color: 'var(--text-dark)', fontSize: '0.78rem', margin: 'auto' }}>Swipe on a mobile device to capture touch velocity</div>
              : touchVelocity.map((v, i) => {
                  const h = Math.min(80, Math.max(6, v * 0.8));
                  return <div key={i} style={{ flex: 1, height: h, background: `hsl(${160 + i*8}, 70%, 50%)`, borderRadius: '3px 3px 0 0', transition: 'height 0.2s' }} title={`${v} px/ms`} />;
                })
            }
          </div>
          {/* Simulate touch button for desktop */}
          <button
            onClick={() => {
              const simVels = Array.from({ length: 8 }, () => 30 + Math.random() * 70 + Math.sin(Math.random() * Math.PI) * 20);
              setTouchVelocity(simVels.map(v => Math.round(v)));
            }}
            style={{ marginTop: '0.75rem', padding: '0.45rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#10b981', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Simulate Swipe (Demo)
          </button>
        </div>

        {/* ── AI Edge Trust Score breakdown ── */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p style={{ margin: '0 0 1rem', fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            AI Trust Engine — Real-Time Signal Fusion
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {[
              { signal: 'Keystroke Dwell Variance', score: keystrokeSamples.length < 4 ? '—' : (() => { const d = keystrokeSamples.map(s=>s.dwell); const avg = d.reduce((a,b)=>a+b,0)/d.length; const std = Math.sqrt(d.reduce((a,b)=>a+Math.pow(b-avg,2),0)/d.length); return std > 20 ? 'HUMAN' : std > 5 ? 'UNCERTAIN' : 'BOT'; })(), color: '#38bdf8' },
              { signal: 'Mouse Curvature', score: mousePoints.length < 6 ? '—' : (() => { const first=mousePoints[0], last=mousePoints[mousePoints.length-1]; const s=Math.sqrt(Math.pow(last.x-first.x,2)+Math.pow(last.y-first.y,2)); let p=0; for(let i=1;i<mousePoints.length;i++) p+=Math.sqrt(Math.pow(mousePoints[i].x-mousePoints[i-1].x,2)+Math.pow(mousePoints[i].y-mousePoints[i-1].y,2)); return s>0 && p/s>1.08 ? 'HUMAN' : 'SCRIPTED'; })(), color: '#818cf8' },
              { signal: 'Canvas Fingerprint', score: fingerprint.canvas === 'blocked' ? 'HEADLESS' : fingerprint.canvas !== '—' ? 'UNIQUE' : '—', color: '#f59e0b' },
              { signal: 'Hardware Coherence', score: fingerprint.cores > 0 && fingerprint.webglRenderer !== 'blocked' ? 'REAL DEVICE' : fingerprint.webglRenderer === 'blocked' ? 'VIRTUAL GPU' : '—', color: '#10b981' },
              { signal: 'Touch Bio-Variance', score: touchVelocity.length < 3 ? '—' : (() => { const std = Math.sqrt(touchVelocity.reduce((a,v)=>a+Math.pow(v-touchVelocity.reduce((a,b)=>a+b,0)/touchVelocity.length,2),0)/touchVelocity.length); return std > 10 ? 'HUMAN' : 'SCRIPTED'; })(), color: '#06b6d4' },
              { signal: 'Overall Trust', score: scoreLabel, color: scoreColor },
            ].map(({ signal, score, color }) => (
              <div key={signal} style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{signal}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '2rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.03em' },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.98rem', marginTop: '0.25rem' },
  layout: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' },
  formPanel: { padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  formPanelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '1rem' },
  panelTitle: { fontSize: '1.15rem', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em' },
  formSelector: { background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.45rem 0.75rem', fontSize: '0.82rem', color: '#fff', cursor: 'pointer', outline: 'none' },
  form: { display: 'flex', flexDirection: 'column' },
  widgetContainerOuter: { marginTop: '0.5rem', marginBottom: '1.5rem' },
  actionRow: { display: 'flex', gap: '0.75rem' },
  actionBtnPrimary: { flex: 1, padding: '0.8rem', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', border: 'none', color: '#fff', fontWeight: '700', fontSize: '0.92rem', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.15)' },
  actionBtnSecondary: { flex: 1, padding: '0.8rem', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.92rem', borderRadius: '8px', cursor: 'pointer' },
  consolePanel: { padding: '1.5rem', height: '480px', display: 'flex', flexDirection: 'column' },
  consoleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.75rem', marginBottom: '1rem' },
  consoleIndicatorRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  consoleDot: { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 6px var(--secondary)', display: 'inline-block' },
  consoleTitle: { fontSize: '0.85rem', fontWeight: '700', color: '#fff', fontFamily: 'var(--font-mono)' },
  clearBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '500' },
  consoleBody: { flex: 1, background: '#04060b', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' },
  consoleEmpty: { color: 'var(--text-dark)', textAlign: 'center', padding: '3rem 1.5rem' },
  consoleOutput: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  consoleLine: { color: '#e2e8f0', whiteSpace: 'pre-wrap' },
  jsonOutput: { color: 'var(--secondary)', marginTop: '0.75rem', borderTop: '1px dashed rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem', whiteSpace: 'pre-wrap' },
};
