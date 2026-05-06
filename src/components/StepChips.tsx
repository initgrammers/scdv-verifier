import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { VerifyResult } from '../lib/types';

type StepStatus = 'pending' | 'active' | 'success' | 'failure';

interface Step {
  readonly key: string;
  readonly label: string;
}

interface StepChipsProps {
  result?: VerifyResult;
  isVerifying: boolean;
}

const VERIFICATION_STEPS: readonly Step[] = [
  { key: 'signature', label: 'Firma criptográfica verificada' },
] as const;

function getStepStatus(result: VerifyResult | undefined, isVerifying: boolean): StepStatus {
  if (isVerifying && !result) return 'active';
  if (!result) return 'pending';
  if (result.valid) return 'success';
  return 'failure';
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function StepChips({ result, isVerifying }: StepChipsProps) {
  const status = getStepStatus(result, isVerifying);
  const step = VERIFICATION_STEPS[0];

  return (
    <div className="flex flex-col gap-2 mx-6 mt-3">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300',
          status === 'success' && 'bg-success/10 border-success/20',
          status === 'failure' && 'bg-danger/10 border-danger/20',
          (status === 'pending' || status === 'active') && 'bg-surface border-primary/10',
          status === 'active' && 'animate-pulse'
        )}
      >
        <StepIcon status={status} isVerifying={isVerifying} />
        <span className={cn(
          'text-sm font-semibold flex-1',
          status === 'success' && 'text-primary',
          status === 'failure' && 'text-danger',
          (status === 'pending' || status === 'active') && 'text-primary/70'
        )}>
          {step.label}
        </span>
        {status === 'success' && <CheckCircle size={16} className="text-success" />}
        {status === 'failure' && <XCircle size={16} className="text-danger" />}
      </div>
    </div>
  );
}

function StepIcon({ status, isVerifying }: { status: StepStatus; isVerifying: boolean }) {
  const baseClasses = 'w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0';

  const statusClasses = {
    success: 'bg-success/20 text-success border border-success/30',
    failure: 'bg-danger/20 text-danger border border-danger/30',
    pending: 'bg-muted/20 text-muted border border-muted/30',
    active: 'bg-accent/20 text-accent border border-accent/30',
  };

  if (status === 'active') {
    return (
      <div className={cn(baseClasses, statusClasses.active, 'animate-spin')}>
        <AlertCircle size={14} />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={cn(baseClasses, statusClasses.success)}>
        <CheckCircle size={14} />
      </div>
    );
  }

  if (status === 'failure') {
    return (
      <div className={cn(baseClasses, statusClasses.failure)}>
        <XCircle size={14} />
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, statusClasses.pending)}>
      1
    </div>
  );
}
