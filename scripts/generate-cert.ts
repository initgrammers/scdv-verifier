#!/usr/bin/env bun
/**
 * Script para generar certificados de prueba válidos
 * Uso: bun scripts/generate-cert.ts
 * 
 * Genera:
 * - Root key pair (firma directa de certificados)
 * - QR payload válido (para probar en la app)
 * - Archivos .pem guardados en keys/
 */

import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import { mkdirSync, writeFileSync } from 'node:fs';
ed.hashes.sha512 = sha512;

const toBase64Url = (buf: Uint8Array): string => 
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const SESSIONS = {
  1: { ciudad: 'Quito', programa_id: 'ia-creadores-contenido', programa_nombre: 'Inteligencia Artificial para Creadores de Contenido y Periodistas', duracion: '4', fecha: '2026-04-22' },
  2: { ciudad: 'Quito', programa_id: 'ia-sector-publico', programa_nombre: 'Inteligencia Artificial para el Sector Público', duracion: '4', fecha: '2026-04-21' },
  3: { ciudad: 'Quito', programa_id: 'ia-emprendedores', programa_nombre: 'Inteligencia Artificial para Emprendedores y Sociedad Civil', duracion: '4', fecha: '2026-04-21' },
  4: { ciudad: 'Guayaquil', programa_id: 'ia-creadores-contenido', programa_nombre: 'Inteligencia Artificial para Creadores de Contenido y Periodistas', duracion: '4', fecha: '2026-04-24' },
  5: { ciudad: 'Guayaquil', programa_id: 'ia-sector-publico', programa_nombre: 'Inteligencia Artificial para el Sector Público', duracion: '4', fecha: '2026-04-24' },
  6: { ciudad: 'Guayaquil', programa_id: 'ia-emprendedores', programa_nombre: 'Inteligencia Artificial para Emprendedores y Sociedad Civil', duracion: '4', fecha: '2026-04-25' },
  7: { ciudad: 'Quito', programa_id: 'techties-2026', programa_nombre: 'Voluntariado - TechTies Ecuador 2026', duracion: '24', fecha: '2026-04-20 al 2026-04-22' },
  8: { ciudad: 'Quito', programa_id: 'techties-2026', programa_nombre: 'Voluntariado - TechTies Ecuador 2026', duracion: '8', fecha: '2026-04-20' },
  9: { ciudad: 'Quito', programa_id: 'techties-2026', programa_nombre: 'Voluntariado - TechTies Ecuador 2026', duracion: '8', fecha: '2026-04-22' },
  10: { ciudad: 'Quito', programa_id: 'techties-2026', programa_nombre: 'Voluntariado - TechTies Ecuador 2026', duracion: '8', fecha: '2026-04-21' },
  11: { ciudad: 'Guayaquil', programa_id: 'techties-2026', programa_nombre: 'Voluntariado - TechTies Ecuador 2026', duracion: '24', fecha: '2026-04-23 al 2026-04-25' },
  12: { ciudad: 'Guayaquil', programa_id: 'techties-2026', programa_nombre: 'Voluntariado - TechTies Ecuador 2026', duracion: '8', fecha: '2026-04-25' },
};

// Configuración del certificado a generar
const SESSION_ID = 1;
const PARTICIPANT_NAME = 'María García';

console.log('═══════════════════════════════════════════════════════════');
console.log('  SCDV - Generador de Certificados de Prueba');
console.log('═══════════════════════════════════════════════════════════\n');

const session = SESSIONS[SESSION_ID as keyof typeof SESSIONS];
if (!session) {
  console.error(`❌ Sesión con ID ${SESSION_ID} no encontrada`);
  process.exit(1);
}

console.log(`📋 Sesión #${SESSION_ID}: ${session.programa_nombre}`);
console.log(`   Ciudad: ${session.ciudad}`);
console.log(`   Fecha: ${session.fecha}`);
console.log(`   Duración: ${session.duracion} horas`);
console.log(`   Participante: ${PARTICIPANT_NAME}\n`);

// 1. Generar ROOT key pair
console.log('📝 Generando claves ROOT...');
const rootPrivate = ed.utils.randomSecretKey();
const rootPublic = await ed.getPublicKeyAsync(rootPrivate);
const rootPublicB64 = toBase64Url(rootPublic);

console.log('   ✓ Root key pair generado\n');

// 2. Firmar datos expandidos con ROOT private key
console.log('📝 Firmando datos expandidos del certificado con ROOT...');
const certString = `${session.ciudad}|${session.programa_id}|${session.programa_nombre}|${PARTICIPANT_NAME}|${session.fecha}|${session.duracion}`;
const dataBytes = new TextEncoder().encode(certString);
const sigData = await ed.sign(dataBytes, rootPrivate);
const sigDataB64 = toBase64Url(sigData);

const verifySig = ed.verify(sigData, dataBytes, rootPublic);
console.log(`   ✓ Verificación: ${verifySig ? 'OK' : 'FALLO'}\n`);

// 3. Generar QR payload
const qrPayload = `${SESSION_ID}|${PARTICIPANT_NAME}|${sigDataB64}`;

console.log('═══════════════════════════════════════════════════════════');
console.log('  RESULTADOS');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('🔑 ROOT PUBLIC KEY (para .env):');
console.log('   PUBLIC_ROOT_KEY=' + rootPublicB64);
console.log('');

console.log('📄 QR PAYLOAD (para input manual de la app):');
console.log('   ' + qrPayload);
console.log('');
console.log(`📊 Tamaño del QR: ${qrPayload.length} chars`);
console.log('');

// OUTPUT
const keysDir = 'keys';
mkdirSync(keysDir, { recursive: true });

console.log('═══════════════════════════════════════════════════════════');
console.log('  ARCHIVOS GUARDADOS EN keys/');
console.log('═══════════════════════════════════════════════════════════\n');

const rootPrivatePem = `-----BEGIN PRIVATE KEY-----
${Buffer.from(rootPrivate).toString('base64').match(/.{1,64}/g)?.join('\n')}
-----END PRIVATE KEY-----`;
writeFileSync(`${keysDir}/root_private.pem`, rootPrivatePem + '\n');
console.log('   ✓ keys/root_private.pem');

const rootPublicPem = `-----BEGIN PUBLIC KEY-----
${Buffer.from(rootPublic).toString('base64').match(/.{1,64}/g)?.join('\n')}
-----END PUBLIC KEY-----`;
writeFileSync(`${keysDir}/root_public.pem`, rootPublicPem + '\n');
console.log('   ✓ keys/root_public.pem');

writeFileSync(`${keysDir}/qr_payload.txt`, qrPayload + '\n');
console.log('   ✓ keys/qr_payload.txt');

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  RESUMEN');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('1. Copiá PUBLIC_ROOT_KEY al archivo .env');
console.log('2. El QR payload está listo para probar en la app');
console.log('');
