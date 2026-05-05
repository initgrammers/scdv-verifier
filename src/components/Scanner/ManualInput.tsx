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
      background: 'rgba(10,49,97,0.05)',
      border: '1px solid rgba(10,49,97,0.1)',
      borderRadius: 18,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <Keyboard size={18} style={{ color: 'rgba(10,49,97,0.3)', flexShrink: 0 }} />
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder="Pegue el código aquí..."
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#0A3161',
          fontSize: 16,
          fontWeight: 500,
          fontFamily: 'inherit',
        }}
      />
      {value && (
        <button
          onClick={onSubmit}
          style={{
            padding: '6px 14px',
            background: '#B31942',
            color: '#FFFFFF',
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
