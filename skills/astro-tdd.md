# 🧪 Reglas de TDD para Astro y Core Criptográfico

Esta skill dicta cómo el agente debe abordar la configuración y escritura de Testing (TDD) dentro del verificador.

## 🛠 Stack de Testing Oficial

- **Test Runner Principal:** `Vitest` (altamente recomendado sobre Jest, dada su perfecta sinergia con el bundler Vite usado por Astro).
- **Testing DOM (Si aplica UI):** `jsdom` o `happy-dom` junto con `@testing-library/react`.
- **Motor de ejecución:** **Bun**, que incluye por defecto una velocidad monstruosa para runners modernos.

## ⚙️ Directivas de TDD

1. **Red-Green-Refactor:** Para la lógica de validación criptográfica en `src/lib/verifier.ts`, está ESTRICTAMENTE PROHIBIDO codificar la solución final sin haber escrito la suite de testeo inicial (con tests fallidos).
2. **Archivos de Prueba:** Nombrados siempre con el sufijo `.test.ts` o `.test.tsx` y adyacentes al código que testean (o dentro de una carpeta `__tests__` respectiva).
3. **Aserciones Criptográficas:** Asegurarse de enviar arrays y búferes decodificados precisos. `vitest` manejará los fallos criptográficos que validan "Certificado Falso" o "Alterado".
4. **Comandos requeridos en config:**
   - Instalar: `bun add -d vitest @testing-library/react jsdom`
   - Setup: Añadir `"test": "vitest run"` en los scripts de tu `package.json`.
