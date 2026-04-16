export interface CertData {
  emisor: string;
  curso_id: string;
  curso_nombre: string;
  nombre: string;
  fecha: string;
  duracion?: string;
  codigo?: string;
  nivel?: string;
  contenido?: string;
}

export interface QRKeyMaterial {
  pub: string;       // Base64url — Ed25519 course public key (32 bytes raw)
  sig_root: string;  // Base64url — signature of pub by root key (64 bytes raw)
}

export interface QRPayload {
  d: CertData;
  k: QRKeyMaterial;
  s: string;         // Base64url — signature of d with k.pub (64 bytes raw)
}

export type VerifyStep = 'step1_course_auth' | 'step2_data_integrity';

export interface VerifyResult {
  valid: boolean;
  step1Passed: boolean;
  step2Passed: boolean;
  data?: CertData;
  error?: string;
  failedStep?: VerifyStep;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  result: VerifyResult;
  rawPayload: string;
}
