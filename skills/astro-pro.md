# 🚀 Arquitectura Astro (World-Class Standards)

Esta skill define las reglas inflexibles para escribir código frontal en Astro, garantizando rendimiento de grado empresarial, calificación Lighthouse cercana a 100, y una base de código lista para crecer exponencialmente.

## 🏝 Arquitectura de Islas (Integración de React)

El pilar de Astro es enviar $0$ JavaScript al cliente. React es un invitado, no el dueño del DOM.

1. **Directivas de Hidratación Cautelosas:**
   - Usa `client:idle` para interacciones secundarias (Modales, tooltips) para no bloquear la carga inicial.
   - Usa `client:load` ÚNICAMENTE para componentes críticos funcionales inmediatos (Ej. El Lector de QR).
   - Usa `client:only="react"` si y solo si el componente usa APIs nativas de window (cámara, localstorage) que de lo contrario fallarían en el SSR/SSG del build.
2. **Nanostores para Estado:** Si dos islas desconectadas de React necesitan hablar entre ellas, USA `@nanostores/react`. Está prohibido inundar la aplicación web de Providers o Redux para un ecosistema de islas.

## 📁 Semántica de Directorios

Separación de responsabilidades draconiana:

- `src/pages/`: Actúan netamente como enrutadores. No deben tener lógica compleja, solo orquestan a los componentes.
- `src/components/`: Piezas de UI aisladas y reusables (`.astro` para estáticos, `.tsx` para dinámicos).
- `src/layouts/`: Recipientes maestros (Ej. `BaseLayout.astro`) que centralizan la inyección requerida de metadatos y `<head>`.
- `src/lib/`: Toda tu lógica no-visual, utilidades, y validaciones criptográficas viven aquí (TDD-friendly).

## 🛡️ Estricto Type Safety (TypeScript)

Fórmula requerida en componentes `.astro`:

```astro
---
interface Props {
  title: string;
  isOptional?: boolean;
}
const { title, isOptional = false } = Astro.props;
---
```

- No uses tipos implícitos ni evasivas como `any`.

## 🕸 Optimización de UI y Assets

- **Astro Prefetch:** Para fluidez absoluta, los enlaces relevantes deben tener el atributo `<a href="..." data-astro-prefetch>`.
- **Estilos:** Prioriza el scope nativo de `<style>` en componentes Astro o TailwindCSS global para una carga efímera.
- Todo recurso vital o ícono manifest offline a utilizar en la PWA deberá alojarse estáticamente en la raíz de `public/`.
