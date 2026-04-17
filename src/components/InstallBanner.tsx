import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'scdv-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallMode = 'android' | 'ios' | null;

function detectInstallMode(): InstallMode {
  if (typeof window === 'undefined') return null;
  if (window.matchMedia('(display-mode: standalone)').matches) return null;
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios/i.test(ua)) {
    return 'ios';
  }
  return null;
}

export function InstallBanner({ base = '/' }: { base?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<InstallMode>(null);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const detectedMode = detectInstallMode();

    if (detectedMode === 'ios') {
      setTimeout(() => setMode('ios'), 1800);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setMode('android'), 1800);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = (permanent = false) => {
    setAnimateOut(true);
    if (permanent) localStorage.setItem(DISMISSED_KEY, '1');
    setTimeout(() => setMode(null), 350);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') localStorage.setItem(DISMISSED_KEY, '1');
    dismiss(false);
  };

  if (!mode) return null;

  const slideStyle: React.CSSProperties = {
    transform: animateOut ? 'translateY(110%)' : 'translateY(0)',
    transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
  };

  return (
    <>
      <div
        onClick={() => dismiss(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 49,
          opacity: animateOut ? 0 : 1,
          transition: 'opacity 0.35s ease',
        }}
      />
      <div
        role="dialog"
        aria-label="Instalar aplicación"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '0 16px 24px',
          ...slideStyle,
        }}
      >
        <div style={{
          background: 'linear-gradient(145deg, rgba(18,18,18,0.97) 0%, rgba(12,12,12,0.99) 100%)',
          border: '1px solid rgba(132,204,22,0.25)',
          borderRadius: '28px',
          padding: '22px 20px 20px',
          boxShadow: '0 -8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), 0 0 64px rgba(132,204,22,0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}>
          <div style={{
            width: '36px', height: '4px', borderRadius: '99px',
            background: 'rgba(255,255,255,0.12)', margin: '0 auto 20px',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              overflow: 'hidden', flexShrink: 0,
              border: '1px solid rgba(132,204,22,0.2)',
              boxShadow: '0 4px 16px rgba(132,204,22,0.15)',
            }}>
              <img src={`${base}icon-192.png`} alt="SCDV Verificador"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 3px', letterSpacing: '-0.2px' }}>
                SCDV Verificador
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.4 }}>
                Funciona offline · Sin registro · Gratis
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'rgba(132,204,22,0.12)', border: '1px solid rgba(132,204,22,0.25)',
              borderRadius: '999px', padding: '4px 10px', flexShrink: 0,
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                fill="none" stroke="#84cc16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#84cc16', letterSpacing: '0.04em' }}>PWA</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {['⚡ Verificación instantánea', '🔒 100% local', '📵 Sin conexión'].map((feature) => (
              <span key={feature} style={{
                fontSize: '11px', fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '999px', padding: '4px 10px',
              }}>{feature}</span>
            ))}
          </div>

          {mode === 'ios' ? <IosInstructions onDismiss={() => dismiss(true)} /> : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => dismiss(true)}
                style={{
                  flex: '0 0 auto', padding: '13px 18px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px', fontSize: '13px', fontWeight: 700,
                  color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Ahora no
              </button>
              <button
                onClick={handleInstall}
                style={{
                  flex: 1, padding: '13px 18px',
                  background: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
                  border: 'none', borderRadius: '14px',
                  fontSize: '14px', fontWeight: 800, color: '#0a0a0a',
                  cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.01em',
                  boxShadow: '0 4px 20px rgba(132,204,22,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Instalar app
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function IosInstructions({ onDismiss }: { onDismiss: () => void }) {
  const steps = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="#84cc16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      ),
      text: 'Tocá el botón Compartir en Safari',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="#84cc16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      ),
      text: 'Seleccioná "Agregar a pantalla de inicio"',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="#84cc16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
      text: 'Confirmá tocando "Agregar"',
    },
  ];

  return (
    <div>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 14px', textAlign: 'center' }}>
        Seguí estos pasos para instalar en iOS:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              background: 'rgba(132,204,22,0.1)', border: '1px solid rgba(132,204,22,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {step.icon}
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.4 }}>
              <span style={{ color: 'rgba(132,204,22,0.8)', fontWeight: 700, marginRight: '4px' }}>{i + 1}.</span>
              {step.text}
            </p>
          </div>
        ))}
      </div>
      <button
        onClick={onDismiss}
        style={{
          width: '100%', padding: '13px 18px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px', fontSize: '13px', fontWeight: 700,
          color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Entendido
      </button>
    </div>
  );
}
