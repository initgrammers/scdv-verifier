import { describe, it, expect, beforeAll } from 'vitest';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import type { QRPayload, CertData } from '../types';

// Required for @noble/ed25519 v3 in non-browser environments
ed.hashes.sha512 = sha512;

// Helper
function toBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

describe('verifyChain — Ed25519 Cryptographic Pipeline', () => {
  let rootPubKey: Uint8Array;
  let validPayload: QRPayload;
  let certData: CertData;

  beforeAll(() => {
    // @noble/ed25519 v3: randomSecretKey (was randomPrivateKey), sync API
    const rootPrivKey = ed.utils.randomSecretKey();
    rootPubKey = ed.getPublicKey(rootPrivKey);

    const coursePrivKey = ed.utils.randomSecretKey();
    const coursePubKey = ed.getPublicKey(coursePrivKey);

    // Step 1: sign coursePubKey with rootPrivKey
    const sigRoot = ed.sign(coursePubKey, rootPrivKey);

    certData = {
      emisor: 'Institución Test',
      curso_id: 'test-2025',
      curso_nombre: 'Curso de Prueba',
      nombre: 'Juan Pérez',
      fecha: '2025-04-16',
    };

    // Step 2: sign JSON.stringify(certData) with coursePrivKey
    const dataBytes = new TextEncoder().encode(JSON.stringify(certData));
    const sigData = ed.sign(dataBytes, coursePrivKey);

    validPayload = {
      d: certData,
      k: {
        pub: toBase64Url(coursePubKey),
        sig_root: toBase64Url(sigRoot),
      },
      s: toBase64Url(sigData),
    };
  });

  it('returns valid=true for a fully legitimate payload', async () => {
    const { verifyChain } = await import('../verifier');
    const result = await verifyChain(validPayload, toBase64Url(rootPubKey));
    expect(result.valid).toBe(true);
    expect(result.step1Passed).toBe(true);
    expect(result.step2Passed).toBe(true);
    expect(result.data).toEqual(certData);
  });

  it('fails step1 when sig_root was signed by a different root key (CERTIFICADO FALSO)', async () => {
    const { verifyChain } = await import('../verifier');
    const fakeRootPriv = ed.utils.randomSecretKey();
    const coursePrivKey2 = ed.utils.randomSecretKey();
    const coursePubKey2 = ed.getPublicKey(coursePrivKey2);
    const fakeSigRoot = ed.sign(coursePubKey2, fakeRootPriv);

    const tampered: QRPayload = {
      ...validPayload,
      k: { ...validPayload.k, sig_root: toBase64Url(fakeSigRoot) },
    };
    const result = await verifyChain(tampered, toBase64Url(rootPubKey));
    expect(result.valid).toBe(false);
    expect(result.step1Passed).toBe(false);
    expect(result.failedStep).toBe('step1_course_auth');
  });

  it('fails step2 when certificate data was tampered (DATOS ALTERADOS)', async () => {
    const { verifyChain } = await import('../verifier');
    const tampered: QRPayload = {
      ...validPayload,
      d: { ...validPayload.d, nombre: 'Impostor García' },
    };
    const result = await verifyChain(tampered, toBase64Url(rootPubKey));
    expect(result.valid).toBe(false);
    expect(result.step1Passed).toBe(true);
    expect(result.step2Passed).toBe(false);
    expect(result.failedStep).toBe('step2_data_integrity');
  });

  it('returns error for malformed base64 in s field', async () => {
    const { verifyChain } = await import('../verifier');
    const malformed: QRPayload = {
      ...validPayload,
      s: 'NOT_VALID_BASE64!!!###',
    };
    const result = await verifyChain(malformed, toBase64Url(rootPubKey));
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
