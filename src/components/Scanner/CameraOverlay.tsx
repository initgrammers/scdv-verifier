import React from 'react';
import { Camera, ShieldOff, AlertTriangle } from 'lucide-react';
import type { CameraStatus } from '../../hooks/useCameraScanner';

interface CameraOverlayProps {
  status: CameraStatus;
  onRetry: () => void;
}

export function CameraOverlay({ status, onRetry }: CameraOverlayProps) {
  if (status === 'ready') return null;

  let icon = <Camera size={28} style={{ color: 'rgba(255,255,255,0.2)' }} />;
  let title = 'Iniciando cámara...';
  let subtitle = '';
  let showRetry = false;

  if (status === 'requesting') {
    title = 'Solicitando permisos...';
    subtitle = 'Acepta el permiso de cámara cuando aparezca';
  } else if (status === 'permission-denied') {
    icon = <ShieldOff size={28} style={{ color: '#ef4444' }} />;
    title = 'Permiso denegado';
    subtitle = 'Ve a ajustes del navegador y permite el acceso a la cámara';
    showRetry = true;
  } else if (status === 'no-camera') {
    icon = <AlertTriangle size={28} style={{ color: '#f59e0b' }} />;
    title = 'Sin cámara';
    subtitle = 'No se detectó ninguna cámara en este dispositivo';
  } else if (status === 'error') {
    icon = <AlertTriangle size={28} style={{ color: '#ef4444' }} />;
    title = 'Error al iniciar';
    subtitle = 'No se pudo acceder a la cámara';
    showRetry = true;
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10,10,10,0.88)',
      gap: 10, padding: '0 20px',
      textAlign: 'center',
    }}>
      {icon}
      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>{title}</p>
      {subtitle && (
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{subtitle}</p>
      )}
      {showRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 6,
            padding: '8px 18px',
            background: 'rgba(132,204,22,0.15)',
            border: '1px solid rgba(132,204,22,0.3)',
            borderRadius: 10,
            color: '#84cc16',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
