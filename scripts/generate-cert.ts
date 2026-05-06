#!/usr/bin/env bun
/**
 * Script para generar certificados de prueba válidos
 * Uso: bun scripts/generate-cert.ts
 * 
 * Genera:
 * - Root key pair (para el verificador)
 * - Program key pair (para la ciudad)  
 * - QR payload válido (para probar en la app)
 * - Archivos .pem guardados en keys/
 */

import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
import { mkdirSync, writeFileSync } from 'node:fs';
ed.hashes.sha512 = sha512;

const toBase64Url = (buf: Uint8Array): string => 
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const fromBase64Url = (b64: string): Uint8Array => {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
};

interface CertData {
  ciudad: string;
  programa_id: string;
  programa_nombre: string;
  nombre: string;
  fecha: string;
}

// Datos del certificado a firmar
const certData: CertData = {
  ciudad: 'Instituto de Tecnología',
  programa_id: 'python-2025',
  programa_nombre: 'Python para Data Science',
  nombre: 'María García',
  fecha: '2025-04-14',
};

console.log('═══════════════════════════════════════════════════════════');
console.log('  SCDV - Generador de Certificados de Prueba');
console.log('═══════════════════════════════════════════════════════════\n');

// 1. Generar ROOT key pair
console.log('📝 Generando claves ROOT...');
const rootPrivate = ed.utils.randomSecretKey();
const rootPublic = await ed.getPublicKeyAsync(rootPrivate);
const rootPublicB64 = toBase64Url(rootPublic);

console.log('   ✓ Root key pair generado\n');

// 2. Generar PROGRAM key pair
console.log('📝 Generando claves del PROGRAMA...');
const programPrivate = ed.utils.randomSecretKey();
const programPublic = await ed.getPublicKeyAsync(programPrivate);
const programPublicB64 = toBase64Url(programPublic);

console.log('   ✓ Program key pair generado\n');

// 3. Firmar programPublic con rootPrivate (Step 1)
console.log('📝 Firmando clave pública del programa con ROOT...');
const sigRoot = await ed.sign(programPublic, rootPrivate);
const sigRootB64 = toBase64Url(sigRoot);

// Verificar locally
const verifyStep1 = ed.verify(sigRoot, programPublic, rootPublic);
console.log(`   ✓ Step 1 verificación: ${verifyStep1 ? 'OK' : 'FALLO'}\n`);

// 4. Firmar datos con programPrivate (Step 2)
console.log('📝 Firmando datos del certificado...');
const dataBytes = new TextEncoder().encode(JSON.stringify(certData));
const sigData = await ed.sign(dataBytes, programPrivate);
const sigDataB64 = toBase64Url(sigData);

// Verificar locally
const verifyStep2 = ed.verify(sigData, dataBytes, programPublic);
console.log(`   ✓ Step 2 verificación: ${verifyStep2 ? 'OK' : 'FALLO'}\n`);

// 5. Generar QR payload
const qrPayload = {
  d: certData,
  k: { pub: programPublicB64, sig_root: sigRootB64 },
  s: sigDataB64,
};

const qrPayloadB64 = Buffer.from(JSON.stringify(qrPayload))
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');

// OUTPUT
const keysDir = 'keys';
mkdirSync(keysDir, { recursive: true });

console.log('═══════════════════════════════════════════════════════════');
console.log('  RESULTADOS');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('🔑 ROOT PUBLIC KEY (para .env):');
console.log('   PUBLIC_ROOT_KEY=' + rootPublicB64);
console.log('');

console.log('📄 QR PAYLOAD (para input manual de la app):');
console.log('   ' + qrPayloadB64);
console.log('');

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

const programPrivatePem = `-----BEGIN PRIVATE KEY-----
${Buffer.from(programPrivate).toString('base64').match(/.{1,64}/g)?.join('\n')}
-----END PRIVATE KEY-----`;
writeFileSync(`${keysDir}/program_private.pem`, programPrivatePem + '\n');
console.log('   ✓ keys/program_private.pem');

const programPublicPem = `-----BEGIN PUBLIC KEY-----
${Buffer.from(programPublic).toString('base64').match(/.{1,64}/g)?.join('\n')}
-----END PUBLIC KEY-----`;
writeFileSync(`${keysDir}/program_public.pem`, programPublicPem + '\n');
console.log('   ✓ keys/program_public.pem');

writeFileSync(`${keysDir}/sig_root.txt`, sigRootB64 + '\n');
console.log('   ✓ keys/sig_root.txt');

writeFileSync(`${keysDir}/qr_payload.txt`, qrPayloadB64 + '\n');
console.log('   ✓ keys/qr_payload.txt');

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  RESUMEN');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('1. Copiá PUBLIC_ROOT_KEY al archivo .env');
console.log('2. El QR payload está listo para probar en la app');
console.log('3. Guardá los archivos .pem del programa para emitir certificados');
console.log('');