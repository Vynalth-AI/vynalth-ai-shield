import React from 'react';

const OFFICIAL_LOGO_DATA = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIHJ4PSIxMjgiIGZpbGw9IiMwQTBBMEIiLz4KICAKICA8IS0tIE91dGVyIFN3aXJscyAtLT4KICA8cGF0aCBkPSJNNDAwIDI1NkM0MDAgMzM1LjUyOSAzMzUuNTI5IDQwMCAyNTYgNDAwQzE3Ni40NzEgNDAwIDExMiAzMzUuNTI5IDExMiAyNTZDMTEyIDE3Ni40NzEgMTc2LjQ3MSAxMTIgMjU2IDExMkMzMzUuNTI5IDExMiA0MDAgMTc2LjQ3MSA0MDAgMjU2WiIgZmlsbD0idXJsKCNwYWludDBfYW5ndWxhcl9sb2dvKSIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KICAKICA8IS0tIFBsYW5ldCAtLT4KICA8Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjY0IiBmaWxsPSJ1cmwoI3BhaW50MV9yYWRpYWxfbG9nbykiLz4KICAKICA8IS0tIFBsYW5ldCBSaW5nIC0tPgogIDxlbGxpcHNlIGN4PSIyNTYiIGN5PSIyNTYiIHJ4PSIxMDAiIHJ5PSIyMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTE1IDI1NiAyNTYpIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1vcGFjaXR5PSIwLjYiLz4KICAKICA8IS0tIFN0YXJzIC0tPgogIDxjaXJjbGUgY3g9IjE1MCIgY3k9IjE1MCIgcj0iNCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC44Ij4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMC40OzE7MC40IiBkdXI9IjJzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgLz4KICA8L2NpcmNsZT4KICA8Y2lyY2xlIGN4PSIzODAiIGN5PSIxMjAiIHI9IjMiIGZpbGw9IiM2MEE1RkEiIGZpbGwtb3BhY2l0eT0iMC44Ij4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMC40OzE7MC40IiBkdXI9IjNzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgLz4KICA8L2NpcmNsZT4KICA8Y2lyY2xlIGN4PSI0MjAiIGN5PSIzNTAiIHI9IjUiIGZpbGw9IiNGNDcyQjYiIGZpbGwtb3BhY2l0eT0iMC44Ij4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMC40OzE7MC40IiBkdXI9IjIuNXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogIDwvY2lyY2xlPgogIDxjaXJjbGUgY3g9IjEyMCIgY3k9IjQwMCIgcj0iMyIgZmlsbD0iIzgxOENGOCIgZmlsbC1vcGFjaXR5PSIwLjgiPgogICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIwLjQ7MTswLjQiIGR1cj0iNHMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogIDwvY2lyY2xlPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjEwMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC42Ii8+CiAgPGNpcmNsZSBjeD0iNDUwIiBjeT0iMjAwIiByPSIyIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjYiLz4KCiAgPGRlZnM+CiAgICA8cmFkaWFsR3JhZGllbnQgaWQ9InBhaW50MF9hbmd1bGFyX2xvZ28iIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjU2IDI1Nikgcm90YXRlKDkwKSBzY2FsZSgxNDQpIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjM0I4MkY2Ii8+CiAgICAgIDxzdG9wIG9mZnNldD0iMC4zMyIgc3RvcC1jb2xvcj0iIzhCNUNGNiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjAuNjYiIHN0b3AtY29sb3I9IiNFQzQ4OTkiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRjU5RTBCIi8+CiAgICA8L3JhZGlhbEdyYWRpZW50PgogICAgPHJhZGlhbEdyYWRpZW50IGlkPSJwYWludDFfcmFkaWFsX2xvZ28iIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjU2IDI1Nikgcm90YXRlKDkwKSBzY2FsZSg2NCkiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM0RjQ2RTUiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMUUxQjRCIi8+CiAgICA8L3JhZGlhbEdyYWRpZW50PgogIDwvZGVmcz4KPC9zdmc+Cg==";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onReturnHome?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onReturnHome, onLogout }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Security Dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      )
    },
    {
      id: 'trust_center',
      label: 'Trust Center',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'playground',
      label: 'Widget Simulator',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      )
    },
    {
      id: 'logs',
      label: 'Verification Logs',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      )
    },
    {
      id: 'integration',
      label: 'API & Integration',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="12" y1="2" x2="12" y2="22" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Engine Settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    },
    {
      id: 'specs',
      label: 'System Specification',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    },
    {
      id: 'rules',
      label: 'Rules Engine',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      )
    },
    {
      id: 'admin',
      label: 'Admin Portal',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      )
    },
    {
      id: 'ml_pipeline',
      label: 'ML Engine',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      )
    },
    {
      id: 'adversarial_training',
      label: 'Adversarial (Anti-Bot) Sandbox',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      )
    },
    {
      id: 'alerts',
      label: 'Alerts & Webhooks',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    },
    {
      id: 'checklist',
      label: 'Capability Checklist',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    },
    {
      id: 'search_intelligence',
      label: 'AI Search Intelligence',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      )
    },
    {
      id: 'status',
      label: 'System Status',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      )
    }
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brandContainer}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {/* Logo 1: VitaMind AI (Mother Company - Official Planet SVG Logo) */}
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.15)'
          }} title="VitaMind AI (Parent Company)">
            <img src={OFFICIAL_LOGO_DATA} alt="SomnoAI Official Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          
          {/* Joint operator symbol */}
          <span style={{ color: 'var(--text-dark)', fontSize: '0.65rem', fontWeight: 800 }}>✕</span>

          {/* Logo 2: VitaShield (Child Product/Gateway - Blue Glow) */}
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(6, 182, 212, 0.15)'
          }} title="VitaShield Gateway (Security Subsidiary)">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>
        <div style={styles.brandText}>
          <div style={styles.brandTitle}>VitaShield</div>
          <div style={styles.brandSubtitle}>VitaMind AI Security</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={styles.nav}>
        <ul style={styles.navList}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    ...styles.navButton,
                    ...(isActive ? styles.navButtonActive : {})
                  }}
                >
                  <span style={{ 
                    ...styles.iconWrapper, 
                    color: isActive ? '#06b6d4' : '#94a3b8' 
                  }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && <div style={styles.activeIndicator} />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Engine Status & Footer */}
      <div style={styles.footer}>
        {onLogout && (
          <button 
            onClick={onLogout}
            style={{ ...styles.exitBtn, background: 'rgba(239, 68, 68, 0.08)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)', marginBottom: '0.45rem' }}
            title="Sign out of developer console"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        )}
        {onReturnHome && (
          <button 
            onClick={onReturnHome}
            style={styles.exitBtn}
            title="Return to public marketing homepage"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Exit to Landing Site
          </button>
        )}
        <div style={styles.statusBox}>
          <span style={styles.statusDot} />
          <div style={styles.statusText}>
            <div style={styles.statusTitle}>Shield Engine Active</div>
            <div style={styles.statusDesc}>V1.2 - Global Gateway</div>
          </div>
        </div>
        <div style={styles.footerVersion}>© 2026 VitaMind AI Inc.</div>
      </div>
    </aside>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    background: 'rgba(9, 13, 23, 0.85)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.75rem 1rem',
    zIndex: 100,
    boxShadow: '8px 0 32px rgba(0, 0, 0, 0.25)'
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0.75rem 2rem 0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'rgba(6, 182, 212, 0.08)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column'
  },
  brandTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em'
  },
  brandSubtitle: {
    fontSize: '0.62rem',
    fontWeight: '800',
    color: 'var(--secondary)',
    letterSpacing: '0.12em',
    marginTop: '0.1rem'
  },
  nav: {
    flex: 1,
    marginTop: '2rem'
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  navButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.85rem 1rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: 'var(--text-muted)',
    fontSize: '0.92rem',
    fontWeight: '600',
    textAlign: 'left',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  navButtonActive: {
    color: '#fff',
    background: 'rgba(255, 255, 255, 0.03)',
    boxShadow: 'inset 0 0 12px rgba(6, 182, 212, 0.05)'
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease'
  },
  activeIndicator: {
    position: 'absolute',
    left: '0',
    top: '25%',
    bottom: '25%',
    width: '3.5px',
    background: 'linear-gradient(to bottom, var(--secondary), var(--primary))',
    borderRadius: '0 4px 4px 0',
    boxShadow: '0 0 10px rgba(6, 182, 212, 0.8)'
  },
  footer: {
    marginTop: 'auto',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    paddingTop: '1.25rem'
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '0.65rem 0.75rem',
    marginBottom: '1rem'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--success)',
    boxShadow: '0 0 8px var(--success)',
    display: 'inline-block',
    animation: 'dot-pulse 2s infinite'
  },
  statusText: {
    display: 'flex',
    flexDirection: 'column'
  },
  statusTitle: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#f8fafc'
  },
  statusDesc: {
    fontSize: '0.65rem',
    color: 'var(--text-dark)',
    marginTop: '0.05rem'
  },
  footerVersion: {
    fontSize: '0.68rem',
    color: 'var(--text-dark)',
    textAlign: 'center'
  },
  exitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '0.5rem',
    background: 'rgba(239, 68, 68, 0.06)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '0.85rem',
    transition: 'all 0.2s ease'
  }
};
