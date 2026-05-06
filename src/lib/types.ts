export interface CertData {
  ciudad: string;
  programa_id: string;
  programa_nombre: string;
  nombre: string;
  fecha: string;
  duracion?: string;
  codigo?: string;
  nivel?: string;
  contenido?: string;
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
