import { CheckCircle, XCircle } from 'lucide-react';
import type { VerifyResult } from '../lib/types';

interface ResultCardProps {
  result?: VerifyResult;
  isVerifying: boolean;
}

const MESSAGES = {
  verifying: {
    title: 'Verificando certificado...',
    subtitle: 'Ejecutando verificación criptográfica en 2 pasos',
  },
  valid: {
    title: 'Certificado Válido',
    subtitle: 'La firma criptográfica es auténtica y los datos no han sido alterados',
  },
  invalid: 'La verificación falló. El certificado puede ser falso o estar dañado.',
} as const;

export function ResultCard({ result, isVerifying }: ResultCardProps) {
  if (isVerifying && !result) {
    return <VerifyingState />;
  }

  if (!result) return null;

  return result.valid ? <ValidState /> : <InvalidState error={result.error} />;
}

function VerifyingState() {
  return (
    <div className="bg-gradient-to-br from-surface to-card border border-white/[0.07] rounded-3xl p-8 flex flex-col items-center gap-3">
      <PulsingIcon />
      <p className="text-base font-bold text-white">{MESSAGES.verifying.title}</p>
      <p className="text-xs text-muted text-center max-w-[220px]">{MESSAGES.verifying.subtitle}</p>
    </div>
  );
}

function PulsingIcon() {
  return (
    <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center animate-pulse">
      <div className="w-8 h-8 rounded-full bg-accent animate-ping" />
    </div>
  );
}

function ValidState() {
  return (
    <div className="bg-gradient-to-br from-surface to-card border border-white/[0.07] rounded-3xl p-8 flex flex-col items-center gap-3">
      <ResultIcon isValid />
      <Title isValid />
      <Subtitle isValid />
    </div>
  );
}

function InvalidState({ error }: { error?: string }) {
  return (
    <div className="bg-gradient-to-br from-surface to-card border border-white/[0.07] rounded-3xl p-8 flex flex-col items-center gap-3">
      <ResultIcon isValid={false} />
      <Title isValid={false} />
      <ErrorMessage error={error} />
    </div>
  );
}

function ResultIcon({ isValid }: { isValid: boolean }) {
  return (
    <div
      className={`w-20 h-20 rounded-full flex items-center justify-center ${
        isValid
          ? 'bg-gradient-to-br from-success/30 to-success/5 border-2 border-success/40 shadow-glow-success'
          : 'bg-gradient-to-br from-danger/30 to-danger/5 border-2 border-danger/40 shadow-glow-danger'
      }`}
    >
      {isValid ? (
        <CheckCircle size={40} className="text-success" />
      ) : (
        <XCircle size={40} className="text-danger" />
      )}
    </div>
  );
}

function Title({ isValid }: { isValid: boolean }) {
  return (
    <h2 className={`text-2xl font-extrabold tracking-tight ${isValid ? 'text-success' : 'text-danger'}`}>
      {isValid ? MESSAGES.valid.title : 'Certificado Inválido'}
    </h2>
  );
}

function Subtitle({ isValid }: { isValid: boolean }) {
  return (
    <p className="text-xs text-muted text-center max-w-[220px] leading-relaxed">
      {isValid ? MESSAGES.valid.subtitle : ''}
    </p>
  );
}

function ErrorMessage({ error }: { error?: string }) {
  return (
    <p className="text-xs text-muted text-center max-w-[220px] leading-relaxed">
      {error || MESSAGES.invalid}
    </p>
  );
}