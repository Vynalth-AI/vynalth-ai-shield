import React, { useState, useEffect } from 'react';
import type { ShieldConfig, VerificationLog } from '../types';

interface DashboardProps {
  config: ShieldConfig;
  logs: VerificationLog[];
  onAddLog?: (
    method: VerificationLog['method'],
    status: VerificationLog['status'],
    score: number,
    flags?: string[],
    deviceAnomalies?: string[]
  ) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ config, logs, onAddLog }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; human: number; bot: number; index: number } | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(2000);
  const [trafficProfile, setTrafficProfile] = useState<'balanced' | 'bots' | 'humans'>('balanced');
  
  // Real-time threat feed events shown next to the radar
  const [radarThreats, setRadarThreats] = useState<Array<{ id: string; time: string; ip: string; location: string; event: string }>>([
    { id: '1', time: '12:20:15', ip: '185.220.101.4', location: 'DE (Frankfurt)', event: 'AI Bot Blocked' },
    { id: '2', time: '12:19:42', ip: '103.149.162.25', location: 'SG (Singapore)', event: 'WebDriver Flagged' },
    { id: '3', time: '12:18:03', ip: '45.89.230.12', location: 'RU (Moscow)', event: 'Exploit Intercepted' },
  ]);

  // Simulate telemetry feeds
  useEffect(() => {
    if (!isSimulating || !onAddLog) return;

    const interval = setInterval(() => {
      let status: VerificationLog['status'] = 'passed';
      const rand = Math.random();

      if (trafficProfile === 'balanced') {
        if (rand < 0.25) status = 'blocked';
        else if (rand < 0.40) status = 'flagged';
      } else if (trafficProfile === 'bots') {
        if (rand < 0.80) status = 'blocked';
        else if (rand < 0.95) status = 'flagged';
      } else if (trafficProfile === 'humans') {
        if (rand < 0.02) status = 'blocked';
        else if (rand < 0.10) status = 'flagged';
      }

      let method: VerificationLog['method'] = 'behavioral_telemetry';
      let score = 5;
      let flags: string[] = [];
      let anomalies: string[] = [];

      if (status === 'passed') {
        method = Math.random() < 0.8 ? 'behavioral_telemetry' : 'biometric_scan';
        score = Math.floor(Math.random() * 15);
      } else if (status === 'flagged') {
        method = Math.random() < 0.6 ? 'captcha_3d' : 'behavioral_telemetry';
        score = 35 + Math.floor(Math.random() * 30);
        const allFlags = ['suspicious_mouse_micro_tremors', 'click_no_deceleration_pause', 'keystroke_flight_time_anomalous'];
        flags = allFlags.filter(() => Math.random() < 0.6);
      } else {
        const methods: Array<VerificationLog['method']> = ['cryptographic_pow', 'behavioral_telemetry', 'captcha_3d'];
        method = methods[Math.floor(Math.random() * 3)];
        score = 85 + Math.floor(Math.random() * 15);
        const allFlags = ['perfectly_straight_mouse_trajectory', 'bot_paste_submit_abuse', 'sub_500ms_form_submission_speed'];
        flags = allFlags.filter(() => Math.random() < 0.6);
        const allAnomalies = ['navigator_webdriver_active', 'headless_screen_dimensions_zeroed', 'virtualized_gpu_environment'];
        anomalies = allAnomalies.filter(() => Math.random() < 0.6);
      }

      onAddLog(method, status, score, flags, anomalies);

      // Also dynamically update our spinning radar threat ticker feed
      if (status === 'blocked' || status === 'flagged') {
        const newIp = `${Math.floor(Math.random() * 220) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        const locations = ['US (San Francisco)', 'CN (Shenzhen)', 'RU (St. Petersburg)', 'JP (Tokyo)', 'DE (Munich)'];
        const loc = locations[Math.floor(Math.random() * locations.length)];
        const events = ['Headless Crawler Blocked', 'High Anomaly Index Blocked', 'Fingerprint Spoofing Dropped', 'C2 Botnet IP Matched'];
        const evt = events[Math.floor(Math.random() * events.length)];

        setRadarThreats(prev => [
          {
            id: String(Date.now()),
            time: new Date().toLocaleTimeString(),
            ip: newIp,
            location: loc,
            event: evt
          },
          ...prev.slice(0, 4)
        ]);
      }
    }, simSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, trafficProfile, onAddLog]);

  // Calculate live stats dynamically based on logs
  const total = logs.length;
  const blocked = logs.filter(l => l.status === 'blocked').length;
  const passed = logs.filter(l => l.status === 'passed').length;
  const flagged = logs.filter(l => l.status === 'flagged').length;

  const botRate = total ? ((blocked / total) * 100).toFixed(1) + '%' : '0.0%';
  const deviceTrust = total ? (((passed + flagged) / total) * 100).toFixed(1) + '%' : '100.0%';

  const kpis = [
    {
      title: 'Total Inquiries Analyzed',
      value: total.toLocaleString(),
      change: 'Real-time telemetry requests',
      isUp: true,
      color: 'var(--secondary)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
      )
    },
    {
      title: 'Bot Threat Intensity',
      value: botRate,
      change: `${blocked} intrusion blocks active`,
      isUp: blocked > 0,
      color: '#f59e0b',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    },
    {
      title: 'Firewall Drop Actions',
      value: blocked.toLocaleString(),
      change: 'Hard HTTP 403 blocks executed',
      isUp: blocked > 0,
      color: '#ef4444',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    },
    {
      title: 'Aggregate User Integrity',
      value: deviceTrust,
      change: 'Authentic human validations',
      isUp: true,
      color: '#10b981',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 11 11 13 15 9" />
        </svg>
      )
    }
  ];

  // Group logs dynamically by day of week
  const chartData = [
    { day: 'Mon', human: logs.filter(l => l.status !== 'blocked' && new Date(l.timestamp).getDay() === 1).length, bot: logs.filter(l => l.status === 'blocked' && new Date(l.timestamp).getDay() === 1).length },
    { day: 'Tue', human: logs.filter(l => l.status !== 'blocked' && new Date(l.timestamp).getDay() === 2).length, bot: logs.filter(l => l.status === 'blocked' && new Date(l.timestamp).getDay() === 2).length },
    { day: 'Wed', human: logs.filter(l => l.status !== 'blocked' && new Date(l.timestamp).getDay() === 3).length, bot: logs.filter(l => l.status === 'blocked' && new Date(l.timestamp).getDay() === 3).length },
    { day: 'Thu', human: logs.filter(l => l.status !== 'blocked' && new Date(l.timestamp).getDay() === 4).length, bot: logs.filter(l => l.status === 'blocked' && new Date(l.timestamp).getDay() === 4).length },
    { day: 'Fri', human: logs.filter(l => l.status !== 'blocked' && new Date(l.timestamp).getDay() === 5).length, bot: logs.filter(l => l.status === 'blocked' && new Date(l.timestamp).getDay() === 5).length },
    { day: 'Sat', human: logs.filter(l => l.status !== 'blocked' && new Date(l.timestamp).getDay() === 6).length, bot: logs.filter(l => l.status === 'blocked' && new Date(l.timestamp).getDay() === 6).length },
    { day: 'Sun', human: logs.filter(l => l.status !== 'blocked' && new Date(l.timestamp).getDay() === 0).length, bot: logs.filter(l => l.status === 'blocked' && new Date(l.timestamp).getDay() === 0).length }
  ];

  const maxVal = Math.max(10, ...chartData.map(d => Math.max(d.human, d.bot))) + 2;
  const yLabels = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

  // Calculate live verification method distribution for Threat Intelligence
  const methodCounts = {
    telemetry: logs.filter(l => l.method === 'behavioral_telemetry').length,
    captcha: logs.filter(l => l.method === 'captcha_3d').length,
    pow: logs.filter(l => l.method === 'cryptographic_pow').length,
    biometrics: logs.filter(l => l.method === 'biometric_scan').length
  };
  const methodTotal = total || 1;
  const pctTelemetry = ((methodCounts.telemetry / methodTotal) * 100).toFixed(1);
  const pctCaptcha = ((methodCounts.captcha / methodTotal) * 100).toFixed(1);
  const pctPow = ((methodCounts.pow / methodTotal) * 100).toFixed(1);
  const pctBiometrics = ((methodCounts.biometrics / methodTotal) * 100).toFixed(1);

  const width = 600;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates helper
  const getCoords = (index: number, val: number) => {
    const x = paddingLeft + (index / (chartData.length - 1)) * chartWidth;
    const y = height - paddingBottom - (val / maxVal) * chartHeight;
    return { x, y };
  };

  // Generate paths
  const humanCoords = chartData.map((d, i) => getCoords(i, d.human));
  const botCoords = chartData.map((d, i) => getCoords(i, d.bot));

  // Generates organic smooth Bezier paths instead of rigid jagged lines
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

  const createSmoothAreaPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    const line = createSmoothPath(coords);
    return `${line} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;
  };

  const humanLine = createSmoothPath(humanCoords);
  const humanArea = createSmoothAreaPath(humanCoords);
  const botLine = createSmoothPath(botCoords);
  const botArea = createSmoothAreaPath(botCoords);

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">Defense Operations Console</h1>
          <p style={styles.subtitle}>Real-time biometric kinetics telemetry, network risk parameters, and active firewall mitigations.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={styles.presetBadge}>
            <span>Preset: <strong>{
              config.preset === 'social' ? 'Social Platform' :
              config.preset === 'ai_apps' ? 'AI Apps Guard' :
              config.preset === 'crypto' ? 'Anti-Sybil Crypto' :
              config.preset === 'gaming' ? 'Gaming Macro' : 'General Web'
            }</strong></span>
          </div>
          <div style={{
            ...styles.threatBadge,
            background: isSimulating && trafficProfile === 'bots' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
            borderColor: isSimulating && trafficProfile === 'bots' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)',
          }}>
            <span style={{
              ...styles.threatPulse,
              background: isSimulating && trafficProfile === 'bots' ? 'var(--danger)' : 'var(--success)',
              boxShadow: isSimulating && trafficProfile === 'bots' ? '0 0 10px var(--danger)' : '0 0 10px var(--success)',
            }} />
            <span>Threat Level: <strong style={{ color: isSimulating && trafficProfile === 'bots' ? 'var(--danger)' : 'var(--success)' }}>{isSimulating && trafficProfile === 'bots' ? 'ATTACK INDICATION' : 'NORMAL'}</strong></span>
          </div>
        </div>
      </div>

      {/* Global Defense Map & Live Radar Screen */}
      <div className="premium-card" style={{ ...styles.radarLayout, boxShadow: 'var(--glow-shadow)' }}>
        {/* Left Side: Dynamic Spinning Radar Screen */}
        <div style={styles.radarVisualContainer}>
          <div style={styles.radarWrapper}>
            {/* Spinning sweeps */}
            <div style={styles.radarSweeper}></div>
            {/* Concentric rings */}
            <div style={{ ...styles.radarRing, width: '100%', height: '100%' }}></div>
            <div style={{ ...styles.radarRing, width: '75%', height: '75%' }}></div>
            <div style={{ ...styles.radarRing, width: '50%', height: '50%' }}></div>
            <div style={{ ...styles.radarRing, width: '25%', height: '25%' }}></div>
            {/* Crosshairs */}
            <div style={styles.radarAxisH}></div>
            <div style={styles.radarAxisV}></div>
            
            {/* Blinking threat markers */}
            <span style={{ ...styles.radarThreatDot, top: '24%', left: '72%', animationDelay: '0.3s' }}></span>
            <span style={{ ...styles.radarThreatDot, top: '65%', left: '35%', animationDelay: '0.8s' }}></span>
            <span style={{ ...styles.radarThreatDot, top: '42%', left: '18%', animationDelay: '1.4s' }}></span>
            <span style={{ ...styles.radarThreatDot, top: '80%', left: '60%', animationDelay: '0.1s', background: '#f59e0b' }}></span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.06em', color: '#00ffff' }}>ACTIVE DEFENSIVE RADAR</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SCANNING GATEWAYS | RANGE: 2500mi</span>
          </div>
        </div>

        {/* Right Side: Log Feed representing ongoing blockades */}
        <div style={styles.radarFeedContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Ongoing Blockade Ledgers</span>
            <span style={styles.radarLiveBadge}>SECURE STREAM</span>
          </div>
          <div style={styles.radarFeedList}>
            {radarThreats.map(t => (
              <div key={t.id} style={styles.radarFeedRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={styles.radarBlockBadge}>BLOCK</span>
                  <span style={styles.radarRowIp}>{t.ip}</span>
                </div>
                <span style={styles.radarRowLoc}>{t.location}</span>
                <span style={styles.radarRowEvt}>{t.event}</span>
                <span style={styles.radarRowTime}>{t.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Gateway Simulator Control Card */}
      <div className="premium-card" style={styles.simulatorPanel}>
        <div style={styles.simulatorHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isSimulating ? 'var(--secondary)' : 'var(--text-dark)',
              boxShadow: isSimulating ? '0 0 10px var(--secondary)' : 'none',
              animation: isSimulating ? 'pulse-glow 2s infinite' : 'none'
            }} />
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700', color: '#fff' }}>
              Edge Gateway Live Traffic Simulator Control
            </h3>
          </div>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="btn"
            style={{
              padding: '0.4rem 1.2rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              background: isSimulating ? 'rgba(239, 68, 68, 0.12)' : 'rgba(6, 182, 212, 0.12)',
              border: isSimulating ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(6, 182, 212, 0.35)',
              color: isSimulating ? 'var(--danger)' : 'var(--secondary)',
              transition: 'all 0.3s'
            }}
          >
            {isSimulating ? 'SHUT DOWN FEED' : 'ACTIVATE SIMULATION FEED'}
          </button>
        </div>
        <p style={{ margin: '0.25rem 0 1rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Inject live, randomized human/bot traffic patterns to observe real-time updates across charts, thresholds, threat filters, and ledger telemetry.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <label style={styles.simLabel}>Traffic Profile</label>
            <select
              value={trafficProfile}
              onChange={(e) => setTrafficProfile(e.target.value as any)}
              disabled={!isSimulating}
              style={styles.simSelect}
            >
              <option value="balanced">Balanced (Normal Mix)</option>
              <option value="humans">Mostly Human Traffic</option>
              <option value="bots">Coordinated Bot Attack</option>
            </select>
          </div>
          <div>
            <label style={styles.simLabel}>Simulation Speed</label>
            <select
              value={simSpeed}
              onChange={(e) => setSimSpeed(Number(e.target.value))}
              disabled={!isSimulating}
              style={styles.simSelect}
            >
              <option value={4000}>Slow (Every 4s)</option>
              <option value={2000}>Normal (Every 2s)</option>
              <option value={800}>Fast (Every 0.8s)</option>
            </select>
          </div>
          <div>
            <label style={styles.simLabel}>Live Activity Feed (Incoming Requests)</label>
            <div style={styles.simFeedConsole}>
              {logs.slice(0, 3).map((log) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '3px' }}>
                  <span style={{
                    color: log.status === 'passed' ? 'var(--success)' : log.status === 'flagged' ? 'var(--warning)' : 'var(--danger)',
                    fontWeight: '700',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    [{log.status.toUpperCase()}]
                  </span>
                  <span style={{ color: '#fff', opacity: 0.85, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>{log.location}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{log.device}</span>
                  <span style={{ color: log.riskScore > 75 ? 'var(--danger)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Score: {log.riskScore}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontStyle: 'italic', textAlign: 'center', paddingTop: '5px' }}>
                  Gateway idle. Enable the simulator to view live traffic.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className="premium-card kpi-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.25rem' }}>
            <div className="kpi-header">
              <span className="kpi-title" style={{ fontSize: '0.74rem', letterSpacing: '0.06em' }}>{kpi.title}</span>
              <div className="kpi-icon-wrapper" style={{ width: '36px', height: '36px' }}>{kpi.icon}</div>
            </div>
            <div className="kpi-value" style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{kpi.value}</div>
            <div className={`kpi-change ${kpi.isUp ? 'up' : 'down'}`} style={{ fontSize: '0.74rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: kpi.isUp ? 'rotate(0deg)' : 'rotate(180deg)', marginRight: '3px' }}>
                <polyline points="18 15 12 9 6 15" />
              </svg>
              <span>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Geo Splits */}
      <div style={styles.chartsGrid}>
        {/* Verification Traffic Smooth Bezier Line Chart */}
        <div className="premium-card" style={styles.chartPanel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>Verification Traffic Analytics</h3>
              <p style={styles.panelSubtitle}>Weekly verification request load vs bot interventions</p>
            </div>
            <div style={styles.chartLegend}>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: 'var(--secondary)' }} />
                <span style={styles.legendText}>Humans Verified</span>
              </div>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: 'var(--danger)' }} />
                <span style={styles.legendText}>Bots Blocked</span>
              </div>
            </div>
          </div>

          <div style={styles.chartWrapper}>
            <svg viewBox={`0 0 ${width} ${height}`} style={styles.svg}>
              <defs>
                <linearGradient id="humanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="botGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--danger)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--danger)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
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

              {/* X Axis Labels */}
              {chartData.map((d, i) => {
                const x = paddingLeft + (i / (chartData.length - 1)) * chartWidth;
                return (
                  <text
                    key={i}
                    x={x}
                    y={height - 10}
                    fill="var(--text-dark)"
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {d.day}
                  </text>
                );
              })}

              {/* Y Axis Labels */}
              {yLabels.map((val, i) => {
                const y = height - paddingBottom - (val / maxVal) * chartHeight;
                return (
                  <text
                    key={i}
                    x={paddingLeft - 8}
                    y={y + 4}
                    fill="var(--text-dark)"
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="end"
                  >
                    {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                  </text>
                );
              })}

              {/* Area Under Curves */}
              <path d={humanArea} fill="url(#humanGrad)" />
              <path d={botArea} fill="url(#botGrad)" />

              {/* Smooth Bezier Line Curves */}
              <path d={humanLine} fill="none" stroke="var(--secondary)" strokeWidth="2.5" />
              <path d={botLine} fill="none" stroke="var(--danger)" strokeWidth="2" />

              {/* Interaction points */}
              {chartData.map((d, i) => {
                const hc = humanCoords[i];
                const bc = botCoords[i];
                const isHovered = hoveredPoint?.index === i;
                return (
                  <g key={i}>
                    {/* Hover hotspot */}
                    <rect
                       x={hc.x - 20}
                      y={0}
                      width={40}
                      height={height}
                      fill="transparent"
                      cursor="pointer"
                      onMouseEnter={() => setHoveredPoint({ ...d, index: i })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    
                    {/* Human dot */}
                    <circle
                      cx={hc.x}
                      cy={hc.y}
                      r={isHovered ? 5.5 : 3.5}
                      fill="#06b6d4"
                      stroke="#080b10"
                      strokeWidth="2"
                    />

                    {/* Bot dot */}
                    <circle
                      cx={bc.x}
                      cy={bc.y}
                      r={isHovered ? 4.5 : 2.5}
                      fill="#ef4444"
                      stroke="#080b10"
                      strokeWidth="1.5"
                    />

                    {/* Hover vertical line */}
                    {isHovered && (
                      <line
                        x1={hc.x}
                        y1={paddingTop}
                        x2={hc.x}
                        y2={height - paddingBottom}
                        stroke="rgba(6, 182, 212, 0.25)"
                        strokeWidth="1"
                        pointerEvents="none"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div style={{
                ...styles.tooltip,
                left: `${paddingLeft + (hoveredPoint.index / (chartData.length - 1)) * chartWidth}px`
              }}>
                <div style={styles.tooltipTitle}>{hoveredPoint.day} Analytics</div>
                <div style={{ color: 'var(--secondary)', display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
                  <span>Verified:</span> <strong>{hoveredPoint.human.toLocaleString()}</strong>
                </div>
                <div style={{ color: 'var(--danger)', display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
                  <span>Blocked:</span> <strong>{hoveredPoint.bot.toLocaleString()}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Threat Intelligence / Bot Origins */}
        <div className="premium-card" style={styles.sidePanel}>
          <h3 style={styles.panelTitle}>Threat Analytics</h3>
          <p style={styles.panelSubtitle}>Key traffic channels and automated bot fingerprints</p>

          <div style={styles.metricList}>
            <div style={styles.metricRow}>
              <div style={styles.metricLabelInfo}>
                <span style={styles.metricColorIndicator} />
                <span>Behavioral Telemetry</span>
              </div>
              <span style={styles.metricValueText}>{pctTelemetry}%</span>
            </div>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${pctTelemetry}%`, background: 'var(--primary)' }} />
            </div>

            <div style={styles.metricRow}>
              <div style={styles.metricLabelInfo}>
                <span style={{ ...styles.metricColorIndicator, background: 'var(--secondary)' }} />
                <span>3D Capcha Challenge</span>
              </div>
              <span style={styles.metricValueText}>{pctCaptcha}%</span>
            </div>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${pctCaptcha}%`, background: 'var(--secondary)' }} />
            </div>

            <div style={styles.metricRow}>
              <div style={styles.metricLabelInfo}>
                <span style={{ ...styles.metricColorIndicator, background: 'var(--warning)' }} />
                <span>Proof-of-Work Puzzles</span>
              </div>
              <span style={styles.metricValueText}>{pctPow}%</span>
            </div>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${pctPow}%`, background: 'var(--warning)' }} />
            </div>

            <div style={styles.metricRow}>
              <div style={styles.metricLabelInfo}>
                <span style={{ ...styles.metricColorIndicator, background: 'var(--danger)' }} />
                <span>Kinetics Biometric Scan</span>
              </div>
              <span style={styles.metricValueText}>{pctBiometrics}%</span>
            </div>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${pctBiometrics}%`, background: 'var(--danger)' }} />
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h4 style={{ ...styles.panelTitle, fontSize: '0.88rem', marginBottom: '0.75rem', color: '#fff' }}>Blocked Bot Breakdown</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>🤖 AI Crawlers & Operators:</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>
                  {logs.filter(l => l.deviceAnomalies?.includes('automated_ai_agent_signature') || (l.browser && l.browser.includes('Headless'))).length} blocked
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>⚙️ WebDriver Automation:</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>
                  {logs.filter(l => l.deviceAnomalies?.includes('navigator_webdriver_active')).length} blocked
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>🖥️ Virtual Headless VMs:</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>
                  {logs.filter(l => l.deviceAnomalies?.includes('virtualized_gpu_environment')).length} blocked
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>🚫 JS-Disabled Agents:</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>
                  {logs.filter(l => l.deviceAnomalies?.includes('javascript_disabled_client')).length} blocked
                </span>
              </div>
            </div>
          </div>

          <div style={styles.warningBox}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div style={styles.warningText}>
              Telemetry spike mitigation active. Automatically scaling Proof-of-Work difficulty ratios for suspicious sub-networks.
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
    gap: '1.75rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.03em'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.94rem',
    marginTop: '0.2rem'
  },
  presetBadge: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(6, 182, 212, 0.04)',
    border: '1px solid rgba(6, 182, 212, 0.18)',
    padding: '0.45rem 0.9rem',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#fff'
  },
  threatBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '0.45rem 0.9rem',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#fff',
    transition: 'all 0.3s'
  },
  threatPulse: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    animation: 'dot-pulse 2.5s infinite'
  },
  radarLayout: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: '1.75rem',
    padding: '1.5rem',
    background: 'rgba(5, 7, 12, 0.65)',
    border: '1px solid rgba(6, 182, 212, 0.12)',
    boxShadow: 'var(--glow-shadow)',
    borderRadius: '16px',
    alignItems: 'center'
  },
  radarVisualContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    paddingRight: '1.75rem'
  },
  radarWrapper: {
    position: 'relative',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(6, 182, 212, 0.02)',
    border: '1px solid rgba(6, 182, 212, 0.25)',
    boxShadow: 'inset 0 0 15px rgba(6, 182, 212, 0.1)',
    overflow: 'hidden'
  },
  radarSweeper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.15) 0deg, rgba(6, 182, 212, 0.05) 90deg, transparent 180deg)',
    borderRadius: '50%',
    animation: 'radar-scan 4s linear infinite',
    transformOrigin: 'center'
  },
  radarRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    border: '1px dashed rgba(6, 182, 212, 0.12)'
  },
  radarAxisH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: '1px',
    background: 'rgba(6, 182, 212, 0.1)'
  },
  radarAxisV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    width: '1px',
    height: '100%',
    background: 'rgba(6, 182, 212, 0.1)'
  },
  radarThreatDot: {
    position: 'absolute',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#ef4444',
    boxShadow: '0 0 8px #ef4444',
    animation: 'blink-threat 2.5s infinite'
  },
  radarFeedContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '130px'
  },
  radarLiveBadge: {
    fontSize: '0.62rem',
    fontWeight: '800',
    color: '#00ffff',
    background: 'rgba(6, 182, 212, 0.15)',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    borderRadius: '4px',
    padding: '1px 6px',
    letterSpacing: '0.05em'
  },
  radarFeedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    overflowY: 'hidden',
    height: '100px'
  },
  radarFeedRow: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr 2fr 0.6fr',
    alignItems: 'center',
    fontSize: '0.74rem',
    fontFamily: 'var(--font-mono)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    paddingBottom: '4px',
    color: 'var(--text-muted)'
  },
  radarBlockBadge: {
    fontSize: '0.62rem',
    fontWeight: '800',
    color: '#ef4444',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '4px',
    padding: '1px 4px',
    textAlign: 'center'
  },
  radarRowIp: {
    color: '#fff',
    fontWeight: '600'
  },
  radarRowLoc: {
    color: 'var(--text-muted)',
    opacity: 0.85
  },
  radarRowEvt: {
    color: '#f59e0b',
    opacity: 0.9
  },
  radarRowTime: {
    color: 'var(--text-dark)',
    textAlign: 'right'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.7fr 1fr',
    gap: '1.5rem',
    alignItems: 'start'
  },
  chartPanel: {
    padding: '1.5rem',
    position: 'relative'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  panelTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em'
  },
  panelSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem'
  },
  chartLegend: {
    display: 'flex',
    gap: '1.25rem'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  legendText: {
    fontSize: '0.76rem',
    color: 'var(--text-muted)',
    fontWeight: '500'
  },
  chartWrapper: {
    position: 'relative',
    width: '100%'
  },
  svg: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  tooltip: {
    position: 'absolute',
    top: '15px',
    transform: 'translateX(-50%)',
    background: 'rgba(5, 7, 12, 0.95)',
    border: '1px solid var(--border-color-glow)',
    boxShadow: 'var(--glow-shadow)',
    borderRadius: '8px',
    padding: '0.65rem 0.9rem',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    zIndex: 10,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem'
  },
  tooltipTitle: {
    fontWeight: '700',
    color: '#fff',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '0.2rem',
    marginBottom: '0.2rem'
  },
  sidePanel: {
    padding: '1.5rem'
  },
  metricList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.7rem',
    margin: '1.25rem 0'
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem'
  },
  metricLabelInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: 'var(--text-muted)'
  },
  metricColorIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--primary)'
  },
  metricValueText: {
    fontWeight: '700',
    color: '#fff'
  },
  progressContainer: {
    width: '100%',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: '2px'
  },
  warningBox: {
    display: 'flex',
    gap: '0.6rem',
    background: 'rgba(245, 158, 11, 0.02)',
    border: '1px solid rgba(245, 158, 11, 0.1)',
    borderRadius: '10px',
    padding: '0.75rem 0.9rem',
    marginTop: '1.25rem'
  },
  warningText: {
    fontSize: '0.72rem',
    lineHeight: '1.4',
    color: 'var(--text-muted)'
  },
  simulatorPanel: {
    padding: '1.25rem',
    background: 'rgba(6, 182, 212, 0.02)',
    border: '1px solid rgba(6, 182, 212, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(8px)',
  },
  simulatorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.5rem',
    marginBottom: '0.5rem'
  },
  simLabel: {
    display: 'block',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginBottom: '0.2rem',
    fontWeight: '600'
  },
  simSelect: {
    width: '100%',
    background: 'rgba(5, 7, 12, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '0.4rem 0.65rem',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.76rem',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  simFeedConsole: {
    background: 'rgba(5, 7, 12, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    padding: '0.45rem 0.65rem',
    height: '56px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    overflowY: 'hidden',
    fontFamily: 'var(--font-mono)'
  }
};
