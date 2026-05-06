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

const CERT_FIELDS = ['ciudad', 'programa_id', 'programa_nombre', 'nombre', 'fecha'] as const;

interface CertData {
  ciudad: string;
  programa_id: string;
  programa_nombre: string;
  nombre: string;
  fecha: string;
}

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

// 2. Firmar datos directamente con ROOT private key
console.log('📝 Firmando datos del certificado con ROOT...');
const certString = CERT_FIELDS.map(f => certData[f]).join('|');
const dataBytes = new TextEncoder().encode(certString);
const sigData = await ed.sign(dataBytes, rootPrivate);
const sigDataB64 = toBase64Url(sigData);

const verifySig = ed.verify(sigData, dataBytes, rootPublic);
console.log(`   ✓ Verificación: ${verifySig ? 'OK' : 'FALLO'}\n`);

// 3. Generar QR payload
const qrPayload = `${certString}|${sigDataB64}`;

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
