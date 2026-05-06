import { describe, it, expect, beforeAll } from 'vitest';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import type { CertData } from '../types';

ed.hashes.sha512 = sha512;

const toBase64Url = (bytes: Uint8Array): string => {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const SESSIONS = {
  1: { ciudad: 'Quito', programa_id: 'ia-creadores-contenido', programa_nombre: 'Inteligencia Artificial para Creadores de Contenido y Periodistas', duracion: '4', fecha: '2025-04-22' },
  2: { ciudad: 'Quito', programa_id: 'ia-sector-publico', programa_nombre: 'Inteligencia Artificial para el Sector Público', duracion: '4', fecha: '2025-04-21' },
  3: { ciudad: 'Quito', programa_id: 'ia-emprendedores', programa_nombre: 'Inteligencia Artificial para Emprendedores y Sociedad Civil', duracion: '4', fecha: '2025-04-21' },
  4: { ciudad: 'Guayaquil', programa_id: 'ia-creadores-contenido', programa_nombre: 'Inteligencia Artificial para Creadores de Contenido y Periodistas', duracion: '4', fecha: '2025-04-24' },
  5: { ciudad: 'Guayaquil', programa_id: 'ia-sector-publico', programa_nombre: 'Inteligencia Artificial para el Sector Público', duracion: '4', fecha: '2025-04-24' },
  6: { ciudad: 'Guayaquil', programa_id: 'ia-emprendedores', programa_nombre: 'Inteligencia Artificial para Emprendedores y Sociedad Civil', duracion: '4', fecha: '2025-04-25' },
};

function buildQRPayload(sessionId: number, nombre: string, sigB64: string): string {
  return `${sessionId}|${nombre}|${sigB64}`;
}

function expandCertData(sessionId: number, nombre: string): string {
  const s = SESSIONS[sessionId as keyof typeof SESSIONS];
  return `${s.ciudad}|${s.programa_id}|${s.programa_nombre}|${nombre}|${s.fecha}|${s.duracion}`;
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

    const nombre = 'Juan Pérez';
    const certString = expandCertData(1, nombre);
    const dataBytes = new TextEncoder().encode(certString);
    const sigData = ed.sign(dataBytes, rootPrivKey);

    certData = {
      ciudad: 'Quito',
      programa_id: 'ia-creadores-contenido',
      programa_nombre: 'Inteligencia Artificial para Creadores de Contenido y Periodistas',
      nombre,
      fecha: '2025-04-22',
      duracion: '4',
    };

    validPayload = buildQRPayload(1, nombre, toBase64Url(sigData));
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
    const dataBytes = new TextEncoder().encode(expandCertData(1, 'Juan Pérez'));
    const fakeSig = ed.sign(dataBytes, fakePrivKey);

    const tampered = buildQRPayload(1, 'Juan Pérez', toBase64Url(fakeSig));
    const result = await verifyCertificate(tampered, rootPubKeyB64);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('fails when participant name was tampered', async () => {
    const { verifyCertificate } = await import('../verifier');
    const parts = validPayload.split('|');
    parts[1] = 'Impostor García';
    const tampered = parts.join('|');
    const result = await verifyCertificate(tampered, rootPubKeyB64);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('fails when session ID is changed', async () => {
    const { verifyCertificate } = await import('../verifier');
    const parts = validPayload.split('|');
    parts[0] = '2';
    const tampered = parts.join('|');
    const result = await verifyCertificate(tampered, rootPubKeyB64);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error for malformed signature', async () => {
    const { verifyCertificate } = await import('../verifier');
    const malformed = buildQRPayload(1, 'Juan Pérez', 'NOT_VALID_BASE64!!!###');
    const result = await verifyCertificate(malformed, rootPubKeyB64);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error for invalid session ID', async () => {
    const { verifyCertificate } = await import('../verifier');
    const malformed = buildQRPayload(999, 'Juan Pérez', toBase64Url(new Uint8Array(64)));
    const result = await verifyCertificate(malformed, rootPubKeyB64);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('decodeQRPayload — session-based decoding', () => {
  let rootPrivKey: Uint8Array;
  let rootPubKeyB64: string;
  let encodedPayload: string;
  let certData: CertData;

  beforeAll(() => {
    rootPrivKey = ed.utils.randomSecretKey();
    const rootPubKey = ed.getPublicKey(rootPrivKey);
    rootPubKeyB64 = toBase64Url(rootPubKey);

    const nombre = 'Ana López';
    const certString = expandCertData(4, nombre);
    const dataBytes = new TextEncoder().encode(certString);
    const sigData = ed.sign(dataBytes, rootPrivKey);

    certData = {
      ciudad: 'Guayaquil',
      programa_id: 'ia-creadores-contenido',
      programa_nombre: 'Inteligencia Artificial para Creadores de Contenido y Periodistas',
      nombre,
      fecha: '2025-04-24',
      duracion: '4',
    };

    encodedPayload = buildQRPayload(4, nombre, toBase64Url(sigData));
  });

  it('decodes a valid session-based payload', async () => {
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

  it('produces significantly smaller payloads than JSON format', () => {
    const sessionPayload = encodedPayload;

    const jsonPayload = JSON.stringify({
      d: {
        ciudad: 'Guayaquil',
        programa_id: 'ia-creadores-contenido',
        programa_nombre: 'Inteligencia Artificial para Creadores de Contenido y Periodistas',
        nombre: 'Ana López',
        fecha: '2025-04-24',
        duracion: '4',
      },
      s: toBase64Url(new Uint8Array(64)),
    });
    const jsonB64 = Buffer.from(jsonPayload).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    expect(sessionPayload.length).toBeLessThan(jsonB64.length);
    expect(sessionPayload.length).toBeLessThan(120);
  });
});
