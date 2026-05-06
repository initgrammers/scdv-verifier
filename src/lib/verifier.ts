import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import type { CertData, SessionInfo, VerifyResult } from './types';

ed.hashes.sha512 = sha512;

export const ROOT_PUBLIC_KEY = import.meta.env.PUBLIC_ROOT_KEY || 'PzWbhI8G2Jk2KEM9CrDu472A2Q2yzzk2gZK99oCbfno';

export const SESSIONS: Record<number, SessionInfo> = {
  1: { ciudad: 'Quito', programa_id: 'ia-creadores-contenido', programa_nombre: 'Inteligencia Artificial para Creadores de Contenido y Periodistas', duracion: '4', fecha: '2025-04-22' },
  2: { ciudad: 'Quito', programa_id: 'ia-sector-publico', programa_nombre: 'Inteligencia Artificial para el Sector Público', duracion: '4', fecha: '2025-04-21' },
  3: { ciudad: 'Quito', programa_id: 'ia-emprendedores', programa_nombre: 'Inteligencia Artificial para Emprendedores y Sociedad Civil', duracion: '4', fecha: '2025-04-21' },
  4: { ciudad: 'Guayaquil', programa_id: 'ia-creadores-contenido', programa_nombre: 'Inteligencia Artificial para Creadores de Contenido y Periodistas', duracion: '4', fecha: '2025-04-24' },
  5: { ciudad: 'Guayaquil', programa_id: 'ia-sector-publico', programa_nombre: 'Inteligencia Artificial para el Sector Público', duracion: '4', fecha: '2025-04-24' },
  6: { ciudad: 'Guayaquil', programa_id: 'ia-emprendedores', programa_nombre: 'Inteligencia Artificial para Emprendedores y Sociedad Civil', duracion: '4', fecha: '2025-04-25' },
};

function fromBase64Url(b64: string): Uint8Array {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function verifyCertificate(
  payload: string,
  rootPubKeyB64: string = ROOT_PUBLIC_KEY
): Promise<VerifyResult> {
  try {
    const { data, sigBytes } = decodeQRPayload(payload);
    const rootPubBytes = fromBase64Url(rootPubKeyB64);
    const dataBytes = new TextEncoder().encode(expandCertData(data));

    const valid = ed.verify(sigBytes, dataBytes, rootPubBytes);
    if (!valid) {
      return {
        valid: false,
        error: 'Los datos del certificado fueron alterados o la firma no es válida.',
      };
    }

    return {
      valid: true,
      data,
    };
  } catch (err) {
    return {
      valid: false,
      error: `Error de procesamiento: ${err instanceof Error ? err.message : 'desconocido'}`,
    };
  }
}

export function decodeQRPayload(raw: string): { data: CertData; sigBytes: Uint8Array } {
  try {
    let payloadString = raw;

    if (raw.startsWith('http')) {
      try {
        const url = new URL(raw);
        const dataParam = url.searchParams.get('data');
        if (!dataParam) {
          throw new Error('Parámetro ?data= vacío en la URL.');
        }
        payloadString = dataParam;
      } catch (err) {
        if (err instanceof Error && err.message.includes('Parámetro')) {
          throw err;
        }
        throw new Error('URL inválida o malformada.');
      }
    }

    const parts = payloadString.split('|');
    if (parts.length !== 3) {
      throw new Error('Estructura de QR inválida.');
    }

    const sessionId = parseInt(parts[0], 10);
    const session = SESSIONS[sessionId];
    if (!session) {
      throw new Error(`Sesión con ID ${sessionId} no encontrada.`);
    }

    const data: CertData = {
      ciudad: session.ciudad,
      programa_id: session.programa_id,
      programa_nombre: session.programa_nombre,
      nombre: parts[1],
      fecha: session.fecha,
      duracion: session.duracion,
    };

    const sigBytes = fromBase64Url(parts[2]);

    return { data, sigBytes };
  } catch {
    throw new Error('QR malformado o no es un certificado SCDV.');
  }
}

export function expandCertData(data: CertData): string {
  return `${data.ciudad}|${data.programa_id}|${data.programa_nombre}|${data.nombre}|${data.fecha}|${data.duracion}`;
}

export function buildQRPayload(sessionId: number, nombre: string, sigB64: string): string {
  return `${sessionId}|${nombre}|${sigB64}`;
}
