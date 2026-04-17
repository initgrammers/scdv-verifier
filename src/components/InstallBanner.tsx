import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'scdv-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner({ base = '/' }: { base?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    // Don't show if user already dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small delay so the page is fully loaded before sliding in
      setTimeout(() => setVisible(true), 1800);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Also hide if app is already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = (permanent = false) => {
    setAnimateOut(true);
    if (permanent) localStorage.setItem(DISMISSED_KEY, '1');
    setTimeout(() => setVisible(false), 350);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(DISMISSED_KEY, '1');
    }
    dismiss(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop blur overlay */}
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

      {/* Banner */}
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
          transform: animateOut ? 'translateY(110%)' : 'translateY(0)',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
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

          {/* Drag handle */}
          <div style={{
            width: '36px',
            height: '4px',
            borderRadius: '99px',
            background: 'rgba(255,255,255,0.12)',
            margin: '0 auto 20px',
          }} />

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            {/* App icon */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid rgba(132,204,22,0.2)',
              boxShadow: '0 4px 16px rgba(132,204,22,0.15)',
            }}>
              <img
                src={`${base}icon-192.png`}
                alt="SCDV Verificador"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '16px',
                fontWeight: 800,
                color: '#fff',
                margin: '0 0 3px',
                letterSpacing: '-0.2px',
              }}>
                SCDV Verificador
              </p>
              <p style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                margin: 0,
                lineHeight: 1.4,
              }}>
                Funciona offline · Sin registro · Gratis
              </p>
            </div>

            {/* Trust badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(132,204,22,0.12)',
              border: '1px solid rgba(132,204,22,0.25)',
              borderRadius: '999px',
              padding: '4px 10px',
              flexShrink: 0,
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                fill="none" stroke="#84cc16" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#84cc16', letterSpacing: '0.04em' }}>
                PWA
              </span>
            </div>
          </div>

          {/* Feature pills */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}>
            {['⚡ Verificación instantánea', '🔒 100% local', '📵 Sin conexión'].map((feature) => (
              <span
                key={feature}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '999px',
                  padding: '4px 10px',
                }}
              >
                {feature}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => dismiss(true)}
              style={{
                flex: '0 0 auto',
                padding: '13px 18px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              Ahora no
            </button>

            <button
              onClick={handleInstall}
              style={{
                flex: 1,
                padding: '13px 18px',
                background: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
                border: 'none',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 800,
                color: '#0a0a0a',
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.01em',
                boxShadow: '0 4px 20px rgba(132,204,22,0.35)',
                transition: 'opacity 0.15s, transform 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Instalar app
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
