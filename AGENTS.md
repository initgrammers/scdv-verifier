# 🤖 Fuente de la Verdad - SCDV Verificador (AGENTS.md)

Este archivo es la fuente de verdad principal para cualquier IA o humano trabajando en este repositorio. Cualquier instrucción contenida aquí prima sobre deducciones aisladas.

## 📌 Propósito del Proyecto

El **Verificador** es el componente público del *Sistema de Certificados Digitales Verificables*. Su único objetivo es determinar (offline y online) la autenticidad de un documento decodificando y validando criptográficamente las firmas contenidas en su QR respectivo.

## 🏗️ Stack Tecnológico

- **Framework base:** Astro (con output configurado como estático `static`).
- **Lógica de interfaz:** React JS (vía integración de Islas de Astro).
- **Core Criptográfico:** `@noble/ed25519` (Pure JS, no usar Node built-ins).
- **Entorno de Red:** PWA (Progressive Web App) para funcionar fuera de línea.
- **Despliegue:** GitHub Pages (requiere el path `/scdv-verificador/` configurado en el `base` de Astro).
- **Herramienta (Toolchain):** Preferir **Bun** sobre npm/yarn.

## 🔐 Algoritmo y Flujo de Verificación Criptográfica

1. La aplicación posee la `ROOT_PUBLIC_KEY` quemada (hardcodeada) en constantes de texto de la aplicación.
2. Un escaner lee el QR que posee un Base64Url de la siguiente forma JSON:
   - `d`: Datos útiles del negocio del certificado (participante, fecha, curso).
   - `k`: Key material, contiene `pub` (Clave pública del curso específico) y `sig_root` (Firma demostrando que `pub` fue autorizado por nuestra `ROOT_PUBLIC_KEY`).
   - `s`: Signature, firma de todos los datos en `d` garantizados por `k.pub`.
3. El proceso de decisión final debe SIEMPRE consistir de 2 pasos estrictos:
   - **PASO 1:** Evaluar que el curso está legitimado vía `verify(sig_root, pub, ROOT_PUBLIC_KEY)`.
   - **PASO 2:** Confirmar que los datos del usuario jamas fueron alterados vía `verify(s, d, pub)`.

## ⚠️ Reglas Intocables de Arquitectura

1. **NO Existe Backend API:** El verificador opera 100% de lado del cliente en el Browser para funcionar como PWA en eventos offline presenciales. No proponer ni establecer APIs para este repositorio.
2. **Cero Dependencias Externas Criptográficas Nativas:** Toda la solución criptográfica debe recaer en `@noble/ed25519` por su soporte puro en motores JS sin módulos C++ de por medio.
3. **Manejo Estratégico de Testing (TDD):** El testing automatizado DEBE aplicarse **exclusivamente a flujos y/o componentes de alto nivel** (ej. la tubería criptográfica base y validaciones críticas del negocio). Prohibido malgastar recursos en pruebas de UI sin impacto matemático. Todo escenario a testear debe apegarse fielmente a la metodología **TDD** y seguir las mejores prácticas impuestas por el stack oficial de nuestro proyecto.
