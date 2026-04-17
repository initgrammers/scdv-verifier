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
  const isIdle = state === 'idle';

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] w-full relative overflow-hidden">
      {/* Ante-background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col lg:flex-row flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 pb-24 lg:pb-0 lg:items-center lg:gap-12 xl:gap-20">
        
        {/* Left Column: Hero (Always visible on Desktop, context on mobile) */}
        <div className={`w-full lg:w-[45%] transition-all duration-700 ${!isIdle && 'hidden lg:block'}`}>
          <HeroSection smallOnDesktop={!isIdle} />
        </div>

        {/* Right Column: Interaction Area (Scanner or Results) */}
        <div className={`flex-1 flex flex-col justify-center w-full transition-all duration-500`}>
          {showResults ? (
            <ResultsView
              result={result}
              certData={certData}
              isVerifying={isVerifying}
              onReset={handleReset}
            />
          ) : (
            <div className={`animate-in fade-in zoom-in duration-500 w-full ${isIdle ? 'max-w-2xl mx-auto lg:mx-0' : 'max-w-full'}`}>
              <QrScanner onScan={handleScan} isScanning={state !== 'idle'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroSection({ smallOnDesktop = false }: { smallOnDesktop?: boolean }) {
  return (
    <div className={`pt-12 pb-8 lg:py-0 animate-in slide-in-from-top lg:slide-in-from-left duration-700 transition-all`}>
      <div className="flex flex-col md:items-start items-center">
        <div className="flex items-center gap-2.5 mb-6 lg:mb-8">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-accent shadow-glow-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-accent">Sistema Activo</span>
          </div>
        </div>
        
        <h1 className={`${smallOnDesktop ? 'text-[32px] lg:text-[44px]' : 'text-[42px] lg:text-[72px]'} font-black leading-[0.9] tracking-tight text-white mb-6 text-center md:text-left transition-all duration-500`}>
          Validación <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40 italic">Instantánea</span>
        </h1>
        <p className={`${smallOnDesktop ? 'text-sm' : 'text-base md:text-lg'} text-muted font-medium leading-relaxed max-w-[380px] text-center md:text-left opacity-80 transition-all duration-500`}>
          Escanea el código QR del certificado para verificar su autenticidad criptográfica en tiempo real.
        </p>
      </div>
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pt-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 items-start">
        <div className="flex flex-col gap-6 lg:gap-8">
          <ResultCard result={result} isVerifying={isVerifying} />
          <div className="hidden lg:block">
            <StepChips result={result} isVerifying={isVerifying} />
            <ResetButton onReset={onReset} />
          </div>
        </div>

        {certData && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            <CertDataCard data={certData} />
          </div>
        )}
      </div>
      
      <div className="lg:hidden mt-4">
        <StepChips result={result} isVerifying={isVerifying} />
        <ResetButton onReset={onReset} />
      </div>
    </div>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-6 lg:mt-8 w-full max-w-sm mx-auto lg:mx-0">
      <button
        onClick={onReset}
        className="group relative w-full py-4.5 rounded-[22px] font-bold text-base transition-all active:scale-[0.98]"
      >
        <div className="absolute inset-0 bg-accent rounded-[22px] shadow-glow-accent opacity-90 group-hover:opacity-100 transition-opacity" />
        <span className="relative z-10 text-bg tracking-tight flex items-center justify-center gap-2">
          Nueva Verificación
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </span>
      </button>
    </div>
  );
}