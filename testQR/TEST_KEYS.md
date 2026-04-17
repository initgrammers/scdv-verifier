# Claves de Prueba - SCDV Verificador

Este documento contiene las claves públicas y estructura necesaria para crear certificados de prueba válidos.

## Clave ROOT

Esta clave debe estar configurada en el archivo `.env` del proyecto:

```bash
PUBLIC_ROOT_KEY=TvVylyHw_34tOFQWzFYWd9aomEnULoDh-_H0pV2UyeA
```

## Estructura del JSON para QR

Para crear un QR válido, el JSON debe tener esta estructura:

```json
{
  "d": {
    "emisor": "Nombre del emisor",
    "curso_id": "identificador-del-curso",
    "curso_nombre": "Nombre completo del curso",
    "nombre": "Nombre del participante",
    "fecha": "YYYY-MM-DD"
  },
  "k": {
    "pub": "clave_pública_del_curso_en_base64url",
    "sig_root": "firma_de_la_clave_pública_por_la_root_key"
  },
  "s": "firma_de_los_datos_d_con_la_clave_privada_del_curso"
}
```

## Ejemplo Completo

```json
{
  "d": {
    "emisor": "Instituto de Tecnología",
    "curso_id": "python-2025",
    "curso_nombre": "Python para Data Science",
    "nombre": "María García",
    "fecha": "2025-04-14"
  },
  "k": {
    "pub": "yfbdfaxeBGTL6gPvc9eY4ojnbDmBDVYMpeb_pyugjY8",
    "sig_root": "atwKUpAS3vlvwQhFAWbfNUBDdMsi2IYCWTP6qkUQtHx7fxRX0jQ5JFOFonRHt-IADeEwIotOXptIstRDM_FaAw"
  },
  "s": "oKqkAPwgpIbwtRp94pjGLSd3f0Dyot6vuNWMZg9sD40dGvY_g9Y5Bhwgu7-QmoJFUfp2WRNBgo3RwjWakKPeAA"
}
```

## Cómo Generar un Nuevo QR

### Opción 1: Usar el Script (Recomendado)

El script `generate-cert.ts` genera automáticamente claves válidas y el QR:

```bash
bun scripts/generate-cert.ts
```

El script te dará:

1. Nueva `PUBLIC_ROOT_KEY` para el `.env`
2. QR Payload listo para usar
3. Archivos `.pem` para el emisor (course_private, course_public, sig_root)

### Opción 2: Generar Manualmente

1. **Crear el JSON** con los datos del certificado
2. **Codificar a Base64url:**

   ```bash
   echo '{"d":{...},"k":{...},"s":"..."}}' | base64 | tr '+' '-' | tr '/' '_' | tr -d '='
   ```

3. **Generar el QR** con el string resultado

## Cómo Validar un QR

Para verificar que un QR es válido:

```bash
bun scripts/validate.ts "<qr_payload>"
```

Ejemplo:

```bash
bun scripts/validate.ts "eyJkIjp7ImVtaXNvciI6Ikluc3RpdHV0byBkZSBUZWNub2xvZ8OtYSIsImN1cnNvX2lkIjoicHl0aG9uLTIwMjUiLCJjdXJzb19ub21icmUiOiJQeXRob24gcGFyYSBEYXRhIFNjaWVuY2UiLCJub21icmUiOiJNYXLDrWEgR2FyY8OtYSIsImZlY2hhIjoiMjAyNS0wNC0xNCJ9LCJrIjp7InB1YiI6InlmYmRmYXhlQkdUTDZnUHZjOWVZNG9qbmJEbUJEVllNcGViX3B5dWdqWTgiLCJzaWdfcm9vdCI6ImF0d0tVcEFTM3ZsdndRaEZBV2JmTlVCRGRNc2kySVlDV1RQNnFrVVF0SHg3ZnhSWDBqUTVKRk9Gb25SSHQtSUFEZUV3SW90T1hwdElzdFJETV9GYUF3In0sInMiOiJvS3FrQVB3Z3BJYnd0UnA5NHBqR0xTZDNmMER5b3Q2dnVOV01aZzlzRDQwZEd2WV9nOVk1Qmh3Z3U3LVFtb0pGVWZwMldSTkJnbzNSd2pXYWtLUGVBQSJ9"
```

## Notas Importantes

- Las claves privadas mostradas aquí son solo para pruebas locales
- En producción, las claves privadas deben mantenerse Offline y seguras
- Cada vez que ejecutás `generate-cert.ts`, se generan nuevas claves
- Si generás nuevas claves, actualizá el `.env` con la nueva `PUBLIC_ROOT_KEY`

## Archivos de Referencia

- `scripts/generate-cert.ts` - Generador de certificados de prueba
- `scripts/validate.ts` - Validador de QR payloads
- `.env` - Archivo de configuración con la clave pública ROOT
- `docs/ARQUITECTURA_CERTIFICADOS.md` - Documentación completa de la arquitectura
