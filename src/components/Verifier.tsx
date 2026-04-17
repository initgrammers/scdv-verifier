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
    <div className="flex flex-col min-h-screen pb-20">
      {state === 'idle' && <HeroSection />}
      {showResults ? (
        <ResultsView
          result={result}
          certData={certData}
          isVerifying={isVerifying}
          onReset={handleReset}
        />
      ) : (
        <QrScanner onScan={handleScan} isScanning={state !== 'idle'} />
      )}
    </div>
  );
}

function VerifierHeader() {
  return (
    <div className="px-6 pt-6 pb-2">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-white/[0.07] w-fit">
        <span className="w-2 h-2 rounded-full bg-accent shadow-glow-accent" />
        <span className="text-sm font-extrabold tracking-tight text-white">SCDV Verificador</span>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <div className="px-6 pt-2">
      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-white mb-1.5">
        Verificar<br />Certificado
      </h1>
      <p className="text-sm text-muted font-medium">Escanea el QR o ingresa el código</p>
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
    <>
      <ResultCard result={result} isVerifying={isVerifying} />
      {certData && <CertDataCard data={certData} />}
      <StepChips result={result} isVerifying={isVerifying} />
      <ResetButton onReset={onReset} />
    </>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-6 mt-4">
      <button
        onClick={onReset}
        className="w-full py-4 rounded-[18px] font-bold text-base bg-card text-white border border-white/[0.07]"
      >
        Verificar otro certificado
      </button>
    </div>
  );
}