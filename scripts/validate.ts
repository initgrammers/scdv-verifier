#!/usr/bin/env bun
/**
 * Script para validar un QR payload contra la ROOT_PUBLIC_KEY del .env
 * Uso: bun scripts/validate.ts <qr_payload>
 * 
 * Ejemplo: bun scripts/validate.ts "1|María García|firma_base64url"
 */

import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

ed.hashes.sha512 = sha512;

const SESSIONS = {
  1: { ciudad: 'Quito', programa_id: 'ia-creadores-contenido', programa_nombre: 'Inteligencia Artificial para Creadores de Contenido y Periodistas', duracion: '4', fecha: '2026-04-22' },
  2: { ciudad: 'Quito', programa_id: 'ia-sector-publico', programa_nombre: 'Inteligencia Artificial para el Sector Público', duracion: '4', fecha: '2026-04-21' },
  3: { ciudad: 'Quito', programa_id: 'ia-emprendedores', programa_nombre: 'Inteligencia Artificial para Emprendedores y Sociedad Civil', duracion: '4', fecha: '2026-04-21' },
  4: { ciudad: 'Guayaquil', programa_id: 'ia-creadores-contenido', programa_nombre: 'Inteligencia Artificial para Creadores de Contenido y Periodistas', duracion: '4', fecha: '2026-04-24' },
  5: { ciudad: 'Guayaquil', programa_id: 'ia-sector-publico', programa_nombre: 'Inteligencia Artificial para el Sector Público', duracion: '4', fecha: '2026-04-24' },
  6: { ciudad: 'Guayaquil', programa_id: 'ia-emprendedores', programa_nombre: 'Inteligencia Artificial para Emprendedores y Sociedad Civil', duracion: '4', fecha: '2026-04-25' },
};

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
  console.error('  bun scripts/validate.ts "1|María García|firma_base64url"');
  process.exit(1);
}

const qrPayload = args[0];
const ROOT_PUBLIC_KEY = getRootKeyFromEnv();

console.log('═══════════════════════════════════════════════════════════');
console.log('  SCDV - Validador de Certificados');
console.log('═══════════════════════════════════════════════════════════\n');

const parts = qrPayload.split('|');
if (parts.length !== 3) {
  console.error('❌ Error: QR Payload inválido (estructura: id|nombre|firma)');
  process.exit(1);
}

const sessionId = parseInt(parts[0], 10);
const session = SESSIONS[sessionId as keyof typeof SESSIONS];
if (!session) {
  console.error(`❌ Error: Sesión con ID ${sessionId} no encontrada`);
  process.exit(1);
}

const nombre = parts[1];
const certString = `${session.ciudad}|${session.programa_id}|${session.programa_nombre}|${nombre}|${session.fecha}|${session.duracion}`;

console.log('📄 Datos del Certificado:');
console.log(JSON.stringify({
  ciudad: session.ciudad,
  programa_id: session.programa_id,
  programa_nombre: session.programa_nombre,
  nombre,
  fecha: session.fecha,
  duracion: session.duracion,
}, null, 2));
console.log('');

console.log('🔐 Verificación:');
console.log('');

const rootPub = fromBase64Url(ROOT_PUBLIC_KEY);
const dataBytes = new TextEncoder().encode(certString);
const sigData = fromBase64Url(parts[2]);

const valid = ed.verify(sigData, dataBytes, rootPub);
console.log(`   Firma del certificado:`);
console.log(`   ${valid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log(valid ? '  ✅ CERTIFICADO VÁLIDO' : '  ❌ CERTIFICADO INVÁLIDO');
console.log('═══════════════════════════════════════════════════════════\n');
