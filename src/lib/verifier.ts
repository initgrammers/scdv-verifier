import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import type { QRPayload, VerifyResult } from './types';

ed.hashes.sha512 = sha512;

export const ROOT_PUBLIC_KEY = import.meta.env.PUBLIC_ROOT_KEY || 'PLACEHOLDER';

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
    const coursePubBytes = fromBase64Url(payload.k.pub);
    const sigRootBytes = fromBase64Url(payload.k.sig_root);
    const sigDataBytes = fromBase64Url(payload.s);
    const dataBytes = new TextEncoder().encode(JSON.stringify(payload.d));

    const step1Passed = ed.verify(sigRootBytes, coursePubBytes, rootPubBytes);
    if (!step1Passed) {
      return {
        valid: false,
        step1Passed: false,
        step2Passed: false,
        failedStep: 'step1_course_auth',
        error: 'La clave del curso no está autorizada por la raíz de confianza.',
      };
    }

    const step2Passed = ed.verify(sigDataBytes, dataBytes, coursePubBytes);
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
    const padded = raw.replace(/-/g, '+').replace(/_/g, '/') +
      '='.repeat((4 - (raw.length % 4)) % 4);
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