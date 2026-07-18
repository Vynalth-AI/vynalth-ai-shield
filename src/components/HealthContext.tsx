import React, { useState } from 'react';

// ──────────────────────────────────────────────────────────────────
// HealthContext.tsx
// Vynalth AI Health Differentiation:
//   - Sleep / wearable context simulator (Oura-style)
//   - Adaptive Trust strictness engine
//   - AI Agent credential trust panel
//   - NeuroShield WAF health-sector rule display
// ──────────────────────────────────────────────────────────────────

interface SleepData {
  date: string;
  score: number;
  rem: number; // hrs
  deep: number; // hrs
  hrv: number; // ms
  restingHr: number; // bpm
  readiness: number;
}

const generateSleepHistory = (): SleepData[] => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const score = 50 + Math.floor(Math.random() * 45);
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      score,
      rem: +(1.2 + Math.random() * 0.8).toFixed(1),
      deep: +(0.8 + Math.random() * 1.2).toFixed(1),
      hrv: Math.round(35 + Math.random() * 45),
      restingHr: Math.round(52 + Math.random() * 16),
      readiness: Math.round(score * 0.9 + Math.random() * 10),
    };
  });
};

const NEURO_RULES = [
  { id: 'r001', name: 'Health Record Scraper Guard', category: 'Data Protection', severity: 'critical', trigger: 'Bulk-read >50 patient records/min', action: 'BLOCK + Alert', enabled: true },
  { id: 'r002', name: 'Fake Registration Burst', category: 'Account Fraud', severity: 'high', trigger: 'Signup velocity >10/min per IP', action: 'CHALLENGE', enabled: true },
  { id: 'r003', name: 'Sleep Score API Abuse', category: 'API Protection', severity: 'high', trigger: 'Wearable data endpoint >200 req/min', action: 'RATE LIMIT', enabled: true },
  { id: 'r004', name: 'AI Prescription Bot', category: 'Abuse', severity: 'critical', trigger: 'Repeated AI prescription queries from bot UA', action: 'BLOCK', enabled: true },
  { id: 'r005', name: 'Telehealth Session Hijack', category: 'Session Security', severity: 'critical', trigger: 'WebRTC session fingerprint mismatch', action: 'TERMINATE', enabled: true },
  { id: 'r006', name: 'HIPAA Audit Trigger', category: 'Compliance', severity: 'medium', trigger: 'Unusual PHI access pattern', action: 'AUDIT + FLAG', enabled: true },
  { id: 'r007', name: 'Oura/Fitbit Token Brute Force', category: 'Credential Attack', severity: 'high', trigger: 'OAuth token replay attack detected', action: 'INVALIDATE + BLOCK', enabled: false },
  { id: 'r008', name: 'Geo-Velocity Travel Anomaly', category: 'Session Security', severity: 'critical', trigger: 'Impossible travel: sub-5min IP jump between Malaysia and international regions', action: 'BLOCK + ALERT', enabled: true },
];

const AI_AGENTS = [
  { id: 'agent-001', name: 'SleepSomno Analysis Engine', provider: 'Vynalth.ai', trustLevel: 'verified', scope: ['read:sleep', 'read:hrv', 'write:insights'], lastSeen: '2 min ago', requestsToday: 1_842 },
  { id: 'agent-002', name: 'NeuroShield Threat Classifier', provider: 'Vynalth AI Shield.io', trustLevel: 'verified', scope: ['read:threat_intel', 'write:block_rules'], lastSeen: '12 min ago', requestsToday: 4_120 },
  { id: 'agent-003', name: 'Health Coach GPT-4o', provider: 'openai.com', trustLevel: 'provisional', scope: ['read:sleep', 'read:activity'], lastSeen: '1 hr ago', requestsToday: 345 },
  { id: 'agent-004', name: 'Unknown Scraper Bot', provider: 'unregistered', trustLevel: 'blocked', scope: [], lastSeen: '3 hrs ago', requestsToday: 8_903 },
];

export const HealthContext: React.FC = () => {
  const [sleepHistory] = useState<SleepData[]>(generateSleepHistory);
  const [selectedDay, setSelectedDay] = useState(6); // latest
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [ruleToggles, setRuleToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(NEURO_RULES.map(r => [r.id, r.enabled]))
  );
  const [activeSection, setActiveSection] = useState<'sleep' | 'waf' | 'agents'>('sleep');

  const today = sleepHistory[selectedDay];
  const avgScore = Math.round(sleepHistory.reduce((a, d) => a + d.score, 0) / sleepHistory.length);

  // Derive adaptive strictness from sleep score
  const computeStrictness = (score: number): { label: string; level: number; color: string; desc: string } => {
    if (score >= 80) return { label: 'RELAXED', level: 1, color: '#10b981', desc: 'Good sleep detected — reduced friction, streamlined auth flows.' };
    if (score >= 60) return { label: 'STANDARD', level: 2, color: '#38bdf8', desc: 'Normal sleep — standard verification challenge threshold.' };
    if (score >= 40) return { label: 'ELEVATED', level: 3, color: '#f59e0b', desc: 'Sleep deficit — extra verification step for sensitive actions.' };
    return { label: 'HIGH FRICTION', level: 4, color: '#ef4444', desc: 'Severe fatigue risk — biometric step required, password auth blocked.' };
  };

  const strictness = computeStrictness(adaptiveMode ? today.score : 70);

  const severityColor = (s: string) =>
    s === 'critical' ? '#ef4444' : s === 'high' ? '#f59e0b' : s === 'medium' ? '#38bdf8' : '#10b981';

  const trustColor = (t: string) =>
    t === 'verified' ? '#10b981' : t === 'provisional' ? '#f59e0b' : '#ef4444';

  const sections = [
    { id: 'sleep', label: '💤 Sleep Context', color: '#818cf8' },
    { id: 'waf', label: '🛡️ NeuroShield WAF', color: '#ef4444' },
    { id: 'agents', label: '🤖 AI Agent Trust', color: '#38bdf8' },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', margin: 0 }} className="gradient-text">
          Vynalth Health Context Engine
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>
          The world's first health-aware identity verification layer — adapts security friction to your biometric readiness state.
        </p>
      </div>

      {/* Section Nav */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            padding: '0.5rem 1rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, transition: 'all 0.2s',
            background: activeSection === s.id ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: activeSection === s.id ? s.color : 'var(--text-muted)',
            borderBottom: activeSection === s.id ? `2px solid ${s.color}` : '2px solid transparent',
          }}>{s.label}</button>
        ))}
      </div>

      {/* ── Sleep Context ── */}
      {activeSection === 'sleep' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 7-day sleep bar chart */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>7-Day Sleep History (Oura Ring Sim)</p>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>7-day avg: <strong style={{ color: '#f1f5f9' }}>{avgScore}</strong></p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Adaptive Mode</span>
                <button onClick={() => setAdaptiveMode(m => !m)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: adaptiveMode ? '#818cf8' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.25s' }}>
                  <span style={{ position: 'absolute', top: 3, left: adaptiveMode ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', display: 'block' }} />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
              {sleepHistory.map((day, i) => {
                const h = (day.score / 100) * 100;
                const isSelected = i === selectedDay;
                const col = day.score >= 80 ? '#10b981' : day.score >= 60 ? '#818cf8' : day.score >= 40 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={i} onClick={() => setSelectedDay(i)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    <div style={{ width: '100%', height: h, background: isSelected ? col : `${col}55`, borderRadius: '4px 4px 0 0', transition: 'all 0.3s', border: isSelected ? `1px solid ${col}` : 'none' }} />
                    <span style={{ fontSize: '0.62rem', color: isSelected ? '#f1f5f9' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{day.date.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected day detail */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <p style={{ margin: '0 0 1rem', fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {today.date} — Sleep Metrics
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { label: 'Sleep Score', value: today.score, unit: '/100', color: today.score >= 80 ? '#10b981' : today.score >= 60 ? '#818cf8' : '#f59e0b' },
                  { label: 'Readiness', value: today.readiness, unit: '/100', color: '#38bdf8' },
                  { label: 'REM Sleep', value: today.rem, unit: ' hrs', color: '#a78bfa' },
                  { label: 'Deep Sleep', value: today.deep, unit: ' hrs', color: '#60a5fa' },
                  { label: 'HRV', value: today.hrv, unit: ' ms', color: '#f472b6' },
                  { label: 'Resting HR', value: today.restingHr, unit: ' bpm', color: '#fb7185' },
                ].map(({ label, value, unit, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}{unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Adaptive Strictness output */}
            <div className="glass-panel" style={{ padding: '1.5rem', border: `1px solid ${strictness.color}33` }}>
              <p style={{ margin: '0 0 1rem', fontSize: '0.7rem', fontWeight: 700, color: strictness.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Adaptive Trust Strictness</p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1rem 0' }}>
                {/* Level indicator bars */}
                <div style={{ display: 'flex', gap: 4, width: '100%' }}>
                  {[1,2,3,4].map(l => (
                    <div key={l} style={{ flex: 1, height: 8, borderRadius: 4, background: l <= strictness.level ? strictness.color : 'rgba(255,255,255,0.08)', transition: 'background 0.4s' }} />
                  ))}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: strictness.color }}>{strictness.label}</div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>{strictness.desc}</p>
              </div>
              <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '0.75rem' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>AUTO-APPLIED RULES</p>
                {[
                  strictness.level >= 2 && 'Standard behavioral challenge on login',
                  strictness.level >= 3 && 'Step-up MFA for sensitive actions',
                  strictness.level >= 4 && 'Password auth disabled — biometrics required',
                  strictness.level === 1 && '✓ Frictionless pass-through enabled',
                ].filter(Boolean).map((rule, i) => (
                  <div key={i} style={{ fontSize: '0.75rem', color: '#f1f5f9', padding: '0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: strictness.color }}>•</span> {rule}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NeuroShield WAF ── */}
      {activeSection === 'waf' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.75rem 1rem' }}>
            <span>🛡️</span>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#fca5a5', lineHeight: 1.5 }}>
              <strong>NeuroShield WAF</strong> — AI-powered rules designed specifically for health data platforms. Protects PHI, prevents medical record scraping, and stops AI prescription bots.
            </p>
          </div>
          {NEURO_RULES.map(rule => (
            <div key={rule.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: ruleToggles[rule.id] ? 1 : 0.5 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9' }}>{rule.name}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4, background: `${severityColor(rule.severity)}20`, color: severityColor(rule.severity) }}>
                    {rule.severity.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.4rem', borderRadius: 3 }}>{rule.category}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Trigger: <span style={{ color: '#f1f5f9' }}>{rule.trigger}</span> → Action: <span style={{ color: '#ef4444', fontWeight: 700 }}>{rule.action}</span>
                </div>
              </div>
              <button onClick={() => setRuleToggles(prev => ({ ...prev, [rule.id]: !prev[rule.id] }))}
                style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: ruleToggles[rule.id] ? '#10b981' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
                <span style={{ position: 'absolute', top: 3, left: ruleToggles[rule.id] ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', display: 'block' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── AI Agent Trust ── */}
      {activeSection === 'agents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 8, padding: '0.75rem 1rem' }}>
            <span>🤖</span>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#7dd3fc', lineHeight: 1.5 }}>
              <strong>AI Agent Identity Layer</strong> — Vynalth AI Shield verifies that AI agents calling your health APIs have valid credentials, declared scopes, and human oversight. Unregistered agents are auto-blocked.
            </p>
          </div>
          {AI_AGENTS.map(agent => (
            <div key={agent.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>{agent.name}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4, background: `${trustColor(agent.trustLevel)}20`, color: trustColor(agent.trustLevel) }}>
                    {agent.trustLevel.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Provider: {agent.provider} · Last seen: {agent.lastSeen} · {agent.requestsToday.toLocaleString()} req today</div>
                {agent.scope.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {agent.scope.map(s => (
                      <span key={s} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', borderRadius: 4, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                {agent.trustLevel === 'blocked' ? (
                  <span style={{ padding: '0.4rem 0.75rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>🚫 BLOCKED</span>
                ) : agent.trustLevel === 'provisional' ? (
                  <span style={{ padding: '0.4rem 0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>⚠ PROVISIONAL</span>
                ) : (
                  <span style={{ padding: '0.4rem 0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>✓ TRUSTED</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
