# ⚛️ Arquitectura React (World-Class Clean Code)

Esta skill establece cómo escribir nuestros componentes y hooks en React. Dado que React opera como "islas dinámicas" dentro de Astro, necesitamos componentes quirúrgicos, con inyección estricta y código extremadamente limpio sin acoplamiento desastroso.

## 📐 Anatomía Perfecta y Early Returns

1. **Separación de pre-renderizado:** Todo componente debe resolver rápidamente sus casos de no-render (Loading states, errores, validaciones) usando **Early Returns** antes de retornar el JSX principal.
   - ❌ **Prohibido:** Envolver tu pantalla principal en un gigantesco `if (data) { return <div>...gran DOM...</div> }`.
   - ✅ **Correcto:** `if (!data) return <Spinner />; return <div>...gran DOM...</div>;`
2. **Prop Drilling Limpio:** Desestructura tus props directamente en la declaración del componente por sobre inyectar objetos ciegos. Evita usar la palabra reservada `props.*`.
3. **Fragmentos Nativos:** Evita la inyección inútil de nodos HTML `<div>` extra que dañan la profundidad del navegador y la accesibilidad. Usa fragmentos vacíos `<>...</>` cuando solo quieres encapsular nodos hermanos.

## 🔒 Type-Safety y Consistencia

Todo componente debe poseer de forma obligatoria la definición atómica de sus tipos expuestos, rechazando explícitamente el uso de `any`:

```tsx
interface FeatureProps {
  payload: string;
  isScanned?: boolean;
  onValidation: (status: boolean) => void;
}

export const QrFeature = ({ payload, isScanned = false, onValidation }: FeatureProps) => {
  // ...
};
```

## 훅 Reglas Doradas de los Hooks

1. **Regla del Custom Hook de Rescate:** Si tu componente acumula múltiples estados, efectos asíncronos y referenciación cruzada (por ejemplo, manipular el MediaStream de la cámara QR y actualizar el layout analizado), **extrae obligatoriamente la lógica a un Custom Hook** abstracto (ej: `useCameraScanner()`). El componente visible debe quedar ignorante de cómo sucedieron las reglas de negocio en la capa baja y solo solicitar/recibir estado.
2. **Aislamiento de la API de Navegador:** Como tu aplicación será pre-renderizada en el lado servidor (Astro SSG local), recuerda fielmente que cualquier ejecución global relacionada a APIs nativas (como `navigator.mediaDevices` o `window`) DEBE envolverse dentro de un `useEffect` que prevenga de ejecutarse en nodo de servidor para prevenir un crash de compilación.
3. **Cero Estados Redundantes:** Nunca encapules en un `useState` algo que pueda ser dinámicamente derivado o computado desde variables ya observadas.

## 🧠 Desacople Lógico

React debe actuar **exclusivamente como Agente de Presentación (Vista)**. Toda la matemática brutal de `@noble/ed25519` referente a verificar las Keys debe existir como utilidades abstractas en `src/lib/` que son consumidas asíncronamente desde las Islas de React, impidiendo el acoplamiento directo entre UI y el dominio de negocio.
