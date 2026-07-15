import React, { useState, useEffect } from 'react';
import type { VerificationLog } from '../types';

interface TrustCenterProps {
  logs: VerificationLog[];
}

export const TrustCenter: React.FC<TrustCenterProps> = ({ logs }) => {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'passed' | 'blocked'>('all');
  const [autoencoderThreshold, setAutoencoderThreshold] = useState<number>(60);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deploySuccess, setDeploySuccess] = useState<boolean>(false);
  const [commandBarActive, setCommandBarActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Node locations mapping for live latency representation
  const [gatewayNodes, setGatewayNodes] = useState([
    { name: 'US-West (San Francisco)', ip: '24.120.10.4', active: true, latency: 1.1, scrubbed: 489201 },
    { name: 'EU-Central (Frankfurt)', ip: '185.220.101.4', active: true, latency: 2.3, scrubbed: 312048 },
    { name: 'AP-East (Tokyo)', ip: '172.56.21.90', active: true, latency: 1.8, scrubbed: 198305 },
    { name: 'AP-South (Singapore)', ip: '103.149.162.25', active: true, latency: 1.5, scrubbed: 245109 },
  ]);

  // Handle keyboard shortcuts (Linear feel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle command bar with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarActive(prev => !prev);
      }
      // Escape closes inspect drawer / command bar
      if (e.key === 'Escape') {
        setSelectedLogId(null);
        setCommandBarActive(false);
      }
      // Quick filter hotkeys if not typing in input
      if (document.activeElement?.tagName !== 'INPUT') {
        if (e.key === 'a' || e.key === 'A') setActiveFilter('all');
        if (e.key === 'p' || e.key === 'P') setActiveFilter('passed');
        if (e.key === 'b' || e.key === 'B') setActiveFilter('blocked');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simulate network telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGatewayNodes(prev => prev.map(node => ({
        ...node,
        latency: parseFloat((node.latency + (Math.random() * 0.4 - 0.2)).toFixed(2)),
        scrubbed: node.scrubbed + Math.floor(Math.random() * 8)
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDeployWeights = () => {
    setIsDeploying(true);
    setDeploySuccess(false);
    setTimeout(() => {
      setIsDeploying(false);
      setDeploySuccess(true);
      setTimeout(() => setDeploySuccess(false), 3000);
    }, 1500);
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = 
      activeFilter === 'all' || 
      (activeFilter === 'passed' && log.status === 'passed') || 
      (activeFilter === 'blocked' && log.status === 'blocked');
    
    const matchesSearch = 
      log.ipAddress.includes(searchQuery) ||
      log.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.includes(searchQuery) ||
      (log.browser && log.browser.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const selectedLog = logs.find(log => log.id === selectedLogId);

  return (
    <div style={styles.container}>
      {/* Dynamic Key command prompt banner */}
      <div style={styles.commandBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={styles.commandKey}>⌘ K</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Press <code style={styles.inlineCode}>Cmd+K</code> to open Command Menu. Use hotkeys <code style={styles.inlineCode}>A</code>, <code style={styles.inlineCode}>P</code>, <code style={styles.inlineCode}>B</code> to filter.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={styles.activePulse}></span>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.05em', color: '#00ffff' }}>LIVE TELEMETRY ACTIVE</span>
        </div>
      </div>

      {/* Hero Header Area (Apple Simplicity) */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">Trust Center</h1>
          <p style={styles.subtitle}>
            Real-time biometric validation transparency, SLA compliance logs, and edge autoencoder model telemetry.
          </p>
        </div>
        <div style={styles.uptimeBadgeBox}>
          <div style={{ textAlign: 'right' }}>
            <span style={styles.uptimePercentage}>99.998%</span>
            <span style={styles.uptimeLabel}>30-DAY COMPLIANCE SLA</span>
          </div>
          <div style={styles.uptimeChartDot}></div>
        </div>
      </header>

      {/* Live Gateway Nodes Metrics Cards */}
      <section style={styles.nodesGrid}>
        {gatewayNodes.map((node) => (
          <div key={node.name} className="glass-panel" style={styles.nodeCard}>
            <div style={styles.nodeCardHeader}>
              <span style={styles.nodeName}>{node.name}</span>
              <span style={{ ...styles.nodeIndicator, background: node.active ? '#06b6d4' : '#ef4444' }} />
            </div>
            <div style={styles.nodeCardBody}>
              <div style={styles.nodeStat}>
                <span style={styles.nodeStatLabel}>Ping Latency</span>
                <span style={styles.nodeStatValue}>{node.latency} ms</span>
              </div>
              <div style={styles.nodeStat}>
                <span style={styles.nodeStatLabel}>Scrubbed Requests</span>
                <span style={styles.nodeStatValue}>{node.scrubbed.toLocaleString()}</span>
              </div>
            </div>
            <div style={styles.nodeIpAddress}>{node.ip}</div>
          </div>
        ))}
      </section>

      {/* Main Workspace Layout */}
      <div style={styles.workspaceLayout}>
        
        {/* Left Column: Live Traffic Autopsy Log Stream (Cloudflare/Stripe quality) */}
        <div className="glass-panel" style={styles.autopsyPanel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Decoupled Telemetry Stream</h3>
            <div style={styles.filterControls}>
              <input 
                placeholder="Search IP, location, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchBar}
              />
              <div style={styles.buttonGroup}>
                <button 
                  onClick={() => setActiveFilter('all')}
                  style={{ ...styles.filterBtn, ...(activeFilter === 'all' ? styles.filterBtnActive : {}) }}
                >
                  All (A)
                </button>
                <button 
                  onClick={() => setActiveFilter('passed')}
                  style={{ ...styles.filterBtn, ...(activeFilter === 'passed' ? styles.filterBtnActive : {}) }}
                >
                  Passed (P)
                </button>
                <button 
                  onClick={() => setActiveFilter('blocked')}
                  style={{ ...styles.filterBtn, ...(activeFilter === 'blocked' ? styles.filterBtnActive : {}) }}
                >
                  Blocked (B)
                </button>
              </div>
            </div>
          </div>

          <div style={styles.logList}>
            {filteredLogs.length === 0 ? (
              <div style={styles.emptyLogs}>No matching telemetry logs found.</div>
            ) : (
              filteredLogs.map((log) => {
                const isBlocked = log.status === 'blocked' || log.status === 'flagged';
                return (
                  <div 
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    style={{
                      ...styles.logRow,
                      borderColor: selectedLogId === log.id ? '#00ffff' : 'rgba(255, 255, 255, 0.04)',
                      background: selectedLogId === log.id ? 'rgba(6, 182, 212, 0.05)' : 'rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    <div style={styles.logRowLeft}>
                      <span style={{ 
                        ...styles.statusBadge, 
                        background: isBlocked ? 'rgba(244, 63, 94, 0.12)' : 'rgba(6, 182, 212, 0.12)',
                        color: isBlocked ? '#f43f5e' : '#00ffff',
                        borderColor: isBlocked ? 'rgba(244, 63, 94, 0.3)' : 'rgba(6, 182, 212, 0.3)'
                      }}>
                        {log.status.toUpperCase()}
                      </span>
                      <div style={styles.logInfo}>
                        <span style={styles.logIp}>{log.ipAddress}</span>
                        <span style={styles.logMeta}>{log.location} • {log.browser}</span>
                      </div>
                    </div>
                    <div style={styles.logRowRight}>
                      <span style={{ 
                        ...styles.riskIndicator,
                        color: log.riskScore > 60 ? '#f43f5e' : log.riskScore > 30 ? '#f59e0b' : '#10b981'
                      }}>
                        Risk: {log.riskScore}%
                      </span>
                      <span style={styles.logTime}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Neural Parameter Tuner (Linear Quality) */}
        <div className="glass-panel" style={styles.tunerPanel}>
          <div style={styles.tunerSection}>
            <h3 style={styles.panelTitle}>Active Autoencoder Settings</h3>
            <p style={styles.tunerDesc}>
              Calibrate risk classification weights dynamically. Changes compile and push parameters directly to Edge node gateway workers.
            </p>

            <div style={styles.controlGroup}>
              <div style={styles.controlHeader}>
                <span style={styles.controlLabel}>Risk Flag Threshold</span>
                <span style={styles.controlValue}>{autoencoderThreshold}%</span>
              </div>
              <input 
                type="range"
                min="10"
                max="90"
                value={autoencoderThreshold}
                onChange={(e) => setAutoencoderThreshold(parseInt(e.target.value))}
                style={styles.slider}
              />
              <div style={styles.sliderLabels}>
                <span>Sensitive</span>
                <span>Balanced</span>
                <span>Permissive</span>
              </div>
            </div>

            <div style={styles.matrixBox}>
              <span style={styles.matrixTitle}>Current Target Loss Matrix</span>
              <div style={styles.matrixGrid}>
                <div style={styles.matrixCell}>W1: 0.852</div>
                <div style={styles.matrixCell}>W2: -0.124</div>
                <div style={styles.matrixCell}>B1: 0.985</div>
                <div style={styles.matrixCell}>B2: 0.457</div>
              </div>
            </div>
          </div>

          <div style={styles.tunerActionBox}>
            <button 
              disabled={isDeploying}
              onClick={handleDeployWeights}
              style={{
                ...styles.deployBtn,
                background: isDeploying ? 'rgba(255, 255, 255, 0.1)' : '#fafafa',
                color: isDeploying ? 'var(--text-muted)' : '#09090b',
                cursor: isDeploying ? 'not-allowed' : 'pointer'
              }}
            >
              {isDeploying ? 'Deploying Neural Weights...' : 'Deploy Calibration to Edge'}
            </button>
            {deploySuccess && (
              <span style={styles.deploySuccessMessage}>
                ✓ Calibration pushed to 4 edge nodes successfully!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stripe-style Drawer Panel for detailed log inspections */}
      {selectedLog && (
        <div style={styles.drawerOverlay} onClick={() => setSelectedLogId(null)}>
          <div style={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div>
                <h4 style={styles.drawerTitle}>Telemetry Request Analysis</h4>
                <span style={styles.drawerId}>{selectedLog.id}</span>
              </div>
              <button style={styles.closeBtn} onClick={() => setSelectedLogId(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div style={styles.drawerContent}>
              {/* Telemetry metrics overview */}
              <div style={styles.drawerSection}>
                <h5 style={styles.drawerSectionTitle}>Overview</h5>
                <table style={styles.drawerTable}>
                  <tbody>
                    <tr>
                      <td style={styles.drawerTableLabel}>Client IP Address</td>
                      <td style={styles.drawerTableValue}>{selectedLog.ipAddress}</td>
                    </tr>
                    <tr>
                      <td style={styles.drawerTableLabel}>Geographic Origin</td>
                      <td style={styles.drawerTableValue}>{selectedLog.location}</td>
                    </tr>
                    <tr>
                      <td style={styles.drawerTableLabel}>Device Environment</td>
                      <td style={styles.drawerTableValue}>{selectedLog.device} ({selectedLog.browser})</td>
                    </tr>
                    <tr>
                      <td style={styles.drawerTableLabel}>Verification Mode</td>
                      <td style={styles.drawerTableValue}>{selectedLog.method}</td>
                    </tr>
                    <tr>
                      <td style={styles.drawerTableLabel}>Verification Result</td>
                      <td style={{
                        ...styles.drawerTableValue,
                        color: selectedLog.status === 'passed' ? '#00ffff' : '#f43f5e',
                        fontWeight: '700'
                      }}>{selectedLog.status.toUpperCase()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Behavior Analysis / Captcha Flags */}
              <div style={styles.drawerSection}>
                <h5 style={styles.drawerSectionTitle}>Biometric & Network Flag Diagnostics</h5>
                <div style={styles.anomalyList}>
                  {((selectedLog.flags || []).length === 0 && (selectedLog.deviceAnomalies || []).length === 0) ? (
                    <div style={styles.cleanTelemetryMessage}>
                      ✓ Telemetry parameters clean. No suspicious anomalies detected.
                    </div>
                  ) : (
                    <>
                      {(selectedLog.flags || []).map(flag => (
                        <div key={flag} style={styles.anomalyItem}>
                          <span style={styles.anomalyDotRed}></span>
                          <span style={styles.anomalyText}>{flag.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                      {(selectedLog.deviceAnomalies || []).map(anomaly => (
                        <div key={anomaly} style={{ ...styles.anomalyItem, background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                          <span style={styles.anomalyDotAmber}></span>
                          <span style={styles.anomalyText}>{anomaly.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Cryptographic Signature & Hash details */}
              <div style={styles.drawerSection}>
                <h5 style={styles.drawerSectionTitle}>Cryptographic Evidence Block</h5>
                <div style={styles.codeBlock}>
                  <div style={styles.codeLine}><span style={styles.codeKeyword}>"token_signature":</span> <span style={styles.codeString}>"sha256_b376d8ef924c18fa302d91c10729"</span></div>
                  <div style={styles.codeLine}><span style={styles.codeKeyword}>"client_site_key":</span> <span style={styles.codeString}>"vms_pub_live_38bf8c6e2"</span></div>
                  <div style={styles.codeLine}><span style={styles.codeKeyword}>"proof_of_work":</span> {"{"}</div>
                  <div style={styles.codeLine}>  <span style={styles.codeKeyword}>"nonce":</span> <span style={styles.codeNumber}>928157</span>,</div>
                  <div style={styles.codeLine}>  <span style={styles.codeKeyword}>"difficulty":</span> <span style={styles.codeNumber}>4</span></div>
                  <div style={styles.codeLine}>{"}"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette Menu overlay (Linear Style) */}
      {commandBarActive && (
        <div style={styles.commandOverlay} onClick={() => setCommandBarActive(false)}>
          <div style={styles.commandBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.commandHeader}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input 
                autoFocus 
                placeholder="Search commands (e.g. filter, deploy, clear)..."
                style={styles.commandInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.toLowerCase();
                    if (value.includes('passed') || value === 'p') setActiveFilter('passed');
                    else if (value.includes('blocked') || value === 'b') setActiveFilter('blocked');
                    else if (value.includes('all') || value === 'a') setActiveFilter('all');
                    else if (value.includes('deploy')) handleDeployWeights();
                    setCommandBarActive(false);
                  }
                }}
              />
            </div>
            <div style={styles.commandList}>
              <div style={styles.commandGroupTitle}>Filter Actions</div>
              <div style={styles.commandItem} onClick={() => { setActiveFilter('all'); setCommandBarActive(false); }}>
                <span>Show All Telemetry Logs</span>
                <span style={styles.commandShortcut}>A</span>
              </div>
              <div style={styles.commandItem} onClick={() => { setActiveFilter('passed'); setCommandBarActive(false); }}>
                <span>Filter by Passed Requests</span>
                <span style={styles.commandShortcut}>P</span>
              </div>
              <div style={styles.commandItem} onClick={() => { setActiveFilter('blocked'); setCommandBarActive(false); }}>
                <span>Filter by Blocked Requests</span>
                <span style={styles.commandShortcut}>B</span>
              </div>

              <div style={styles.commandGroupTitle}>Configuration Actions</div>
              <div style={styles.commandItem} onClick={() => { handleDeployWeights(); setCommandBarActive(false); }}>
                <span>Deploy Neural Calibration to Edge Gateways</span>
                <span style={styles.commandShortcut}>Deploy</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    position: 'relative',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem 0'
  },
  commandBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(6, 182, 212, 0.03)',
    border: '1px solid rgba(6, 182, 212, 0.1)',
    borderRadius: '8px',
    padding: '0.65rem 1rem',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  commandKey: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '4px',
    padding: '0.15rem 0.4rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: '#fff',
    fontWeight: '700'
  },
  inlineCode: {
    fontFamily: 'var(--font-mono)',
    color: '#00ffff',
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '0.1rem 0.25rem',
    borderRadius: '3px'
  },
  activePulse: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#00ffff',
    boxShadow: '0 0 8px #00ffff',
    display: 'inline-block',
    animation: 'dot-pulse 1.5s infinite'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.03em'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.92rem',
    marginTop: '0.25rem',
    maxWidth: '650px'
  },
  uptimeBadgeBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
    padding: '0.75rem 1rem'
  },
  uptimePercentage: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#00ffff',
    display: 'block',
    letterSpacing: '-0.02em'
  },
  uptimeLabel: {
    fontSize: '0.65rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em'
  },
  uptimeChartDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 10px #10b981'
  },
  nodesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    width: '100%'
  },
  nodeCard: {
    padding: '1.25rem',
    background: 'rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    position: 'relative'
  },
  nodeCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nodeName: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#fff'
  },
  nodeIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    boxShadow: '0 0 6px rgba(6, 182, 212, 0.6)'
  },
  nodeCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  nodeStat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nodeStatLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  nodeStatValue: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'var(--font-mono)'
  },
  nodeIpAddress: {
    fontSize: '0.68rem',
    color: 'rgba(255, 255, 255, 0.15)',
    fontFamily: 'var(--font-mono)',
    marginTop: '0.25rem'
  },
  workspaceLayout: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
    alignItems: 'start',
    width: '100%',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr'
    }
  } as any,
  autopsyPanel: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '1rem'
  },
  panelTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.01em'
  },
  filterControls: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  searchBar: {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.45rem 0.75rem',
    fontSize: '0.8rem',
    color: '#fff',
    outline: 'none',
    width: '160px'
  },
  buttonGroup: {
    display: 'flex',
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '2px'
  },
  filterBtn: {
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    padding: '0.35rem 0.75rem',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  filterBtnActive: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff'
  },
  logList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    maxHeight: '480px',
    overflowY: 'auto',
    paddingRight: '0.25rem'
  },
  emptyLogs: {
    padding: '2.5rem 0',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.85rem'
  },
  logRow: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  logRowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  statusBadge: {
    fontSize: '0.68rem',
    fontWeight: '800',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid',
    letterSpacing: '0.04em'
  },
  logInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  logIp: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'var(--font-mono)'
  },
  logMeta: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem'
  },
  logRowRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    textAlign: 'right'
  },
  riskIndicator: {
    fontSize: '0.82rem',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)'
  },
  logTime: {
    fontSize: '0.7rem',
    color: 'var(--text-dark)',
    marginTop: '0.15rem'
  },
  tunerPanel: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '480px',
    gap: '2rem'
  },
  tunerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  tunerDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.45'
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  controlHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  controlLabel: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#fff'
  },
  controlValue: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#00ffff',
    fontFamily: 'var(--font-mono)'
  },
  slider: {
    width: '100%',
    accentColor: '#00ffff',
    background: 'rgba(255, 255, 255, 0.08)',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'pointer'
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.65rem',
    color: 'var(--text-dark)',
    fontWeight: '700'
  },
  matrixBox: {
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.85rem',
    marginTop: '0.5rem'
  },
  matrixTitle: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '0.5rem'
  },
  matrixGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem'
  },
  matrixCell: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--secondary)',
    background: 'rgba(6, 182, 212, 0.04)',
    border: '1px solid rgba(6, 182, 212, 0.1)',
    borderRadius: '4px',
    padding: '0.35rem',
    textAlign: 'center'
  },
  tunerActionBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  deployBtn: {
    width: '100%',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  deploySuccessMessage: {
    fontSize: '0.75rem',
    color: 'var(--success)',
    textAlign: 'center',
    fontWeight: '600'
  },
  drawerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    zIndex: 200,
    display: 'flex',
    justifyContent: 'flex-end',
    animation: 'fadeIn 0.25s ease'
  },
  drawerPanel: {
    width: '100%',
    maxWidth: '460px',
    height: '100vh',
    background: 'rgba(15, 23, 42, 0.95)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
    boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  drawerTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#fff'
  },
  drawerId: {
    fontSize: '0.72rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  drawerContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  drawerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  drawerSectionTitle: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '0.35rem'
  },
  drawerTable: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  drawerTableLabel: {
    padding: '0.45rem 0',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    width: '40%'
  },
  drawerTableValue: {
    padding: '0.45rem 0',
    fontSize: '0.82rem',
    color: '#fff',
    fontFamily: 'var(--font-mono)'
  },
  anomalyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  cleanTelemetryMessage: {
    fontSize: '0.78rem',
    color: 'var(--success)',
    background: 'rgba(16, 185, 129, 0.06)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    borderRadius: '6px',
    padding: '0.65rem 0.85rem'
  },
  anomalyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(244, 63, 94, 0.06)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem'
  },
  anomalyDotRed: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#f43f5e',
    display: 'inline-block'
  },
  anomalyDotAmber: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#f59e0b',
    display: 'inline-block'
  },
  anomalyText: {
    fontSize: '0.75rem',
    color: '#f8fafc',
    textTransform: 'capitalize'
  },
  codeBlock: {
    background: '#090d16',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    padding: '1rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.72rem',
    lineHeight: '1.5'
  },
  codeLine: {
    color: '#cbd5e1'
  },
  codeKeyword: {
    color: '#f472b6'
  },
  codeString: {
    color: '#34d399'
  },
  codeNumber: {
    color: '#60a5fa'
  },
  commandOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    zIndex: 250,
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '10vh'
  },
  commandBox: {
    width: '100%',
    maxWidth: '520px',
    maxHeight: '340px',
    background: 'rgba(15, 23, 42, 0.96)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  commandHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
  },
  commandInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none'
  },
  commandList: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.5rem'
  },
  commandGroupTitle: {
    fontSize: '0.65rem',
    fontWeight: '800',
    color: 'var(--text-dark)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '0.5rem 0.75rem 0.25rem 0.75rem'
  },
  commandItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.65rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.82rem',
    color: '#cbd5e1',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    ':hover': {
      background: 'rgba(255,255,255,0.03)',
      color: '#fff'
    }
  } as any,
  commandShortcut: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    padding: '0.1rem 0.35rem',
    fontSize: '0.68rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)'
  }
};
