#!/usr/bin/env bun
/**
 * Script para validar un QR payload contra la ROOT_PUBLIC_KEY del .env
 * Uso: bun scripts/validate.ts <qr_payload>
 * 
 * Ejemplo: bun scripts/validate.ts "eyJkIjp7..."
 */

import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

ed.hashes.sha512 = sha512;

const toBase64Url = (buf: Uint8Array): string => 
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const fromBase64Url = (b64: string): Uint8Array => {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
};

// Cargar PUBLIC_ROOT_KEY desde .env
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

// Obtener QR payload del argumento
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Uso: bun scripts/validate.ts <qr_payload>');
  console.error('');
  console.error('Ejemplo:');
  console.error('  bun scripts/validate.ts "eyJkIjp7ImVtaXNvciI6Ikluc3RpdHV0byBkZSBUZWNub2xvZ8OtYSIsImN1cnNvX2lkIjoicHl0aG9uLTIwMjUiLCJjdXJzb19ub21icmUiOiJQeXRob24gcGFyYSBEYXRhIFNjaWVuY2UiLCJub21icmUiOiJNYXLDrWEgR2FyY8OtYSIsImZlY2hhIjoiMjAyNS0wNC0xNCJ9LCJrIjp7InB1YiI6IkxWNEgtNHNRcmxQMnB4Nm1hWFA0S1JLYVBMbFB2UnN3NWdpQUJDVlBHWW8iLCJzaWdfcm9vdCI6IlpQdVhHUVI4b2dNbWZyUFJQc0RaM2szMm5pUFZaX0s3U1BaSjhUWVpaT09aRm12eXkzWWk5bnd3aktOZ2VIYmIxbTE1VkV4VjdnN2NNalFyMkp4QkFnIn0sInMiOiJRV0J6VTVia2NxWGwxWHBQR2pnRG8waXFDWUF3aFI0M3RqZ3FQM092T2F3ZVF0RGVZU2s5anlCTFJ0dl9tVEc1QnZKU1hfaXo5NTZvMUpCNmM1M3FBZyJ9"');
  process.exit(1);
}

const qrPayload = args[0];
const ROOT_PUBLIC_KEY = getRootKeyFromEnv();

console.log('═══════════════════════════════════════════════════════════');
console.log('  SCDV - Validador de Certificados');
console.log('═══════════════════════════════════════════════════════════\n');

// Decodificar QR
let payload: any;
try {
  const decoded = fromBase64Url(qrPayload);
  payload = JSON.parse(new TextDecoder().decode(decoded));
} catch (e) {
  console.error('❌ Error: QR Payload inválido');
  process.exit(1);
}

console.log('📄 Datos del Certificado:');
console.log(JSON.stringify(payload.d, null, 2));
console.log('');

console.log('🔐 Verificación:');
console.log('');

// Step 1: Verificar que la clave del curso fue autorizada por ROOT
const coursePub = fromBase64Url(payload.k.pub);
const sigRoot = fromBase64Url(payload.k.sig_root);
const rootPub = fromBase64Url(ROOT_PUBLIC_KEY);

const step1 = ed.verify(sigRoot, coursePub, rootPub);
console.log(`   Step 1 - Clave del curso autorizada por ROOT:`);
console.log(`   ${step1 ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);

// Step 2: Verificar que los datos no fueron alterados
const dataBytes = new TextEncoder().encode(JSON.stringify(payload.d));
const sigData = fromBase64Url(payload.s);

const step2 = ed.verify(sigData, dataBytes, coursePub);
console.log(`   Step 2 - Datos del certificado intactos:`);
console.log(`   ${step2 ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log(step1 && step2 ? '  ✅ CERTIFICADO VÁLIDO' : '  ❌ CERTIFICADO INVÁLIDO');
console.log('═══════════════════════════════════════════════════════════\n');