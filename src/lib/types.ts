export interface CertData {
  ciudad: string;
  programa_id: string;
  programa_nombre: string;
  nombre: string;
  fecha: string;
  duracion: string;
}

export interface SessionInfo {
  ciudad: string;
  programa_id: string;
  programa_nombre: string;
  duracion: string;
  fecha: string;
}

export interface VerifyResult {
  valid: boolean;
  data?: CertData;
  error?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  result: VerifyResult;
  rawPayload: string;
}
