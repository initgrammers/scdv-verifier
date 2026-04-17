import React from 'react';

export function ScannerOverlay() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Corner brackets */}
      {[
        { top: 16, left: 16, borderTop: true, borderLeft: true, borderRadius: '10px 0 0 0' },
        { top: 16, right: 16, borderTop: true, borderRight: true, borderRadius: '0 10px 0 0' },
        { bottom: 16, left: 16, borderBottom: true, borderLeft: true, borderRadius: '0 0 0 10px' },
        { bottom: 16, right: 16, borderBottom: true, borderRight: true, borderRadius: '0 0 10px 0' },
      ].map((corner, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 48, height: 48,
          ...(corner.top !== undefined && { top: corner.top }),
          ...(corner.bottom !== undefined && { bottom: corner.bottom }),
          ...(corner.left !== undefined && { left: corner.left }),
          ...(corner.right !== undefined && { right: corner.right }),
          borderStyle: 'solid',
          borderColor: '#84cc16',
          borderWidth: 0,
          borderTopWidth: corner.borderTop ? 3 : 0,
          borderBottomWidth: corner.borderBottom ? 3 : 0,
          borderLeftWidth: corner.borderLeft ? 3 : 0,
          borderRightWidth: corner.borderRight ? 3 : 0,
          borderRadius: corner.borderRadius,
        }} />
      ))}
      {/* Scan line */}
      <div style={{
        position: 'absolute',
        left: 20, right: 20,
        height: 2,
        top: '45%',
        background: 'linear-gradient(to right, transparent, #84cc16, transparent)',
        opacity: 0.6,
        filter: 'blur(0.5px)',
      }} />
    </div>
  );
}
