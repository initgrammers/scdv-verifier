import { useState, useEffect, useRef, useCallback } from 'react';
import type { Html5Qrcode } from 'html5-qrcode';

export type CameraStatus = 'idle' | 'requesting' | 'ready' | 'permission-denied' | 'no-camera' | 'error';

interface UseCameraScannerProps {
  onScan: (data: string) => void;
  isActive: boolean;
  retryKey: number;
  containerId: string;
}

export function useCameraScanner({ onScan, isActive, retryKey, containerId }: UseCameraScannerProps) {
  const [status, setStatus] = useState<CameraStatus>('idle');
  const readerRef = useRef<Html5Qrcode | null>(null);

  const stopScanner = useCallback(async () => {
    if (readerRef.current) {
      try {
        const state = readerRef.current.getState();
        // State 2 = SCANNING
        if (state === 2) {
          await readerRef.current.stop();
        }
      } catch (err) {
        console.warn('[useCameraScanner] Error stopping scanner:', err);
      }
      readerRef.current = null;
    }
    setStatus('idle');
  }, []);

  const startScanner = useCallback(async () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    setStatus('requesting');

    // Step 1: Request permission — prefer rear camera, fall back to any camera
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: 'environment' } } });
      } catch {
        // Rear camera not available (desktop, front-only device) — try any camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      // Release immediately — html5-qrcode will open its own stream
      stream.getTracks().forEach(t => t.stop());
    } catch (err: unknown) {
      const name = err instanceof Error ? (err as DOMException).name : '';
      const message = err instanceof Error ? err.message : String(err);
      if (name === 'NotAllowedError' || message.toLowerCase().includes('permission') || message.toLowerCase().includes('denied')) {
        setStatus('permission-denied');
      } else if (name === 'NotFoundError' || message.toLowerCase().includes('not found')) {
        setStatus('no-camera');
      } else {
        console.error('[useCameraScanner] getUserMedia error:', err);
        setStatus('error');
      }
      return;
    }

    // Step 2: Start html5-qrcode
    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

      container.innerHTML = '';

      const reader = new Html5Qrcode(containerId, { verbose: false });
      readerRef.current = reader;

      const config = { 
        fps: 20, 
        aspectRatio: 1.0,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        videoConstraints: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: { ideal: 'environment' }
        },
        formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
      };

      const onSuccess = (decodedText: string) => { 
        console.log('[useCameraScanner] QR Detected:', decodedText);
        onScan(decodedText); 
      };

      try {
        await reader.start({ facingMode: { exact: 'environment' } }, config, onSuccess, () => {});
      } catch {
        await reader.start({ facingMode: 'user' }, config, onSuccess, () => {});
      }

      setStatus('ready');
    } catch (err) {
      console.error('[useCameraScanner] html5-qrcode start error:', err);
      setStatus('error');
    }
  }, [containerId, onScan]);

  useEffect(() => {
    if (isActive) {
      stopScanner().then(() => startScanner());
    } else {
      stopScanner();
    }

    return () => { stopScanner(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, retryKey, startScanner, stopScanner]);

  return { status };
}
