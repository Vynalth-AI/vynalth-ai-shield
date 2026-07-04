import React, { useState, useEffect } from 'react';
import type { VerificationLog } from '../types';

interface SearchIntelligenceProps {
  logs: VerificationLog[];
}

export const SearchIntelligence: React.FC<SearchIntelligenceProps> = ({ logs }) => {
  const [activeSubTab, setActiveSubTab] = useState<'analyser' | 'chat'>('analyser');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VerificationLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<VerificationLog | null>(null);
  const [aiReport, setAiReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Pre-load initial search results
  useEffect(() => {
    if (!query) {
      setResults(logs.slice(0, 5));
    } else {
      const q = query.toLowerCase();
      const filtered = logs.filter(log => 
        log.ipAddress.toLowerCase().includes(q) ||
        log.location.toLowerCase().includes(q) ||
        log.browser.toLowerCase().includes(q) ||
        log.device.toLowerCase().includes(q) ||
        log.status.toLowerCase().includes(q) ||
        (log.flags || []).some(f => f.toLowerCase().includes(q)) ||
        (log.deviceAnomalies || []).some(a => a.toLowerCase().includes(q))
      );
      setResults(filtered);
    }
  }, [query, logs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateAiAnalysis();
  };

  const generateAiAnalysis = () => {
    if (results.length === 0) {
      setAiReport('### 无搜索结果\n无法为当前查询生成情报分析，请尝试其他搜索词（例如："Germany"、"blocked"、"Headless"）。');
      return;
    }

    setIsGenerating(true);
    setAiReport('');

    setTimeout(() => {
      const blockedCount = results.filter(r => r.status === 'blocked').length;
      const avgRisk = Math.round(results.reduce((acc, r) => acc + r.riskScore, 0) / results.length);
      const topCountry = results.reduce((acc: { [key: string]: number }, r) => {
        const country = r.location.split(' ')[0] || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});
      const primaryCountry = Object.keys(topCountry).reduce((a, b) => topCountry[a] > topCountry[b] ? a : b, 'Unknown');
      
      const anomalies = Array.from(new Set(results.flatMap(r => r.deviceAnomalies || [])));
      const flags = Array.from(new Set(results.flatMap(r => r.flags || [])));

      let analysisMarkdown = `### 🤖 VitaShield AI Threat Intelligence Report
**Query Matrix:** "${query || 'Recent Active Logs'}"  
**Report Generated:** ${new Date().toLocaleString()}  
**Target Profile Severity:** ${avgRisk > 70 ? '🔴 CRITICAL THREAT' : avgRisk > 40 ? '🟡 SUSPICIOUS' : '🟢 SECURE / LOW RISK'}

---

#### 📊 Telemetry Metrics & Aggregation
* **Total Scanned Events:** ${results.length} requests matched
* **Flagged / Blocked Rate:** ${Math.round((blockedCount / results.length) * 100)}% (${blockedCount} blocked)
* **Average Risk Score Index:** ${avgRisk}%
* **Primary Attacking Origin:** ${primaryCountry}

---

#### 🔍 Identified Threat Signature & Vectors
`;

      if (avgRisk > 40) {
        analysisMarkdown += `The traffic patterns show **high-probability automated automation campaigns**. The clients exhibit robotic kinetics with zero movement jitter and uniform keystroke flight delays. 

##### Detected Signature Vectors:
${anomalies.map(a => `* ⚠️ **Device Flag:** \`${a}\` (Indicates modified execution context / virtualized client)`).join('\n')}
${flags.map(f => `* ⚠️ **Behavioral Flag:** \`${f}\` (Indicates non-human movement acceleration profile)`).join('\n')}

##### 🛡️ Mitigation Recommendations:
1. **Rotate Autoencoder Weights:** Deploy your latest adversarial weights from the Sandbox to block the straight-line coordinate vectors.
2. **Increase PoW Difficulty:** Set the target cryptographic proof difficulty to \`Difficulty 4\` to increase CPU-bound costs for head-less puppeteers.
3. **Blackhole Subnet:** Temporarily route IPs matching \`${results[0]?.ipAddress.split('.').slice(0, 3).join('.')}.0/24\` to the 3D alignment CAPTCHA loop.`;
      } else {
        analysisMarkdown += `The scanned subset consists primarily of **legitimate human interaction profiles**. Standard physiological noise and mouse acceleration curvature match healthy conversion templates. 

No active botnets, scrapers, or automation frameworks have been flagged for this query profile. Maintain medium strictness settings.`;
      }

      setAiReport(analysisMarkdown);
      setIsGenerating(false);
    }, 1200);
  };

  const handleSelectLog = (log: VerificationLog) => {
    setSelectedLog(log);
    setQuery(log.ipAddress);
  };

  const quickSearch = (term: string) => {
    setQuery(term);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">AI Search Intelligence</h1>
          <p style={styles.subtitle}>Query client telemetry logs, investigate specific attack subnets, and generate natural language threat reports.</p>
        </div>
        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          Threat Database: Active ({logs.length} indexed logs)
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div style={styles.subTabNav}>
        <button 
          onClick={() => setActiveSubTab('analyser')} 
          style={{
            ...styles.subTabButton,
            borderBottom: activeSubTab === 'analyser' ? '2px solid #00f2fe' : '2px solid transparent',
            color: activeSubTab === 'analyser' ? '#00f2fe' : '#94a3b8'
          }}
        >
          🕵️ Threat Telemetry Analyser
        </button>
        <button 
          onClick={() => setActiveSubTab('chat')} 
          style={{
            ...styles.subTabButton,
            borderBottom: activeSubTab === 'chat' ? '2px solid #00f2fe' : '2px solid transparent',
            color: activeSubTab === 'chat' ? '#00f2fe' : '#94a3b8'
          }}
        >
          💬 Cloudflare AI Search Chat
        </button>
      </div>

      {activeSubTab === 'analyser' && (
        <>
          {/* Quick Search Chips */}
          <div style={styles.chipsContainer}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Quick Intelligence Queries:</span>
            <button onClick={() => quickSearch('blocked')} style={styles.chipButton}>🔴 Blocked Requests</button>
            <button onClick={() => quickSearch('Headless')} style={styles.chipButton}>🤖 Headless Browsers</button>
            <button onClick={() => quickSearch('Germany')} style={styles.chipButton}>🇩🇪 Germany Subnet</button>
            <button onClick={() => quickSearch('behavioral_telemetry')} style={styles.chipButton}>🖱️ Telemetry Method</button>
          </div>

          {/* Main Grid Layout */}
          <div style={styles.grid}>
            {/* Left Side: Search & Table */}
            <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <form onSubmit={handleSearchSubmit} style={styles.searchBarContainer} className="glass-panel">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search by IP address, country, browser signature, anomaly flags..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={styles.searchInput}
                />
                <button type="submit" style={styles.searchButton}>
                  Generate Threat Intel
                </button>
              </form>

              {/* Results Table */}
              <div className="glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Search Results ({results.length} found)</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Click log row to inspect detailed kinetics</span>
                </h3>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.th}>Timestamp</th>
                        <th style={styles.th}>IP Address</th>
                        <th style={styles.th}>Location</th>
                        <th style={styles.th}>Browser</th>
                        <th style={styles.th}>Risk Score</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.length > 0 ? (
                        results.map((log) => (
                          <tr 
                            key={log.id} 
                            onClick={() => handleSelectLog(log)}
                            style={{
                              ...styles.tableRow,
                              background: selectedLog?.id === log.id ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
                              borderLeft: selectedLog?.id === log.id ? '3px solid #00f2fe' : '3px solid transparent'
                            }}
                          >
                            <td style={styles.td}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                            <td style={styles.td}>
                              <span style={styles.ipText}>{log.ipAddress}</span>
                            </td>
                            <td style={styles.td}>{log.location}</td>
                            <td style={styles.td}>{log.browser}</td>
                            <td style={styles.td}>
                              <span style={{
                                color: log.riskScore > 70 ? '#f87171' : log.riskScore > 30 ? '#fbbf24' : '#34d399',
                                fontWeight: 600
                              }}>
                                {log.riskScore}%
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={{
                                ...styles.statusBadge,
                                backgroundColor: log.status === 'passed' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: log.status === 'passed' ? '#34d399' : '#f87171'
                              }}>
                                {log.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={styles.noResults}>
                            No matching logs found in the security threat database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Side: AI Intelligence Analysis */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '320px' }}>
              {/* AI Intelligence Report */}
              <div className="glass-panel" style={{ padding: '2rem', flex: 1.5, background: 'rgba(10, 15, 30, 0.65)', border: '1px solid rgba(0, 242, 254, 0.15)' }}>
                <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.2rem', color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f2fe', boxShadow: '0 0 8px #00f2fe' }} />
                  Threat Intel Report Generator
                </h3>

                {isGenerating ? (
                  <div style={styles.loadingContainer}>
                    <div style={styles.spinner} />
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                      Analyzing {results.length} telemetry payloads with AI Search Engine...
                    </span>
                  </div>
                ) : aiReport ? (
                  <div style={styles.reportContent}>
                    {aiReport.split('\n').map((line, idx) => {
                      if (line.startsWith('###')) {
                        return <h3 key={idx} style={{ color: '#fff', fontSize: '1.2rem', marginTop: '15px', marginBottom: '8px' }}>{line.replace('###', '')}</h3>;
                      }
                      if (line.startsWith('####')) {
                        return <h4 key={idx} style={{ color: '#00f2fe', fontSize: '1rem', marginTop: '15px', marginBottom: '8px' }}>{line.replace('####', '')}</h4>;
                      }
                      if (line.startsWith('*')) {
                        return <li key={idx} style={{ color: '#cbd5e1', fontSize: '0.9rem', marginLeft: '10px', marginBottom: '4px' }}>{line.replace('*', '').trim()}</li>;
                      }
                      if (line.startsWith('#####')) {
                        return <h5 key={idx} style={{ color: '#f87171', fontSize: '0.95rem', marginTop: '12px', marginBottom: '6px' }}>{line.replace('#####', '')}</h5>;
                      }
                      if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
                        return <p key={idx} style={{ color: '#e2e8f0', fontSize: '0.88rem', marginLeft: '15px', margin: '4px 0' }}>{line}</p>;
                      }
                      return <p key={idx} style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', margin: '8px 0' }}>{line}</p>;
                    })}
                  </div>
                ) : (
                  <div style={styles.emptyReport}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '15px' }}>
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                      <polyline points="7.5 19.79 7.5 14.6 3 12" />
                      <polyline points="21 12 16.5 14.6 16.5 19.79" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'center', maxWidth: '250px' }}>
                      Click "Generate Threat Intel" above to generate a custom natural language threat report.
                    </span>
                  </div>
                )}
              </div>

              {/* Selected Log Detailed Kinematics */}
              {selectedLog && (
                <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, background: 'rgba(15, 23, 42, 0.45)' }}>
                  <h4 style={{ margin: '0 0 0.8rem 0', color: '#fff', fontSize: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🔍 Anomaly Signature Analysis</span>
                    <span style={{ color: '#00f2fe', fontSize: '0.8rem' }}>{selectedLog.id}</span>
                  </h4>
                  <div style={styles.detailGrid}>
                    <div>
                      <div style={styles.detailLabel}>Detected Anomaly Flags:</div>
                      {selectedLog.flags && selectedLog.flags.length > 0 ? (
                        selectedLog.flags.map(f => (
                          <span key={f} style={styles.anomalyTag}>⚠️ {f}</span>
                        ))
                      ) : (
                        <span style={{ color: '#34d399', fontSize: '0.85rem' }}>✓ Clean Behavioral Profile</span>
                      )}
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <div style={styles.detailLabel}>Environment Integrity Flags:</div>
                      {selectedLog.deviceAnomalies && selectedLog.deviceAnomalies.length > 0 ? (
                        selectedLog.deviceAnomalies.map(a => (
                          <span key={a} style={styles.envTag}>🤖 {a}</span>
                        ))
                      ) : (
                        <span style={{ color: '#34d399', fontSize: '0.85rem' }}>✓ Native Browser Environment</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeSubTab === 'chat' && (
        <div className="glass-panel" style={styles.cloudflareChatContainer}>
          <div dangerouslySetInnerHTML={{
            __html: `
              <chat-page-snippet 
                api-url="https://8e6afc0f-9bfc-4aba-8b16-5b452ed6e065.search.ai.cloudflare.com"
                theme="dark"
                placeholder="Ask VitaShield AI Search Intelligence anything about your system or docs..."
                style="height: 100%; display: block;">
              </chat-page-snippet>
            `
          }} style={{ height: '100%' }} />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    color: '#cbd5e1',
    animation: 'fadeIn 0.5s ease-out'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '15px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    margin: 0,
    letterSpacing: '-0.025em'
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    margin: '4px 0 0 0'
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '20px',
    background: 'rgba(0, 242, 254, 0.08)',
    border: '1px solid rgba(0, 242, 254, 0.2)',
    color: '#00f2fe',
    fontSize: '0.85rem',
    fontWeight: 600
  },
  badgeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#00f2fe',
    boxShadow: '0 0 8px #00f2fe'
  },
  subTabNav: {
    display: 'flex',
    gap: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '2px',
    marginBottom: '10px'
  },
  subTabButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    padding: '8px 12px 10px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  cloudflareChatContainer: {
    height: '600px',
    padding: '1rem',
    background: 'rgba(10, 15, 30, 0.45)',
    border: '1px solid rgba(0, 242, 254, 0.15)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  chipsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap' as const,
    padding: '4px 0'
  },
  chipButton: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    color: '#cbd5e1',
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  grid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap' as const,
    alignItems: 'stretch'
  },
  searchBarContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.8rem 1.2rem',
    background: 'rgba(10, 15, 30, 0.45)'
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    padding: '4px 0'
  },
  searchButton: {
    padding: '8px 16px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    border: 'none',
    color: '#050b14',
    fontWeight: 700,
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    textAlign: 'left' as const,
    fontSize: '0.88rem'
  },
  tableHeaderRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  th: {
    padding: '12px 10px',
    color: '#94a3b8',
    fontWeight: 600,
    fontSize: '0.82rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
    transition: 'background 0.2s ease'
  },
  td: {
    padding: '14px 10px',
    color: '#e2e8f0'
  },
  ipText: {
    fontFamily: 'monospace',
    color: '#38bdf8',
    fontWeight: 600
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '0.025em'
  },
  noResults: {
    padding: '40px 10px',
    color: '#64748b',
    textAlign: 'center' as const
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '250px',
    gap: '15px'
  },
  spinner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid rgba(0, 242, 254, 0.1)',
    borderTopColor: '#00f2fe',
    animation: 'spin 1s linear infinite'
  },
  reportContent: {
    maxHeight: '400px',
    overflowY: 'auto' as const,
    paddingRight: '10px'
  },
  emptyReport: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '280px'
  },
  detailGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  },
  detailLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: 600,
    marginBottom: '6px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  },
  anomalyTag: {
    display: 'inline-block',
    fontSize: '0.75rem',
    color: '#fbbf24',
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    borderRadius: '4px',
    padding: '3px 8px',
    marginRight: '6px',
    marginBottom: '6px'
  },
  envTag: {
    display: 'inline-block',
    fontSize: '0.75rem',
    color: '#f87171',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '4px',
    padding: '3px 8px',
    marginRight: '6px',
    marginBottom: '6px'
  }
};
