import React, { useState } from 'react';

interface ComponentStatus {
  name: string;
  uptime: string;
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  history: Array<{ day: number; uptime: number }>;
}

export const StatusPage: React.FC<{ isStandalone?: boolean }> = ({ isStandalone = false }) => {
  const [latencyHistory] = useState<number[]>(() => {
    // Generate simulated latency values around 14ms - 28ms for 24 hours
    return Array.from({ length: 24 }, () => 14 + Math.floor(Math.random() * 14));
  });

  const shieldComponents: ComponentStatus[] = [
    {
      name: 'Edge Gateway Verification API',
      uptime: '99.99%',
      status: 'operational',
      history: generateUptimeHistory(99.9)
    },
    {
      name: 'Telemetry Kinetic Processor',
      uptime: '99.97%',
      status: 'operational',
      history: generateUptimeHistory(99.8)
    },
    {
      name: 'Custom Firewall Rules Engine',
      uptime: '100.00%',
      status: 'operational',
      history: generateUptimeHistory(100)
    }
  ];

  const vitamindComponents: ComponentStatus[] = [
    {
      name: 'Core AI Inference API',
      uptime: '99.98%',
      status: 'operational',
      history: generateUptimeHistory(99.9)
    },
    {
      name: 'Embedding Generation Hub',
      uptime: '99.95%',
      status: 'operational',
      history: generateUptimeHistory(99.7)
    },
    {
      name: 'Neural Training Pipeline',
      uptime: '100.00%',
      status: 'operational',
      history: generateUptimeHistory(100)
    }
  ];

  const infraComponents: ComponentStatus[] = [
    {
      name: 'Supabase db-live Database Cluster',
      uptime: '99.99%',
      status: 'operational',
      history: generateUptimeHistory(99.9)
    },
    {
      name: 'CDN Edge Delivery Nodes',
      uptime: '100.00%',
      status: 'operational',
      history: generateUptimeHistory(100)
    }
  ];

  function generateUptimeHistory(baseRate: number): Array<{ day: number; uptime: number }> {
    return Array.from({ length: 90 }, (_, idx) => {
      const isOutage = baseRate < 100 && Math.random() < 0.015;
      const uptime = isOutage ? (94 + Math.random() * 5) : 100;
      return { day: idx + 1, uptime };
    });
  }

  // Draw smooth SVG path for Latency
  const width = 600;
  const height = 120;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxLat = 40;

  const points = latencyHistory.map((l, i) => {
    const x = paddingLeft + (i / (latencyHistory.length - 1)) * chartWidth;
    const y = height - paddingBottom - (l / maxLat) * chartHeight;
    return { x, y };
  });

  const createSmoothPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(points);

  return (
    <div style={{ ...styles.container, maxWidth: isStandalone ? '840px' : '100%', margin: isStandalone ? '3rem auto' : '0' }}>
      {/* Brand Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={styles.logoWrapper}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }} />
          </div>
          <div>
            <h1 style={styles.brandTitle}>sleepsomno.com</h1>
            <p style={styles.brandSubtitle}>VitaMind AI & VitaShield System Status</p>
          </div>
        </div>
        <span style={styles.timeBadge}>
          <span style={styles.livePulse} />
          SYSTEM LIVE
        </span>
      </div>

      {/* Global Status Banner (Vercel Status Inspired Clean Panel) */}
      <div className="glass-panel glowing" style={styles.banner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={styles.bannerGlowDot} />
          <div>
            <h2 style={styles.bannerTitle}>All Systems Operational</h2>
            <p style={styles.bannerSubtitle}>VitaShield active defense gates and VitaMind AI endpoints are working normal.</p>
          </div>
        </div>
        <span style={styles.uptimeBadge}>99.98% UPTIME</span>
      </div>

      {/* Group 1: VitaShield */}
      <div className="glass-panel" style={styles.panel}>
        <h3 style={styles.sectionHeader}>VITASHIELD OPERATION ENGINE</h3>
        <div style={styles.componentsList}>
          {shieldComponents.map((c, i) => (
            <div key={i} style={styles.componentItem}>
              <div style={styles.componentMetaRow}>
                <span style={styles.componentName}>{c.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={styles.statusTextBadge}>Operational</span>
                  <span style={styles.componentUptimeVal}>{c.uptime}</span>
                </div>
              </div>
              <div style={styles.uptimeBarWrapper}>
                {c.history.map((day, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.uptimeTick,
                      background: day.uptime === 100 ? '#10b981' : '#f59e0b',
                      opacity: day.uptime === 100 ? 0.95 : 0.7
                    }}
                    title={`Day ${day.day}: ${day.uptime}% uptime`}
                  />
                ))}
              </div>
              <div style={styles.uptimeAxisRow}>
                <span>90 days ago</span>
                <span>Today</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group 2: VitaMind AI */}
      <div className="glass-panel" style={styles.panel}>
        <h3 style={styles.sectionHeader}>VITAMIND AI INFERENCE PLATFORM</h3>
        <div style={styles.componentsList}>
          {vitamindComponents.map((c, i) => (
            <div key={i} style={styles.componentItem}>
              <div style={styles.componentMetaRow}>
                <span style={styles.componentName}>{c.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={styles.statusTextBadge}>Operational</span>
                  <span style={styles.componentUptimeVal}>{c.uptime}</span>
                </div>
              </div>
              <div style={styles.uptimeBarWrapper}>
                {c.history.map((day, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.uptimeTick,
                      background: day.uptime === 100 ? '#10b981' : '#f59e0b',
                      opacity: day.uptime === 100 ? 0.95 : 0.7
                    }}
                    title={`Day ${day.day}: ${day.uptime}% uptime`}
                  />
                ))}
              </div>
              <div style={styles.uptimeAxisRow}>
                <span>90 days ago</span>
                <span>Today</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group 3: Common Database */}
      <div className="glass-panel" style={styles.panel}>
        <h3 style={styles.sectionHeader}>COMMON DATA INFRASTRUCTURE</h3>
        <div style={styles.componentsList}>
          {infraComponents.map((c, i) => (
            <div key={i} style={styles.componentItem}>
              <div style={styles.componentMetaRow}>
                <span style={styles.componentName}>{c.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={styles.statusTextBadge}>Operational</span>
                  <span style={styles.componentUptimeVal}>{c.uptime}</span>
                </div>
              </div>
              <div style={styles.uptimeBarWrapper}>
                {c.history.map((day, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.uptimeTick,
                      background: day.uptime === 100 ? '#10b981' : '#f59e0b',
                      opacity: day.uptime === 100 ? 0.95 : 0.7
                    }}
                    title={`Day ${day.day}: ${day.uptime}% uptime`}
                  />
                ))}
              </div>
              <div style={styles.uptimeAxisRow}>
                <span>90 days ago</span>
                <span>Today</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Latency Chart & Recent Incidents Log */}
      <div style={styles.splitGrid}>
        {/* Latency card */}
        <div className="glass-panel" style={styles.panel}>
          <h3 style={styles.sectionHeader}>EDGE INQUIRY LATENCY (24H)</h3>
          <p style={styles.panelSubtitle}>Average secure handshake response verification time</p>
          <div style={styles.chartWrapper}>
            <svg viewBox={`0 0 ${width} ${height}`} style={styles.svg}>
              {/* Horizontal grid lines */}
              {[0, 0.5, 1].map((ratio, i) => {
                const y = paddingTop + ratio * chartHeight;
                return (
                  <line
                    key={i}
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.03)"
                    strokeWidth="1"
                  />
                );
              })}
              {/* Smooth Curve */}
              <path d={linePath} fill="none" stroke="var(--secondary)" strokeWidth="2" />
              
              {/* Latency markers */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="1.5"
                  fill="var(--secondary)"
                />
              ))}
            </svg>
            <div style={styles.chartLabelRow}>
              <span>24h ago</span>
              <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>Avg: 18.5ms</span>
              <span>Now</span>
            </div>
          </div>
        </div>

        {/* Timeline Log */}
        <div className="glass-panel" style={styles.panel}>
          <h3 style={styles.sectionHeader}>PAST SYSTEM INCIDENTS</h3>
          <p style={styles.panelSubtitle}>Historical operation audits and resolved mitigations</p>
          <div style={styles.timelineWrapper}>
            {/* Incident 1 */}
            <div style={styles.timelineItem}>
              <div style={styles.timelineIndicator}>
                <div style={styles.timelineNodeDot} />
                <div style={styles.timelineLineTrack} />
              </div>
              <div style={styles.timelineContent}>
                <div style={styles.incidentHeader}>
                  <span style={styles.incidentStatusBadge}>RESOLVED</span>
                  <span style={styles.incidentTitle}>Coordinated Botnet Mitigated</span>
                </div>
                <p style={styles.incidentDate}>July 15, 2026 - 12:40 UTC</p>
                <p style={styles.incidentDesc}>
                  VitaShield Edge Gateways successfully identified and dropped 124,510 high-risk credential verification requests. System load remained nominal.
                </p>
              </div>
            </div>

            {/* Incident 2 */}
            <div style={styles.timelineItem}>
              <div style={styles.timelineIndicator}>
                <div style={{ ...styles.timelineNodeDot, background: 'rgba(255,255,255,0.2)' }} />
              </div>
              <div style={styles.timelineContent}>
                <div style={styles.incidentHeader}>
                  <span style={{ ...styles.incidentStatusBadge, color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}>COMPLETED</span>
                  <span style={styles.incidentTitle}>AI Embedding Processor Migration</span>
                </div>
                <p style={styles.incidentDate}>July 10, 2026 - 02:00 UTC</p>
                <p style={styles.incidentDesc}>
                  Scheduled rolling updates on VitaMind AI embedding vector engines were deployed successfully with zero recorded request timeouts.
                </p>
              </div>
            </div>
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
    gap: '1.5rem',
    padding: '1.5rem',
    minHeight: '100vh',
    color: 'var(--text-main)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    paddingBottom: '1rem',
    marginBottom: '0.5rem'
  },
  logoWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid rgba(6,182,212,0.15)'
  },
  brandTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.02em'
  },
  brandSubtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)'
  },
  timeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(16, 185, 129, 0.06)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '6px',
    padding: '0.35rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--success)'
  },
  livePulse: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--success)',
    boxShadow: '0 0 8px var(--success)',
    display: 'inline-block',
    animation: 'dot-pulse 2s infinite'
  },
  banner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    background: 'rgba(16, 185, 129, 0.02)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    boxShadow: '0 0 20px rgba(16, 185, 129, 0.05)'
  },
  bannerGlowDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'var(--success)',
    boxShadow: '0 0 12px var(--success)',
    animation: 'pulse-glow 2s infinite'
  },
  bannerTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#fff'
  },
  bannerSubtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem'
  },
  uptimeBadge: {
    fontSize: '0.78rem',
    fontWeight: '800',
    color: '#10b981',
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '6px',
    padding: '0.25rem 0.55rem'
  },
  panel: {
    padding: '1.5rem'
  },
  sectionHeader: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'var(--text-dark)',
    letterSpacing: '0.08em',
    marginBottom: '1rem',
    textTransform: 'uppercase'
  },
  componentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  componentItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  componentMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.82rem',
    fontWeight: '600'
  },
  componentName: {
    color: '#f8fafc'
  },
  statusTextBadge: {
    color: '#10b981',
    fontSize: '0.74rem',
    fontWeight: 700
  },
  componentUptimeVal: {
    color: 'var(--text-dark)',
    fontSize: '0.78rem'
  },
  uptimeBarWrapper: {
    display: 'flex',
    gap: '2px',
    height: '24px',
    background: 'rgba(255,255,255,0.01)',
    padding: '3px 0'
  },
  uptimeTick: {
    flex: 1,
    height: '100%',
    borderRadius: '1px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  uptimeAxisRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.68rem',
    color: 'var(--text-dark)',
    marginTop: '0.1rem'
  },
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    alignItems: 'start'
  },
  panelSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.05rem',
    marginBottom: '1rem'
  },
  chartWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  svg: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  chartLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    color: 'var(--text-dark)'
  },
  timelineWrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '0.5rem'
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem',
    position: 'relative'
  },
  timelineIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '12px'
  },
  timelineNodeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 6px rgba(16,185,129,0.5)',
    zIndex: 2,
    marginTop: '4px'
  },
  timelineLineTrack: {
    width: '1px',
    flex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    margin: '4px 0'
  },
  timelineContent: {
    flex: 1,
    paddingBottom: '1.5rem'
  },
  incidentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  incidentStatusBadge: {
    fontSize: '0.6rem',
    fontWeight: '800',
    color: '#10b981',
    border: '1px solid rgba(16,185,129,0.25)',
    background: 'rgba(16,185,129,0.05)',
    borderRadius: '4px',
    padding: '1px 5px',
    letterSpacing: '0.04em'
  },
  incidentTitle: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#fff'
  },
  incidentDate: {
    fontSize: '0.68rem',
    color: 'var(--text-dark)',
    marginTop: '0.2rem',
    marginBottom: '0.35rem'
  },
  incidentDesc: {
    fontSize: '0.74rem',
    lineHeight: '1.45',
    color: 'var(--text-muted)'
  }
};
