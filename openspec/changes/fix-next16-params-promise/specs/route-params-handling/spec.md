# Spec: Route Params Handling

## Overview

Especificación para el manejo correcto de parámetros de ruta dinámicos en Next.js 16, donde `params` es una Promise que debe ser desempaquetada antes de su uso.

## Technical Requirements

### TR-1: Tipo de Params como Promise

**Requisito**: Todos los componentes de página con rutas dinámicas deben declarar `params` como `Promise<T>`.

**Rationale**: Next.js 16 cambia el modelo de renderizado para soportar Partial Prerendering, haciendo que los params sean asíncronos.

**Acceptance Criteria**:
- [ ] Tipo cambiado de `params: { id: string }` a `params: Promise<{ id: string }>`
- [ ] Sin errores de TypeScript
- [ ] Build exitoso

### TR-2: Desempaquetado con React.use()

**Requisito**: Los params deben ser desempaquetados usando `React.use()` antes de acceder a sus propiedades.

**Rationale**: `React.use()` es la API de React para consumir Promises en componentes, permitiendo que React maneje el estado de loading automáticamente.

**Acceptance Criteria**:
- [ ] Importar `use` de `"react"`
- [ ] Usar `const { id } = use(params)` al inicio del componente
- [ ] Acceder a `id` directamente, no a `params.id`
- [ ] Sin warnings en consola

### TR-3: Compatibilidad con SWR

**Requisito**: El id desempaquetado debe funcionar correctamente con hooks de SWR.

**Rationale**: SWR usa el key como dependencia. Si el key cambia correctamente, el fetching debe funcionar.

**Acceptance Criteria**:
- [ ] SWR hooks reciben el id desempaquetado en el key
- [ ] Fetching funciona correctamente
- [ ] No hay requests duplicados o innecesarios

## Implementation Details

### Patrón Actual (Incorrecto)

```typescript
export default function Page({
  params,
}: {
  params: { id: string };
}) {
  const { data } = useSWR(`/api/resource/${params.id}`, fetcher);
  // ...
}
```

### Patrón Nuevo (Correcto)

```typescript
import { use } from "react";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data } = useSWR(`/api/resource/${id}`, fetcher);
  // ...
}
```

## Files Affected

| File | Route Pattern | Params Used |
|------|---------------|-------------|
| `src/app/series/[id]/page.tsx` | `/series/:id` | `id` |
| `src/app/read/[id]/page.tsx` | `/read/:id` | `id` |
| `src/app/creator/chapters/[id]/page.tsx` | `/creator/chapters/:id` | `id` |
| `src/app/creator/volumes/[id]/page.tsx` | `/creator/volumes/:id` | `id` |
| `src/app/creator/series/[id]/page.tsx` | `/creator/series/:id` | `id` |

## Edge Cases

### EC-1: Múltiples params dinámicos

Si en el futuro se agregan rutas con múltiples params (ej: `/series/[seriesId]/chapters/[chapterId]`):

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

### EC-2: Uso en Server Components

En Server Components (sin `"use client"`), también se debe usar `await`:

```typescript
// Server Component
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // ...
}
```

**Nota**: Todos los archivos afectados actualmente son Client Components.

## Testing Strategy

### Manual Testing
1. Navegar a cada ruta dinámica
2. Verificar que no hay errores en consola
3. Verificar que el contenido carga correctamente
4. Verificar que SWR fetching funciona

### Automated Testing
- [ ] Ejecutar `npm run build` - debe pasar sin errores
- [ ] Ejecutar `npm run lint` - debe pasar sin warnings nuevos

## Migration Checklist

Para cada archivo afectado:
- [ ] Importar `use` de `"react"`
- [ ] Cambiar tipo de `params` a `Promise<{ id: string }>`
- [ ] Agregar `const { id } = use(params)` al inicio del componente
- [ ] Reemplazar todas las instancias de `params.id` por `id`
- [ ] Verificar que no hay otros usos de `params` que necesiten ajuste

## References

- [Next.js 16 Sync Dynamic APIs](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [React.use() API](https://react.dev/reference/react/use)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading)
