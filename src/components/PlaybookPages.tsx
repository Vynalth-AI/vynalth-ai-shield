import React, { useState } from 'react';




interface PlaybookPagesProps {
  currentPath: string;
  onBack: () => void;
}

export const PlaybookPages: React.FC<PlaybookPagesProps> = ({ currentPath, onBack }) => {
  const [slideTrigger, setSlideTrigger] = useState(false);
  const [bounceTrigger, setBounceTrigger] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState<string>('Select an audio cue below to synthesize...');

  // Check if visitor is eligible (Singapore/Malaysia locale now, fully open to the world in August 2026 MYT)
  const isEligibleMYSG = () => {
    try {
      // Dynamic time gating in Malaysia Time (GMT+8)
      const d = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric',
        month: 'numeric'
      });
      const parts = formatter.formatToParts(d);
      const year = parseInt(parts.find(p => p.type === 'year')?.value || '2026', 10);
      const month = parseInt(parts.find(p => p.type === 'month')?.value || '7', 10); // 1-indexed (1-12)

      if (year > 2026 || (year === 2026 && month >= 8)) {
        return true; // Auto-open globally starting August 2026 MYT
      }

      // Restrict to Malaysia (MY) or Singapore (SG) in July 2026
      const offset = d.getTimezoneOffset(); // -480 for GMT+8 (Malaysia and Singapore)
      const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
      const browserLangs = (navigator.languages || [navigator.language]).map(l => l.toLowerCase());
      
      const hasMYSGLang = browserLangs.some(l => 
        l.includes('my') || 
        l.includes('sg') || 
        l.startsWith('ms')
      );

      const hasMYSGTz = tz.includes('kuala_lumpur') || 
                        tz.includes('singapore') || 
                        tz.includes('kuching') || 
                        tz.includes('malaysia');

      const isGMT8 = offset === -480;

      return hasMYSGLang || hasMYSGTz || isGMT8;
    } catch {
      return false;
    }
  };


  const allowedRegion = isEligibleMYSG();

  // localStorage-persisted sound mute toggle state
  const [isMuted, setIsMuted] = useState(() => {
    if (!allowedRegion) return true; // Force muted/disabled for other countries
    try {
      const cached = localStorage.getItem('vms-widget-muted');
      return cached !== null ? cached === 'true' : true; // Default to true (muted by default)
    } catch {
      return true;
    }
  });

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    try {
      localStorage.setItem('vms-widget-muted', String(nextMute));
    } catch {}
    if (!nextMute) {
      synthesizeTone('success', true);
    }
  };


  // Web Audio Synthesis Engine (Sine/Triangle oscillators mapped to ENVELOPE filters)
  const synthesizeTone = (type: 'success' | 'error' | 'click', force = false) => {
    if (!allowedRegion) {
      setAudioFeedback('Audio synthesis is locked for your region until August 2026 (Malaysia Time GMT+8).');
      return;
    }
    if (!force && isMuted) {
      setAudioFeedback('Audio output is currently muted. Please unmute using the control switch in the top header bar.');
      return;
    }
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;

      if (!AudioCtx) {
        setAudioFeedback('Web Audio API not supported in this browser.');
        return;
      }
      
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'success') {
        setAudioFeedback('Synthesizing Double Tone Success Chime (C5 -> E5, decay 180ms)...');
        
        // Primary oscillator (C5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        // Harmony oscillator (E5) after 60ms delay
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.06);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.setValueAtTime(0.12, now + 0.06);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.2);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.25);
      } else if (type === 'error') {
        setAudioFeedback('Synthesizing Low frequency Warning Sweep (Triangle wave A2 -> D2, decay 250ms)...');
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110.00, now); // A2
        osc.frequency.linearRampToValueAtTime(73.42, now + 0.2); // D2
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'click') {
        setAudioFeedback('Synthesizing High-Pass Transient Click Feedback (2000Hz sine burst, 18ms)...');
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000.00, now);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.02);
      }
    } catch (e: any) {
      setAudioFeedback(`Audio Synthesis failed: ${e.message}`);
    }
  };

  const cleanPath = currentPath.toLowerCase().replace(/^\//, '');

  const renderContent = () => {
    switch (cleanPath) {
      case 'emilkowal-animations':
        return (
          <div>
            <h2 style={styles.title}>Emil Kowalski's Easing & spring Playbook</h2>
            <p style={styles.desc}>
              Demonstrating asymmetric timings, iOS sheet gesture-friction dynamics, and micro-press scales. Fast UI timings should remain under 300ms.
            </p>
            
            {/* Easing comparison box */}
            <div className="glass-panel" style={styles.panel}>
              <h3 style={styles.sectionTitle}>Curve Competing SandBox</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                Press "Trigger Race" to compare standard linear transitions against the custom `cubic-bezier(0.32, 0.72, 0, 1)` spring curves.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', marginBottom: '1.5rem' }}>
                {/* Curve 1 */}
                <div style={styles.track}>
                  <span style={styles.trackLabel}>Custom Spring: cubic-bezier(0.32, 0.72, 0, 1)</span>
                  <div style={{
                    ...styles.runner,
                    background: '#8b5cf6',
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)',
                    transition: slideTrigger ? 'transform 380ms cubic-bezier(0.32, 0.72, 0, 1)' : 'transform 0s',
                    transform: slideTrigger ? 'translateX(calc(100% - 24px))' : 'translateX(0)'
                  }} />
                </div>
                {/* Curve 2 */}
                <div style={styles.track}>
                  <span style={styles.trackLabel}>Standard CSS: ease-out</span>
                  <div style={{
                    ...styles.runner,
                    background: '#22d3ee',
                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)',
                    transition: slideTrigger ? 'transform 380ms ease-out' : 'transform 0s',
                    transform: slideTrigger ? 'translateX(calc(100% - 24px))' : 'translateX(0)'
                  }} />
                </div>
                {/* Curve 3 */}
                <div style={styles.track}>
                  <span style={styles.trackLabel}>Linear</span>
                  <div style={{
                    ...styles.runner,
                    background: '#64748b',
                    transition: slideTrigger ? 'transform 380ms linear' : 'transform 0s',
                    transform: slideTrigger ? 'translateX(calc(100% - 24px))' : 'translateX(0)'
                  }} />
                </div>
              </div>
              <button 
                onClick={() => setSlideTrigger(!slideTrigger)}
                style={styles.actionBtn}
              >
                {slideTrigger ? 'Reset Sandbox' : 'Trigger Race'}
              </button>
            </div>

            {/* Scale interactive card */}
            <div className="glass-panel" style={styles.panel}>
              <h3 style={styles.sectionTitle}>Press Feedback Bounds</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                Rule 61: Scale buttons to `scale(0.97)` on active click, utilizing `will-change: transform` to prevent layout re-renders. Try pressing the block.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
                <button
                  style={styles.pressBlock}
                  onMouseDown={() => synthesizeTone('click')}
                >
                  PRESS ME
                </button>
              </div>
            </div>
          </div>
        );

      case 'generating-sounds-with-ai':
        return (
          <div>
            <h2 style={styles.title}>AI Sound Selection & Procedural Synthesis</h2>
            <p style={styles.desc}>
              Web Audio synthesis rules. Generate clean notify prompts using basic waveforms (sine/triangle) and envelope controls to maintain UX audio compliance.
            </p>

            <div className="glass-panel" style={styles.panel}>
              <h3 style={styles.sectionTitle}>Procedural Audio console</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                Click below to synthesize real-time, zero-asset UI feedback sounds designed around digital audio guidelines.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <button onClick={() => synthesizeTone('success')} style={{ ...styles.actionBtn, background: '#10b981' }}>
                  Play Success Chime
                </button>
                <button onClick={() => synthesizeTone('error')} style={{ ...styles.actionBtn, background: '#ef4444' }}>
                  Play Warning Sweep
                </button>
                <button onClick={() => synthesizeTone('click')} style={{ ...styles.actionBtn, background: '#64748b' }}>
                  Play Pointer Click
                </button>
              </div>

              {/* Audio terminal monitor */}
              <div style={styles.terminal}>
                <span style={{ color: '#22d3ee', marginRight: '6px' }}>&gt;</span>
                <span>{audioFeedback}</span>
              </div>
            </div>
          </div>
        );

      case '12-principles-of-animation':
        return (
          <div>
            <h2 style={styles.title}>Disney's 12 Principles of Web Animation</h2>
            <p style={styles.desc}>
              Adapting classic animation metrics for digital layout changes. Squash & Stretch, Anticipation, and follow-through behaviors.
            </p>

            <div className="glass-panel" style={styles.panel}>
              <h3 style={styles.sectionTitle}>Squash and Stretch Sandbox</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                Toggle bounce to observe natural squash/stretch deformation ratios. Notice how the height collapses and width widens at the impact threshold.
              </p>
              
              <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative', marginBottom: '1.5rem', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                <div 
                  className={bounceTrigger ? 'squash-ball' : ''}
                  style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)',
                    boxShadow: '0 0 15px rgba(167, 139, 250, 0.4)',
                    position: 'absolute',
                    animation: bounceTrigger ? 'bounce-squash 1.6s infinite ease-in-out' : 'none',
                    bottom: bounceTrigger ? '0px' : '150px'
                  }}
                />
              </div>

              {/* Inject keyframes locally for Squash & Stretch */}
              <style>{`
                @keyframes bounce-squash {
                  0%, 100% {
                    transform: translateY(-130px) scale(1.0, 1.0);
                  }
                  45% {
                    transform: translateY(0px) scale(1.0, 1.0);
                  }
                  50% {
                    transform: translateY(0px) scale(1.2, 0.7); /* Squashed on floor */
                  }
                  55% {
                    transform: translateY(0px) scale(0.9, 1.15); /* Stretched as it leaves */
                  }
                  70% {
                    transform: translateY(-80px) scale(1.0, 1.0);
                  }
                }
              `}</style>

              <button 
                onClick={() => setBounceTrigger(!bounceTrigger)}
                style={styles.actionBtn}
              >
                {bounceTrigger ? 'Halt Ball' : 'Bounce Ball'}
              </button>
            </div>
          </div>
        );

      case 'web-design-guidelines':
        return (
          <div>
            <h2 style={styles.title}>Web Interface & Aesthetic Guidelines</h2>
            <p style={styles.desc}>
              Checking compliance with Vercel and Apple guidelines: contrast levels, visual hierarchy, and focus state indicators.
            </p>

            <div className="glass-panel" style={styles.panel}>
              <h3 style={styles.sectionTitle}>Compliance checklist</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                Ensure your current application complies with these visual design principles:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Minimum Contrast Ratio 4.5:1 for body copy', desc: 'Ensures text readability across all background conditions.' },
                  { label: 'Focus Rings utilizing :focus-visible', desc: 'Allows keyboard navigators to clearly identify focused items without cluttering mouse clicks.' },
                  { label: 'Smooth scale(0.97) feedback for active press state', desc: 'Guarantees that user actions receive immediate physical feedback.' },
                  { label: 'Asymmetric spring transition paths for sliders & modals', desc: 'Simulates physics models with friction dampening.' }
                ].map((item, idx) => (
                  <div key={idx} style={styles.checkRow}>
                    <input type="checkbox" defaultChecked style={styles.checkbox} />
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', display: 'block' }}>{item.label}</span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'sounds-on-the-web':
        return (
          <div>
            <h2 style={styles.title}>Sounds on the Web: Audio UX & Accessibility</h2>
            <p style={styles.desc}>
              Best practices for applying micro-tones in web apps. Accessibility guidelines dictate sound must always be supplementary.
            </p>

            <div className="glass-panel" style={styles.panel}>
              <h3 style={styles.sectionTitle}>Audio UX Audits</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Supplement, Don\'t Replace', desc: 'Important notifications must have visual descriptions. Sound cannot be the sole conveyor of information.' },
                  { label: 'Global Mute Controls', desc: 'Provide a single switch to disable all system interface tones immediately.' },
                  { label: 'Frequency Separation', desc: 'Success chimes must use high, pleasant frequencies; blockade warnings must sweeps down low.' },
                  { label: 'Sub-30ms Latency', desc: 'Tones must play within 30ms of interaction to avoid feeling decoupled from clicks.' }
                ].map((item, idx) => (
                  <div key={idx} style={styles.checkRow}>
                    <input type="checkbox" defaultChecked style={styles.checkbox} />
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', display: 'block' }}>{item.label}</span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <h2 style={styles.title}>Playbook Not Found</h2>
            <p style={styles.desc}>Please return to home or verify the pathname.</p>
          </div>
        );
    }
  };

  return (
    <div style={styles.container}>
      {/* Brand Header */}
      <div style={styles.headerBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {/* Double Logo */}
            <div style={styles.logoWrapper}>
              <img src="/brand-logo-new.png" alt="SomnoAI Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 800 }}>✕</span>
            <div style={styles.logoWrapperShield}>
              <img src="/logo.jpg" alt="VitaShield Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            </div>
          </div>
          <div>
            <h1 style={styles.brandTitle}>sleepsomno.com</h1>
            <p style={styles.brandSubtitle}>UI Design & Animation Playbook</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {allowedRegion && (
            <button
              onClick={toggleMute}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: isMuted ? '#64748b' : '#00ffff',
                borderRadius: '6px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              title={isMuted ? "Unmute playbook sounds" : "Mute playbook sounds"}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v6a3 3 0 0 0 3 3h1.586l4.707 4.707A1 1 0 0 0 20 22V4a1 1 0 0 0-1.707-.707L13.586 8H12a3 3 0 0 0-3 3z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>
          )}
          <button onClick={onBack} style={styles.backBtn}>
            ← Back to Gateway
          </button>
        </div>

      </div>

      {/* Main layout grid */}
      <div style={styles.layoutGrid}>
        {/* Navigation Sidebar */}
        <div className="glass-panel" style={styles.sidebar}>
          <h4 style={styles.sidebarTitle}>Interactive Guides</h4>
          <ul style={styles.navList}>
            {[
              { path: 'emilkowal-animations', label: 'Emil Kowal Timings' },
              { path: 'generating-sounds-with-ai', label: 'Sound Selection (Web Audio)' },
              { path: '12-principles-of-animation', label: '12 Animation Principles' },
              { path: 'web-design-guidelines', label: 'Web design guidelines' },
              { path: 'sounds-on-the-web', label: 'Sounds on the Web UX' }
            ].map((item) => (
              <li key={item.path}>
                <a 
                  href={`/${item.path}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', `/${item.path}`);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  style={{
                    ...styles.navLink,
                    color: cleanPath === item.path ? '#00ffff' : '#94a3b8',
                    background: cleanPath === item.path ? 'rgba(6, 182, 212, 0.05)' : 'transparent',
                    borderColor: cleanPath === item.path ? 'rgba(6, 182, 212, 0.2)' : 'transparent'
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic content viewport */}
        <div style={styles.content}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '3rem auto',
    padding: '0 1.5rem',
    color: '#f8fafc',
    fontFamily: 'system-ui, sans-serif'
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '1.5rem',
    marginBottom: '2rem'
  },
  logoWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0b',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  logoWrapperShield: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(6, 182, 212, 0.08)',
    border: '1px solid rgba(6, 182, 212, 0.2)'
  },
  brandTitle: {
    fontSize: '1rem',
    fontWeight: 800,
    color: '#f8fafc',
    margin: 0,
    lineHeight: 1.2
  },
  brandSubtitle: {
    fontSize: '0.72rem',
    color: '#64748b',
    margin: 0
  },
  backBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#f8fafc',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontWeight: 700,
    transition: 'all 0.2s ease'
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '2rem'
  },
  sidebar: {
    padding: '1.25rem',
    background: 'rgba(255, 255, 255, 0.01)',
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
    height: 'fit-content'
  },
  sidebarTitle: {
    fontSize: '0.75rem',
    fontWeight: 800,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '1rem',
    marginTop: 0
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  navLink: {
    display: 'block',
    padding: '0.62rem 0.88rem',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: 700,
    textDecoration: 'none',
    border: '1px solid transparent',
    transition: 'all 0.18s ease'
  },
  content: {
    minHeight: '400px'
  },
  title: {
    fontSize: '1.62rem',
    fontWeight: 800,
    color: '#f8fafc',
    margin: '0 0 0.5rem 0'
  },
  desc: {
    fontSize: '0.88rem',
    color: '#94a3b8',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
    marginTop: 0
  },
  panel: {
    padding: '1.5rem',
    marginBottom: '1.5rem',
    background: 'rgba(0, 0, 0, 0.15)',
    borderColor: 'rgba(255,255,255,0.04)'
  },
  sectionTitle: {
    fontSize: '0.94rem',
    fontWeight: 800,
    color: '#f8fafc',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase',
    letterSpacing: '0.02em'
  },
  track: {
    height: '38px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '8px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px'
  },
  trackLabel: {
    position: 'absolute',
    left: '12px',
    fontSize: '0.68rem',
    color: '#94a3b8',
    fontWeight: 600,
    pointerEvents: 'none'
  },
  runner: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    position: 'relative',
    zIndex: 2
  },
  actionBtn: {
    padding: '0.62rem 1.25rem',
    border: 'none',
    borderRadius: '6px',
    color: '#ffffff',
    background: '#8b5cf6',
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.25)',
    fontWeight: 700,
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  pressBlock: {
    width: '140px',
    height: '60px',
    borderRadius: '12px',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    background: 'rgba(139, 92, 246, 0.05)',
    boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
    fontSize: '0.88rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'transform 120ms cubic-bezier(0.32, 0.72, 0, 1)',
    willChange: 'transform',
    outline: 'none'
  },
  terminal: {
    padding: '0.88rem 1.25rem',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: '#34d399',
    display: 'flex',
    alignItems: 'center'
  },
  checkRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '8px'
  },
  checkbox: {
    marginTop: '0.15rem',
    cursor: 'pointer',
    accentColor: '#00ffff'
  }
};
