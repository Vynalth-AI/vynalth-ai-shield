import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LogsTable } from './components/LogsTable';
import { Integration } from './components/Integration';
import { Settings } from './components/Settings';
import { WidgetPlayground } from './components/WidgetPlayground';
import { SystemSpecs } from './components/SystemSpecs';
import { RulesEngine } from './components/RulesEngine';
import { AdminPortal } from './components/AdminPortal';
import { MLEngine } from './components/MLEngine';
import { AlertsManager } from './components/AlertsManager';
import { MarketingPortal } from './components/MarketingPortal';
import { AuthPortal } from './components/AuthPortal';
import { ChecklistPage } from './components/ChecklistPage';
import { NegativeTraining } from './components/NegativeTraining';
import { SearchIntelligence } from './components/SearchIntelligence';
import { TrustCenter } from './components/TrustCenter';
import { StatusPage } from './components/StatusPage';
import { PlaybookPages } from './components/PlaybookPages';
import { MediaPage } from './components/MediaPage';
import { PricingPage } from './components/PricingPage';
import { WhitepaperPage } from './components/WhitepaperPage';
import { PrivacyCompliance } from './components/PrivacyCompliance';
import { HealthContext } from './components/HealthContext';
import { BotBounty } from './components/BotBounty';
import { getApiBaseUrl } from './lib/api';

import type { ShieldConfig, VerificationLog } from './types';

// Initial dummy logs that feed the dashboard charts and tables
const INITIAL_LOGS: VerificationLog[] = [
  {
    id: 'req_vms_geo_travel_jump',
    timestamp: new Date(Date.now() - 30000).toISOString(),
    ipAddress: '175.139.12.85',
    location: 'Russia (Moscow) / Malaysia (Kuala Lumpur) Conflict',
    device: 'Windows Desktop',
    browser: 'Chrome 126',
    method: 'behavioral_telemetry',
    status: 'blocked',
    riskScore: 99,
    flags: ['impossible_travel_anomaly', 'suspicious_geo_velocity_jump'],
    deviceAnomalies: []
  },
  {
    id: 'req_vms_9a8f27c3',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    ipAddress: '185.220.101.4',
    location: 'Germany (Berlin)',
    device: 'Linux Desktop',
    browser: 'Firefox 125',
    method: 'captcha_3d',
    status: 'passed',
    riskScore: 12,
    flags: [],
    deviceAnomalies: []
  },
  {
    id: 'req_vms_f8b1c4e9',
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    ipAddress: '103.149.162.25',
    location: 'China (Shenzhen)',
    device: 'Windows Desktop',
    browser: 'Chrome 126',
    method: 'behavioral_telemetry',
    status: 'blocked',
    riskScore: 98,
    flags: ['perfectly_straight_mouse_trajectory', 'zero_mouse_acceleration_variance', 'bot_paste_submit_abuse'],
    deviceAnomalies: []
  },
  {
    id: 'req_vms_c302d184',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    ipAddress: '72.210.45.182',
    location: 'United States (Seattle)',
    device: 'iPhone 15 Pro',
    browser: 'Safari Mobile',
    method: 'behavioral_telemetry',
    status: 'passed',
    riskScore: 3,
    flags: [],
    deviceAnomalies: []
  },
  {
    id: 'req_vms_7e2d93b1',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    ipAddress: '45.89.230.12',
    location: 'Russia (Moscow)',
    device: 'Windows Desktop',
    browser: 'Chrome 126 (Headless)',
    method: 'cryptographic_pow',
    status: 'blocked',
    riskScore: 95,
    flags: ['sub_500ms_form_submission_speed'],
    deviceAnomalies: ['navigator_webdriver_active', 'headless_screen_dimensions_zeroed', 'virtualized_gpu_environment']
  },
  {
    id: 'req_vms_09c8d1f2',
    timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
    ipAddress: '198.51.100.42',
    location: 'Canada (Toronto)',
    device: 'macOS Laptop',
    browser: 'Chrome 126',
    method: 'biometric_scan',
    status: 'passed',
    riskScore: 8,
    flags: [],
    deviceAnomalies: []
  },
  {
    id: 'req_vms_d48a1c90',
    timestamp: new Date(Date.now() - 55 * 60000).toISOString(),
    ipAddress: '172.56.21.90',
    location: 'United States (Chicago)',
    device: 'Android Phone',
    browser: 'Chrome Mobile',
    method: 'captcha_3d',
    status: 'flagged',
    riskScore: 54,
    flags: ['instant_click_no_deceleration_pause', 'abnormally_low_mouse_dynamics'],
    deviceAnomalies: []
  }
];

function App() {
  // Check if standalone status page mode is requested
  const isStatusSubdomain = typeof window !== 'undefined' && (
    window.location.hostname.includes('status') || 
    window.location.search.includes('status=true')
  );
  
  if (isStatusSubdomain) {
    return <StatusPage isStandalone={true} />;
  }

  // Redirect old subdomain vitashield.sleepsomno.com to new shield.sleepsomno.com domain
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'vitashield.sleepsomno.com') {
      window.location.replace('https://shield.sleepsomno.com' + window.location.pathname + window.location.search);
      return null;
    }
  }

  // Client-side fallback redirect for main domain status paths
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (path === '/status' || path === '/en/status' || path === '/cn/status' || path === '/ms/status' || path === '/status/') {
      window.location.replace('https://status.sleepsomno.com');
      return null;
    }
  }

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const cleanPath = currentPath.toLowerCase().replace(/^\//, '');
  const isPlaybookRoute = [
    'sounds-on-the-web',
    '12-principles-of-animation',
    'emilkowal-animations',
    'web-design-guidelines',
    'generating-sounds-with-ai'
  ].includes(cleanPath);

  if (isPlaybookRoute) {
    return (
      <PlaybookPages 
        currentPath={currentPath} 
        onBack={() => {
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
        }} 
      />
    );
  }

  const [viewMode, setViewMode] = useState<'marketing' | 'auth' | 'console' | 'pricing' | 'whitepaper'>('marketing');

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('vms-auth-session');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  
  const [config, setConfig] = useState<ShieldConfig>({
    preset: 'general',
    strictness: 'medium',
    forcedMethod: 'auto',
    bypassIpList: ['127.0.0.1'],
    blockIpList: [],
    themePrimary: '#00f2fe',
    themeBg: '#0b1329',
    themeText: '#a5f3fc',
    cdnEnabled: true,
    gzipEnabled: true
  });

  const [logs, setLogs] = useState<VerificationLog[]>([]);

  // Scopes logs and settings by logged-in user email (Each user sees their own)
  useEffect(() => {
    if (!user) {
      setLogs([]);
      setConfig({
        preset: 'general',
        strictness: 'medium',
        forcedMethod: 'auto',
        bypassIpList: ['127.0.0.1'],
        blockIpList: [],
        themePrimary: '#00f2fe',
        themeBg: '#0b1329',
        themeText: '#a5f3fc',
        cdnEnabled: true,
        gzipEnabled: true
      });
      return;
    }
    const email = user.user?.email || user.email || 'guest';
    
    // Load real logs from database
    fetch(`${getApiBaseUrl()}/api/logs`)
      .then(res => res.json())
      .then(data => {
        if (data && data.logs && data.logs.length > 0) {
          setLogs(data.logs);
          localStorage.setItem(`vms_logs_${email}`, JSON.stringify(data.logs));
        } else {
          const cachedLogs = localStorage.getItem(`vms_logs_${email}`);
          if (cachedLogs) {
            setLogs(JSON.parse(cachedLogs));
          } else {
            setLogs(INITIAL_LOGS);
          }
        }
      })
      .catch(() => {
        const cachedLogs = localStorage.getItem(`vms_logs_${email}`);
        if (cachedLogs) {
          setLogs(JSON.parse(cachedLogs));
        } else {
          setLogs(INITIAL_LOGS);
        }
      });

    // Load scoped config
    const cachedConfig = localStorage.getItem(`vms_config_${email}`);
    if (cachedConfig) {
      try {
        setConfig(JSON.parse(cachedConfig));
      } catch {}
    }
  }, [user]);

  // Hook to persist config updates to localStorage
  const handleUpdateConfig = (newConfig: ShieldConfig) => {
    setConfig(newConfig);
    if (user) {
      const email = user.user?.email || user.email || 'guest';
      localStorage.setItem(`vms_config_${email}`, JSON.stringify(newConfig));
    }
  };

  // Single Sign-On (SSO) & Shared Session handler for sleepsomno.com users
  useEffect(() => {
    // 1. Intercept URL redirect query parameters from sleepsomno.com
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('sso_token') || params.get('access_token');
    const ssoEmail = params.get('email') || params.get('user_email');

    if (ssoToken && ssoEmail) {
      const session = {
        accessToken: ssoToken,
        user: { email: ssoEmail },
        sso: true,
        source: 'sleepsomno.com redirect'
      };
      localStorage.setItem('vms-auth-session', JSON.stringify(session));
      setUser(session);
      setViewMode('console');
      setActiveTab('dashboard');

      // Strip credentials from address bar quietly to avoid token leaks
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
      return;
    }

    // 2. Read shared root domain session cookies (e.g. .sleepsomno.com)
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return undefined;
    };

    const sharedJwt = getCookie('sleepsomno_jwt') || getCookie('sb-access-token');
    if (sharedJwt && !user) {
      const session = {
        accessToken: sharedJwt,
        user: { email: 'member@sleepsomno.com' },
        sso: true,
        source: 'sleepsomno.com cookie'
      };
      localStorage.setItem('vms-auth-session', JSON.stringify(session));
      setUser(session);
      setViewMode('console');
      setActiveTab('dashboard');
    }
  }, [user]);

  // Dynamic SEO Title and Metadata updates for shield.sleepsomno.com
  useEffect(() => {
    let title = 'Vynalth AI Shield - AI-Native Human Verification & Anti-Bot Infrastructure';
    let description = 'Protect your platform, APIs, and Web3 apps from bot networks, credential stuffing, scraping, and malicious AI agents with Vynalth AI Shield. Invisible behavioral telemetry with sub-200ms edge latency.';
    let keywords = 'anti-bot, human verification, bot protection, sybil protection, AI agent detection, secure captcha, invisible telemetry, cybersecurity infrastructure';

    if (isPlaybookRoute) {
      const pageName = cleanPath.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      title = `${pageName} | Vynalth AI Design Playbook`;
      description = `Learn guidelines for ${pageName} matching Emil Kowalski and Disney standards on shield.sleepsomno.com.`;
    } else if (viewMode === 'marketing') {
      title = 'Vynalth AI Shield - Invisible Trust, Everywhere | Anti-Bot & AI Verification';
      description = 'Protect health diagnostic systems, APIs, and B2B platforms from advanced bot networks and crawlers. Vynalth AI Shield is the security division of Vynalth AI, building the future of health AI.';
    } else if (viewMode === 'auth') {
      title = 'Login | Vynalth AI Shield Console';
      description = 'Log in to Vynalth AI Shield console to monitor telemetry logs, manage WAF rules, and review health-context auth settings.';
    } else if (viewMode === 'pricing') {
      title = 'Pricing Plans | Vynalth AI Shield';
      description = 'Choose the best behavioral biometrics plan for your platform. From Freemium to custom Enterprise plans designed for digital therapeutics and B2B SaaS.';
    } else if (viewMode === 'whitepaper') {
      title = 'Whitepaper | Vynalth AI Shield Research';
      description = 'Read our research paper on countering advanced AI operators and automated browser scrapers via micro-interaction dynamics and sub-pixel biometrics.';
    } else if (viewMode === 'console') {
      const tabTitle = activeTab.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      title = `${tabTitle} | Vynalth AI Shield Console`;
      
      switch (activeTab) {
        case 'dashboard':
          description = 'Real-time security telemetry, traffic maps, and trust score metrics for shield.sleepsomno.com.';
          break;
        case 'trust_center':
          title = 'Trust & Compliance Portal | Vynalth AI Shield';
          description = 'Public compliance documentation, impossible travel logs, right to erasure portal, and real-time security assurance.';
          break;
        case 'playground':
          description = 'Test and stress-test the invisible behavioral verification widget and view real-time score updates.';
          break;
        case 'logs':
          description = 'Comprehensive audit trail of behavioral verification logs and bot blocks.';
          break;
        case 'settings':
          description = 'Configure WAF strictness levels, custom themes, IP bypass lists, and client SDK presets.';
          break;
        case 'rules':
          title = 'WAF Rules Engine | Vynalth AI Shield';
          description = 'Manage active firewall security rules including Cloudflare Worker r008 Impossible Travel and behavioral biometrics.';
          break;
        case 'privacy_compliance':
          title = 'Privacy & Compliance Portal | Vynalth AI Shield';
          description = 'Generate dynamic privacy policies for Malaysia PDPA, China PIPL, and EU GDPR. Exercise the Right to be Forgotten.';
          break;
        case 'health_context':
          title = 'Health Context Engine | Vynalth AI Shield';
          description = 'Integrate Oura Ring, Apple Health, and sleep scores to adaptively scale authentication thresholds.';
          break;
        case 'bot_bounty':
          title = 'Security Bot Bounty | Vynalth AI Shield';
          description = 'Submit vulnerability reports to help protect the digital sleep network and earn recognition in our Hall of Fame.';
          break;
      }
    }

    document.title = title;

    // Update meta description
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    // Update meta keywords
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) {
      keywordsMeta.setAttribute('content', keywords);
    }

    // Update OpenGraph Title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    // Update OpenGraph Description
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }
  }, [viewMode, activeTab, currentPath, cleanPath, isPlaybookRoute]);

  // Appends verification telemetry dynamically from widget triggers
  const handleAddLog = (
    method: VerificationLog['method'],
    status: VerificationLog['status'],
    score: number,
    flags?: string[],
    deviceAnomalies?: string[]
  ) => {
    const randomHex = (len: number) => Array.from({length: len}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const newLog: VerificationLog = {
      id: `req_vms_${randomHex(8)}`,
      timestamp: new Date().toISOString(),
      ipAddress: `${Math.floor(Math.random() * 220) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      location: ['United States (San Francisco)', 'United Kingdom (London)', 'Japan (Tokyo)', 'Australia (Sydney)', 'Singapore'][Math.floor(Math.random()*5)],
      device: ['iPhone 15', 'Android Mobile', 'Windows Desktop', 'macOS Laptop'][Math.floor(Math.random()*4)],
      browser: ['Chrome 126', 'Safari Mobile', 'Firefox 125', 'Edge 124'][Math.floor(Math.random()*4)],
      method,
      status,
      riskScore: score,
      flags: flags || [],
      deviceAnomalies: deviceAnomalies || []
    };

    setLogs((prev) => {
      const updated = [newLog, ...prev];
      if (user) {
        const email = user.user?.email || user.email || 'guest';
        localStorage.setItem(`vms_logs_${email}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard config={config} logs={logs} onAddLog={handleAddLog} />;
      case 'trust_center':
        return <TrustCenter logs={logs} />;
      case 'playground':
        return <WidgetPlayground config={config} onAddLog={handleAddLog} />;
      case 'logs':
        return <LogsTable logs={logs} />;
      case 'integration':
        return <Integration />;
      case 'settings':
        return <Settings config={config} setConfig={handleUpdateConfig} />;
      case 'specs':
        return <SystemSpecs />;
      case 'rules':
        return <RulesEngine />;
      case 'admin':
        return <AdminPortal config={config} />;
      case 'ml_pipeline':
        return <MLEngine />;
      case 'adversarial_training':
        return <NegativeTraining />;
      case 'alerts':
        return <AlertsManager />;
      case 'privacy_compliance':
        return <PrivacyCompliance />;
      case 'health_context':
        return <HealthContext />;
      case 'bot_bounty':
        return <BotBounty />;
      case 'checklist':
        return <ChecklistPage />;
      case 'search_intelligence':
        return <SearchIntelligence logs={logs} />;
      case 'status':
        return <StatusPage />;
      case 'media':
        return <MediaPage />;
      default:
        return <Dashboard config={config} logs={logs} onAddLog={handleAddLog} />;
    }
  };

  if (viewMode === 'marketing') {
    return (
      <MarketingPortal 
        onEnterConsole={() => {
          if (user) {
            setViewMode('console');
            setActiveTab('dashboard');
          } else {
            setViewMode('auth');
          }
        }} 
        onNavigateToPricing={() => setViewMode('pricing')}
        onNavigateToWhitepaper={() => setViewMode('whitepaper')}
      />
    );
  }

  if (viewMode === 'auth') {
    return (
      <AuthPortal 
        onAuthSuccess={(session) => {
          localStorage.setItem('vms-auth-session', JSON.stringify(session));
          setUser(session);
          setViewMode('console');
          setActiveTab('dashboard');
        }}
        onBackToHome={() => setViewMode('marketing')}
      />
    );
  }

  if (viewMode === 'pricing') {
    return (
      <PricingPage 
        onGetStarted={() => {
          if (user) {
            setViewMode('console');
            setActiveTab('dashboard');
          } else {
            setViewMode('auth');
          }
        }}
        onBack={() => setViewMode('marketing')}
      />
    );
  }

  if (viewMode === 'whitepaper') {
    return (
      <WhitepaperPage 
        onBack={() => setViewMode('marketing')}
        onDeployConsole={() => {
          if (user) {
            setViewMode('console');
            setActiveTab('dashboard');
          } else {
            setViewMode('auth');
          }
        }}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Side Navigation panel */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onReturnHome={() => setViewMode('marketing')}
        onLogout={() => {
          localStorage.removeItem('vms-auth-session');
          setUser(null);
          setViewMode('marketing');
        }}
      />
      
      {/* Main viewport area */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
