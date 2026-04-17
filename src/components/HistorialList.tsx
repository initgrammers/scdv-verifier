import { useState, useEffect } from 'react';
import { getHistory, clearHistory } from '../lib/history';
import { Clock, CheckCircle, XCircle, Trash2, Search, AlertTriangle, Calendar } from 'lucide-react';
import type { HistoryEntry } from '../lib/types';

export function HistorialList() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  const handleClear = () => {
    if (confirm('¿Estás seguro de que quieres borrar el historial?')) {
      clearHistory();
      setEntries([]);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const data = entry.result.data;
    if (!data) return false;
    return (
      data.nombre?.toLowerCase().includes(query) ||
      data.curso_nombre?.toLowerCase().includes(query) ||
      data.emisor?.toLowerCase().includes(query)
    );
  });

  if (entries.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 32px',
        gap: '16px',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
        }}>
          <Clock size={30} style={{ color: 'rgba(255,255,255,0.25)' }} />
        </div>
        <p style={{ fontSize: '17px', fontWeight: 700, color: '#fff', margin: 0 }}>Sin verificaciones</p>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          maxWidth: '220px',
          lineHeight: 1.6,
          margin: 0,
        }}>
          Las verificaciones que realices aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 4px',
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {filteredEntries.length} de {entries.length} verificación{entries.length !== 1 ? 'es' : ''}
        </span>
        <button
          onClick={handleClear}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'rgba(239,68,68,0.8)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgb(239,68,68)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.8)')}
        >
          <Trash2 size={13} />
          Borrar todo
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.3)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, curso o emisor…"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '14px',
            padding: '12px 16px 12px 40px',
            fontSize: '14px',
            color: '#fff',
            outline: 'none',
            transition: 'border-color 0.2s, background 0.2s',
            fontFamily: 'inherit',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'rgba(132,204,22,0.4)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
        />
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredEntries.map((entry) => (
          <HistoryCard key={entry.id} entry={entry} />
        ))}
        {filteredEntries.length === 0 && search && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 0',
            gap: '8px',
            color: 'rgba(255,255,255,0.35)',
          }}>
            <Search size={24} />
            <p style={{ margin: 0, fontSize: '14px' }}>Sin resultados para "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const { result, timestamp } = entry;
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isValid = result.valid;
  const accentColor = isValid ? '#84cc16' : '#ef4444';
  const accentBg = isValid ? 'rgba(132,204,22,0.12)' : 'rgba(239,68,68,0.12)';
  const accentBorder = isValid ? 'rgba(132,204,22,0.25)' : 'rgba(239,68,68,0.25)';

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.025) 100%)',
      border: `1px solid rgba(255,255,255,0.09)`,
      borderRadius: '20px',
      overflow: 'hidden',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Card header strip */}
      <div style={{
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: accentBg,
      }}>
        {/* Status badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          background: accentBg,
          border: `1px solid ${accentBorder}`,
          borderRadius: '999px',
          padding: '5px 12px 5px 8px',
        }}>
          {isValid ? (
            <CheckCircle size={15} style={{ color: accentColor }} />
          ) : (
            <XCircle size={15} style={{ color: accentColor }} />
          )}
          <span style={{
            fontSize: '12px',
            fontWeight: 800,
            color: accentColor,
            letterSpacing: '0.02em',
          }}>
            {isValid ? 'Válido' : 'Inválido'}
          </span>
        </div>

        {/* Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Calendar size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Card body: certificate data */}
      {result.data && (
        <div style={{ padding: '4px 0' }}>
          <FieldRow label="Participante" value={result.data.nombre} />
          <FieldRow label="Curso" value={result.data.curso_nombre} />
          {result.data.emisor && (
            <FieldRow label="Emisor" value={result.data.emisor} isLast />
          )}
        </div>
      )}

      {/* Error state (invalid + no data) */}
      {result.error && !result.data && (
        <div style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}>
          <AlertTriangle size={15} style={{ color: 'rgba(239,68,68,0.7)', marginTop: '1px', flexShrink: 0 }} />
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.5,
          }}>
            {result.error}
          </p>
        </div>
      )}
    </div>
  );
}

function FieldRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '11px 18px',
      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
      gap: '12px',
    }}>
      <span style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.35)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '13px',
        fontWeight: 700,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'right',
        maxWidth: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {value}
      </span>
    </div>
  );
}