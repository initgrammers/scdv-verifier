import { useState, useCallback } from 'react';
import { Camera, Keyboard } from 'lucide-react';
import { useCameraScanner } from '../hooks/useCameraScanner';
import { ScannerOverlay } from './Scanner/ScannerOverlay';
import { CameraOverlay } from './Scanner/CameraOverlay';
import { ManualInput } from './Scanner/ManualInput';

type InputMode = 'camera' | 'manual';

interface QrScannerProps {
  onScan: (data: string) => void;
  isScanning: boolean;
}

const QR_CONTAINER_ID = 'qr-reader-container';

/**
 * QrScanner Component
 * Handles the UI for both camera-based and manual code input.
 * Delegates low-level camera logic to useCameraScanner hook.
 */
export function QrScanner({ onScan, isScanning }: QrScannerProps) {
  const [mode, setMode] = useState<InputMode>('camera');
  const [inputValue, setInputValue] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  // The hook handles the heavy lifting of permissions and html5-qrcode lifecycle
  const { status } = useCameraScanner({ 
    onScan, 
    isActive: mode === 'camera' && !isScanning, 
    retryKey,
    containerId: QR_CONTAINER_ID 
  });

  const handleManualSubmit = useCallback(() => {
    if (inputValue.trim()) {
      onScan(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, onScan]);

  const handleRetry = useCallback(() => {
    setRetryKey(k => k + 1);
  }, []);

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
          {/* Main scanner container for html5-qrcode */}
          <div id={QR_CONTAINER_ID} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          
          <ScannerOverlay />
          
          <CameraOverlay 
            status={status} 
            onRetry={handleRetry} 
          />
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
          className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] border ${
            mode === 'camera' 
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