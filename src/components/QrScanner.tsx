import { useState, useCallback } from 'react';
import { Camera, Keyboard } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ScannerOverlay } from './Scanner/ScannerOverlay';
import { ManualInput } from './Scanner/ManualInput';

type InputMode = 'camera' | 'manual';

interface QrScannerProps {
  onScan: (data: string) => void;
  isScanning: boolean;
}

/**
 * QrScanner Component
 * Uses high-performance ZXing WebAssembly via @yudiel/react-qr-scanner.
 */
export function QrScanner({ onScan, isScanning }: QrScannerProps) {
  const [mode, setMode] = useState<InputMode>('camera');
  const [inputValue, setInputValue] = useState('');

  const handleManualSubmit = useCallback(() => {
    if (inputValue.trim()) {
      onScan(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, onScan]);

  const handleQRScan = useCallback((result: any) => {
    if (result && result.length > 0 && result[0].rawValue) {
      onScan(result[0].rawValue);
    }
  }, [onScan]);

  return (
    <div style={{ margin: '12px 20px 0' }}>
      {/* View Switcher: Camera or Manual */}
      {mode === 'camera' ? (
        <div style={{
          borderRadius: 32,
          overflow: 'hidden',
          background: '#0a0a0a',
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
          minHeight: 300,
          aspectRatio: '1/1', // Force square aspect ratio for consistent look
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}>
          {(!isScanning) && (
            <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
              <Scanner
                onScan={handleQRScan}
                formats={['qr_code']}
                components={{
                  audio: false,
                  finder: false // We use our custom ScannerOverlay
                }}
                styles={{
                  container: { width: '100%', height: '100%', paddingTop: 0 },
                  video: { objectFit: 'cover' }
                }}
              />
            </div>
          )}

          <ScannerOverlay />
        </div>
      ) : (
        <ManualInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleManualSubmit}
        />
      )}

      {/* Mode Toggle Button */}
      <div className="mt-5 px-5 md:px-0">
        <button
          onClick={() => setMode(mode === 'camera' ? 'manual' : 'camera')}
          className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] border ${mode === 'camera'
            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            : 'bg-accent border-accent text-bg shadow-glow-accent'
            }`}
        >
          {mode === 'camera' ? (
            <>
              <Keyboard size={18} className="opacity-60" />
              Ingresar código por texto
            </>
          ) : (
            <>
              <Camera size={18} />
              Activar Escáner de Cámara
            </>
          )}
        </button>
      </div>
    </div>
  );
}