import { useState, useCallback } from 'react';
import { decodeQRPayload, verifyChain } from '../lib/verifier';
import { addToHistory } from '../lib/history';
import { QrScanner } from './QrScanner';
import { ResultCard } from './ResultCard';
import { CertDataCard } from './CertDataCard';
import { StepChips } from './StepChips';
import type { VerifyResult, CertData } from '../lib/types';

type AppState = 'idle' | 'scanning' | 'verifying' | 'success' | 'error';

interface VerifierState {
  state: AppState;
  result?: VerifyResult;
  certData?: CertData;
}

const initialState: VerifierState = {
  state: 'idle',
  result: undefined,
  certData: undefined,
};

export function Verifier() {
  const [{ state, result, certData }, setState] = useState<VerifierState>(initialState);

  const handleScan = useCallback(async (rawData: string) => {
    setState(prev => ({ ...prev, state: 'verifying', result: undefined }));

    try {
      const payload = decodeQRPayload(rawData);
      const verifyResult = await verifyChain(payload);
      setState(prev => {
        if (verifyResult.valid) {
          addToHistory(verifyResult, rawData);
          return { ...prev, result: verifyResult, state: 'success', certData: verifyResult.data };
        }
        return { ...prev, result: verifyResult, state: 'error', certData: undefined };
      });
    } catch (err) {
      const errorResult: VerifyResult = {
        valid: false,
        step1Passed: false,
        step2Passed: false,
        error: err instanceof Error ? err.message : 'Error desconocido',
      };
      setState(prev => ({ ...prev, result: errorResult, state: 'error' }));
    }
  }, []);

  const handleReset = useCallback(() => {
    setState(initialState);
  }, []);

  const isVerifying = state === 'verifying';
  const showResults = state === 'success' || state === 'error';

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] relative overflow-hidden">
      {/* Ante-background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col flex-1 pb-20">
        {state === 'idle' && <HeroSection />}
        
        <div className="flex-1 flex flex-col justify-center">
          {showResults ? (
            <ResultsView
              result={result}
              certData={certData}
              isVerifying={isVerifying}
              onReset={handleReset}
            />
          ) : (
            <div className="animate-in fade-in zoom-in duration-500">
              <QrScanner onScan={handleScan} isScanning={state !== 'idle'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <div className="px-7 pt-8 pb-4 animate-in slide-in-from-top duration-700">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-accent shadow-glow-accent animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-accent">Sistema Activo</span>
        </div>
      </div>
      
      <h1 className="text-[34px] font-black leading-[1.1] tracking-tight text-white mb-3">
        Validación <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40 italic">Instantánea</span>
      </h1>
      <p className="text-sm text-muted font-medium leading-relaxed max-w-[260px]">
        Escanea el código QR del certificado para verificar su autenticidad criptográfica.
      </p>
    </div>
  );
}

interface ResultsViewProps {
  result?: VerifyResult;
  certData?: CertData;
  isVerifying: boolean;
  onReset: () => void;
}

function ResultsView({ result, certData, isVerifying, onReset }: ResultsViewProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ResultCard result={result} isVerifying={isVerifying} />
      {certData && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          <CertDataCard data={certData} />
        </div>
      )}
      <StepChips result={result} isVerifying={isVerifying} />
      <ResetButton onReset={onReset} />
    </div>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-6 mt-8">
      <button
        onClick={onReset}
        className="group relative w-full py-4 rounded-[22px] font-bold text-base transition-all active:scale-[0.98]"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent border border-white/[0.1] rounded-[22px] shadow-lg group-hover:from-white/[0.12]" />
        <span className="relative z-10 text-white tracking-tight flex items-center justify-center gap-2">
          Nueva Verificación
          <span className="opacity-40 group-hover:translate-x-0.5 transition-transform">→</span>
        </span>
      </button>
    </div>
  );
}