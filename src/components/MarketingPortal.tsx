import React, { useState, useEffect } from 'react';
import { VerificationWidget } from './VerificationWidget/VerificationWidget';
import { useBehaviorTracker } from './VerificationWidget/useBehaviorTracker';
import { MATRIX_CATEGORIES } from './SystemSpecs';
import { evaluateTelemetry } from '../lib/riskEngine';
import { DailyCheckinWidget } from './DailyCheckinWidget';
import { DotMatrixLoader } from './ui/DotMatrixLoader';

interface MarketingPortalProps {
  onEnterConsole: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToWhitepaper?: () => void;
}

export const MarketingPortal: React.FC<MarketingPortalProps> = ({ 
  onEnterConsole,
  onNavigateToPricing,
  onNavigateToWhitepaper
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [demoResults, setDemoResults] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [demoMail, setDemoMail] = useState<string>('tester@company.com');
  const [activeMatrixCategory, setActiveMatrixCategory] = useState<string>('behavioral');
  const [docsTab, setDocsTab] = useState<'nodejs' | 'python' | 'go' | 'curl'>('nodejs');

  // Interactive Backend API sandbox states
  const [mockRiskScore, setMockRiskScore] = useState<number>(12);
  const [mockWebdriver, setMockWebdriver] = useState<boolean>(false);
  const [mockStraightMouse, setMockStraightMouse] = useState<boolean>(false);
  const [mockSwiftshader, setMockSwiftshader] = useState<boolean>(false);

  // Cycle the 4-step flowchart automatically every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Real-time live behavior tracker
  const { getTelemetryToken } = useBehaviorTracker();
  const [liveTelemetry, setLiveTelemetry] = useState<any>(null);

  const handleDemoVerify = async (token: string) => {
    setDemoLoading(true);
    
    setTimeout(() => {
      try {
        const key = "vms_pub_live_demo";
        const encrypted = atob(token);
        let decrypted = '';
        for (let i = 0; i < encrypted.length; i++) {
          decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        const decodedString = decodeURIComponent(decrypted);
        const telemetry = JSON.parse(decodedString);
        
        const fingerprint = telemetry.fingerprint || {};
        const behavior = telemetry.behavior || {};
        
        const clientIp = '127.0.0.1';
        const hasForwardedFor = false;
        const aiAgentPatterns = [
          /openai/i, /gptbot/i, /chatgpt/i, /chat-gpt/i, /claude/i, /anthropic/i,
          /google-extended/i, /googlebot/i, /bingbot/i, /crawler/i, /spider/i,
          /python-urllib/i, /axios/i, /headless/i, /puppeteer/i, /playwright/i,
          /selenium/i, /webdriver/i, /operator/i
        ];
        const userAgent = fingerprint.userAgent || '';
        const isBotUA = aiAgentPatterns.some(pattern => pattern.test(userAgent));

        const evaluation = evaluateTelemetry(
          fingerprint,
          behavior,
          clientIp,
          userAgent,
          hasForwardedFor,
          isBotUA,
          telemetry.createdAt,
          telemetry.signature,
          "vms_pub_live_demo",
          telemetry.powNonce,
          telemetry.powDifficulty
        );
        
        const mousePoints = behavior.mousePoints || [];
        let straightRatio = 1.25;
        if (mousePoints.length >= 4) {
          let pathLen = 0;
          for (let i = 1; i < mousePoints.length; i++) {
            pathLen += Math.sqrt(Math.pow(mousePoints[i].x - mousePoints[i-1].x, 2) + Math.pow(mousePoints[i].y - mousePoints[i-1].y, 2));
          }
          const first = mousePoints[0];
          const last = mousePoints[mousePoints.length - 1];
          const straight = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));
          straightRatio = pathLen / (straight || 1);
        }
        
        const keyTimings = behavior.keyTimings || [];
        let keyStd = 35;
        if (keyTimings.length >= 4) {
          const avg = keyTimings.reduce((a: number, b: number) => a + b, 0) / keyTimings.length;
          const variance = keyTimings.reduce((acc: number, t: number) => acc + Math.pow(t - avg, 2), 0) / keyTimings.length;
          keyStd = Math.sqrt(variance);
        }
        
        let riskScore = evaluation.riskScore;
        let trustScore = 100 - riskScore;
        let anomalies: string[] = evaluation.deviceAnomalies || [];
        let flags: string[] = [];

        if (fingerprint.webdriverActive) {
          anomalies.push('navigator_webdriver_active');
        }
        if (straightRatio < 1.05 && mousePoints.length > 5) {
          flags.push('perfectly_straight_mouse_trajectory');
          riskScore = Math.max(riskScore, 75);
        }
        if (keyStd < 12 && keyTimings.length > 3) {
          flags.push('zero_mouse_acceleration_variance');
          riskScore = Math.max(riskScore, 80);
        }
        
        riskScore = Math.min(Math.max(riskScore, 0), 100);
        trustScore = Math.min(Math.max(trustScore, 0), 100);
        
        let decision = 'allow';
        if (riskScore >= 60) decision = 'block';
        else if (riskScore > 20 || trustScore < 65) decision = 'challenge';
        
        setDemoResults({
          success: true,
          decision,
          scores: {
            risk_score: riskScore,
            trust_score: trustScore,
            reputation_score: 95
          },
          details: {
            is_ai_agent: false,
            device_anomalies: anomalies,
            behavior_flags: flags,
            mouse_straightness: Math.round(straightRatio * 100) / 100,
            key_std_dev: Math.round(keyStd * 10) / 10,
            mousePointsCount: mousePoints.length,
            keyPressesCount: behavior.keyPressesCount || 0
          }
        });
      } catch (err) {
        // fail silently
      } finally {
        setDemoLoading(false);
      }
    }, 150);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const token = getTelemetryToken();
      if (!token) return;

      try {
        const decoded = JSON.parse(atob(token));
        const fingerprint = decoded.fingerprint || {};
        const behavior = decoded.behavior || {};
        const mousePoints = behavior.mousePoints || [];

        let straightRatio = 1.25;
        if (mousePoints.length >= 4) {
          let pathLen = 0;
          for (let i = 1; i < mousePoints.length; i++) {
            pathLen += Math.sqrt(Math.pow(mousePoints[i].x - mousePoints[i-1].x, 2) + Math.pow(mousePoints[i].y - mousePoints[i-1].y, 2));
          }
          const first = mousePoints[0];
          const last = mousePoints[mousePoints.length - 1];
          const straight = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));
          straightRatio = pathLen / (straight || 1);
        }

        const keyTimings = behavior.keyTimings || [];
        let keyStd = 35;
        if (keyTimings.length >= 4) {
          const avg = keyTimings.reduce((a: number, b: number) => a + b, 0) / keyTimings.length;
          const variance = keyTimings.reduce((acc: number, t: number) => acc + Math.pow(t - avg, 2), 0) / keyTimings.length;
          keyStd = Math.sqrt(variance);
        }

        let riskScore = 12;
        let anomalies: string[] = [];
        let flags: string[] = [];

        if (fingerprint.webdriverActive) {
          anomalies.push('navigator_webdriver_active');
          riskScore = 95;
        }
        if (straightRatio < 1.05 && mousePoints.length > 5) {
          flags.push('perfectly_straight_mouse_trajectory');
          riskScore = Math.max(riskScore, 75);
        }
        if (keyStd < 12 && keyTimings.length > 3) {
          flags.push('zero_mouse_acceleration_variance');
          riskScore = Math.max(riskScore, 80);
        }
        
        riskScore = Math.min(Math.max(riskScore, 0), 100);
        let trustScore = 100 - riskScore;
        
        let decision = 'allow';
        if (riskScore >= 60) decision = 'block';
        else if (riskScore > 20 || trustScore < 65) decision = 'challenge';
        
        setLiveTelemetry({
          success: true,
          decision,
          scores: {
            risk_score: riskScore,
            trust_score: trustScore,
            reputation_score: 95
          },
          details: {
            is_ai_agent: false,
            device_anomalies: anomalies,
            behavior_flags: flags,
            mouse_straightness: Math.round(straightRatio * 100) / 100,
            key_std_dev: Math.round(keyStd * 10) / 10,
            mousePointsCount: mousePoints.length,
            keyPressesCount: behavior.keyPressesCount || 0
          }
        });
      } catch (err) {
        // fail silently
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getTelemetryToken]);

  return (
    <div style={styles.container}>
      {/* Background Ambient Glow Filters (Meta & Apple hybrid) */}
      <div style={styles.glowOverlayPurple} />
      <div style={styles.glowOverlayCyan} />

      {/* Top Header */}
      <header style={styles.topHeader}>
        <div style={styles.brand}>
          <div style={styles.logoIcon}>
            <img src="/vynalth_ai_shield_logo.jpg" alt="Vynalth AI Shield Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <span style={styles.brandName}>Vynalth AI Shield</span>
            <span style={styles.brandSub}>Invisible Trust, Everywhere · BY Vynalth AI</span>
          </div>
        </div>

        <nav style={styles.topNav}>
          <a href="#features" style={styles.navLink}>FEATURES</a>
          <a href="#pipeline" style={styles.navLink}>HOW IT WORKS</a>
          <a href="#matrix" style={styles.navLink}>DEFENSE MATRIX</a>
          <a href="#docs" style={styles.navLink}>DOCUMENTATION</a>
          <button 
            onClick={onNavigateToPricing} 
            style={{ ...styles.navLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textTransform: 'uppercase' }}
          >
            Pricing
          </button>
          <button 
            onClick={onNavigateToWhitepaper} 
            style={{ ...styles.navLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textTransform: 'uppercase' }}
          >
            Whitepaper
          </button>
          <a 
            href="/emilkowal-animations" 
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/emilkowal-animations');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            style={styles.navLink}
          >
            DESIGN PLAYBOOK
          </a>
          <button onClick={onEnterConsole} style={styles.consoleBtn}>GO TO CONSOLE</button>
        </nav>
      </header>

      {/* Hero Section (SpaceX & Apple hybrid) */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgePulse} />
            <span>AI-NATIVE VERIFICATION ENGINE</span>
          </div>
          <h1 style={styles.heroTitle}>
            DEFEND YOUR PLATFORM AGAINST ADVANCED AUTOMATION
          </h1>
          <p style={styles.heroSubtitle}>
            Vynalth AI Shield (Invisible Trust, Everywhere) is the security division of Vynalth AI (Building the Future of Health AI). Engineered to counter synthetic traffic and AI agents, our edge infrastructure silently assesses sub-pixel human kinetic patterns with zero user friction.
          </p>

          <div style={styles.heroCtas}>
            <button onClick={onEnterConsole} style={styles.primaryCta}>DEPLOY CONSOLE</button>
            <a href="#demo-sandbox" style={styles.secondaryCta}>LIVE SIMULATOR</a>
          </div>
        </div>
      </section>

      {/* Painpoint & Solution Section (Notion grid-outlines) */}
      <section style={{ ...styles.section, paddingTop: '1rem', paddingBottom: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', width: '100%', maxWidth: '1100px', gap: '1.5rem' }}>
          {/* Painpoints */}
          <div className="glass-panel" style={{ ...styles.gridCard, borderLeft: '3px solid var(--danger)' }}>
            <h3 style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.01em' }}>
              <span style={{ color: 'var(--danger)' }}>⚠️</span> LEGACY CAPTCHAS HAVE FAILED
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
              Modern bots and generative AI agents easily bypass slider puzzles and image recognition tasks. Traditional gatekeepers fail to stop credential stuffing and web scraping, while severely hurting customer registration conversion rates.
            </p>
          </div>

          {/* Solutions */}
          <div className="glass-panel" style={{ ...styles.gridCard, borderLeft: '3px solid #0066cc' }}>
            <h3 style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.01em' }}>
              <span style={{ color: '#0066cc' }}>🛡️</span> THE Vynalth AI Shield PARADIGM
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
              Vynalth AI Shield works invisibly. By deploying client-side kinetics trackers, the system analyzes physiological telemetry, mouse jitter frequency, and device hardware specifications in real-time, verifying human users with zero friction.
            </p>
          </div>
        </div>
      </section>

      {/* ── Vynalth AI Shield Beta Daily Check-in (Laboratory styled Notion grid) ───────────────────────────────── */}
      <section id="daily-checkin" style={{ ...styles.section, borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}>
        <div style={{ width: '100%', maxWidth: '1100px', padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr)', gap: '40px', alignItems: 'center' }}>

            {/* Left: Text */}
            <div style={{ textAlign: 'left' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)',
                borderRadius: '6px', padding: '4px 10px', marginBottom: '16px',
              }}>
                <span style={{ fontSize: '10px', color: '#a855f7', fontWeight: 800, letterSpacing: '0.08em' }}>BETA TRAINING LAB</span>
              </div>
              <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 900, margin: '0 0 12px', lineHeight: 1.15, letterSpacing: '-0.03em' }}>
                REINFORCE THE MODEL
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Help optimize Vynalth AI Shield's behavioral neural network. By completing a 10-second daily kinetic challenge, you provide diverse biomechanical samples to distinguish organic human actions from AI test suites.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: '🖱️', text: 'Log cursor trajectories and kinetic flight-time logs' },
                  { icon: '🧠', text: 'Train the local edge autoencoder defense model' },
                  { icon: '🎁', text: '4-day verification streak unlocks 3 months of Neuro Plan' },
                  { icon: '🔒', text: 'Anonymized at local layer, PDPA and GDPR compliant' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 500 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Widget */}
            <div style={styles.widgetWrapper}>
              <DailyCheckinWidget />
            </div>

          </div>
        </div>
      </section>

      {/* Flowchart "How it Works" Pipeline Section (Apple & Notion borders) */}
      <section id="pipeline" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>CASCADING EDGE PIPELINE</h2>
          <p style={styles.sectionSubtitle}>We orchestrate multi-tiered validation checks quietly at the browser edge.</p>
        </div>

        <div style={styles.pipelineBox}>
          <div style={styles.pipelineNodes}>
            {/* Node 1 */}
            <div style={{ ...styles.nodeCard, ...(activeStep === 0 ? styles.nodeCardActive : {}) }}>
              <div style={styles.nodeIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h4 style={styles.nodeTitle}>1. Telemetry Capture</h4>
              <p style={styles.nodeDesc}>Silent sensors collect cursor movement, clicking pace, and key timings.</p>
            </div>

            {/* Line 1 */}
            <div style={styles.connectionLine}>
              <div style={{ ...styles.linePulse, ...(activeStep === 0 ? styles.linePulseActive : {}) }} />
            </div>

            {/* Node 2 */}
            <div style={{ ...styles.nodeCard, ...(activeStep === 1 ? styles.nodeCardActive : {}) }}>
              <div style={styles.nodeIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <h4 style={styles.nodeTitle}>2. Token Compilation</h4>
              <p style={styles.nodeDesc}>Frontend SDK encrypts raw kinetics into a secure cryptographic token payload.</p>
            </div>

            {/* Line 2 */}
            <div style={styles.connectionLine}>
              <div style={{ ...styles.linePulse, ...(activeStep === 1 ? styles.linePulseActive : {}) }} />
            </div>

            {/* Node 3 */}
            <div style={{ ...styles.nodeCard, ...(activeStep === 2 ? styles.nodeCardActive : {}) }}>
              <div style={styles.nodeIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h4 style={styles.nodeTitle}>3. Heuristics Audit</h4>
              <p style={styles.nodeDesc}>Risk Engine checks transaction tokens against sub-pixel and WebDriver rules.</p>
            </div>

            {/* Line 3 */}
            <div style={styles.connectionLine}>
              <div style={{ ...styles.linePulse, ...(activeStep === 2 ? styles.linePulseActive : {}) }} />
            </div>

            {/* Node 4 */}
            <div style={{ ...styles.nodeCard, ...(activeStep === 3 ? styles.nodeCardActive : {}) }}>
              <div style={styles.nodeIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h4 style={styles.nodeTitle}>4. Adaptive Action</h4>
              <p style={styles.nodeDesc}>Low-risk logs pass through. Outlier anomalies prompt block/verification challenges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Features & Original Heuristics Section */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>13 PROPRIETARY KINETIC FILTERS</h2>
          <p style={styles.sectionSubtitle}>We audit biometric events using precision mathematical analysis.</p>
        </div>

        <div style={styles.productGrid}>
          <div className="glass-panel" style={styles.productCard}>
            <span style={styles.eyebrow}>HEURISTIC 01</span>
            <h4 style={styles.productTitle}>⚡ Micro-jitter & Bio-noise</h4>
            <p style={styles.productDesc}>
              Filters sub-pixel mouse cursor vibrations. Human hands display continuous biological micro-jitter that scripted frameworks cannot replicate.
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <span style={styles.eyebrow}>HEURISTIC 02</span>
            <h4 style={styles.productTitle}>⏳ Deceleration Curve Velocity</h4>
            <p style={styles.productDesc}>
              Analyzes hesitation velocities before clicks. Automated scripts move at static velocities, missing organic braking trajectories.
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <span style={styles.eyebrow}>HEURISTIC 03</span>
            <h4 style={styles.productTitle}>🧠 Adaptive Flight Pacing</h4>
            <p style={styles.productDesc}>
              Models cognitive delay between input field transits. Scripts trigger immediate sequence submissions, skipping human typing focus loops.
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <span style={styles.eyebrow}>HEURISTIC 04</span>
            <h4 style={styles.productTitle}>⌨️ Backspace & Error Correction</h4>
            <p style={styles.productDesc}>
              Rewards spelling corrections and natural typos. Automated typing systems produce perfect speed patterns with no correction actions.
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <span style={styles.eyebrow}>HEURISTIC 05</span>
            <h4 style={styles.productTitle}>🔗 Cross-session Association</h4>
            <p style={styles.productDesc}>
              Correlates browser telemetry logs across multiple tabs to isolate simultaneous distributed automation runs.
            </p>
          </div>

          <div className="glass-panel" style={{ ...styles.productCard, border: '1px solid #0066cc', background: 'rgba(0, 102, 204, 0.03)' }}>
            <span style={{ ...styles.eyebrow, color: '#0066cc' }}>SYSTEM LAYER</span>
            <h4 style={{ ...styles.productTitle, color: '#0066cc' }}>🛡️ Deep Threat Intelligence</h4>
            <p style={styles.productDesc}>
              Equipped with clipboard chain logs, GPU context validation, browser fingerprinting, and dynamic proof-of-work checks.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
              <a href="#matrix" style={{ color: '#2997ff', fontWeight: 700, textDecoration: 'none', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                VIEW FULL SECURITY MATRIX <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Scenarios and Why Choose Grid (Notion styling) */}
      <section style={{ ...styles.section, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', width: '100%', maxWidth: '1100px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Scenarios */}
          <div className="glass-panel" style={styles.gridCard}>
            <h3 style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>PROTECTION SCENARIOS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { title: 'SaaS Account Security & Registrations', desc: 'Mitigate brute-force credential stuffing and bot farm signups.' },
                { title: 'Web3 Airdrop Integrity', desc: 'Secure smart contract distribution from sybil cluster automation.' },
                { title: 'API Gateway Endpoint Rate Limiting', desc: 'Guard public API structures from scraping queries.' },
                { title: 'E-commerce Scalping Blockades', desc: 'Lock out automated checkout scripts and scalper applications.' },
              ].map((s, idx) => (
                <div key={idx} style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '0.82rem', color: '#2997ff', margin: '0 0 4px 0', fontWeight: 800 }}>• {s.title.toUpperCase()}</h4>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why Vynalth AI Shield */}
          <div className="glass-panel" style={styles.gridCard}>
            <h3 style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>ENGINE CHARACTERISTICS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { title: 'Aerospace-Grade Accuracy', desc: 'Precision modeling tailored to identify headless execution frameworks.' },
                { title: 'Frictionless Conversion UI', desc: 'Silent tracking keeps validation seamless, boosting standard conversions.' },
                { title: 'Model Recalibration Loops', desc: 'Telemetry anomalies train autoencoders continuously at the database edge.' },
                { title: 'Drop-In Developer SDK', desc: 'Add frontend collection script and server API verification in minutes.' },
              ].map((w, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h4 style={{ fontSize: '0.82rem', color: '#f8fafc', margin: 0, fontWeight: 800 }}>✓ {w.title.toUpperCase()}</h4>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Sandbox Interactive Simulator Panel (SpaceX control dashboard aesthetic) */}
      <section id="demo-sandbox" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>ACTION TELEMETRY SANDBOX</h2>
          <p style={styles.sectionSubtitle}>Interact with the collection node below to trace real-time kinetic calculations.</p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', width: '100%', maxWidth: '1100px', flexWrap: 'wrap', marginTop: '1rem', textAlign: 'left' }}>
          {/* Left Panel: The Form */}
          <form 
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const token = formData.get('vms-shield-token') as string;
              if (token) {
                handleDemoVerify(token);
              } else {
                alert("Please fill out email to compile telemetry payload.");
              }
            }}
            className="glass-panel" 
            style={{ flex: 1, minWidth: '320px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '18px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>FORM INTEGRATION</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Type your email. The SDK will quietly monitor your cursor and typing parameters to sign a verification payload.
            </p>

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label" htmlFor="demo-email" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>EMAIL ADDRESS</label>
              <input
                type="email"
                id="demo-email"
                value={demoMail}
                onChange={(e) => setDemoMail(e.target.value)}
                className="input-field"
                placeholder="developer@company.com"
                style={{ background: 'rgba(0,0,0,0.4)', margin: 0, border: '1px solid rgba(255,255,255,0.08)' }}
                required
              />
            </div>

            <div style={{ padding: '8px 0' }}>
              <VerificationWidget
                siteKey="vms_pub_live_demo"
                onVerify={handleDemoVerify}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0, 102, 204, 0.08)',
                border: '1px solid rgba(0, 102, 204, 0.4)',
                borderRadius: '8px',
                color: '#2997ff',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0, 102, 204, 0.15)';
                e.currentTarget.style.borderColor = '#2997ff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0, 102, 204, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(0, 102, 204, 0.4)';
              }}
            >
              COMPILE & SUBMIT
            </button>
          </form>

          {/* Right Panel: The Scoring Console */}
          <div className="glass-panel" style={{ flex: 1.2, minWidth: '320px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '18px', background: 'rgba(5, 7, 12, 0.95)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.01em' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2997ff', boxShadow: '0 0 10px #2997ff' }} />
              DECISION ENGINE TERMINAL
            </h3>

            {demoLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', height: '180px', color: 'var(--text-muted)' }}>
                <DotMatrixLoader preset="pulse" size={36} dotSize={4.5} color="#2997ff" />
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>Analyzing client-side bio-kinetics logs...</span>
              </div>
            ) : demoResults ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Decision Alert */}
                <div style={{
                  padding: '10px 14px',
                  background: demoResults.decision === 'allow' ? 'rgba(16, 185, 129, 0.06)' :
                             demoResults.decision === 'challenge' ? 'rgba(245, 158, 11, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                  border: demoResults.decision === 'allow' ? '1px solid rgba(16, 185, 129, 0.25)' :
                          demoResults.decision === 'challenge' ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '6px',
                  color: demoResults.decision === 'allow' ? '#34d399' :
                         demoResults.decision === 'challenge' ? '#fbbf24' : '#f87171',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em'
                }}>
                  DECISION: {demoResults.decision.toUpperCase()}
                </div>

                {/* Score breakdown metrics */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>RISK SCORE</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px', color: demoResults.scores.risk_score > 50 ? '#f87171' : '#f8fafc' }}>
                      {demoResults.scores.risk_score}%
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>TRUST SCORE</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px', color: demoResults.scores.trust_score < 50 ? '#f87171' : '#34d399' }}>
                      {demoResults.scores.trust_score}%
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>REPUTATION</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px', color: '#2997ff' }}>
                      {demoResults.scores.reputation_score}%
                    </div>
                  </div>
                </div>

                {/* Detail metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                    <span>Trajectory Jitter Ratio:</span>
                    <strong style={{ color: '#fff' }}>{demoResults.details.mouse_straightness || 1.25}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                    <span>Keystroke Delay Cadence SD:</span>
                    <strong style={{ color: '#fff' }}>{demoResults.details.key_std_dev || 35} ms</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                    <span>Automated Headless Test:</span>
                    <strong style={{ color: demoResults.details.device_anomalies.length > 0 ? '#f87171' : '#34d399' }}>
                      {demoResults.details.device_anomalies.length > 0 ? 'FAIL' : 'PASS'}
                    </strong>
                  </div>
                </div>

                {/* Flags list */}
                {demoResults.details.behavior_flags && demoResults.details.behavior_flags.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700, letterSpacing: '0.05em' }}>BEHAVIORAL FLAGS INGESTED:</div>
                    {demoResults.details.behavior_flags.map((flag: string) => (
                      <div key={flag} style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#f87171', background: 'rgba(239, 68, 68, 0.04)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.12)' }}>
                        [ANOMALY] {flag.toUpperCase()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : liveTelemetry ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Decision Alert */}
                <div style={{
                  padding: '10px 14px',
                  background: liveTelemetry.decision === 'allow' ? 'rgba(16, 185, 129, 0.05)' :
                             liveTelemetry.decision === 'challenge' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                  border: liveTelemetry.decision === 'allow' ? '1px solid rgba(16, 185, 129, 0.2)' :
                          liveTelemetry.decision === 'challenge' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '6px',
                  color: liveTelemetry.decision === 'allow' ? '#34d399' :
                         liveTelemetry.decision === 'challenge' ? '#fbbf24' : '#f87171',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>DECISION: {liveTelemetry.decision.toUpperCase()}</span>
                  <span style={{ fontSize: '9px', color: '#2997ff', fontWeight: 800 }}>● TELEMETRY STREAM</span>
                </div>

                {/* Score breakdown metrics */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>RISK SCORE</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px', color: liveTelemetry.scores.risk_score > 50 ? '#f87171' : '#f8fafc' }}>
                      {liveTelemetry.scores.risk_score}%
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>TRUST SCORE</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px', color: liveTelemetry.scores.trust_score < 50 ? '#f87171' : '#34d399' }}>
                      {liveTelemetry.scores.trust_score}%
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>REPUTATION</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px', color: '#2997ff' }}>
                      {liveTelemetry.scores.reputation_score}%
                    </div>
                  </div>
                </div>

                {/* Detail metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                    <span>Kinetic Coordinates Captured:</span>
                    <strong style={{ color: '#fff' }}>{liveTelemetry.details.mousePointsCount} / 30</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                    <span>Trajectory Straightness Ratio:</span>
                    <strong style={{ color: '#fff' }}>{liveTelemetry.details.mouse_straightness || 1.25}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                    <span>Keystroke Delay Variance SD:</span>
                    <strong style={{ color: '#fff' }}>{liveTelemetry.details.key_std_dev || 35} ms</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                    <span>Automated Headless Test:</span>
                    <strong style={{ color: liveTelemetry.details.device_anomalies.length > 0 ? '#f87171' : '#34d399' }}>
                      {liveTelemetry.details.device_anomalies.length > 0 ? 'FAIL' : 'PASS'}
                    </strong>
                  </div>
                </div>

                {/* Flags list */}
                {liveTelemetry.details.behavior_flags && liveTelemetry.details.behavior_flags.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700, letterSpacing: '0.05em' }}>BEHAVIORAL FLAGS INGESTED:</div>
                    {liveTelemetry.details.behavior_flags.map((flag: string) => (
                      <div key={flag} style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#f87171', background: 'rgba(239, 68, 68, 0.04)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.12)' }}>
                        [ANOMALY] {flag.toUpperCase()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--text-muted)', fontSize: '0.76rem', fontFamily: 'var(--font-mono)', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.06)' }}>
                Waiting for telemetry packet... Move cursor inside sandbox to compile.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Defense Matrix Section */}
      <section id="matrix" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>DEFENSE MATRIX SPECIFICATION</h2>
          <p style={styles.sectionSubtitle}>
            Browse the active detection algorithms, client checks, and neural thresholds loaded into Vynalth AI Shield.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '1.5rem', marginTop: '1rem', alignItems: 'start', width: '100%', maxWidth: '1100px', textAlign: 'left' }}>
          {/* Left Column: Categories List (Notion outline buttons) */}
          <div className="glass-panel" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {MATRIX_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveMatrixCategory(cat.id)}
                style={{
                  padding: '10px 14px',
                  background: activeMatrixCategory === cat.id ? 'rgba(0, 102, 204, 0.06)' : 'transparent',
                  border: activeMatrixCategory === cat.id ? '1px solid rgba(0, 102, 204, 0.4)' : '1px solid transparent',
                  borderRadius: '6px',
                  color: activeMatrixCategory === cat.id ? '#2997ff' : 'var(--text-muted)',
                  textAlign: 'left',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.02em'
                }}
              >
                {cat.title.split(' (')[0].toUpperCase()}
              </button>
            ))}
          </div>

          {/* Right Column: Methods Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {MATRIX_CATEGORIES.filter(cat => cat.id === activeMatrixCategory).map((cat) => (
              <div key={cat.id}>
                <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{cat.title.toUpperCase()}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0, lineHeight: '1.4' }}>{cat.description}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {cat.methods.map((method, idx) => (
                    <div 
                      key={idx} 
                      className="glass-panel" 
                      style={{ 
                        padding: '1.25rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '10px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: cat.id === 'Vynalth AI Shield' ? 'rgba(0, 102, 204, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(0, 102, 204, 0.3)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <h4 style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 800, margin: 0, lineHeight: '1.3' }}>{method.name.toUpperCase()}</h4>
                        <span 
                          style={{ 
                            fontSize: '9px', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            background: method.power === 'Maximum' ? 'rgba(239, 68, 68, 0.08)' : method.power === 'High' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                            color: method.power === 'Maximum' ? 'var(--danger)' : method.power === 'High' ? 'var(--warning)' : 'var(--success)',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            border: `1px solid ${method.power === 'Maximum' ? 'rgba(239,68,68,0.2)' : method.power === 'High' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`
                          }}
                        >
                          POWER: {method.power.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{method.desc}</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.68rem', color: 'var(--text-dark)', fontWeight: 700, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px', fontFamily: 'var(--font-mono)' }}>
                        DIFFICULTY: {method.difficulty.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Docs & Quick Start Section (Notion clean layouts) */}
      <section id="docs" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>DEVELOPER QUICK START</h2>
          <p style={styles.sectionSubtitle}>
            Embed the client collection SDK and query verification tokens from your backend.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem', width: '100%', maxWidth: '1100px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>
            INTEGRATION WORKFLOW
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', flexWrap: 'wrap' }}>
            {/* Step 1: Frontend */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '0.88rem', color: '#2997ff', margin: '0 0 10px 0', fontWeight: 800 }}>
                1. FRONTEND COLLECTION
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                Load our client-side verification script inside your HTML document header. It silently tracks human biological mechanics to construct cryptographic tokens.
              </p>
              
              <div style={{ background: 'rgba(5, 7, 12, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', overflowX: 'auto', color: '#e2e8f0', flex: 1 }}>
                <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>{"<!-- Load the SDK client -->"}</div>
                <div style={{ color: '#38bdf8' }}>
                  {"<script "}
                  <span style={{ color: '#fbbf24' }}>src</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"https://shield.sleepsomno.com/widget.js"</span>
                  {" async defer></script>"}
                </div>
                <br />
                <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>{"<!-- Form container -->"}</div>
                <div style={{ color: '#38bdf8' }}>
                  {"<form "}
                  <span style={{ color: '#fbbf24' }}>id</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"auth-form"</span>
                  {" "}
                  <span style={{ color: '#fbbf24' }}>action</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"/submit"</span>
                  {" "}
                  <span style={{ color: '#fbbf24' }}>method</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"POST"</span>
                  {">"}
                </div>
                <div style={{ paddingLeft: '1rem', color: '#38bdf8' }}>
                  {"<input "}
                  <span style={{ color: '#fbbf24' }}>type</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"email"</span>
                  {" required />"}
                  <br />
                  {"<!-- Vynalth AI Shield Container -->"}
                  <br />
                  {"<div "}
                  <span style={{ color: '#fbbf24' }}>id</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"Vynalth AI Shield-widget"</span>
                  {" "}
                  <span style={{ color: '#fbbf24' }}>data-sitekey</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"vms_pub_live_79a2b8e3"</span>
                  {"></div>"}
                  <br />
                  {"<button "}
                  <span style={{ color: '#fbbf24' }}>type</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"submit"</span>
                  {">Login Securely</button>"}
                </div>
                <div style={{ color: '#38bdf8' }}>
                  {"</form>"}
                </div>
              </div>
            </div>

            {/* Step 2: Backend */}
            <div>
              <h4 style={{ fontSize: '0.88rem', color: '#2997ff', margin: '0 0 10px 0', fontWeight: 800 }}>
                2. BACKEND AUDIT
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                On submission, the SDK embeds a secure token key <code>vms-shield-token</code>. Query our secure verify API on your backend endpoint to receive risk scores.
              </p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                {['nodejs', 'python', 'go', 'curl'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setDocsTab(lang as any)}
                    style={{
                      padding: '4px 10px',
                      background: docsTab === lang ? 'rgba(0, 102, 204, 0.06)' : 'rgba(255,255,255,0.02)',
                      border: docsTab === lang ? '1px solid rgba(0, 102, 204, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      color: docsTab === lang ? '#2997ff' : 'var(--text-muted)',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div style={{ background: 'rgba(5, 7, 12, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', overflowX: 'auto', color: '#38bdf8', height: '180px' }}>
                {docsTab === 'nodejs' && (
                  <pre style={{ margin: 0 }}>{`// Node.js Express Backend
app.post('/submit', async (req, res) => {
  const token = req.body['vms-shield-token'];
  
  // Call secure verification route
  const verify = await fetch('https://shield.sleepsomno.com/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: 'vms_sec_live_9c0f73b18274d8a21f7c',
      token: token,
      ip: req.ip
    })
  });
  
  const result = await verify.json();
  if (result.success && result.risk_score < 60) {
    res.send("Authentication Successful!");
  } else {
    res.status(403).send("Bot activity blocked.");
  }
});`}</pre>
                )}
                {docsTab === 'python' && (
                  <pre style={{ margin: 0, color: '#34d399' }}>{`# Python Flask verify
import requests

def verify_session(token, client_ip):
    url = "https://shield.sleepsomno.com/api/verify"
    payload = {
        "secret": "vms_sec_live_9c0f73b18274d8a21f7c",
        "token": token,
        "ip": client_ip
    }
    r = requests.post(url, json=payload, timeout=5)
    result = r.json()
    return result.get("success") and result.get("risk_score") < 60`}</pre>
                )}
                {docsTab === 'go' && (
                  <pre style={{ margin: 0, color: '#fbbf24' }}>{`// Golang verify logic
func verifyToken(token string, ip string) bool {
    client := &http.Client{Timeout: 5 * time.Second}
    payload := map[string]string{
        "secret": "vms_sec_live_9c0f73b18274d8a21f7c",
        "token":  token,
        "ip":     ip,
    }
    body, _ := json.Marshal(payload)
    resp, err := client.Post("https://shield.sleepsomno.com/api/verify", "application/json", bytes.NewBuffer(body))
    return riskScore < 60
}`}</pre>
                )}
                {docsTab === 'curl' && (
                  <pre style={{ margin: 0, color: '#f8fafc' }}>{`# Shell verify query
curl -X POST https://shield.sleepsomno.com/api/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "secret": "vms_sec_live_9c0f73b18274d8a21f7c",
    "token": "token_from_client_form",
    "ip": "1.2.3.4"
  }'`}</pre>
                )}
              </div>

              {/* Interactive API Sandbox Simulator */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
                <h5 style={{ fontSize: '0.8rem', color: '#fff', margin: '0 0 8px 0', fontWeight: 800 }}>
                  RESPONSE PLAYGROUND
                </h5>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Risk Score Slider */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Risk Slider:</span>
                        <strong style={{ color: mockRiskScore >= 60 ? 'var(--danger)' : mockRiskScore > 20 ? 'var(--warning)' : 'var(--success)' }}>
                          {mockRiskScore}%
                        </strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={mockRiskScore}
                        onChange={(e) => setMockRiskScore(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#2997ff', cursor: 'pointer' }}
                      />
                    </div>

                    {/* Checkboxes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>SIMULATED MARKERS:</span>
                      
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#fff', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={mockWebdriver}
                          onChange={(e) => setMockWebdriver(e.target.checked)}
                          style={{ accentColor: '#2997ff' }}
                        />
                        <span>WebDriver Flag Active</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#fff', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={mockStraightMouse}
                          onChange={(e) => setMockStraightMouse(e.target.checked)}
                          style={{ accentColor: '#2997ff' }}
                        />
                        <span>Linear Move Detected</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#fff', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={mockSwiftshader}
                          onChange={(e) => setMockSwiftshader(e.target.checked)}
                          style={{ accentColor: '#2997ff' }}
                        />
                        <span>Virtual GPU Flag</span>
                      </label>
                    </div>
                  </div>

                  {/* Simulated JSON Panel */}
                  <div style={{ background: 'rgba(5, 7, 12, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', overflowX: 'auto', maxHeight: '185px' }}>
                    <div style={{ color: 'var(--text-dark)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', marginBottom: '6px', fontSize: '0.62rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>RESPONSE BODY (JSON)</span>
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: '800',
                        background: mockRiskScore >= 60 ? 'rgba(239,68,68,0.08)' : mockRiskScore > 20 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
                        color: mockRiskScore >= 60 ? 'var(--danger)' : mockRiskScore > 20 ? 'var(--warning)' : 'var(--success)',
                        border: `1px solid ${mockRiskScore >= 60 ? 'rgba(239,68,68,0.2)' : mockRiskScore > 20 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`
                      }}>
                        {mockRiskScore >= 60 ? 'BLOCK (403)' : mockRiskScore > 20 ? 'CHALLENGE' : 'ALLOW'}
                      </span>
                    </div>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#2997ff' }}>
                      {JSON.stringify({
                        success: true,
                        timestamp: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
                        risk_score: mockRiskScore,
                        decision: mockRiskScore >= 60 ? 'block' : mockRiskScore > 20 ? 'challenge' : 'allow',
                        details: {
                          device_anomalies: [
                            ...(mockWebdriver ? ['navigator_webdriver_active'] : []),
                            ...(mockSwiftshader ? ['virtualized_gpu_environment'] : [])
                          ],
                          behavior_flags: [
                            ...(mockStraightMouse ? ['perfectly_straight_mouse_trajectory'] : []),
                            ...(mockRiskScore > 40 ? ['sub_500ms_form_submission_speed'] : [])
                          ]
                        }
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Contact Section */}
      <section id="contact" style={{ ...styles.section, marginBottom: '4rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '650px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid rgba(0, 102, 204, 0.25)', background: 'rgba(0,0,0,0.2)' }}>
          <h2 style={{ ...styles.sectionTitle, color: '#f8fafc', letterSpacing: '-0.02em' }}>UPGRADE YOUR SERVICE SECURITY</h2>
          <p style={{ ...styles.sectionSubtitle, maxWidth: '100%' }}>
            Deploy frictionless human verification or contact sales to schedule an enterprise audit.
          </p>
          <div style={{ margin: '1.5rem 0', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onEnterConsole}
              style={{
                padding: '12px 28px',
                background: 'rgba(0, 102, 204, 0.08)',
                border: '1px solid rgba(0, 102, 204, 0.4)',
                borderRadius: '30px',
                color: '#2997ff',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0, 102, 204, 0.15)';
                e.currentTarget.style.borderColor = '#2997ff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0, 102, 204, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(0, 102, 204, 0.4)';
              }}
            >
              GET STARTED
            </button>
            <a 
              href="mailto:sales@sleepsomno.com" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
                borderRadius: '30px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(0, 102, 204, 0.45)',
                transition: 'all 0.3s ease',
                letterSpacing: '0.05em'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              SCHEDULE DEMO
            </a>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            For customized deployment setups, contact sales@sleepsomno.com. Deployments integrate in minutes.
          </p>
        </div>
      </section>

      {/* Legal Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        padding: '3rem 2.5rem 2rem 2.5rem',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
          textAlign: 'left'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.75rem' }}>V</div>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--primary)' }}>Vynalth AI Shield</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              AI-Powered Frictionless Security & Behavioral Verification Gateway. Protecting APIs, portals, and infrastructure from advanced automated threats.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>Legal & Governance</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: 0, margin: 0, fontSize: '0.76rem' }}>
              <li><a href="https://trust.sleepsomno.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a></li>
              <li><a href="https://trust.sleepsomno.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Human Verification Policy ⭐</a></li>
              <li><a href="https://trust.sleepsomno.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Challenge Verification Policy</a></li>
              <li><a href="https://trust.sleepsomno.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>AI Transparency Policy</a></li>
              <li><a href="https://trust.sleepsomno.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Security Policy</a></li>
              <li><a href="https://trust.sleepsomno.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>API Terms</a></li>
              <li><a href="https://trust.sleepsomno.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Responsible AI Policy</a></li>
              <li><a href="https://trust.sleepsomno.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Data Retention Policy</a></li>
              <li><a href="https://trust.sleepsomno.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Vulnerability Disclosure Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>System Subdomains</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: 0, margin: 0, fontSize: '0.76rem' }}>
              <li><a href="https://shield.sleepsomno.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>shield.sleepsomno.com (Gateway)</a></li>
              <li><a href="https://trust.sleepsomno.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>trust.sleepsomno.com (Trust Center)</a></li>
              <li><a href="https://status.sleepsomno.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>status.sleepsomno.com (Live Status)</a></li>
            </ul>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '2rem auto 0 auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <div>© 2026 Vynalth AI Inc. All rights reserved. Vynalth HumanProof™ is a trademark of Vynalth AI Inc.</div>
          <div>Protected by Supabase Vault & Cloudflare Edge Gateway</div>
        </div>
      </footer>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    color: 'var(--text-main)',
    fontFamily: "var(--font-sans)",
    position: 'relative',
    overflowX: 'hidden'
  },
  glowOverlayPurple: {
    display: 'none'
  },
  glowOverlayCyan: {
    display: 'none'
  },
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2.5rem',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    background: '#0a2540',
    color: '#ffffff',
    zIndex: 100
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textAlign: 'left'
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  brandName: {
    fontSize: '0.98rem',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.02em',
    display: 'block',
    lineHeight: 1
  },
  brandSub: {
    fontSize: '0.58rem',
    color: '#00c7b1',
    fontWeight: 800,
    letterSpacing: '0.08em',
    display: 'block',
    marginTop: '3px',
    lineHeight: 1
  },
  topNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.75rem'
  },
  navLink: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.85)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    letterSpacing: '0.05em'
  },
  consoleBtn: {
    background: '#00c7b1',
    border: 'none',
    color: '#ffffff',
    padding: '0.45rem 1.15rem',
    borderRadius: '20px',
    fontSize: '0.72rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    letterSpacing: '0.03em'
  },
  heroSection: {
    position: 'relative',
    padding: '6rem 2rem 4rem 2rem',
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    overflow: 'hidden',
    background: 'var(--bg-primary)'
  },
  heroContent: {
    maxWidth: '850px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    zIndex: 1
  },
  heroBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    padding: '0.4rem 0.85rem',
    borderRadius: '20px',
    fontSize: '0.68rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    letterSpacing: '0.08em'
  },
  heroBadgePulse: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#00c7b1'
  },
  heroTitle: {
    fontSize: '2.8rem',
    fontFamily: "var(--font-sans)",
    fontWeight: 800,
    lineHeight: '1.05',
    letterSpacing: '-0.04em',
    color: 'var(--primary)',
    textTransform: 'uppercase'
  },
  heroSubtitle: {
    fontSize: '0.98rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    maxWidth: '650px',
    fontWeight: 400
  },
  heroCtas: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  },
  primaryCta: {
    background: '#00c7b1',
    border: 'none',
    color: '#ffffff',
    padding: '0.75rem 1.85rem',
    borderRadius: '24px',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    letterSpacing: '0.03em'
  },
  secondaryCta: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '0.75rem 1.85rem',
    borderRadius: '24px',
    fontSize: '0.82rem',
    fontWeight: 700,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    letterSpacing: '0.03em'
  },
  section: {
    padding: '4rem 2.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2.5rem',
    position: 'relative',
    zIndex: 1
  },
  sectionHeader: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxWidth: '600px'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: 'var(--primary)',
    textTransform: 'uppercase'
  },
  sectionSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5'
  },
  gridCard: {
    padding: '2rem',
    background: 'var(--bg-glass)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  widgetWrapper: {
    background: 'var(--bg-glass)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '1.5rem'
  },
  pipelineBox: {
    width: '100%',
    maxWidth: '1100px',
    padding: '2.5rem 1.5rem',
    background: 'var(--bg-glass)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px'
  },
  pipelineNodes: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem'
  },
  nodeCard: {
    flex: 1,
    minWidth: '200px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '1.25rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease'
  },
  nodeCardActive: {
    borderColor: '#00d4aa',
    background: 'var(--secondary-glow)'
  },
  nodeIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)'
  },
  nodeTitle: {
    fontSize: '0.8rem',
    fontWeight: 800,
    color: 'var(--primary)',
    letterSpacing: '-0.01em'
  },
  nodeDesc: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  },
  connectionLine: {
    width: '60px',
    height: '2px',
    background: 'var(--border-color)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  linePulse: {
    position: 'absolute',
    height: '2px',
    width: '0%',
    background: '#00d4aa',
    left: 0,
    transition: 'width 2.5s linear'
  },
  linePulseActive: {
    width: '100%'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
    width: '100%',
    maxWidth: '1100px'
  },
  eyebrow: {
    fontSize: '0.62rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    marginBottom: '4px',
    display: 'block'
  },
  productCard: {
    padding: '1.5rem',
    background: 'var(--bg-glass)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    transition: 'border-color 0.2s ease'
  },
  productTitle: {
    fontSize: '0.98rem',
    fontWeight: 800,
    color: 'var(--primary)',
    letterSpacing: '-0.02em',
    margin: 0
  },
  productDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    margin: 0
  }
};
