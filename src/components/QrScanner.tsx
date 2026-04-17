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
          minHeight: 300,
          maxHeight: 'min(500px, 60vh)',
          aspectRatio: 'unset', // Allow flexible content
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

      {/* Mode Controls */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button
          onClick={() => setMode('camera')}
          style={{
            flex: 1,
            padding: '14px 0',
            borderRadius: 18,
            fontWeight: 800,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            fontFamily: 'inherit',
            border: 'none',
            transition: 'all 0.15s',
            background: mode === 'camera' ? '#84cc16' : 'rgba(255,255,255,0.06)',
            color: mode === 'camera' ? '#0a0a0a' : 'rgba(255,255,255,0.7)',
            boxShadow: mode === 'camera' ? '0 4px 20px rgba(132,204,22,0.3)' : 'none',
          }}
        >
          <Camera size={17} />
          Activar Cámara
        </button>
        
        <button
          onClick={() => setMode('manual')}
          style={{
            padding: '14px 18px',
            borderRadius: 18,
            fontWeight: 800,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
            background: mode === 'manual' ? 'rgba(132,204,22,0.15)' : 'rgba(255,255,255,0.06)',
            color: mode === 'manual' ? '#84cc16' : 'rgba(255,255,255,0.7)',
            border: mode === 'manual' ? '1px solid rgba(132,204,22,0.3)' : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Keyboard size={17} />
        </button>
      </div>
    </div>
  );
}