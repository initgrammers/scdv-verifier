# SCDV Verificador

![Version](https://img.shields.io/badge/version-1.0.0-84cc16?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-offline%20ready-84cc16?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-gray?style=flat-square)

Verificador público del **Sistema de Certificados Digitales Verificables**. Determina la autenticidad de un certificado escaneando su código QR — funciona completamente offline y sin backend.

## ¿Qué hace?

Decodifica el QR del certificado y ejecuta dos validaciones criptográficas en cadena:

1. **Verifica la clave del curso** — confirma que fue autorizada por la clave raíz del sistema
2. **Verifica los datos del participante** — confirma que nombre, fecha y curso no fueron alterados

Todo el procesamiento ocurre en el navegador. Ningún dato sale del dispositivo.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Astro 6 (static output) |
| UI | React 19 (islands) |
| Criptografía | `@noble/ed25519` |
| Estilos | Tailwind CSS |
| PWA / SW | `@vite-pwa/astro` + Workbox |
| Runtime | Bun |

## Desarrollo

> Requiere Node >= 22.12.0 y Bun.

```bash
# Instalar dependencias
bun install

# Dev server (HTTPS local via mkcert)
bun dev

# Build de producción
nvm use 22 && bun run build

# Tests
bun test
```

## Despliegue

El proyecto se despliega como sitio estático en GitHub Pages bajo el path `/scdv-verificador/`. El build genera el Service Worker con Workbox que precachea todos los assets para funcionamiento 100% offline.
