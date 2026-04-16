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
  { key: 'step1_course_auth', label: 'Clave del curso autorizada por Root' },
  { key: 'step2_data_integrity', label: 'Datos del certificado intactos' },
] as const;

function getStepStatus(result: VerifyResult | undefined, stepKey: string, isVerifying: boolean): StepStatus {
  if (isVerifying && !result) return 'active';
  if (!result) return 'pending';
  
  // Si es válido, ambos pasos son success
  if (result.valid) return 'success';
  
  // Si no es válido, verificar cuál paso falló
  const stepPassed = stepKey === 'step1_course_auth' 
    ? result.step1Passed 
    : result.step2Passed;
    
  if (stepPassed) return 'success';
  
  // Si este paso falló, es failure
  if (result.failedStep === stepKey) return 'failure';
  
  // Este paso no falló pero el resultado es inválido (otro paso falló antes)
  return 'pending';
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function StepChips({ result, isVerifying }: StepChipsProps) {
  return (
    <div className="flex flex-col gap-2 mx-6 mt-3">
      {VERIFICATION_STEPS.map((step, index) => {
        const status = getStepStatus(result, step.key, isVerifying);
        
        return (
          <div
            key={step.key}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300',
              status === 'success' && 'bg-success/10 border-success/20',
              status === 'failure' && 'bg-danger/10 border-danger/20',
              (status === 'pending' || status === 'active') && 'bg-card border-white/[0.07]',
              status === 'active' && 'animate-pulse'
            )}
          >
            <StepIcon status={status} index={index + 1} isVerifying={isVerifying} />
            <span className={cn(
              'text-sm font-semibold flex-1',
              status === 'success' && 'text-white',
              status === 'failure' && 'text-danger',
              (status === 'pending' || status === 'active') && 'text-white/70'
            )}>
              {step.label}
            </span>
            {status === 'success' && <CheckCircle size={16} className="text-success" />}
            {status === 'failure' && <XCircle size={16} className="text-danger" />}
          </div>
        );
      })}
    </div>
  );
}

function StepIcon({ status, index, isVerifying }: { status: StepStatus; index: number; isVerifying: boolean }) {
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
      {index}
    </div>
  );
}