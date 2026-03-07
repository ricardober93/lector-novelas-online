# Design: Next.js 16 Params Promise Handling

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│          Next.js 16 Route Params Flow               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Request: /series/cmmgi3va30007ms7p3dio9hjr        │
│     ↓                                               │
│  Router matches [id] pattern                        │
│     ↓                                               │
│  params = Promise<{ id: "cmmgi3va..." }>           │
│     ↓                                               │
│  Component receives params as Promise               │
│     ↓                                               │
│  ┌──────────────────────────────────────┐          │
│  │  React.use(params)                    │          │
│  │  ↓                                    │          │
│  │  { id: "cmmgi3va..." }               │          │
│  └──────────────────────────────────────┘          │
│     ↓                                               │
│  SWR fetches `/api/series/cmmgi3va...`             │
│     ↓                                               │
│  Render with data                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Design Decisions

### Decision 1: Use React.use() instead of async/await

**Decision**: En Client Components, usar `React.use()` para desempaquetar params.

**Alternatives Considered**:
1. **Async/await en Client Components**: No es posible en componentes cliente sin usar Suspense
2. **Convertir a Server Components**: Posible, pero requeriría refactorizar toda la lógica de SWR
3. **Usar hooks customizados**: Agrega complejidad innecesaria

**Rationale**: 
- `React.use()` es la API oficial de React para consumir Promises en componentes
- Funciona perfectamente en Client Components
- Mantiene el código simple y directo
- No requiere cambios en la estructura de componentes

**Trade-offs**:
- ✅ Solución más simple
- ✅ Consistente con las mejores prácticas de React 19+
- ✅ No requiere Suspense boundaries
- ❌ Requiere importar `use` de React

### Decision 2: Keep as Client Components

**Decision**: Mantener todos los archivos como Client Components (`"use client"`).

**Alternatives Considered**:
1. **Convertir a Server Components**: Reduciría el JavaScript del cliente
2. **Hybrid approach**: Algunos Server, algunos Client

**Rationale**:
- Todos los archivos usan `useSession()`, `useSWR()`, y otros hooks del cliente
- Convertir a Server Components requeriría reescribir toda la lógica de fetching
- El beneficio de performance no justifica el esfuerzo de refactorización
- El error es específicamente de Next.js 16 params, no de la arquitectura

**Trade-offs**:
- ✅ Cambios mínimos
- ✅ Riesgo bajo
- ✅ Mantiene funcionalidad existente
- ❌ No aprovecha Server Components

### Decision 3: No caching strategy changes

**Decision**: Mantener SWR como está sin cambios en la estrategia de caching.

**Rationale**:
- El cambio de params no afecta cómo SWR maneja el cache
- El key del SWR sigue siendo el mismo (`/api/series/${id}`)
- No hay necesidad de cambiar la configuración de SWR

## Component Structure

### Before (Incorrect - Next.js 15)

```typescript
"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";

export default function SeriesPage({
  params,
}: {
  params: { id: string };  // ❌ Sync object
}) {
  const { data } = useSWR(`/api/series/${params.id}`, fetcher);
  //         params.id accessed directly ↑
}
```

### After (Correct - Next.js 16)

```typescript
"use client";

import { use } from "react";  // ✅ Import use
import { useSession } from "next-auth/react";
import useSWR from "swr";

export default function SeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;  // ✅ Promise type
}) {
  const { id } = use(params);  // ✅ Unwrap with use()
  const { data } = useSWR(`/api/series/${id}`, fetcher);
  //         id used directly ↑
}
```

## Error Handling

El manejo de errores no cambia con este refactor:

```typescript
// Loading state - handled by component logic
if (!seriesData && !seriesError) {
  return <Loading />;
}

// Error state - handled by component logic
if (!series) {
  return <Error />;
}
```

`React.use()` lanzará un error si la Promise es rechazada, pero en el caso de `params`, esto no debería ocurrir ya que el router garantiza que los params están disponibles.

## Performance Considerations

### Impact Analysis

| Aspect | Impact | Notes |
|--------|--------|-------|
| Initial render | Neutral | `use()` es síncrono en la práctica para params |
| Bundle size | Neutral | `use` ya está en React, no agrega código |
| Runtime performance | Neutral | Sin overhead significativo |
| Developer experience | Positive | Elimina warnings de consola |

### No Performance Regression

Este cambio es puramente sintáctico para adaptarse al nuevo API de Next.js 16:
- No cambia la lógica de fetching
- No cambia el comportamiento de caching
- No agrega latencia
- No aumenta el bundle size

## Testing Strategy

### What to Test

1. **Functional Testing**:
   - Navegación a rutas dinámicas funciona
   - Data fetching funciona
   - Reading progress se muestra correctamente

2. **Error Testing**:
   - Sin errores en consola
   - Build pasa sin warnings

3. **Integration Testing**:
   - SWR integration funciona
   - Session context funciona

### What NOT to Test

- Unit tests para el desempaquetado de params (es una transformación trivial)
- Performance tests (no hay cambios de performance)
- Server Component tests (no aplican)

## Migration Path

### For New Routes

Cuando se agreguen nuevas rutas dinámicas en el futuro:

```typescript
// Template para nuevos archivos
"use client";

import { use } from "react";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // ... resto del código
}
```

### For Multiple Params

Si se agregan rutas con múltiples params:

```typescript
export default function Page({
  params,
}: {
  params: Promise<{ seriesId: string; chapterId: string }>;
}) {
  const { seriesId, chapterId } = use(params);
  // ...
}
```

## Future Considerations

### Partial Prerendering

Este cambio prepara el código para **Partial Prerendering (PPR)** de Next.js 16:
- Los params como Promises permiten que el shell estático se renderice inmediatamente
- Los datos dinámicos (del id) se cargan de forma diferida
- No hay cambios adicionales necesarios para habilitar PPR en el futuro

### React 19 Compatibility

`React.use()` es parte de React 19, así que este cambio también mejora la compatibilidad con versiones futuras de React.

## References

- [Next.js 16 Sync Dynamic APIs](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [React 19 use() API](https://react.dev/reference/react/use)
- [Next.js Partial Prerendering](https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering)
