import React, { useState } from 'react';

interface PricingPageProps {
  onGetStarted?: () => void;
  onBack?: () => void;
}

const PLANS = [
  {
    id: 'free',
    name: 'Developer',
    badge: null,
    price: { monthly: 0, annual: 0 },
    unit: 'Free forever',
    description: 'Integrate VitaShield into your project. No credit card required.',
    cta: 'Start Building Free',
    ctaStyle: 'outline',
    verifications: '10,000',
    features: [
      'Up to 10,000 verifications / mo',
      'Behavioral telemetry engine',
      'JavaScript SDK (Web)',
      'Real-time risk scoring',
      'Community Slack support',
      'VitaShield branding on widget',
    ],
    notIncluded: [
      'Custom domain widget',
      'Advanced ML rules engine',
      'SLA guarantee',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    badge: null,
    price: { monthly: 99, annual: 79 },
    unit: 'per month',
    description: 'For growing products that need more volume and deeper controls.',
    cta: 'Start Free Trial',
    ctaStyle: 'outline',
    verifications: '100,000',
    features: [
      'Up to 100,000 verifications / mo',
      'Everything in Developer',
      'Remove VitaShield branding',
      'Custom widget domain',
      'Keyboard + mouse biometrics',
      'Threat intelligence dashboard',
      'Email support (48h SLA)',
      'API access (REST)',
    ],
    notIncluded: [
      'Dedicated ML model training',
      'Priority SLA',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    badge: 'Most Popular',
    price: { monthly: 399, annual: 319 },
    unit: 'per month',
    description: 'Advanced protection for high-traffic platforms and fintech.',
    cta: 'Start Free Trial',
    ctaStyle: 'primary',
    verifications: '1,000,000',
    features: [
      'Up to 1M verifications / mo',
      'Everything in Growth',
      'Agentic AI traffic governance',
      'Rules Engine (no-code)',
      'Adversarial ML training',
      'BNM RMiT compliance reports',
      'SIEM integration (Splunk, Elastic)',
      'Priority email + Slack (12h SLA)',
      'Dedicated onboarding engineer',
      'Multi-domain widget deployment',
    ],
    notIncluded: [],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: null,
    price: { monthly: null, annual: null },
    unit: 'Custom pricing',
    description: 'High-volume, regulated industries, and custom compliance requirements.',
    cta: 'Talk to Sales',
    ctaStyle: 'outline',
    verifications: 'Unlimited',
    features: [
      'Unlimited verifications',
      'Everything in Business',
      'Dedicated cloud instance (VPC)',
      'Custom ML model per tenant',
      'On-prem deployment option',
      '99.99% uptime SLA',
      'SOC2 Type II + ISO 27001 ready',
      'NACSA / BNM RMiT audit support',
      'Named Account Engineer',
      '24/7 phone + emergency support',
      'Custom contract & billing terms',
    ],
    notIncluded: [],
  },
];

const FAQS = [
  {
    q: 'What counts as a verification?',
    a: 'One verification = one session where VitaShield analyzes a visitor and returns a risk score. A single page visit may trigger one verification. Bot blocks and passed sessions both count.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'Yes — Growth and Business plans include a 14-day free trial. No credit card required to start. You\'ll be prompted to add billing only if you choose to continue.',
  },
  {
    q: 'What happens when I exceed my monthly limit?',
    a: 'We never hard-block traffic. When you exceed your plan\'s limit, we automatically switch to a lightweight scoring mode and notify you. You can upgrade or purchase overage credits at $0.0002 per verification.',
  },
  {
    q: 'Is VitaShield compliant with Bank Negara Malaysia\'s RMiT policy?',
    a: 'Business and Enterprise plans include BNM RMiT compliance reporting. We generate the audit logs and evidence packages required for Malaysian financial institutions. Our team has experience with NACSA-listed framework requirements.',
  },
  {
    q: 'Can I self-host VitaShield?',
    a: 'On-premise and private VPC deployment is available on Enterprise plans. Contact our sales team to discuss your infrastructure requirements.',
  },
  {
    q: 'What is VitaMind AI\'s relationship to VitaShield?',
    a: 'VitaShield is the flagship security product of VitaMind AI. VitaMind AI is the parent company building AI-native security infrastructure for the post-CAPTCHA, agentic AI era.',
  },
];

export const PricingPage: React.FC<PricingPageProps> = ({ onGetStarted, onBack }) => {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 40%, #0a1628 100%)',
      color: '#e2e8f0',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflowX: 'hidden',
    }}>
      {/* Nav bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2rem',
        borderBottom: '1px solid rgba(56,189,248,0.1)',
        background: 'rgba(10,15,30,0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '0.875rem',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#38bdf8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to home
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' }}>VitaShield</span>
        </div>

        <button
          onClick={onGetStarted}
          style={{
            padding: '0.5rem 1.25rem',
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Get Started Free
        </button>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '5rem 2rem 3rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(56,189,248,0.1)',
          border: '1px solid rgba(56,189,248,0.3)',
          borderRadius: '100px',
          padding: '0.375rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.8rem',
          color: '#38bdf8',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
          TRANSPARENT PRICING · NO SURPRISES
        </div>

        <h1 style={{
          fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          margin: '0 0 1.25rem',
          background: 'linear-gradient(135deg, #f1f5f9 0%, #38bdf8 60%, #818cf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Stop bots. Ship faster.<br />Start free.
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.125rem', maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          VitaShield's behavioral AI protects your web and API surfaces from bots, fraud, and agentic AI attacks.
          Transparent pricing. No credit card to start.
        </p>

        {/* Billing toggle */}
        <div style={{
          display: 'inline-flex',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '100px',
          padding: '0.25rem',
          gap: '0.25rem',
          marginBottom: '4rem',
        }}>
          {(['monthly', 'annual'] as const).map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '100px',
                border: 'none',
                background: billing === b ? 'linear-gradient(135deg,#38bdf8,#818cf8)' : 'transparent',
                color: billing === b ? 'white' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {b === 'monthly' ? 'Monthly' : 'Annual'}{b === 'annual' && (
                <span style={{
                  marginLeft: '0.4rem',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '100px',
                  fontSize: '0.7rem',
                }}>Save 20%</span>
              )}
            </button>
          ))}
        </div>

        {/* Pricing cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          maxWidth: 1180,
          margin: '0 auto',
          padding: '0 1rem',
        }}>
          {PLANS.map(plan => {
            const isFeatured = plan.badge === 'Most Popular';
            const price = billing === 'annual' ? plan.price.annual : plan.price.monthly;

            return (
              <div
                key={plan.id}
                style={{
                  background: isFeatured
                    ? 'linear-gradient(145deg, rgba(56,189,248,0.12) 0%, rgba(129,140,248,0.12) 100%)'
                    : 'rgba(255,255,255,0.03)',
                  border: isFeatured
                    ? '1.5px solid rgba(56,189,248,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '1.25rem',
                  padding: '2rem 1.75rem',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  textAlign: 'left',
                  boxShadow: isFeatured ? '0 0 40px rgba(56,189,248,0.1)' : 'none',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = isFeatured ? '0 0 40px rgba(56,189,248,0.1)' : 'none';
                }}
              >
                {plan.badge && (
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.3rem 0.9rem',
                    borderRadius: '100px',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}>{plan.badge}</div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{plan.name}</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    {price !== null ? (
                      <>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>
                          ${price}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.3rem' }}>/mo</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>Custom</span>
                    )}
                  </div>
                  <p style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>
                    {plan.verifications} verifications/mo
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.825rem', marginTop: '0.6rem', lineHeight: 1.5 }}>{plan.description}</p>
                </div>

                <button
                  onClick={onGetStarted}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: isFeatured ? 'none' : '1px solid rgba(56,189,248,0.4)',
                    background: isFeatured ? 'linear-gradient(135deg, #38bdf8, #818cf8)' : 'transparent',
                    color: isFeatured ? 'white' : '#38bdf8',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginBottom: '1.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!isFeatured) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(56,189,248,0.1)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isFeatured) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }
                  }}
                >
                  {plan.cta}
                </button>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
                  <p style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Included</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.825rem', color: '#94a3b8' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                    {plan.notIncluded.map((f, i) => (
                      <li key={`no-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.825rem', color: '#334155' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          marginTop: '3.5rem',
          padding: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          {[
            { icon: '🔒', text: 'SOC2 Ready' },
            { icon: '🇲🇾', text: 'BNM RMiT Compliant' },
            { icon: '🛡️', text: 'GDPR & PDPA' },
            { icon: '⚡', text: '99.9% Uptime SLA' },
            { icon: '🔑', text: 'No data stored by default' },
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
              <span>{b.icon}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>

        {/* Overage note */}
        <p style={{ color: '#475569', fontSize: '0.825rem', marginTop: '2rem' }}>
          Overage beyond plan limit: <strong style={{ color: '#64748b' }}>$0.0002 per verification</strong>. We never block traffic — we alert you first.
        </p>

        {/* Compare with competitors */}
        <div style={{ maxWidth: 820, margin: '5rem auto 0', padding: '0 1rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f1f5f9' }}>
            How VitaShield compares
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '0.925rem' }}>
            Enterprise bot protection without the enterprise price tag.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  {['Feature', 'VitaShield Business', 'Cloudflare Enterprise', 'DataDome', 'Arkose Labs'].map((h, i) => (
                    <th key={i} style={{
                      padding: '0.75rem 1rem',
                      textAlign: i === 0 ? 'left' : 'center',
                      color: i === 1 ? '#38bdf8' : '#64748b',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Starting price', '$399/mo', '$5,000+/mo', 'Custom', 'Custom'],
                  ['Transparent pricing', '✅', '❌', '❌', '❌'],
                  ['Free tier', '✅ 10k/mo', '❌', '❌', '❌'],
                  ['Self-serve signup', '✅', '❌', '❌', '❌'],
                  ['Behavioral biometrics', '✅', '⚠️ Basic', '✅', '❌'],
                  ['BNM RMiT compliance', '✅', '❌', '❌', '❌'],
                  ['Agentic AI governance', '✅', '⚠️ Roadmap', '⚠️ Partial', '✅'],
                  ['SEA data residency', '✅', '⚠️', '❌', '❌'],
                  ['14-day free trial', '✅', '❌', '❌', '❌'],
                ].map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{
                        padding: '0.875rem 1rem',
                        textAlign: ci === 0 ? 'left' : 'center',
                        color: ci === 0 ? '#94a3b8' : ci === 1 ? '#38bdf8' : '#64748b',
                        fontWeight: ci === 0 ? 500 : 400,
                        background: ci === 1 ? 'rgba(56,189,248,0.04)' : 'transparent',
                      }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 680, margin: '5rem auto 0', padding: '0 1rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2.5rem', color: '#f1f5f9' }}>
            Frequently asked questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    padding: '1.125rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    gap: '1rem',
                  }}
                >
                  {faq.q}
                  <svg
                    width="16" height="16"
                    viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"
                    style={{ flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 1.25rem 1.25rem', color: '#64748b', fontSize: '0.875rem', lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div style={{
          margin: '5rem auto',
          maxWidth: 600,
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(129,140,248,0.08))',
          border: '1px solid rgba(56,189,248,0.2)',
          borderRadius: '1.5rem',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.75rem' }}>
            Ready to stop bots?
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.925rem' }}>
            Start free. No credit card. 10,000 verifications included every month.
          </p>
          <button
            onClick={onGetStarted}
            style={{
              padding: '0.875rem 2.5rem',
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(56,189,248,0.3)',
            }}
          >
            Start for free →
          </button>
          <p style={{ marginTop: '1rem', color: '#475569', fontSize: '0.8rem' }}>
            A VitaMind AI product · Made for the post-CAPTCHA era
          </p>
        </div>
      </div>
    </div>
  );
};
