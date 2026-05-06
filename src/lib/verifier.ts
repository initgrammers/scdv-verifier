import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import type { CertData, VerifyResult } from './types';

ed.hashes.sha512 = sha512;

export const ROOT_PUBLIC_KEY = import.meta.env.PUBLIC_ROOT_KEY || '4IPtUQgtn6skkHpXw4Ddg47aS6sqArHVnT9iLCYiUAM';

function fromBase64Url(b64: string): Uint8Array {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

const CERT_FIELDS = ['ciudad', 'programa_id', 'programa_nombre', 'nombre', 'fecha'] as const;

export async function verifyCertificate(
  payload: string,
  rootPubKeyB64: string = ROOT_PUBLIC_KEY
): Promise<VerifyResult> {
  try {
    const { data, sigBytes } = decodeQRPayload(payload);
    const rootPubBytes = fromBase64Url(rootPubKeyB64);
    const dataBytes = new TextEncoder().encode(encodeCertData(data));

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
    if (parts.length !== CERT_FIELDS.length + 1) {
      throw new Error('Estructura de QR inválida.');
    }

    const data: CertData = {} as CertData;
    for (let i = 0; i < CERT_FIELDS.length; i++) {
      data[CERT_FIELDS[i]] = parts[i];
    }

    const sigBytes = fromBase64Url(parts[CERT_FIELDS.length]);

    return { data, sigBytes };
  } catch {
    throw new Error('QR malformado o no es un certificado SCDV.');
  }
}

export function encodeCertData(data: CertData): string {
  return CERT_FIELDS.map(field => data[field]).join('|');
}

export function buildQRPayload(data: CertData, sigB64: string): string {
  return `${encodeCertData(data)}|${sigB64}`;
}
