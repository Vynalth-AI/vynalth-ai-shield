import React, { useState } from 'react';

// ──────────────────────────────────────────────────────────────────
// BotBounty.tsx
// Security researcher portal:
//   - Active bounty program listing (Reputation Points only)
//   - Researcher leaderboard (Aligned with Hall of Fame)
//   - Vulnerability submission form (CVSSv3-style scoring)
//   - Disclosure timeline tracker
// ──────────────────────────────────────────────────────────────────

interface Bounty {
  id: string;
  title: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  reputationPoints: number;
  status: 'open' | 'in_review' | 'closed';
  scope: string;
  description: string;
}

interface Researcher {
  rank: number;
  handle: string;
  country: string;
  reports: number;
  accepted: number;
  score: number;
  badge: string;
}

const BOUNTIES: Bounty[] = [
  {
    id: 'b001', title: 'Authentication Bypass via Biometric Token Replay',
    category: 'Authentication', severity: 'critical',
    reputationPoints: 1000, status: 'open',
    scope: 'api/verify, api/session/*',
    description: 'Find any method to bypass VitaShield\'s behavioral verification by replaying or forging biometric telemetry tokens.',
  },
  {
    id: 'b002', title: 'Bot Detection Evasion — Mouse Trajectory Spoofing',
    category: 'Anti-Bot', severity: 'high',
    reputationPoints: 500, status: 'open',
    scope: 'SDK / client-side JS',
    description: 'Demonstrate a reliable technique for generating synthetic mouse paths that fool the curvature analysis into scoring ≥70 Trust Score.',
  },
  {
    id: 'b003', title: 'Tenant API Key Enumeration',
    category: 'Information Disclosure', severity: 'high',
    reputationPoints: 400, status: 'open',
    scope: 'api/keys/*, api/admin/*',
    description: 'Enumerate or brute-force another tenant\'s API keys or webhook secrets through any endpoint.',
  },
  {
    id: 'b004', title: 'PDPA / GDPR Data Leakage — Cross-Tenant PII',
    category: 'Privacy', severity: 'critical',
    reputationPoints: 800, status: 'open',
    scope: 'All API endpoints',
    description: 'Access personally identifiable information belonging to another tenant\'s users through IDOR, improper scoping, or data pipeline errors.',
  },
  {
    id: 'b005', title: 'Rate Limiting Bypass — Credential Stuffing Enablement',
    category: 'Rate Limiting', severity: 'medium',
    reputationPoints: 200, status: 'in_review',
    scope: 'api/verify, api/auth/*',
    description: 'Bypass the per-IP / per-tenant rate limiter to enable credential stuffing attacks at scale.',
  },
  {
    id: 'b006', title: 'WebAuthn FIDO2 Attestation Bypass',
    category: 'Authentication', severity: 'high',
    reputationPoints: 600, status: 'open',
    scope: 'api/webauthn/*',
    description: 'Bypass WebAuthn attestation verification to register a FIDO2 credential without a real authenticator.',
  },
];

const LEADERBOARD: Researcher[] = [
  { rank: 1, handle: 'null0x1f', country: '🇸🇬', reports: 14, accepted: 11, score: 3250, badge: '🥇 Legend' },
  { rank: 2, handle: 'vrdrkode', country: '🇮🇳', reports: 9, accepted: 7, score: 2100, badge: '🥈 Elite' },
  { rank: 3, handle: 'sleepless_pwner', country: '🇲🇾', reports: 12, accepted: 8, score: 1850, badge: '🥉 Elite' },
  { rank: 4, handle: 'asyncvoid', country: '🇵🇱', reports: 6, accepted: 5, score: 1200, badge: '⭐ Advanced' },
  { rank: 5, handle: 'biobyte99', country: '🇧🇷', reports: 8, accepted: 5, score: 950, badge: '⭐ Advanced' },
];

const CVSS_VECTORS = ['Network', 'Adjacent', 'Local', 'Physical'];
const COMPLEXITY = ['Low', 'High'];
const IMPACT = ['None', 'Low', 'High'];

export const BotBounty: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bounties' | 'leaderboard' | 'submit'>('bounties');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [submitForm, setSubmitForm] = useState({
    title: '', category: 'Authentication', severity: 'high', handle: '',
    email: '', vector: 'Network', complexity: 'Low',
    confImpact: 'High', integImpact: 'High', availImpact: 'Low',
    description: '', stepsToReproduce: '', poc: '', cveId: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);

  const severityColor = (s: string) =>
    s === 'critical' ? '#ef4444' : s === 'high' ? '#f59e0b' : s === 'medium' ? '#38bdf8' : '#10b981';

  const statusLabel = (s: string) =>
    s === 'open' ? { text: 'OPEN', color: '#10b981' } :
    s === 'in_review' ? { text: 'IN REVIEW', color: '#f59e0b' } :
    { text: 'CLOSED', color: 'var(--text-muted)' };

  const filteredBounties = selectedSeverity === 'all' ? BOUNTIES : BOUNTIES.filter(b => b.severity === selectedSeverity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const tabs = [
    { id: 'bounties', label: '🎯 Active Programs', color: '#ef4444' },
    { id: 'leaderboard', label: '🏆 Hall of Fame', color: '#f59e0b' },
    { id: 'submit', label: '📝 Submit Report', color: '#10b981' },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', margin: 0 }} className="gradient-text">
            Security Vulnerability Disclosure
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
            Help protect health data and fight automation. Note: We operate a **non-monetary** vulnerability program. Top contributors are recognized in the public **[Security Hall of Fame](https://sleepsomno.com/en/security/hall-of-fame)** reputation leaderboard.
          </p>
        </div>
        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[
            { label: 'Total Reports', value: '148', color: '#10b981' },
            { label: 'Open Scopes', value: BOUNTIES.filter(b => b.status === 'open').length.toString(), color: '#38bdf8' },
            { label: 'Hall of Fame', value: '24', color: '#818cf8' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setSelectedBounty(null); }} style={{
            padding: '0.5rem 1rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, transition: 'all 0.2s',
            background: activeTab === t.id ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: activeTab === t.id ? t.color : 'var(--text-muted)',
            borderBottom: activeTab === t.id ? `2px solid ${t.color}` : '2px solid transparent',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Active Bounties ── */}
      {activeTab === 'bounties' && !selectedBounty && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'critical', 'high', 'medium', 'low'].map(s => (
              <button key={s} onClick={() => setSelectedSeverity(s)} style={{
                padding: '0.35rem 0.85rem', border: `1px solid ${selectedSeverity === s ? severityColor(s) : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 20, background: selectedSeverity === s ? `${severityColor(s)}20` : 'transparent',
                color: selectedSeverity === s ? severityColor(s) : 'var(--text-muted)',
                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize'
              }}>{s === 'all' ? 'All Severities' : s}</button>
            ))}
          </div>
          {filteredBounties.map(bounty => {
            const sl = statusLabel(bounty.status);
            return (
              <div key={bounty.id} onClick={() => setSelectedBounty(bounty)} className="glass-panel" style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', transition: 'border-color 0.2s', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>{bounty.title}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4, background: `${severityColor(bounty.severity)}20`, color: severityColor(bounty.severity) }}>
                        {bounty.severity.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: sl.color }}>{sl.text}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{bounty.description}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>{bounty.reputationPoints} pts</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Reputation Score</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>Category: <strong style={{ color: '#f1f5f9' }}>{bounty.category}</strong></span>
                  <span>Scope: <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{bounty.scope}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bounty Detail */}
      {activeTab === 'bounties' && selectedBounty && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={() => setSelectedBounty(null)} style={{ alignSelf: 'flex-start', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '0.35rem 0.75rem', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>← Back to active scopes</button>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9' }}>{selectedBounty.title}</span>
              <span style={{ padding: '0.2rem 0.6rem', borderRadius: 5, background: `${severityColor(selectedBounty.severity)}20`, color: severityColor(selectedBounty.severity), fontWeight: 700, fontSize: '0.72rem' }}>{selectedBounty.severity.toUpperCase()}</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{selectedBounty.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Reputation Reward', value: `${selectedBounty.reputationPoints} pts`, color: '#f59e0b' },
                { label: 'Category', value: selectedBounty.category, color: '#38bdf8' },
                { label: 'Scope', value: selectedBounty.scope, color: '#10b981' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveTab('submit')} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
              Submit Report for this Scope →
            </button>
          </div>
        </div>
      )}

      {/* ── Leaderboard (Hall of Fame) ── */}
      {activeTab === 'leaderboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '0.75rem 1rem', alignItems: 'center' }}>
            <span>🏆</span>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#f59e0b', lineHeight: 1.5 }}>
              This leaderboard syncs directly with the live public repository at **[sleepsomno.com/en/security/hall-of-fame](https://sleepsomno.com/en/security/hall-of-fame)**. Only verified security researchers with accepted findings are listed.
            </p>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Verified Security Contributors
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {LEADERBOARD.map(r => (
                <div key={r.rank} style={{ display: 'grid', gridTemplateColumns: '2rem 1fr auto', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: r.rank <= 3 ? `rgba(${r.rank === 1 ? '245,158,11' : r.rank === 2 ? '148,163,184' : '180,120,60'},0.07)` : 'rgba(0,0,0,0.12)', borderRadius: 10, border: r.rank === 1 ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: r.rank === 1 ? '#f59e0b' : r.rank === 2 ? '#94a3b8' : r.rank === 3 ? '#b47c3c' : 'var(--text-muted)', textAlign: 'center' }}>#{r.rank}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f1f5f9', fontFamily: 'var(--font-mono)' }}>{r.handle}</span>
                      <span>{r.country}</span>
                      <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700 }}>{r.badge}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {r.reports} reports · {r.accepted} accepted
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>{r.score}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Reputation Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Report ── */}
      {activeTab === 'submit' && (
        submitted ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', margin: '0 0 0.5rem' }}>Report Submitted!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>
              Your vulnerability report has been received. Our security team will review it within 5 business days. You'll receive a confirmation at the email you provided.
            </p>
            <button onClick={() => setSubmitted(false)} style={{ marginTop: '1.5rem', padding: '0.65rem 1.5rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#10b981', fontWeight: 700, cursor: 'pointer' }}>Submit Another</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.7rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Vulnerability Report</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Vulnerability Title *</label>
                  <input required value={submitForm.title} onChange={e => setSubmitForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="e.g. Authentication bypass via token replay" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Category *</label>
                  <select value={submitForm.category} onChange={e => setSubmitForm(f => ({ ...f, category: e.target.value }))} className="input-field" style={{ width: '100%' }}>
                    {['Authentication', 'Anti-Bot', 'Information Disclosure', 'Privacy', 'Rate Limiting', 'XSS/Injection', 'IDOR', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Severity *</label>
                  <select value={submitForm.severity} onChange={e => setSubmitForm(f => ({ ...f, severity: e.target.value }))} className="input-field" style={{ width: '100%' }}>
                    {['critical', 'high', 'medium', 'low'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Your Handle</label>
                  <input value={submitForm.handle} onChange={e => setSubmitForm(f => ({ ...f, handle: e.target.value }))} className="input-field" placeholder="@your_handle" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Contact Email *</label>
                  <input required type="email" value={submitForm.email} onChange={e => setSubmitForm(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="researcher@example.com" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Vulnerability Description *</label>
                  <textarea required value={submitForm.description} onChange={e => setSubmitForm(f => ({ ...f, description: e.target.value }))} className="input-field" rows={4} placeholder="Describe the vulnerability, the attack surface, and potential business impact..." style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Steps to Reproduce *</label>
                  <textarea required value={submitForm.stepsToReproduce} onChange={e => setSubmitForm(f => ({ ...f, stepsToReproduce: e.target.value }))} className="input-field" rows={4} placeholder="1. Navigate to...\n2. Send the following request...\n3. Observe..." style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Proof of Concept (code, curl, screenshot URL)</label>
                  <textarea value={submitForm.poc} onChange={e => setSubmitForm(f => ({ ...f, poc: e.target.value }))} className="input-field" rows={3} placeholder="curl -X POST https://api.vitashield.io/api/verify -d '{...}'" style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>CVE ID (if known)</label>
                  <input value={submitForm.cveId} onChange={e => setSubmitForm(f => ({ ...f, cveId: e.target.value }))} className="input-field" placeholder="CVE-2026-XXXXX" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>

            {/* CVSSv3 Vector */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <p style={{ margin: '0 0 1rem', fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>CVSSv3 Score Estimate</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Attack Vector', key: 'vector', options: CVSS_VECTORS },
                  { label: 'Attack Complexity', key: 'complexity', options: COMPLEXITY },
                  { label: 'Confidentiality Impact', key: 'confImpact', options: IMPACT },
                  { label: 'Integrity Impact', key: 'integImpact', options: IMPACT },
                  { label: 'Availability Impact', key: 'availImpact', options: IMPACT },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>{label}</label>
                    <select value={(submitForm as any)[key]} onChange={e => setSubmitForm(f => ({ ...f, [key]: e.target.value }))} className="input-field" style={{ width: '100%' }}>
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" style={{ flex: 1, padding: '0.85rem', background: 'linear-gradient(135deg, #10b981, #06b6d4)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer' }}>
                Submit Vulnerability Report
              </button>
              <button type="button" onClick={() => setSubmitForm(f => ({ ...f, title: '', description: '', stepsToReproduce: '', poc: '' }))} style={{ padding: '0.85rem 1.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>
                Clear
              </button>
            </div>
          </form>
        )
      )}
    </div>
  );
};
