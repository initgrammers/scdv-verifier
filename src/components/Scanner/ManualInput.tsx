import React from 'react';
import { Keyboard } from 'lucide-react';

interface ManualInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function ManualInput({ value, onChange, onSubmit }: ManualInputProps) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 18,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <Keyboard size={18} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder="Pegue el código aquí..."
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#fff',
          fontSize: 14,
          fontWeight: 500,
          fontFamily: 'inherit',
        }}
      />
      {value && (
        <button
          onClick={onSubmit}
          style={{
            padding: '6px 14px',
            background: '#84cc16',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'inherit',
            flexShrink: 0,
          }}
        >
          Verificar
        </button>
      )}
    </div>
  );
}
