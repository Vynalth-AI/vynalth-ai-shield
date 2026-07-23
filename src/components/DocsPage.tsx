import React, { useState } from 'react';

interface DocsPageProps {
  onBackToHome?: () => void;
  onEnterConsole?: () => void;
}

export const DocsPage: React.FC<DocsPageProps> = ({ onBackToHome, onEnterConsole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<
    'quickstart' | 'humanproof' | 'liveness' | 'multisignal' | 'sdks' | 'policies' | 'api'
  >('quickstart');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const categories = [
    { id: 'quickstart', label: '1. Quick Start Guide', tag: 'Getting Started' },
    { id: 'humanproof', label: '2. Vynalth HumanProof™ Engine', tag: '3-Tier AI' },
    { id: 'liveness', label: '3. Liveness Verification (FaceID)', tag: 'Biometrics' },
    { id: 'multisignal', label: '4. Multi-Signal Score Fusion', tag: 'Scoring' },
    { id: 'sdks', label: '5. SDKs & Integrations', tag: 'Developer' },
    { id: 'api', label: '6. Server Verification API', tag: 'API Reference' },
    { id: 'policies', label: '7. 10 Core Governance Policies', tag: 'Legal & Security' },
  ];

  return (
    <div style={styles.pageContainer}>
      {/* Top Sticky Header */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onBackToHome && (
            <button onClick={onBackToHome} style={styles.backBtn}>
              ← Back to Portal
            </button>
          )}
          <div style={styles.logoBadge}>
            <span style={{ fontWeight: 900, color: '#0a2540' }}>Vynalth AI Shield</span>
            <span style={{ fontSize: '0.68rem', background: '#00c7b1', color: '#ffffff', borderRadius: '4px', padding: '1px 6px', fontWeight: 800 }}>DOCS</span>
          </div>
        </div>

        {/* Global Search Input */}
        <div style={styles.searchWrapper}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search documentation (SDKs, API, HumanProof, Liveness)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {onEnterConsole && (
          <button onClick={onEnterConsole} style={styles.consoleBtn}>
            Open Security Console →
          </button>
        )}
      </header>

      {/* Main Documentation Layout */}
      <div style={styles.docLayout}>
        {/* Left Navigation Sidebar */}
        <aside style={styles.sidebar}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Documentation Menu
          </div>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              style={{
                ...styles.categoryBtn,
                background: activeCategory === cat.id ? '#00c7b1' : 'transparent',
                color: activeCategory === cat.id ? '#ffffff' : '#1d1d1f',
                fontWeight: activeCategory === cat.id ? 700 : 500
              }}
            >
              <span>{cat.label}</span>
              <span style={{
                fontSize: '0.62rem',
                borderRadius: '4px',
                padding: '1px 5px',
                background: activeCategory === cat.id ? 'rgba(255,255,255,0.25)' : '#f5f5f7',
                color: activeCategory === cat.id ? '#ffffff' : '#6e6e73'
              }}>{cat.tag}</span>
            </button>
          ))}
        </aside>

        {/* Right Content Viewport */}
        <main style={styles.mainContent}>
          {activeCategory === 'quickstart' && (
            <div>
              <span style={styles.sectionBadge}>Getting Started</span>
              <h1 style={styles.docTitle}>Quick Start Integration Guide</h1>
              <p style={styles.docLead}>
                Integrate Vynalth AI Shield into your web application in under 2 minutes with our lightweight client SDK and verification API.
              </p>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>1. Embed Client SDK (HTML Script)</h3>
                <p style={styles.cardText}>Place the defense script inside your page head and add the target div inside your form:</p>
                <div style={styles.codeBlock}>
                  <button onClick={() => handleCopy(quickstartCode, 'code1')} style={styles.copyBtn}>
                    {copiedCode === 'code1' ? '✓ Copied' : 'Copy Code'}
                  </button>
                  <pre style={styles.pre}>{quickstartCode}</pre>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'humanproof' && (
            <div>
              <span style={styles.sectionBadge}>3-Tier AI Risk Pipeline</span>
              <h1 style={styles.docTitle}>Vynalth HumanProof™ Engine</h1>
              <p style={styles.docLead}>
                The AI Human Risk Engine automatically evaluates behavioral kinetics, kinetic entropy, and device signals to determine risk levels.
              </p>

              <div style={styles.grid3}>
                <div style={{ ...styles.riskCard, borderColor: '#a7f3d0', background: '#ecfdf5' }}>
                  <div style={{ color: '#047857', fontWeight: 800, fontSize: '0.9rem' }}>✅ Low Risk (Score ≥ 80)</div>
                  <p style={{ color: '#065f46', fontSize: '0.78rem', marginTop: '4px' }}>
                    <strong>Allow (Human Verified)</strong> — 100% invisible transparent pass-through for legitimate visitors.
                  </p>
                </div>
                <div style={{ ...styles.riskCard, borderColor: '#fde68a', background: '#fffbeb' }}>
                  <div style={{ color: '#b45309', fontWeight: 800, fontSize: '0.9rem' }}>⚠️ Medium Risk (40 ≤ Score &lt; 80)</div>
                  <p style={{ color: '#92400e', fontSize: '0.78rem', marginTop: '4px' }}>
                    <strong>Vynalth HumanProof™ Challenge</strong> — Triggers micro-gesture drag or Liveness Verification challenge.
                  </p>
                </div>
                <div style={{ ...styles.riskCard, borderColor: '#fecaca', background: '#fef2f2' }}>
                  <div style={{ color: '#b91c1c', fontWeight: 800, fontSize: '0.9rem' }}>❌ High Risk (Score &lt; 40)</div>
                  <p style={{ color: '#991b1b', fontSize: '0.78rem', marginTop: '4px' }}>
                    <strong>Block</strong> — Instantly drops connection with HTTP 403 Forbidden.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'liveness' && (
            <div>
              <span style={styles.sectionBadge}>Biometrics & Anti-Spoofing</span>
              <h1 style={styles.docTitle}>Vynalth HumanProof™ Liveness Verification</h1>
              <p style={styles.docLead}>
                Human authenticity verification confirming real-world presence via Web Camera API without long-term photo storage.
              </p>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Anti-Spoofing Liveness Workflow</h3>
                <ul style={styles.list}>
                  <li>📷 <strong>Camera Reticle Oval</strong>: Real-time 640x480 frame positioning with lighting check.</li>
                  <li>👁️ <strong>Eye Blink Check</strong>: Natural eye blink detection to stop static photo attacks.</li>
                  <li>👤 <strong>Head Tilt Check</strong>: Motion depth verification against video playback and screen captures.</li>
                  <li>🧬 <strong>128-Dim Encrypted Vector</strong>: Converts face signatures into a 128-dimensional math vector (<code>users.face_embedding_encrypted</code>). Raw photos are never stored.</li>
                </ul>
              </div>
            </div>
          )}

          {activeCategory === 'multisignal' && (
            <div>
              <span style={styles.sectionBadge}>Multi-Signal Score Fusion</span>
              <h1 style={styles.docTitle}>Multi-Signal Score Engine (+20 / +20 / +25 / +35 = 100)</h1>
              <p style={styles.docLead}>
                Human Confidence Scores are calculated dynamically by aggregating 4 independent kinetic signal layers.
              </p>

              <div style={styles.card}>
                <div style={styles.scoreRow}>
                  <span>🖱️ Mouse Trajectory & Curvature Entropy</span>
                  <span style={styles.scoreVal}>+20 pts</span>
                </div>
                <div style={styles.scoreRow}>
                  <span>📱 Touch & Kinematics Acceleration Variance</span>
                  <span style={styles.scoreVal}>+20 pts</span>
                </div>
                <div style={styles.scoreRow}>
                  <span>💻 Device Reputation & WebGL Renderer Hash</span>
                  <span style={styles.scoreVal}>+25 pts</span>
                </div>
                <div style={styles.scoreRow}>
                  <span>🧩 Interactive / Liveness Challenge Result</span>
                  <span style={styles.scoreVal}>+35 pts</span>
                </div>
                <div style={{ ...styles.scoreRow, borderTop: '2px solid #00c7b1', fontWeight: 800, marginTop: '0.5rem' }}>
                  <span>Total Human Confidence Score</span>
                  <span style={{ color: '#00c7b1', fontSize: '1rem' }}>100 pts</span>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'sdks' && (
            <div>
              <span style={styles.sectionBadge}>Developer Integrations</span>
              <h1 style={styles.docTitle}>SDKs & Multi-Language Support</h1>
              <p style={styles.docLead}>
                Official libraries for React, Vue, Svelte, iOS Swift, Android Kotlin, Node.js, Python, Go, Java, PHP, and Supabase.
              </p>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>React SDK Embed</h3>
                <div style={styles.codeBlock}>
                  <pre style={styles.pre}>{reactSdkCode}</pre>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'api' && (
            <div>
              <span style={styles.sectionBadge}>API Reference</span>
              <h1 style={styles.docTitle}>Server Verification API (POST /api/verify)</h1>
              <p style={styles.docLead}>
                Verify submitted telemetry tokens on your backend server endpoint.
              </p>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Endpoint Specification</h3>
                <p style={styles.cardText}><code>POST https://shield.sleepsomno.com/api/verify</code></p>
                <div style={styles.codeBlock}>
                  <pre style={styles.pre}>{apiPayloadCode}</pre>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'policies' && (
            <div>
              <span style={styles.sectionBadge}>Governance & Legal</span>
              <h1 style={styles.docTitle}>10 Core Legal Policies Suite</h1>
              <p style={styles.docLead}>
                Full disclosures governing AI decision making, data minimization, 24-hour ephemeral wipes, and security controls.
              </p>

              <div style={styles.grid2}>
                {[
                  { title: '1. Privacy Policy', desc: 'Telemetry collection for fraud prevention with 3 zero commitments (no selling, no ad tracking, no unauthorized sharing).' },
                  { title: '2. Human Verification Policy ⭐', desc: 'AI confidence scoring, Invisible Verification, Adaptive Challenge, and Human Challenge pathways.' },
                  { title: '3. Challenge Verification Policy', desc: 'Interactive micro-gestures and liveness check triggers with 24h data minimization.' },
                  { title: '4. AI Transparency Policy', desc: 'Autoencoder & Neural Net probabilistic models and enterprise custom threshold controls.' },
                  { title: '5. Anti-Abuse Policy', desc: 'Prohibits verification bypass, token forging, bot attacks, API flooding, and SDK reverse-engineering.' },
                  { title: '6. Developer & API Policy', desc: 'API Key management, rate limits (Free: 10k, Pro: 500k, Enterprise: Unlimited), and SDK terms.' },
                  { title: '7. Data Retention Policy', desc: '24-hour automatic wipe for ephemeral verification tokens; 30-90 days for security audit logs.' },
                  { title: '8. Security Policy', desc: 'AES-256 Supabase Vault encryption at rest, TLS 1.3 in transit, and RLS multi-tenant isolation.' },
                  { title: '9. Responsible AI Policy', desc: 'Bias prevention, continuous algorithmic refinement, and accessibility alternatives.' },
                  { title: '10. Vulnerability Disclosure Policy', desc: 'Security researcher reporting guidelines, contact email security@sleepsomno.com, and 24h SLA.' }
                ].map((p, idx) => (
                  <div key={idx} style={styles.policyCard}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1d1d1f' }}>{p.title}</div>
                    <p style={{ fontSize: '0.74rem', color: '#6e6e73', margin: '4px 0 0 0', lineHeight: 1.4 }}>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const quickstartCode = `<!-- 1. Include Vynalth AI Shield SDK -->
<script src="https://shield.sleepsomno.com/widget.js" defer></script>

<!-- 2. Target container inside your submission form -->
<form id="login-form" action="/login" method="POST">
  <input type="email" name="email" required />
  <input type="password" name="password" required />
  
  <div id="vynalth-shield-widget" 
       data-sitekey="vms_pub_live_79a2b8e3df9102ca"
       data-theme-primary="#00c7b1"></div>
  
  <button type="submit">Sign In</button>
</form>`;

const reactSdkCode = `import React, { useState } from 'react';
import { VerificationWidget } from '@vynalth/shield-react';

export const App = () => {
  const [token, setToken] = useState('');

  return (
    <VerificationWidget
      siteKey="vms_pub_live_79a2b8e3df9102ca"
      onVerify={(t) => setToken(t)}
    />
  );
};`;

const apiPayloadCode = `POST /api/verify HTTP/1.1
Host: shield.sleepsomno.com
Content-Type: application/json

{
  "secret": "vms_sec_live_your_private_secret_key",
  "token": "vmt_live_token_base64_telemetry_here",
  "ip": "203.0.113.195"
}`;

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    minHeight: '100vh',
    background: '#ffffff',
    color: '#1d1d1f',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.85rem 1.5rem',
    background: '#ffffff',
    borderBottom: '1px solid #d2d2d7',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    padding: '0.4rem 0.75rem',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#1d1d1f',
    cursor: 'pointer'
  },
  logoBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem'
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#f5f5f7',
    border: '1px solid #d2d2d7',
    borderRadius: '20px',
    padding: '0.4rem 0.85rem',
    width: '380px'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '0.78rem',
    color: '#1d1d1f',
    width: '100%'
  },
  consoleBtn: {
    background: '#00c7b1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '20px',
    padding: '0.5rem 1rem',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  docLayout: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    minHeight: 'calc(100vh - 60px)'
  },
  sidebar: {
    background: '#f5f5f7',
    borderRight: '1px solid #d2d2d7',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  categoryBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.78rem',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  mainContent: {
    padding: '2rem 2.5rem',
    maxWidth: '900px'
  },
  sectionBadge: {
    fontSize: '0.68rem',
    fontWeight: 800,
    color: '#00c7b1',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    display: 'block',
    marginBottom: '4px'
  },
  docTitle: {
    fontSize: '1.75rem',
    fontWeight: 900,
    color: '#1d1d1f',
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.02em'
  },
  docLead: {
    fontSize: '0.9rem',
    color: '#6e6e73',
    margin: '0 0 1.5rem 0',
    lineHeight: 1.5
  },
  card: {
    background: '#ffffff',
    border: '1px solid #d2d2d7',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 800,
    color: '#1d1d1f',
    margin: '0 0 0.5rem 0'
  },
  cardText: {
    fontSize: '0.8rem',
    color: '#6e6e73',
    margin: '0 0 0.75rem 0'
  },
  codeBlock: {
    position: 'relative',
    background: '#0a2540',
    borderRadius: '8px',
    padding: '1rem',
    overflowX: 'auto'
  },
  pre: {
    margin: 0,
    color: '#00c7b1',
    fontFamily: 'DM Mono, monospace',
    fontSize: '0.78rem',
    lineHeight: 1.5
  },
  copyBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '0.65rem',
    padding: '3px 8px',
    cursor: 'pointer'
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1rem'
  },
  riskCard: {
    border: '1px solid',
    borderRadius: '10px',
    padding: '1rem'
  },
  list: {
    margin: 0,
    paddingLeft: '1.25rem',
    fontSize: '0.82rem',
    color: '#1d1d1f',
    lineHeight: 1.6
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #f5f5f7',
    fontSize: '0.82rem'
  },
  scoreVal: {
    fontWeight: 800,
    color: '#00c7b1',
    fontFamily: 'DM Mono, monospace'
  },
  policyCard: {
    background: '#f5f5f7',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    padding: '0.85rem'
  }
};
