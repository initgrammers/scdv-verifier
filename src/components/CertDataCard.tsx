import { CheckCircle } from 'lucide-react';
import type { CertData } from '../lib/types';

interface CertDataCardProps {
  data: CertData;
}

interface Field {
  readonly label: string;
  readonly value: string;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function buildFields(data: CertData): readonly Field[] {
  const baseFields: Field[] = [
    { label: 'Participante', value: data.nombre },
    { label: 'Programa', value: data.programa_nombre },
    { label: 'Ciudad', value: data.ciudad },
    { label: 'Fecha', value: formatDate(data.fecha) },
  ];

  const optionalFields: Field[] = [];
  if (data.nivel) optionalFields.push({ label: 'Nivel', value: data.nivel });
  if (data.duracion) optionalFields.push({ label: 'Duración', value: data.duracion });

  return [...baseFields, ...optionalFields];
}

export function CertDataCard({ data }: CertDataCardProps) {
  const fields = buildFields(data);

  return (
    <div className="bg-card border border-primary/10 rounded-3xl overflow-hidden">
      <CardHeader />
      <CardBody fields={fields} />
    </div>
  );
}

function CardHeader() {
  return (
    <div className="px-5 py-3.5 flex items-center justify-between border-b border-primary/10">
      <span className="text-xs font-bold tracking-wider uppercase text-muted">
        Datos del Certificado
      </span>
      <AuthBadge />
    </div>
  );
}

function AuthBadge() {
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-success/15 text-success border border-success/30 flex items-center gap-1">
      <CheckCircle size={12} />
      Auténtico
    </span>
  );
}

function CardBody({ fields }: { fields: readonly Field[] }) {
  return (
    <>
      {fields.map((field, index) => (
        <FieldRow key={field.label} field={field} isLast={index === fields.length - 1} />
      ))}
    </>
  );
}

function FieldRow({ field, isLast }: { field: Field; isLast: boolean }) {
  return (
    <div
      className={`px-5 py-3.5 flex justify-between items-baseline border-b border-primary/10 ${
        isLast ? 'border-b-0' : ''
      }`}
    >
      <span className="text-xs text-muted font-semibold uppercase tracking-wider">
        {field.label}
      </span>
      <span className="text-sm font-bold text-primary text-right max-w-[200px] truncate">
        {field.value}
      </span>
    </div>
  );
}