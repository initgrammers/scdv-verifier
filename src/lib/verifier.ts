import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import type { QRPayload, VerifyResult } from './types';

ed.hashes.sha512 = sha512;

export const ROOT_PUBLIC_KEY = import.meta.env.PUBLIC_ROOT_KEY || '4IPtUQgtn6skkHpXw4Ddg47aS6sqArHVnT9iLCYiUAM';

function fromBase64Url(b64: string): Uint8Array {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function verifyChain(
  payload: QRPayload,
  rootPubKeyB64: string = ROOT_PUBLIC_KEY
): Promise<VerifyResult> {
  try {
    const rootPubBytes = fromBase64Url(rootPubKeyB64);
    const programPubBytes = fromBase64Url(payload.k.pub);
    const sigRootBytes = fromBase64Url(payload.k.sig_root);
    const sigDataBytes = fromBase64Url(payload.s);
    const dataBytes = new TextEncoder().encode(JSON.stringify(payload.d));

    const step1Passed = ed.verify(sigRootBytes, programPubBytes, rootPubBytes);
    if (!step1Passed) {
      return {
        valid: false,
        step1Passed: false,
        step2Passed: false,
        failedStep: 'step1_program_auth',
        error: 'La clave del programa no está autorizada por la raíz de confianza.',
      };
    }

    const step2Passed = ed.verify(sigDataBytes, dataBytes, programPubBytes);
    if (!step2Passed) {
      return {
        valid: false,
        step1Passed: true,
        step2Passed: false,
        failedStep: 'step2_data_integrity',
        error: 'Los datos del certificado fueron alterados.',
      };
    }

    return {
      valid: true,
      step1Passed: true,
      step2Passed: true,
      data: payload.d,
    };
  } catch (err) {
    return {
      valid: false,
      step1Passed: false,
      step2Passed: false,
      error: `Error de procesamiento: ${err instanceof Error ? err.message : 'desconocido'}`,
    };
  }
}

export function decodeQRPayload(raw: string): QRPayload {
  try {
    let payloadString = raw;

    // Case: URL-wrapped payload (from QR with --verifier-url)
    // Format: https://verifier.app/verify?data={base64url_payload}
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

    // Decode base64url to bytes
    const padded = payloadString.replace(/-/g, '+').replace(/_/g, '/') +
      '='.repeat((4 - (payloadString.length % 4)) % 4);
    const binaryStr = atob(padded);
    const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder('utf-8').decode(bytes));
    if (
      typeof parsed?.d !== 'object' ||
      typeof parsed?.k?.pub !== 'string' ||
      typeof parsed?.k?.sig_root !== 'string' ||
      typeof parsed?.s !== 'string'
    ) {
      throw new Error('Estructura de QR inválida.');
    }
    return parsed as QRPayload;
  } catch {
    throw new Error('QR malformado o no es un certificado SCDV.');
  }
}