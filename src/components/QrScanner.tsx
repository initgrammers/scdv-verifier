import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Keyboard } from 'lucide-react';
import type { Html5Qrcode } from 'html5-qrcode';

type InputMode = 'camera' | 'manual';

interface QrScannerProps {
  onScan: (data: string) => void;
  isScanning: boolean;
}

interface UseQrScannerOptions {
  onScan: (data: string) => void;
  isActive: boolean;
}

function useQrScanner({ onScan, isActive }: UseQrScannerOptions) {
  const [hasCamera, setHasCamera] = useState(true);
  const scannerRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const reader = new Html5Qrcode('qr-reader');
      readerRef.current = reader;

      await reader.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => onScan(decodedText),
        () => {}
      );
    } catch {
      setHasCamera(false);
    }
  }, [onScan]);

  useEffect(() => {
    if (isActive) {
      startScanner();
    }

    return () => {
      if (readerRef.current) {
        readerRef.current.stop().catch(() => {});
      }
    };
  }, [isActive, startScanner]);

  return { hasCamera, scannerRef };
}

function ScannerOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <CornerBracket position="tl" />
      <CornerBracket position="tr" />
      <CornerBracket position="bl" />
      <CornerBracket position="br" />
      <ScanLine />
    </div>
  );
}

function CornerBracket({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const classes = {
    tl: 'top-5 left-5 rounded-tl-[10px]',
    tr: 'top-5 right-5 rounded-tr-[10px]',
    bl: 'bottom-5 left-5 rounded-bl-[10px]',
    br: 'bottom-5 right-5 rounded-br-[10px]',
  };

  return (
    <div
      className={`absolute w-14 h-14 border-accent border-t-3 border-l-3 ${classes[position]}`}
      style={{
        borderTopWidth: '3px',
        borderLeftWidth: '3px',
        ...(position === 'tr' && { borderRightWidth: '3px', borderLeftWidth: '0' }),
        ...(position === 'bl' && { borderBottomWidth: '3px', borderTopWidth: '0' }),
        ...(position === 'br' && { borderBottomWidth: '3px', borderRightWidth: '3px', borderTopWidth: '0', borderLeftWidth: '0' }),
      }}
    />
  );
}

function CornerBracketsSimple() {
  return (
    <>
      <div className="absolute top-5 left-5 w-14 h-14 border-accent border-t-3 border-l-3 rounded-tl-[10px]" />
      <div className="absolute top-5 right-5 w-14 h-14 border-accent border-t-3 border-r-3 rounded-tr-[10px]" />
      <div className="absolute bottom-5 left-5 w-14 h-14 border-accent border-b-3 border-l-3 rounded-bl-[10px]" />
      <div className="absolute bottom-5 right-5 w-14 h-14 border-accent border-b-3 border-r-3 rounded-br-[10px]" />
    </>
  );
}

function ScanLine() {
  return (
    <div className="absolute left-5 right-5 h-0.5 top-[45%] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50 blur-[0.5px]" />
  );
}

function CameraView({ hasCamera }: { hasCamera: boolean }) {
  return (
    <div className="rounded-[28px] overflow-hidden bg-black aspect-square relative border border-white/[0.07]">
      <div id="qr-reader" className="w-full h-full" />
      <ScannerOverlay />
      {!hasCamera && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/80">
          <p className="text-sm text-muted">Cámara no disponible</p>
        </div>
      )}
    </div>
  );
}

function ManualInput({ value, onChange, onSubmit }: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="bg-card border border-white/[0.07] rounded-[18px] px-4 py-3.5 flex items-center gap-2.5">
      <span className="text-lg opacity-50">
        <Keyboard size={20} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder="Pegue el código aquí..."
        className="flex-1 bg-transparent border-none outline-none text-white font-medium text-sm placeholder:text-muted"
      />
    </div>
  );
}

function ModeButtons({ mode, onModeChange }: {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
}) {
  return (
    <div className="flex gap-3 mt-5">
      <button
        onClick={() => onModeChange('camera')}
        className={`flex-1 py-4 rounded-[18px] font-bold text-base flex items-center justify-center gap-2 transition-all ${
          mode === 'camera'
            ? 'bg-accent text-bg'
            : 'bg-card text-white border border-white/[0.07]'
        }`}
      >
        <Camera size={18} />
        Activar Cámara
      </button>
      <button
        onClick={() => onModeChange('manual')}
        className={`py-4 px-5 rounded-[18px] font-bold text-base bg-card text-white border border-white/[0.07] whitespace-nowrap ${
          mode === 'manual' ? 'ring-2 ring-accent' : ''
        }`}
      >
        <Keyboard size={18} />
      </button>
    </div>
  );
}

export function QrScanner({ onScan, isScanning }: QrScannerProps) {
  const [mode, setMode] = useState<InputMode>('camera');
  const [inputValue, setInputValue] = useState('');
  const { hasCamera } = useQrScanner({ onScan, isActive: mode === 'camera' && isScanning });

  const handleManualSubmit = useCallback(() => {
    if (inputValue.trim()) {
      onScan(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, onScan]);

  return (
    <div className="mx-6 mt-6">
      {mode === 'camera' ? (
        <CameraView hasCamera={hasCamera} />
      ) : (
        <ManualInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleManualSubmit}
        />
      )}
      <ModeButtons mode={mode} onModeChange={setMode} />
    </div>
  );
}