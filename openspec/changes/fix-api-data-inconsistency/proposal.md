## Why

El sistema tiene inconsistencias críticas entre lo que las APIs retornan y lo que el frontend espera:

1. **Bug Crítico**: `/api/series/[id]` no incluye `chapters` en los volúmenes, causando `undefined.filter()` crash
2. **Riesgo Potencial**: Varios componentes frontend acceden a arrays sin optional chaining, vulnerables a cambios en APIs
3. **Inconsistencia**: `/api/series` (listado) incluye chapters, pero `/api/series/[id]` (detalle) no

Error actual:
```
TypeError: Cannot read properties of undefined (reading 'filter')
at volume.chapters.filter((ch) => ch.status === "APPROVED")
```

## What Changes

### Fase 1: Fix Crítico
- Modificar `/api/series/[id]` para incluir `chapters` en los volúmenes

### Fase 2: Defensive Frontend
- Agregar optional chaining en todos los `.map()`, `.filter()`, `.length` de arrays
- Seguir el patrón defensivo de la home page

### Fase 3: API Contract & Type Safety
- Definir contratos claros para cada API
- Crear tipos TypeScript compartidos
- Agregar validación de respuesta

## Capabilities

### New Capabilities
- `api-contracts`: Contratos tipados para todas las APIs públicas

### Modified Capabilities
- `series-detail-api`: Incluir chapters en la respuesta
- `frontend-data-handling`: Acceso defensivo a datos de APIs

## Impact

### Backend
- `src/app/api/series/[id]/route.ts` - Incluir chapters en volumes.include
- `src/types/api-responses.ts` - Nuevo archivo con tipos compartidos

### Frontend
- `src/app/series/[id]/page.tsx` - Optional chaining en volumes/chapters
- `src/app/creator/series/[id]/page.tsx` - Optional chaining en volumes
- `src/app/creator/volumes/[id]/page.tsx` - Optional chaining en chapters
- `src/app/creator/chapters/[id]/page.tsx` - Optional chaining en pages
- `src/app/read/[id]/page.tsx` - Optional chaining en pages

### Testing
- Validar que el build pasa sin errores
- Verificar manualmente todas las rutas afectadas
