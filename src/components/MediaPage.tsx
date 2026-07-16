import React, { useState } from 'react';

const BASE = 'https://vitashield.sleepsomno.com';
const SOMNO_BASE = 'https://sleepsomno.com';

interface MediaAsset {
  id: string;
  category: 'logo' | 'brand' | 'sdk' | 'docs';
  title: string;
  description: string;
  url: string;
  fileType: string;
  preview?: string;
  badge?: string;
}

const ASSETS: MediaAsset[] = [
  // ── Logos ──────────────────────────────────────────
  {
    id: 'vitashield-logo',
    category: 'logo',
    title: 'VitaShield Logo',
    description: 'Official VitaShield product logo. Use on dark backgrounds for best contrast.',
    url: `${BASE}/logo.jpg`,
    fileType: 'JPG',
    preview: `${BASE}/logo.jpg`,
    badge: 'Primary'
  },
  {
    id: 'vitashield-logo512',
    category: 'logo',
    title: 'VitaShield Logo 512px',
    description: 'High-resolution 512×512 VitaShield logo for app icons and marketing materials.',
    url: `${BASE}/logo512.png`,
    fileType: 'PNG',
    preview: `${BASE}/logo512.png`,
    badge: 'High-Res'
  },
  {
    id: 'vitamind-planet',
    category: 'logo',
    title: 'VitaMind AI Planet Logo',
    description: 'VitaMind AI parent company brand logo — cosmic planet design.',
    url: `${BASE}/brand-logo-new.png`,
    fileType: 'PNG',
    preview: `${BASE}/brand-logo-new.png`,
    badge: 'Parent Brand'
  },
  {
    id: 'vitamind-logo512',
    category: 'logo',
    title: 'VitaMind AI Logo 512px',
    description: 'Official 512px VitaMind AI logo for web and app use.',
    url: `${SOMNO_BASE}/logo_512.png`,
    fileType: 'PNG',
    preview: `${SOMNO_BASE}/logo_512.png`,
    badge: 'VitaMind AI'
  },
  {
    id: 'vitamind-og',
    category: 'brand',
    title: 'VitaMind AI OG / Social Card',
    description: 'Social media open-graph preview card. Use as Twitter/Facebook sharing thumbnail.',
    url: `${SOMNO_BASE}/og-image.svg`,
    fileType: 'SVG',
    badge: 'Social'
  },
  {
    id: 'vitashield-favicon',
    category: 'logo',
    title: 'VitaShield Favicon',
    description: 'Vector favicon for browser tabs and PWA manifests.',
    url: `${BASE}/favicon.svg`,
    fileType: 'SVG',
    badge: 'Favicon'
  },
  // ── SDK / Technical ────────────────────────────────
  {
    id: 'widget-sdk',
    category: 'sdk',
    title: 'VitaShield Widget SDK',
    description: 'Drop-in JavaScript SDK. Embed the VitaShield behavioral verification widget on any site.',
    url: `${BASE}/widget.js`,
    fileType: 'JS',
    badge: 'v1 SDK'
  },
  {
    id: 'widget-sdk-secure',
    category: 'sdk',
    title: 'VitaShield Widget SDK (Secure)',
    description: 'Security-hardened variant of the Widget SDK with enhanced CSP and integrity policies.',
    url: `${BASE}/widget-secure.js`,
    fileType: 'JS',
    badge: 'Secure'
  },
  {
    id: 'collector-sdk',
    category: 'sdk',
    title: 'Behavior Collector Script',
    description: 'Silent behavioral telemetry collector — trains the anti-fraud ML model with zero UX impact.',
    url: `${BASE}/collector.js`,
    fileType: 'JS',
    badge: 'ML Trainer'
  },
  // ── Docs ───────────────────────────────────────────
  {
    id: 'postman-collection',
    category: 'docs',
    title: 'Postman API Collection',
    description: 'Pre-configured Postman collection for all VitaShield v1 REST endpoints.',
    url: `${BASE}/v1/postman_collection.json`,
    fileType: 'JSON',
    badge: 'API Docs'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Assets' },
  { id: 'logo', label: 'Logos' },
  { id: 'brand', label: 'Brand' },
  { id: 'sdk', label: 'SDK & Scripts' },
  { id: 'docs', label: 'Documentation' }
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  logo: '#06b6d4',
  brand: '#a855f7',
  sdk: '#10b981',
  docs: '#f59e0b'
};

const BADGE_COLORS: Record<string, string> = {
  Primary: '#06b6d4',
  'High-Res': '#10b981',
  'Parent Brand': '#a855f7',
  'VitaMind AI': '#8b5cf6',
  Social: '#f59e0b',
  Favicon: '#64748b',
  'v1 SDK': '#06b6d4',
  Secure: '#ef4444',
  'ML Trainer': '#10b981',
  'API Docs': '#f59e0b'
};

export const MediaPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = activeCategory === 'all'
    ? ASSETS
    : ASSETS.filter(a => a.category === activeCategory);

  const copyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url).then(() => {
      setCopiedId(asset.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.15)'
          }}>
            <img src="/logo.jpg" alt="VitaShield" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              Media Kit
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              VitaShield × VitaMind AI — Brand Resources
            </p>
          </div>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
          Official logos, brand assets, SDK scripts, and API documentation for VitaShield and VitaMind AI.
          All assets are publicly accessible via CDN. Right-click images to save, or copy the direct URL.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: `1px solid ${activeCategory === cat.id ? 'rgba(6, 182, 212, 0.4)' : 'rgba(255,255,255,0.06)'}`,
              background: activeCategory === cat.id ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255,255,255,0.02)',
              color: activeCategory === cat.id ? '#06b6d4' : '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              outline: 'none',
              letterSpacing: '0.02em'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Asset Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem'
      }}>
        {filtered.map(asset => (
          <div
            key={asset.id}
            className="glass-panel"
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = `${CATEGORY_COLORS[asset.category]}40`;
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${CATEGORY_COLORS[asset.category]}10`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            {/* Preview / Icon */}
            <div style={{
              height: '80px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {asset.preview ? (
                <img
                  src={asset.preview}
                  alt={asset.title}
                  style={{ maxHeight: '64px', maxWidth: '200px', objectFit: 'contain' }}
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span style={{ fontSize: '2rem' }}>
                  {asset.category === 'sdk' ? '⚙️' : asset.category === 'docs' ? '📄' : '🎨'}
                </span>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>{asset.title}</span>
                {asset.badge && (
                  <span style={{
                    padding: '0.1rem 0.5rem',
                    borderRadius: '4px',
                    background: `${BADGE_COLORS[asset.badge] || '#64748b'}18`,
                    border: `1px solid ${BADGE_COLORS[asset.badge] || '#64748b'}40`,
                    color: BADGE_COLORS[asset.badge] || '#64748b',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    {asset.badge}
                  </span>
                )}
                <span style={{
                  marginLeft: 'auto',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#64748b',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}>
                  {asset.fileType}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                {asset.description}
              </p>
            </div>

            {/* URL display */}
            <div style={{
              padding: '0.45rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.04)',
              fontSize: '0.65rem',
              color: '#475569',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {asset.url}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => copyUrl(asset)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: copiedId === asset.id ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
                  color: copiedId === asset.id ? '#10b981' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  outline: 'none'
                }}
              >
                {copiedId === asset.id ? '✓ Copied!' : '⎘ Copy URL'}
              </button>
              <a
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: `1px solid ${CATEGORY_COLORS[asset.category]}30`,
                  background: `${CATEGORY_COLORS[asset.category]}08`,
                  color: CATEGORY_COLORS[asset.category],
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                ↓ Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div style={{
        marginTop: '2rem',
        padding: '1.25rem',
        borderRadius: '10px',
        background: 'rgba(6, 182, 212, 0.04)',
        border: '1px solid rgba(6, 182, 212, 0.1)',
        fontSize: '0.78rem',
        color: '#64748b',
        lineHeight: 1.6,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div>
          <span style={{ color: '#06b6d4', fontWeight: 700 }}>Usage Guidelines: </span>
          VitaShield and VitaMind AI logos may be used in editorial, partner integrations, and press coverage.
          Do not alter colors, proportions, or apply effects to the logos. For commercial licensing inquiries, contact{' '}
          <a href="mailto:contact@sleepsomno.com" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 600 }}>
            contact@sleepsomno.com
          </a>
        </div>
        
        <div style={{ borderTop: '1px solid rgba(6, 182, 212, 0.1)', paddingTop: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: '#f8fafc' }}>Official Links:</span>
          <a href="https://www.instagram.com/_vitashield/" target="_blank" rel="noopener noreferrer" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600 }}>Instagram</a>
          <a href="https://www.linkedin.com/company/real-vitashield" target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', textDecoration: 'none', fontWeight: 600 }}>LinkedIn</a>
          <a href="https://www.crunchbase.com/organization/vitashield" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Crunchbase (Company)</a>
          <a href="https://www.crunchbase.com/person/vyncus-lim" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Crunchbase (Founder)</a>
        </div>
      </div>
    </div>
  );
};
