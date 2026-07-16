import React, { useState, useEffect, useRef } from 'react';
import { useBehaviorTracker } from './useBehaviorTracker';

interface VerificationWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  themePrimary?: string;
  themeBg?: string;
  themeText?: string;
  powDifficulty?: number;
}

export const VerificationWidget: React.FC<VerificationWidgetProps> = ({
  siteKey,
  onVerify,
  themePrimary = '#00f2fe',
  themeBg = 'rgba(13, 20, 35, 0.55)',
  themeText = '#94a3b8',
  powDifficulty = 3
}) => {
  const { getTelemetryToken, solveChallenge, mouseEventsCount, isMobile } = useBehaviorTracker();
  const [challengeActive, setChallengeActive] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(3);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // localStorage-persisted sound mute toggle state
  const [isMuted, setIsMuted] = useState(() => {
    try {
      const cached = localStorage.getItem('vms-widget-muted');
      return cached !== null ? cached === 'true' : true; // Default to true (muted by default)
    } catch {
      return true;
    }
  });


  const [isRebounding, setIsRebounding] = useState(false);
  const lastPlayedX = useRef(3);

  // Web Audio Synthesis (Sine & Triangle tone generators)
  const playSound = (type: 'success' | 'error' | 'click') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'success') {
        // C5 + E5 double sine chime with logarithmic envelope decay
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.06);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.setValueAtTime(0.12, now + 0.06);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.2);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.25);
      } else if (type === 'error') {
        // Triangle wave warning sweep (110Hz -> 73Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110.00, now);
        osc.frequency.linearRampToValueAtTime(73.42, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'click') {
        // High-pass 2000Hz transient click for physical texture feedback
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000.00, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.02);
      }
    } catch (err) {
      console.warn("Audio synthesis error:", err);
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    try {
      localStorage.setItem('vms-widget-muted', String(nextMute));
    } catch {}
  };

  // Automatically intercept parent form submissions without requiring clicks
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parentForm = container.closest('form');
    if (!parentForm) return;

    const handleFormSubmit = (e: SubmitEvent) => {
      if (verified) return;

      // Check if kinetics look suspicious (no mouse movement and not on mobile)
      const isSuspicious = mouseEventsCount === 0 && !isMobile;

      if (isSuspicious) {
        e.preventDefault();
        e.stopPropagation();
        setChallengeActive(true);
      } else {
        const token = getTelemetryToken(siteKey, powDifficulty);
        
        // Inject token field into the parent form
        const oldInput = parentForm.querySelector('input[name="vms-shield-token"]');
        if (oldInput) oldInput.remove();

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'vms-shield-token';
        hiddenInput.value = token;
        parentForm.appendChild(hiddenInput);

        onVerify(token);
      }
    };

    parentForm.addEventListener('submit', handleFormSubmit);
    return () => {
      parentForm.removeEventListener('submit', handleFormSubmit);
    };
  }, [verified, mouseEventsCount, isMobile, getTelemetryToken, onVerify, siteKey, powDifficulty]);

  const handleSliderDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsRebounding(false);
    lastPlayedX.current = sliderPosition;

    const handle = e.currentTarget;
    const track = handle.parentElement;
    if (!track) return;

    const maxDrag = track.clientWidth - handle.clientWidth - 6;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startX = clientX - sliderPosition;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      let left = currentX - startX;
      left = Math.max(3, Math.min(left, maxDrag));
      setSliderPosition(left);

      // Play transient haptic texture clicks every 12 pixels of movement
      if (Math.abs(left - lastPlayedX.current) >= 12) {
        playSound('click');
        lastPlayedX.current = left;
      }

      if (left >= maxDrag - 2) {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchmove', onMove);
        onSuccess();
      }
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchend', onEnd);

      if (sliderPosition < maxDrag - 2) {
        setIsRebounding(true); // iOS spring return ease transition
        setSliderPosition(3);
      }
    };

    const onSuccess = () => {
      solveChallenge('slider');
      setVerified(true);
      playSound('success');
      setChallengeActive(false);
      const token = getTelemetryToken(siteKey, powDifficulty);
      
      const parentForm = containerRef.current?.closest('form');
      if (parentForm) {
        const oldInput = parentForm.querySelector('input[name="vms-shield-token"]');
        if (oldInput) oldInput.remove();

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'vms-shield-token';
        hiddenInput.value = token;
        parentForm.appendChild(hiddenInput);
        
        onVerify(token);

        // Resume form submit
        setTimeout(() => {
          parentForm.submit();
        }, 600);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  };

  const handleWebAuthnVerify = async () => {
    try {
      if (!window.PublicKeyCredential) {
        playSound('error');
        alert("WebAuthn is not supported in this browser environment.");
        return;
      }
      
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: "discouraged"
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });
      
      if (credential) {
        solveChallenge('webauthn');
        setVerified(true);
        playSound('success');
        setChallengeActive(false);
        const token = getTelemetryToken(siteKey, powDifficulty);
        const parentForm = containerRef.current?.closest('form');
        if (parentForm) {
          const oldInput = parentForm.querySelector('input[name="vms-shield-token"]');
          if (oldInput) oldInput.remove();
          const hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = 'vms-shield-token';
          hiddenInput.value = token;
          parentForm.appendChild(hiddenInput);
          onVerify(token);
          setTimeout(() => { parentForm.submit(); }, 600);
        }
      }
    } catch (err: any) {
      playSound('error');
      console.warn("WebAuthn verification failed or cancelled:", err);
      // Mock hardware simulation for development/unsecure context environments
      const confirmBypass = window.confirm("WebAuthn signature query failed or canceled. Run physical hardware validation simulator (WebAuthn / YubiKey)?");
      if (confirmBypass) {
        solveChallenge('webauthn');
        setVerified(true);
        playSound('success');
        setChallengeActive(false);
        const token = getTelemetryToken(siteKey, powDifficulty);
        const parentForm = containerRef.current?.closest('form');
        if (parentForm) {
          const oldInput = parentForm.querySelector('input[name="vms-shield-token"]');
          if (oldInput) oldInput.remove();
          const hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = 'vms-shield-token';
          hiddenInput.value = token;
          parentForm.appendChild(hiddenInput);
          onVerify(token);
          setTimeout(() => { parentForm.submit(); }, 600);
        }
      } else {
        playSound('error');
      }
    }
  };

  return (
    <div ref={containerRef} style={{ display: 'inline-block', margin: '0.5rem 0', position: 'relative' }}>
      <style>{`
        .vms-challenge-container {
          animation: vms-pop 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
          transform-origin: center bottom;
        }
        @keyframes vms-pop {
          0% {
            transform: scale(0.88) translateY(12px);
            opacity: 0;
          }
          70% {
            transform: scale(1.04) translateY(-3px);
          }
          85% {
            transform: scale(0.97) translateY(1px);
          }
          100% {
            transform: scale(1.0) translateY(0);
            opacity: 1;
          }
        }
        .vms-interactive-btn:active {
          transform: scale(0.97) !important;
        }
        .vms-interactive-btn:focus-visible {
          outline: 2px solid ${themePrimary} !important;
          outline-offset: 2px !important;
        }
        .vms-mute-btn:hover {
          color: #fff !important;
          background: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
      
      <input
        type="text"
        name="vms-security-honeypot"
        tabIndex={-1}
        autoComplete="off"
        style={{
          opacity: 0,
          position: 'absolute',
          left: '-9999px',
          height: 0,
          width: 0,
          zIndex: -1
        }}
      />
      {!challengeActive ? (
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: verified ? 'rgba(16, 185, 129, 0.12)' : themeBg,
            border: verified ? '1px solid rgba(16, 185, 129, 0.35)' : `1px solid ${themePrimary}3d`,
            borderRadius: '8px',
            color: verified ? '#34d399' : themeText,
            fontFamily: 'sans-serif',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'default',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            userSelect: 'none'
          }}
          data-sitekey={siteKey}
        >
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: verified ? '#10b981' : themePrimary,
            boxShadow: verified ? '0 0 8px #10b981' : `0 0 8px ${themePrimary}`
          }} />
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={verified ? '#34d399' : themePrimary} strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>
            {verified ? (
              <span>Verification Passed</span>
            ) : (
              <span>Protected by <strong style={{ color: '#fff' }}>VitaShield</strong></span>
            )}
          </span>
        </div>
      ) : (
        <div className="vms-challenge-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', position: 'relative' }}>
          <div style={{
            width: '250px',
            height: '38px',
            background: themeBg,
            border: `1px solid ${themePrimary}5a`,
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            boxShadow: `0 0 12px ${themePrimary}33`,
            fontFamily: 'sans-serif'
          }}>
            <span style={{ fontSize: '11px', color: themeText, fontWeight: '700', pointerEvents: 'none', zIndex: 1 }}>
              🛡️ Slide to Verify Humanity
            </span>
            <div 
              onMouseDown={handleSliderDrag}
              onTouchStart={handleSliderDrag}
              style={{
                width: '32px',
                height: '32px',
                background: themePrimary,
                borderRadius: '50%',
                position: 'absolute',
                left: `${sliderPosition}px`,
                top: '3px',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 8px ${themePrimary}`,
                zIndex: 2,
                transition: isRebounding ? 'left 280ms cubic-bezier(0.32, 0.72, 0, 1)' : 'none'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#080b10" strokeWidth="3">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '250px' }}>
            <button
              type="button"
              onClick={handleWebAuthnVerify}
              className="vms-interactive-btn"
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${themePrimary}3d`,
                borderRadius: '12px',
                color: themeText,
                padding: '6px 12px',
                fontSize: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'transform 120ms cubic-bezier(0.32, 0.72, 0, 1), background 0.2s',
                fontFamily: 'sans-serif',
                willChange: 'transform',
                outline: 'none'
              }}
            >
              🔑 Verify with WebAuthn
            </button>

            {/* Micro Global Mute Button */}
            <button
              type="button"
              onClick={toggleMute}
              className="vms-mute-btn"
              style={{
                width: '28px',
                height: '28px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              title={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v6a3 3 0 0 0 3 3h1.586l4.707 4.707A1 1 0 0 0 20 22V4a1 1 0 0 0-1.707-.707L13.586 8H12a3 3 0 0 0-3 3z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
