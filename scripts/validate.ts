#!/usr/bin/env bun
/**
 * Script para validar un QR payload contra la ROOT_PUBLIC_KEY del .env
 * Uso: bun scripts/validate.ts <qr_payload>
 * 
 * Ejemplo: bun scripts/validate.ts "Instituto|python-2025|...|signature"
 */

import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

ed.hashes.sha512 = sha512;

const CERT_FIELDS = ['ciudad', 'programa_id', 'programa_nombre', 'nombre', 'fecha'] as const;

const fromBase64Url = (b64: string): Uint8Array => {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
};

function getRootKeyFromEnv(): string {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/PUBLIC_ROOT_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch (e) {
    console.error('No se pudo leer .env');
  }
  throw new Error('PUBLIC_ROOT_KEY no encontrada en .env');
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Uso: bun scripts/validate.ts <qr_payload>');
  console.error('');
  console.error('Ejemplo:');
  console.error('  bun scripts/validate.ts "Instituto de Tecnología|python-2025|..."');
  process.exit(1);
}

const qrPayload = args[0];
const ROOT_PUBLIC_KEY = getRootKeyFromEnv();

console.log('═══════════════════════════════════════════════════════════');
console.log('  SCDV - Validador de Certificados');
console.log('═══════════════════════════════════════════════════════════\n');

const parts = qrPayload.split('|');
if (parts.length !== CERT_FIELDS.length + 1) {
  console.error('❌ Error: QR Payload inválido (estructura incorrecta)');
  process.exit(1);
}

const certData: Record<string, string> = {};
for (let i = 0; i < CERT_FIELDS.length; i++) {
  certData[CERT_FIELDS[i]] = parts[i];
}

console.log('📄 Datos del Certificado:');
console.log(JSON.stringify(certData, null, 2));
console.log('');

console.log('🔐 Verificación:');
console.log('');

const rootPub = fromBase64Url(ROOT_PUBLIC_KEY);
const dataBytes = new TextEncoder().encode(parts.slice(0, CERT_FIELDS.length).join('|'));
const sigData = fromBase64Url(parts[CERT_FIELDS.length]);

const valid = ed.verify(sigData, dataBytes, rootPub);
console.log(`   Firma del certificado:`);
console.log(`   ${valid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log(valid ? '  ✅ CERTIFICADO VÁLIDO' : '  ❌ CERTIFICADO INVÁLIDO');
console.log('═══════════════════════════════════════════════════════════\n');
