import { describe, it, expect, beforeAll } from 'vitest';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import type { CertData } from '../types';

ed.hashes.sha512 = sha512;

const toBase64Url = (bytes: Uint8Array): string => {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const CERT_FIELDS = ['ciudad', 'programa_id', 'programa_nombre', 'nombre', 'fecha'] as const;

function buildQRPayload(data: CertData, sigB64: string): string {
  return `${CERT_FIELDS.map(f => data[f]).join('|')}|${sigB64}`;
}

describe('verifyCertificate — Ed25519 Cryptographic Pipeline', () => {
  let rootPubKeyB64: string;
  let rootPrivKey: Uint8Array;
  let validPayload: string;
  let certData: CertData;

  beforeAll(() => {
    rootPrivKey = ed.utils.randomSecretKey();
    const rootPubKey = ed.getPublicKey(rootPrivKey);
    rootPubKeyB64 = toBase64Url(rootPubKey);

    certData = {
      ciudad: 'Institución Test',
      programa_id: 'test-2025',
      programa_nombre: 'Programa de Prueba',
      nombre: 'Juan Pérez',
      fecha: '2025-04-16',
    };

    const dataBytes = new TextEncoder().encode(CERT_FIELDS.map(f => certData[f]).join('|'));
    const sigData = ed.sign(dataBytes, rootPrivKey);

    validPayload = buildQRPayload(certData, toBase64Url(sigData));
  });

  it('returns valid=true for a legitimate payload', async () => {
    const { verifyCertificate } = await import('../verifier');
    const result = await verifyCertificate(validPayload, rootPubKeyB64);
    expect(result.valid).toBe(true);
    expect(result.data).toEqual(certData);
  });

  it('fails when signature was created with a different key', async () => {
    const { verifyCertificate } = await import('../verifier');
    const fakePrivKey = ed.utils.randomSecretKey();
    const dataBytes = new TextEncoder().encode(CERT_FIELDS.map(f => certData[f]).join('|'));
    const fakeSig = ed.sign(dataBytes, fakePrivKey);

    const tampered = buildQRPayload(certData, toBase64Url(fakeSig));
    const result = await verifyCertificate(tampered, rootPubKeyB64);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('fails when certificate data was tampered', async () => {
    const { verifyCertificate } = await import('../verifier');
    const tamperedData = { ...certData, nombre: 'Impostor García' };
    const tampered = buildQRPayload(tamperedData, validPayload.split('|')[CERT_FIELDS.length]);
    const result = await verifyCertificate(tampered, rootPubKeyB64);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error for malformed signature', async () => {
    const { verifyCertificate } = await import('../verifier');
    const parts = validPayload.split('|');
    parts[CERT_FIELDS.length] = 'NOT_VALID_BASE64!!!###';
    const malformed = parts.join('|');
    const result = await verifyCertificate(malformed, rootPubKeyB64);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('decodeQRPayload — pipe-delimited decoding', () => {
  let rootPrivKey: Uint8Array;
  let rootPubKeyB64: string;
  let encodedPayload: string;
  let certData: CertData;

  beforeAll(() => {
    rootPrivKey = ed.utils.randomSecretKey();
    const rootPubKey = ed.getPublicKey(rootPrivKey);
    rootPubKeyB64 = toBase64Url(rootPubKey);

    certData = {
      ciudad: 'Institución Test',
      programa_id: 'test-2025',
      programa_nombre: 'Programa de Prueba',
      nombre: 'Juan Pérez',
      fecha: '2025-04-16',
    };

    const dataBytes = new TextEncoder().encode(CERT_FIELDS.map(f => certData[f]).join('|'));
    const sigData = ed.sign(dataBytes, rootPrivKey);

    encodedPayload = buildQRPayload(certData, toBase64Url(sigData));
  });

  it('decodes a valid pipe-delimited payload', async () => {
    const { decodeQRPayload } = await import('../verifier');
    const { data, sigBytes } = decodeQRPayload(encodedPayload);
    expect(data).toEqual(certData);
    expect(sigBytes).toBeInstanceOf(Uint8Array);
    expect(sigBytes.length).toBe(64);
  });

  it('decodes a URL-wrapped payload', async () => {
    const { decodeQRPayload } = await import('../verifier');
    const urlWrapped = `https://verifier.app/verify?data=${encodedPayload}`;
    const { data } = decodeQRPayload(urlWrapped);
    expect(data).toEqual(certData);
  });

  it('throws on invalid data', async () => {
    const { decodeQRPayload } = await import('../verifier');
    expect(() => decodeQRPayload('NOT_VALID_DATA')).toThrow();
  });

  it('throws on URL with missing data param', async () => {
    const { decodeQRPayload } = await import('../verifier');
    expect(() => decodeQRPayload('https://verifier.app/verify')).toThrow();
  });

  it('produces smaller payloads than JSON format', () => {
    const pipePayload = encodedPayload;

    const jsonPayload = JSON.stringify({ d: certData, s: toBase64Url(new Uint8Array(64)) });
    const jsonB64 = Buffer.from(jsonPayload).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    expect(pipePayload.length).toBeLessThan(jsonB64.length);
  });
});
