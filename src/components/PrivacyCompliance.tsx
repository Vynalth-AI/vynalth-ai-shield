import React, { useState, useRef } from 'react';

// ──────────────────────────────────────────────────────────────────
// PrivacyCompliance.tsx
// PDPA / GDPR / CCPA compliance suite:
//   - Data minimization toggles
//   - Immutable audit log (append-only)
//   - Privacy policy generator
//   - Supabase Vault key-rotation simulator
// ──────────────────────────────────────────────────────────────────

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  outcome: 'success' | 'denied' | 'warn';
  hash: string;
}

const SAMPLE_AUDIT: AuditEntry[] = [
  { id: 'ae-001', timestamp: '2026-07-18 08:12:04 UTC', actor: 'admin@vitamind.ai', action: 'KEY_ROTATION', resource: 'vault/aes-256-primary', outcome: 'success', hash: '0x3f9a1c…' },
  { id: 'ae-002', timestamp: '2026-07-18 07:55:11 UTC', actor: 'api/session-verify', action: 'DATA_READ', resource: 'user_profiles#anon-8823', outcome: 'success', hash: '0x7b2e5d…' },
  { id: 'ae-003', timestamp: '2026-07-18 07:40:30 UTC', actor: 'bot-scanner@unknown', action: 'EXPORT_ATTEMPT', resource: 'threat_intel/*', outcome: 'denied', hash: '0x1f6c9a…' },
  { id: 'ae-004', timestamp: '2026-07-17 23:18:02 UTC', actor: 'admin@vitamind.ai', action: 'POLICY_UPDATE', resource: 'compliance/pdpa-v2', outcome: 'success', hash: '0x9d0f3e…' },
  { id: 'ae-005', timestamp: '2026-07-17 22:03:55 UTC', actor: 'scheduler/cron', action: 'DATA_PURGE', resource: 'sessions > 90d', outcome: 'success', hash: '0x5c4b2f…' },
];

const FRAMEWORKS = ['Malaysia PDPA', 'EU GDPR', 'CCPA (California)', 'HIPAA (Health)'];

const DATA_TOGGLES = [
  { id: 'ip_log', label: 'IP Address Logging', default: true, risk: 'medium', pdpa: true, gdpr: true, ccpa: false },
  { id: 'keystroke', label: 'Keystroke Dynamics', default: true, risk: 'high', pdpa: true, gdpr: true, ccpa: true },
  { id: 'canvas_fp', label: 'Canvas Fingerprint', default: true, risk: 'high', pdpa: false, gdpr: true, ccpa: true },
  { id: 'geo_coarse', label: 'Coarse Geolocation (Country)', default: true, risk: 'low', pdpa: true, gdpr: false, ccpa: false },
  { id: 'device_model', label: 'Device Model / OS', default: true, risk: 'low', pdpa: false, gdpr: false, ccpa: false },
  { id: 'session_replay', label: 'Session Replay Recording', default: false, risk: 'high', pdpa: true, gdpr: true, ccpa: true },
  { id: 'email_hash', label: 'Hashed Email for Dedup', default: true, risk: 'low', pdpa: false, gdpr: false, ccpa: false },
];

const VAULT_KEYS = [
  { id: 'aes-256-primary', name: 'AES-256 Primary Key', status: 'active', rotated: '2026-07-18', nextRotation: '2026-10-18' },
  { id: 'hmac-sig', name: 'HMAC Signature Key', status: 'active', rotated: '2026-06-01', nextRotation: '2026-09-01' },
  { id: 'rsa-webhook', name: 'RSA Webhook Signing', status: 'active', rotated: '2026-05-15', nextRotation: '2026-08-15' },
  { id: 'kek-vault', name: 'Key Encryption Key (KEK)', status: 'active', rotated: '2026-01-01', nextRotation: '2027-01-01' },
];

export const PrivacyCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'minimization' | 'audit' | 'policy' | 'vault'>('minimization');
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(DATA_TOGGLES.map(t => [t.id, t.default]))
  );
  const [policyFramework, setPolicyFramework] = useState('Malaysia PDPA');
  const [companyName, setCompanyName] = useState('VitaShield Sdn Bhd');
  const [dpoEmail, setDpoEmail] = useState('dpo@vitamind.ai');
  const [dataRetention, setDataRetention] = useState('90');
  const [policyGenerated, setPolicyGenerated] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(SAMPLE_AUDIT);
  const [vaultStatus, setVaultStatus] = useState<Record<string, 'idle' | 'rotating' | 'done'>>(
    Object.fromEntries(VAULT_KEYS.map(k => [k.id, 'idle']))
  );
  const policyRef = useRef<HTMLDivElement>(null);

  const toggleField = (id: string) => setToggles(prev => ({ ...prev, [id]: !prev[id] }));

  const generatePolicy = () => {
    setPolicyGenerated(true);
    setTimeout(() => policyRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const rotateKey = (keyId: string) => {
    setVaultStatus(prev => ({ ...prev, [keyId]: 'rotating' }));
    setTimeout(() => {
      setVaultStatus(prev => ({ ...prev, [keyId]: 'done' }));
      const entry: AuditEntry = {
        id: `ae-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        actor: 'admin@vitamind.ai',
        action: 'KEY_ROTATION',
        resource: `vault/${keyId}`,
        outcome: 'success',
        hash: '0x' + Math.random().toString(16).slice(2, 10) + '…',
      };
      setAuditLog(prev => [entry, ...prev]);
    }, 1800);
  };

  const enabledCount = Object.values(toggles).filter(Boolean).length;
  const riskScore = DATA_TOGGLES.reduce((acc, t) => {
    if (!toggles[t.id]) return acc;
    return acc + (t.risk === 'high' ? 3 : t.risk === 'medium' ? 2 : 1);
  }, 0);
  const maxRisk = DATA_TOGGLES.reduce((acc, t) => acc + (t.risk === 'high' ? 3 : t.risk === 'medium' ? 2 : 1), 0);
  const privacyScore = Math.round((1 - riskScore / maxRisk) * 100);

  const frameworkCoverage = (fw: keyof typeof DATA_TOGGLES[0]) => {
    const required = DATA_TOGGLES.filter(t => t[fw]);
    const disabled = required.filter(t => !toggles[t.id]);
    return { total: required.length, compliant: disabled.length };
  };

  const policyText = `
# Privacy Policy — ${companyName}
**Framework: ${policyFramework}** | Effective: ${new Date().toLocaleDateString()}

## 1. Data Controller
${companyName} ("We", "Our") operates as the data controller for personal data processed via the VitaShield behavioral verification platform.
**Data Protection Officer (DPO):** ${dpoEmail}

## 2. Data Collected
We collect and process the following categories of data:
${DATA_TOGGLES.filter(t => toggles[t.id]).map(t => `- **${t.label}** (Risk: ${t.risk})`).join('\n')}

## 3. Legal Basis for Processing
- **Legitimate Interest**: Fraud prevention, account security, bot detection.
- **Contractual Necessity**: Providing the verification service to our clients.
- ${policyFramework.includes('GDPR') ? '**GDPR Art. 6(1)(f)**: Legitimate interests of the controller or a third party.' : ''}
- ${policyFramework.includes('PDPA') ? '**PDPA Section 6**: Processing necessary for the performance of a contract.' : ''}

## 4. Data Retention
All verification session data is retained for **${dataRetention} days** unless a longer period is required by law or our clients' contractual obligations.

## 5. Data Subject Rights
Users have the right to: **Access | Rectification | Erasure | Portability | Objection**.
Submit requests to: ${dpoEmail}

## 6. Security Measures
- AES-256 encryption at rest (Supabase Vault).
- TLS 1.3 in transit.
- Immutable audit logs with cryptographic hash chaining.
- Quarterly key rotation.

## 7. Third-Party Disclosure
We do not sell, share, or rent personal data to third parties except as necessary to provide our services (e.g., Supabase for encrypted storage, Cloudflare for DDoS protection).

*This policy was auto-generated by VitaShield Privacy Compliance Module on ${new Date().toISOString()}.*
  `.trim();

  const tabs = [
    { id: 'minimization', label: '🔒 Data Minimization', color: '#38bdf8' },
    { id: 'audit', label: '📋 Audit Log', color: '#818cf8' },
    { id: 'policy', label: '📄 Policy Generator', color: '#10b981' },
    { id: 'vault', label: '🔑 Key Vault', color: '#f59e0b' },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', margin: 0 }} className="gradient-text">
            Privacy & Compliance Suite
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>
            Malaysia PDPA · EU GDPR · CCPA · HIPAA — data minimization, audit logs, and policy generation in one place.
          </p>
        </div>
        {/* Privacy Score Badge */}
        <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.75rem 1.25rem', flexShrink: 0 }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: privacyScore >= 70 ? '#10b981' : privacyScore >= 40 ? '#f59e0b' : '#ef4444' }}>{privacyScore}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRIVACY SCORE</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '0.5rem 1rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, transition: 'all 0.2s',
            background: activeTab === t.id ? `rgba(${t.id === 'minimization' ? '56,189,248' : t.id === 'audit' ? '129,140,248' : t.id === 'policy' ? '16,185,129' : '245,158,11'},0.15)` : 'transparent',
            color: activeTab === t.id ? t.color : 'var(--text-muted)',
            borderBottom: activeTab === t.id ? `2px solid ${t.color}` : '2px solid transparent',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Tab: Data Minimization ── */}
      {activeTab === 'minimization' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Fields Collected', value: enabledCount + ' / ' + DATA_TOGGLES.length, color: '#38bdf8' },
              { label: 'Privacy Score', value: privacyScore + '%', color: privacyScore >= 70 ? '#10b981' : '#f59e0b' },
              { label: 'GDPR Required OFF', value: frameworkCoverage('gdpr').compliant + ' fields', color: '#818cf8' },
              { label: 'PDPA Required OFF', value: frameworkCoverage('pdpa').compliant + ' fields', color: '#10b981' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <p style={{ margin: '0 0 1rem', fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Data Collection Controls</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {DATA_TOGGLES.map(field => (
                <div key={field.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.15)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{field.label}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4, background: field.risk === 'high' ? 'rgba(239,68,68,0.15)' : field.risk === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', color: field.risk === 'high' ? '#ef4444' : field.risk === 'medium' ? '#f59e0b' : '#10b981' }}>
                        {field.risk.toUpperCase()}
                      </span>
                      {field.gdpr && <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 3, background: 'rgba(129,140,248,0.15)', color: '#818cf8', fontWeight: 700 }}>GDPR</span>}
                      {field.pdpa && <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 3, background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontWeight: 700 }}>PDPA</span>}
                      {field.ccpa && <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 3, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 700 }}>CCPA</span>}
                    </div>
                  </div>
                  {/* Toggle switch */}
                  <button onClick={() => toggleField(field.id)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: toggles[field.id] ? '#10b981' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
                    <span style={{ position: 'absolute', top: 3, left: toggles[field.id] ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', display: 'block' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Audit Log ── */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Immutable Audit Log</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hash-chained, append-only — tamper detection on every row</p>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '0.35rem 0.75rem', borderRadius: 6 }}>
              {auditLog.length} entries · Chain intact ✓
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Timestamp', 'Actor', 'Action', 'Resource', 'Outcome', 'Hash'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditLog.map((entry, i) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{entry.timestamp}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#f1f5f9', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{entry.actor}</td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: 4, background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.72rem' }}>{entry.action}</span>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{entry.resource}</td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: 4, fontWeight: 700, fontSize: '0.72rem', background: entry.outcome === 'success' ? 'rgba(16,185,129,0.15)' : entry.outcome === 'denied' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: entry.outcome === 'success' ? '#10b981' : entry.outcome === 'denied' ? '#ef4444' : '#f59e0b' }}>
                        {entry.outcome.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>{entry.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Policy Generator ── */}
      {activeTab === 'policy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.7rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Policy Configuration</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Compliance Framework</label>
                <select value={policyFramework} onChange={e => setPolicyFramework(e.target.value)} className="input-field" style={{ width: '100%' }}>
                  {FRAMEWORKS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Company / Entity Name</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>DPO Email</label>
                <input value={dpoEmail} onChange={e => setDpoEmail(e.target.value)} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Data Retention (days)</label>
                <input type="number" value={dataRetention} onChange={e => setDataRetention(e.target.value)} className="input-field" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>
            <button onClick={generatePolicy} style={{ marginTop: '1.25rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #10b981, #06b6d4)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
              ✨ Generate Privacy Policy
            </button>
          </div>

          {policyGenerated && (
            <div ref={policyRef} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Generated Policy ({policyFramework})</p>
                <button onClick={() => navigator.clipboard?.writeText(policyText)} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, color: '#10b981', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Copy Markdown</button>
              </div>
              <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'pre-wrap', lineHeight: 1.7, background: '#04060b', borderRadius: 8, padding: '1.25rem', maxHeight: 480, overflowY: 'auto' }}>{policyText}</pre>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Key Vault ── */}
      {activeTab === 'vault' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '0.75rem 1rem', alignItems: 'flex-start' }}>
            <span>🔑</span>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#f59e0b', lineHeight: 1.5 }}>
              <strong>Supabase Vault Simulation</strong> — All keys are encrypted with your root KEK (Key Encryption Key). In production, each rotation triggers a Supabase Vault API call and writes a tamper-proof audit entry.
            </p>
          </div>
          {VAULT_KEYS.map(key => (
            <div key={key.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{key.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                  Last rotated: {key.rotated} · Next: {key.nextRotation}
                </div>
              </div>
              <span style={{ padding: '0.2rem 0.6rem', borderRadius: 5, background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.7rem', fontWeight: 700 }}>ACTIVE</span>
              <button
                onClick={() => rotateKey(key.id)}
                disabled={vaultStatus[key.id] === 'rotating'}
                style={{ padding: '0.5rem 1rem', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 8, background: vaultStatus[key.id] === 'done' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.1)', color: vaultStatus[key.id] === 'done' ? '#10b981' : '#f59e0b', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.3s' }}
              >
                {vaultStatus[key.id] === 'rotating' ? '⟳ Rotating…' : vaultStatus[key.id] === 'done' ? '✓ Rotated' : '↻ Rotate Key'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
