import React, { useState } from 'react';

interface ChecklistItem {
  name: string;
  current: string;
  target: string;
  difficulty: 'Easy' | 'Medium' | 'Complex' | 'Very Complex';
  timeline: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  completed: boolean;
}

interface ChecklistCategory {
  title: string;
  items: ChecklistItem[];
}

export const ChecklistPage: React.FC = () => {
  const [categories, setCategories] = useState<ChecklistCategory[]>([
    {
      title: '1.1 Mobile Capture Capabilities (P1 - Critical)',
      items: [
        { name: 'Mobile SDK Development', current: '8/10', target: '8/10', difficulty: 'Very Complex', timeline: 'Completed (Q1-Q4)', impact: 'Critical', completed: true },
        { name: 'Touch Event Kinetics Analysis', current: '8/10', target: '8/10', difficulty: 'Complex', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true },
        { name: 'Mobile Sensor Ingestion (Accelerometer, Gyroscope)', current: '7/10', target: '7/10', difficulty: 'Complex', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true },
        { name: 'Mobile Browser Fingerprinting', current: '8/10', target: '8/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'Mobile Behavioral Profiling', current: '8/10', target: '8/10', difficulty: 'Complex', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true },
        { name: 'iOS/Android Native View Attestations', current: '7/10', target: '7/10', difficulty: 'Very Complex', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true }
      ]
    },
    {
      title: '1.2 Advanced Fingerprint Spoofing Defenses (P1)',
      items: [
        { name: 'Multi-dimensional Fingerprint Fusion', current: '8/10', target: '8/10', difficulty: 'Complex', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true },
        { name: 'Canvas Obfuscation Detection', current: '8/10', target: '8/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'WebGL Obfuscation Detection', current: '8/10', target: '8/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'Font Fingerprint Spoofing Detection', current: '7/10', target: '7/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'Low', completed: true },
        { name: 'Fingerprint Consistency Verifications', current: '9/10', target: '9/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true },
        { name: 'Over-spoofing Anomaly Flagging', current: '8/10', target: '8/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true }
      ]
    },
    {
      title: '1.3 Autonomous AI Agent Detection (P1)',
      items: [
        { name: 'AI Agent Behavior Pattern Mapping', current: '8/10', target: '8/10', difficulty: 'Complex', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true },
        { name: 'ChatGPT/Claude API Agent Detection', current: '8/10', target: '8/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'Selenium/Playwright Framework Fingerprints', current: '9/10', target: '9/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'Puppeteer Headless Browser Detection', current: '9/10', target: '9/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'Proxy Chain Link Trace Audits', current: '7/10', target: '7/10', difficulty: 'Complex', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'Coordinated Proxy Rotation Profiling', current: '8/10', target: '8/10', difficulty: 'Complex', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true }
      ]
    },
    {
      title: '1.4 Behavioral Biometrics Optimizations (P2)',
      items: [
        { name: 'Mouse Path Trajectory Granularity', current: '9/10', target: '9/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'Keystroke Timing Resolution', current: '9/10', target: '9/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'Scroll Deceleration Curve Analysis', current: '8/10', target: '8/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'Multi-touch Gestures (Mobile App)', current: '7/10', target: '7/10', difficulty: 'Complex', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true },
        { name: 'Device Tilt & Physical Gravity Vector Ingestion', current: '6/10', target: '6/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'Time-series Interaction Sequence Modeling', current: '8/10', target: '8/10', difficulty: 'Complex', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true }
      ]
    },
    {
      title: '2.1 Client SDK Integrity (P0 - Immediate)',
      items: [
        { name: 'Code Obfuscation & Dynamic Encryption', current: '9/10', target: '9/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true },
        { name: 'Debugger Detection & Anti-Debugging Hooks', current: '9/10', target: '9/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true },
        { name: 'JS Code Integrity Verification', current: '9/10', target: '9/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true },
        { name: 'Source Map Leak Protection', current: '8/10', target: '8/10', difficulty: 'Easy', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'Dynamic Script Injection Safeguards', current: '8/10', target: '8/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'Memory Scrape Protection & Isolation', current: '8/10', target: '8/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true }
      ]
    },
    {
      title: '2.2 Token Protection Security (P0 - Immediate)',
      items: [
        { name: 'Telemetry Token Encryption Intensity', current: '9/10', target: '9/10', difficulty: 'Easy', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true },
        { name: 'Replay Attack Prevention Sockets', current: '9/10', target: '9/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true },
        { name: 'Epoch Timestamp Verification Gates', current: '9/10', target: '9/10', difficulty: 'Easy', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'Browser Session Hardware Binding', current: '9/10', target: '9/10', difficulty: 'Medium', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true },
        { name: 'Token Lifecycle Expiry Enforcement', current: '9/10', target: '9/10', difficulty: 'Easy', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true },
        { name: 'ECDSA Token Signature Validation', current: '9/10', target: '9/10', difficulty: 'Easy', timeline: 'Completed (Q1-Q4)', impact: 'Medium', completed: true }
      ]
    },
    {
      title: '5.1 Enterprise Capabilities (P2)',
      items: [
        { name: 'Custom Rules Engine (LocalStorage Persistence)', current: '9/10', target: '9/10', difficulty: 'Complex', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true },
        { name: 'Advanced Audit Reporting & Analytics Dashboards', current: '8/10', target: '9/10', difficulty: 'Medium', timeline: '4-6 Weeks', impact: 'High', completed: false },
        { name: 'Real-time Threat Intelligence API Feed', current: '2/10', target: '8/10', difficulty: 'Complex', timeline: '6-8 Weeks', impact: 'Medium', completed: false }
      ]
    },
    {
      title: '6.1 Testing & Quality Assurance Layer (P1)',
      items: [
        { name: 'Automated Red-Blue Team Playwright Attack Suite', current: '1/10', target: '8/10', difficulty: 'Complex', timeline: '4-6 Weeks', impact: 'High', completed: false },
        { name: 'Chaos Engineering Anomaly Injection (Fake Telemetry / Delay)', current: '0/10', target: '7/10', difficulty: 'Complex', timeline: '6-8 Weeks', impact: 'Medium', completed: false },
        { name: 'Monthly Penetration Testing Checklist Self-Checks', current: '8/10', target: '8/10', difficulty: 'Easy', timeline: 'Completed (Q1-Q4)', impact: 'High', completed: true }
      ]
    },
    {
      title: '6.2 Scalability & Performance Engine (P1)',
      items: [
        { name: 'Global Multi-Region Deployments (Cloudflare Workers + Supabase)', current: '3/10', target: '9/10', difficulty: 'Complex', timeline: '8-10 Weeks', impact: 'High', completed: false },
        { name: 'Model Versioning & A/B Testing Switches (Mouse vs Health Context)', current: '2/10', target: '8/10', difficulty: 'Complex', timeline: '6-8 Weeks', impact: 'Medium', completed: false },
        { name: 'Telemetry Queue Handlers (Cloudflare Queues / Realtime)', current: '1/10', target: '9/10', difficulty: 'Complex', timeline: '8-10 Weeks', impact: 'High', completed: false }
      ]
    },
    {
      title: '6.3 Frontier Technology R&D (P2)',
      items: [
        { name: 'Privacy Computing (MPC / Homomorphic Encryption)', current: '0/10', target: '7/10', difficulty: 'Very Complex', timeline: '12-16 Weeks', impact: 'High', completed: false },
        { name: 'Continuous Background Silent Authentication', current: '2/10', target: '9/10', difficulty: 'Complex', timeline: '8-10 Weeks', impact: 'High', completed: false },
        { name: 'Decentralized Identifiers (DID) Health Data Integration', current: '0/10', target: '8/10', difficulty: 'Very Complex', timeline: '10-12 Weeks', impact: 'Medium', completed: false }
      ]
    }
  ]);

  const toggleItem = (catIdx: number, itemIdx: number) => {
    const updated = [...categories];
    const item = updated[catIdx].items[itemIdx];
    item.completed = !item.completed;
    item.current = item.completed ? item.target : '3/10';
    setCategories(updated);
  };

  // Compute overall statistics
  let totalItems = 0;
  let completedItems = 0;
  categories.forEach(c => {
    c.items.forEach(i => {
      totalItems++;
      if (i.completed) completedItems++;
    });
  });

  const completionPct = Math.round((completedItems / totalItems) * 100);

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">Roadmap & Capability Checklist</h1>
          <p style={styles.subtitle}>Track execution status across security shields, biometric engines, and compliance metrics.</p>
        </div>
        <div style={styles.completionCard}>
          <div style={styles.completionRing}>
            <svg width="60" height="60" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--secondary)"
                strokeDasharray={`${completionPct}, 100`}
                strokeWidth="3.5"
                style={{ strokeLinecap: 'round', transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div style={styles.completionText}>{completionPct}%</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Q1-Q4 Progress</div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>{completedItems} / {totalItems} Resolved</div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {categories.map((cat, catIdx) => (
          <div key={cat.title} className="glass-panel" style={styles.panel}>
            <h3 style={styles.panelTitle}>{cat.title}</h3>
            
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.thLeft}>Optimization Task</th>
                    <th style={styles.th}>Rating</th>
                    <th style={styles.th}>Target</th>
                    <th style={styles.th}>Timeline</th>
                    <th style={styles.th}>Impact</th>
                    <th style={styles.thRight}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.items.map((item, itemIdx) => (
                    <tr key={item.name} style={styles.tr}>
                      <td style={styles.tdLeft}>
                        <strong>{item.name}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dark)', marginTop: '2px' }}>
                          Difficulty: {item.difficulty}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{ 
                          color: item.completed ? 'var(--secondary)' : 'var(--warning)',
                          fontWeight: 'bold',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {item.current}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.target}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: item.completed ? '#34d399' : 'var(--text-muted)'
                        }}>{item.timeline}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: item.impact === 'Critical' || item.impact === 'High' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                          color: item.impact === 'Critical' || item.impact === 'High' ? 'var(--danger)' : 'var(--text-muted)'
                        }}>{item.impact}</span>
                      </td>
                      <td style={styles.tdRight}>
                        <button
                          onClick={() => toggleItem(catIdx, itemIdx)}
                          style={{
                            padding: '4px 10px',
                            background: item.completed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${item.completed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '6px',
                            color: item.completed ? '#34d399' : 'var(--text-muted)',
                            fontSize: '0.72rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {item.completed ? 'COMPLETED' : 'PENDING'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2.5rem',
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #060913 0%, #0b111e 100%)',
    color: '#f8fafc',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '1.5rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)'
  },
  completionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px'
  },
  completionRing: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  completionText: {
    position: 'absolute',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: 'var(--secondary)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem'
  },
  panel: {
    padding: '1.75rem',
    borderRadius: '16px'
  },
  panelTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#00f2fe',
    marginBottom: '1.25rem'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  thRow: {
    borderBottom: '1px solid rgba(255,255,255,0.08)'
  },
  thLeft: {
    padding: '10px 14px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  th: {
    padding: '10px 14px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'center'
  },
  thRight: {
    padding: '10px 14px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'right'
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.2s'
  },
  tdLeft: {
    padding: '14px 14px',
    fontSize: '0.88rem'
  },
  td: {
    padding: '14px 14px',
    fontSize: '0.85rem',
    textAlign: 'center'
  },
  tdRight: {
    padding: '14px 14px',
    fontSize: '0.85rem',
    textAlign: 'right'
  }
};
