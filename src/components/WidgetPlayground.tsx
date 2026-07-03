import React, { useState, useEffect, useRef } from 'react';
import type { ShieldConfig } from '../types';
import { VerificationWidget } from './VerificationWidget/VerificationWidget';

interface WidgetPlaygroundProps {
  config: ShieldConfig;
  onAddLog: (method: 'behavioral_telemetry' | 'captcha_3d' | 'biometric_scan' | 'cryptographic_pow', status: 'passed' | 'flagged' | 'blocked', score: number) => void;
}

export const WidgetPlayground: React.FC<WidgetPlaygroundProps> = ({ config, onAddLog }) => {
  const [formType, setFormType] = useState<'signup' | 'login' | 'ai_apps' | 'crypto'>('signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('100');
  const [address, setAddress] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [prompt, setPrompt] = useState('Generate an optimized React table component.');
  
  // Widget states
  const [widgetState, setWidgetState] = useState<'idle' | 'running' | 'interactive' | 'success' | 'failed'>('idle');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [realResponseJson, setRealResponseJson] = useState<any>(null);

  // Ref to automatically scroll terminal to bottom
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const addTerminalLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const handleRealVerify = async (token: string) => {
    setWidgetState('running');
    setTerminalLogs([]);
    setRealResponseJson(null);
    addTerminalLog('CLIENT SDK: Real-time telemetry token generated successfully.');
    addTerminalLog(`TOKEN SCHEMA: ${token.substring(0, 50)}...`);
    addTerminalLog('SECURE GATEWAY: Connection initialized. Uploading encrypted kinetics packet...');

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          secret: 'vms_sec_live_9c0f73b18274d8a21f7c' // default live key for testing
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setRealResponseJson(result);
      
      addTerminalLog('SECURE GATEWAY: Connection successful. Analyzing response payload...');
      addTerminalLog(`RISK ENGINE: Classification -> ${result.decision.toUpperCase()}. Risk Score: ${result.scores?.risk_score || 0}/100, Trust Score: ${result.scores?.trust_score || 0}/100, Reputation Score: ${result.scores?.reputation_score || 0}/100.`);
      
      if (result.detection_details?.device_anomalies?.length > 0) {
        addTerminalLog(`ANOMALIES DETECTED: ${JSON.stringify(result.detection_details.device_anomalies)}`);
      }
      if (result.detection_details?.behavior_flags?.length > 0) {
        addTerminalLog(`BEHAVIOR FLAGS DETECTED: ${JSON.stringify(result.detection_details.behavior_flags)}`);
      }

      if (result.success) {
        addTerminalLog('SECURE GATEWAY: Decision -> ALLOW. Transaction successfully authorized!');
        setWidgetState('success');
        onAddLog('behavioral_telemetry', 'passed', result.scores?.risk_score || 0);
      } else {
        const dec = result.decision || 'block';
        addTerminalLog(`SECURE GATEWAY: Decision -> ${dec.toUpperCase()}. Verification blocked due to high anomaly index.`);
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

  const resetForm = () => {
    setWidgetState('idle');
  };

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
              onChange={(e) => {
                setFormType(e.target.value as any);
                resetForm();
              }}
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

            {/* Real VitaShield widget container */}
            <div style={styles.widgetContainerOuter}>
              <VerificationWidget
                siteKey="vms_pub_live_9c0f73b18274d8a21f7c"
                onVerify={handleRealVerify}
                themePrimary={config.themePrimary}
                themeBg="rgba(13, 20, 35, 0.55)"
                themeText={config.themeText}
              />
            </div>

            {/* Submission Actions */}
            <div style={styles.actionRow}>
              {widgetState === 'success' ? (
                <button type="button" onClick={resetForm} style={styles.actionBtnSecondary}>
                  Reset Playground
                </button>
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
            <button onClick={() => setTerminalLogs([])} style={styles.clearBtn}>
              Clear Terminal
            </button>
          </div>

          <div style={styles.consoleBody}>
            {terminalLogs.length === 0 ? (
              <div style={styles.consoleEmpty}>
                Waiting for form submission triggers... Click 'Secure Submit Request' to watch real-time client-gateway protocol handshakes.
              </div>
            ) : (
              <div style={styles.consoleOutput}>
                {terminalLogs.map((log, idx) => (
                  <div key={idx} style={styles.consoleLine}>
                    {log}
                  </div>
                ))}
                {realResponseJson && (
                   <div style={styles.jsonOutput}>
                     <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#10B981' }}>
                       {`// POST /v1/verify response payload:
` + JSON.stringify(realResponseJson, null, 2)}
                     </pre>
                   </div>
                )}
                <div ref={terminalEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.03em'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.98rem',
    marginTop: '0.25rem'
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '1.5rem',
    alignItems: 'start'
  },
  formPanel: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  formPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '1rem'
  },
  panelTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em'
  },
  formSelector: {
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.45rem 0.75rem',
    fontSize: '0.82rem',
    color: '#fff',
    cursor: 'pointer',
    outline: 'none'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  widgetContainerOuter: {
    marginTop: '0.5rem',
    marginBottom: '1.5rem'
  },
  widgetPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px dashed var(--border-color)',
    borderRadius: '10px',
    padding: '0.85rem 1rem'
  },
  widgetLogoPlaceholder: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'rgba(6, 182, 212, 0.05)',
    border: '1px solid rgba(6, 182, 212, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  widgetPlaceholderText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  widgetBox: {
    padding: '1.25rem',
    background: 'rgba(0, 0, 0, 0.35)',
    border: '1.5px solid rgba(6, 182, 212, 0.18)',
    boxShadow: 'var(--glow-shadow)',
    borderRadius: '12px'
  },
  widgetSubState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 0'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(6, 182, 212, 0.1)',
    borderTopColor: 'var(--secondary)',
    borderRadius: '50%',
    animation: 'spin-slow 1s linear infinite',
    marginBottom: '1rem'
  },
  widgetStatusMain: {
    fontSize: '0.92rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.2rem'
  },
  widgetStatusSub: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    lineHeight: '1.4'
  },
  widgetSubmitBtn: {
    marginTop: '1.25rem',
    width: '100%',
    padding: '0.65rem 1rem',
    background: 'var(--secondary)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'background 0.2s ease'
  },
  widgetSuccessState: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  successIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'var(--success)',
    boxShadow: '0 0 15px var(--success)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  successTextContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  successTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#fff'
  },
  successDesc: {
    fontSize: '0.76rem',
    color: 'var(--text-muted)',
    marginTop: '0.15rem'
  },
  actionRow: {
    display: 'flex',
    gap: '0.75rem'
  },
  actionBtnPrimary: {
    flex: 1,
    padding: '0.8rem',
    background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
    border: 'none',
    color: '#fff',
    fontWeight: '700',
    fontSize: '0.92rem',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(6, 182, 212, 0.15)'
  },
  actionBtnSecondary: {
    flex: 1,
    padding: '0.8rem',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    fontWeight: '600',
    fontSize: '0.92rem',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  consolePanel: {
    padding: '1.5rem',
    height: '480px',
    display: 'flex',
    flexDirection: 'column'
  },
  consoleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '0.75rem',
    marginBottom: '1rem'
  },
  consoleIndicatorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  consoleDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--secondary)',
    boxShadow: '0 0 6px var(--secondary)',
    display: 'inline-block'
  },
  consoleTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'var(--font-mono)'
  },
  clearBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontWeight: '500'
  },
  consoleBody: {
    flex: 1,
    background: '#04060b',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '1rem',
    overflowY: 'auto',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5'
  },
  consoleEmpty: {
    color: 'var(--text-dark)',
    textAlign: 'center',
    padding: '3rem 1.5rem'
  },
  consoleOutput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  consoleLine: {
    color: '#e2e8f0',
    whiteSpace: 'pre-wrap'
  },
  jsonOutput: {
    color: 'var(--secondary)',
    marginTop: '0.75rem',
    borderTop: '1px dashed rgba(255, 255, 255, 0.05)',
    paddingTop: '0.75rem',
    whiteSpace: 'pre-wrap'
  }
};
