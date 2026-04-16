#!/usr/bin/env bun
/**
 * Script para generar certificados de prueba válidos
 * Uso: bun scripts/generate-cert.ts
 * 
 * Genera:
 * - Root key pair (para el verificador)
 * - Course key pair (para el emisor)  
 * - QR payload válido (para probar en la app)
 */

import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';
ed.hashes.sha512 = sha512;

const toBase64Url = (buf: Uint8Array): string => 
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const fromBase64Url = (b64: string): Uint8Array => {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
};

interface CertData {
  emisor: string;
  curso_id: string;
  curso_nombre: string;
  nombre: string;
  fecha: string;
}

// Datos del certificado a firmar
const certData: CertData = {
  emisor: 'Instituto de Tecnología',
  curso_id: 'python-2025',
  curso_nombre: 'Python para Data Science',
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

// 2. Generar COURSE key pair
console.log('📝 Generando claves del CURSO...');
const coursePrivate = ed.utils.randomSecretKey();
const coursePublic = await ed.getPublicKeyAsync(coursePrivate);
const coursePublicB64 = toBase64Url(coursePublic);

console.log('   ✓ Course key pair generado\n');

// 3. Firmar coursePublic con rootPrivate (Step 1)
console.log('📝 Firmando clave pública del curso con ROOT...');
const sigRoot = await ed.sign(coursePublic, rootPrivate);
const sigRootB64 = toBase64Url(sigRoot);

// Verificar locally
const verifyStep1 = ed.verify(sigRoot, coursePublic, rootPublic);
console.log(`   ✓ Step 1 verificación: ${verifyStep1 ? 'OK' : 'FALLO'}\n`);

// 4. Firmar datos con coursePrivate (Step 2)
console.log('📝 Firmando datos del certificado...');
const dataBytes = new TextEncoder().encode(JSON.stringify(certData));
const sigData = await ed.sign(dataBytes, coursePrivate);
const sigDataB64 = toBase64Url(sigData);

// Verificar locally
const verifyStep2 = ed.verify(sigData, dataBytes, coursePublic);
console.log(`   ✓ Step 2 verificación: ${verifyStep2 ? 'OK' : 'FALLO'}\n`);

// 5. Generar QR payload
const qrPayload = {
  d: certData,
  k: { pub: coursePublicB64, sig_root: sigRootB64 },
  s: sigDataB64,
};

const qrPayloadB64 = Buffer.from(JSON.stringify(qrPayload))
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');

// OUTPUT
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
console.log('  ARCHIVOS PARA EL EMISOR (guárdalos)');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📁 root_private.pem:');
console.log('   (Mantener en lugar seguro - offline)');
const rootPrivatePem = `-----BEGIN PRIVATE KEY-----
${Buffer.from(rootPrivate).toString('base64').match(/.{1,64}/g)?.join('\n')}
-----END PRIVATE KEY-----`;
console.log(rootPrivatePem);
console.log('');

console.log('📁 root_public.pem:');
const rootPublicPem = `-----BEGIN PUBLIC KEY-----
${Buffer.from(rootPublic).toString('base64').match(/.{1,64}/g)?.join('\n')}
-----END PUBLIC KEY-----`;
console.log(rootPublicPem);
console.log('');

console.log('📁 course_private.pem:');
const coursePrivatePem = `-----BEGIN PRIVATE KEY-----
${Buffer.from(coursePrivate).toString('base64').match(/.{1,64}/g)?.join('\n')}
-----END PRIVATE KEY-----`;
console.log(coursePrivatePem);
console.log('');

console.log('📁 course_public.pem:');
const coursePublicPem = `-----BEGIN PUBLIC KEY-----
${Buffer.from(coursePublic).toString('base64').match(/.{1,64}/g)?.join('\n')}
-----END PUBLIC KEY-----`;
console.log(coursePublicPem);
console.log('');

console.log('📁 sig_root.txt:');
console.log(sigRootB64);
console.log('');

console.log('═══════════════════════════════════════════════════════════');
console.log('  RESUMEN');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('1. Copiá PUBLIC_ROOT_KEY al archivo .env');
console.log('2. El QR payload está listo para probar en la app');
console.log('3. Guardá los archivos .pem del curso para emitir certificados');
console.log('');