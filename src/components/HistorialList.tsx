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
      <div className="flex flex-col items-center justify-center py-16 px-8 gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center mb-2">
          <Clock size={30} className="text-white/20" />
        </div>
        <p className="text-lg font-bold text-white lowercase first-letter:uppercase">Sin verificaciones</p>
        <p className="text-sm text-white/40 text-center max-w-[220px] leading-relaxed">
          Las verificaciones que realices aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 md:px-10 pb-32 flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Historial</h1>
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">
            {filteredEntries.length} de {entries.length} verificación{entries.length !== 1 ? 'es' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:w-80">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar certificados..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-accent/40 focus:bg-white/[0.08] transition-all"
            />
          </div>
          
          <button
            onClick={handleClear}
            className="flex items-center gap-2 text-xs font-bold text-red-500/80 hover:text-red-500 transition-colors px-2 py-1"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Borrar todo</span>
          </button>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEntries.map((entry) => (
          <HistoryCard key={entry.id} entry={entry} />
        ))}
        
        {filteredEntries.length === 0 && search && (
          <div className="col-span-full flex flex-col items-center py-20 gap-4 text-white/20">
            <Search size={32} />
            <p className="text-sm">Sin resultados para "{search}"</p>
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
  const statusClasses = isValid 
    ? "text-accent bg-accent/10 border-accent/20" 
    : "text-red-400 bg-red-400/10 border-red-400/20";

  return (
    <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 hover:border-white/20">
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[64px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${isValid ? 'bg-accent' : 'bg-red-400'}`} />

      {/* Card Header */}
      <div className={`px-5 py-4 flex items-center justify-between border-b border-white/5 ${isValid ? 'bg-accent/[0.03]' : 'bg-red-400/[0.03]'}`}>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider ${statusClasses}`}>
          {isValid ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {isValid ? 'Válido' : 'Inválido'}
        </div>
        
        <div className="flex items-center gap-1.5 text-white/30">
          <Calendar size={12} />
          <span className="text-[10px] font-bold uppercase tracking-tight">{formattedDate}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-2">
        {result.data ? (
          <div className="flex flex-col">
            <FieldRow label="Participante" value={result.data.nombre} />
            <FieldRow label="Curso" value={result.data.curso_nombre} />
            {result.data.emisor && (
              <FieldRow label="Emisor" value={result.data.emisor} isLast />
            )}
          </div>
        ) : result.error && (
          <div className="p-4 flex gap-3 items-start">
            <AlertTriangle size={16} className="text-red-400/70 shrink-0 mt-0.5" />
            <p className="text-sm text-white/40 leading-relaxed">{result.error}</p>
          </div>
        )}
      </div>
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
    <div className={`flex items-baseline justify-between p-4 gap-4 ${!isLast ? 'border-b border-white/5' : ''}`}>
      <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.12em] shrink-0">
        {label}
      </span>
      <span className="text-sm font-bold text-white/90 text-right truncate max-w-[180px]">
        {value}
      </span>
    </div>
  );
}