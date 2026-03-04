## Why

La verificación de `res.headers.get("content-type")` en el cliente es innecesaria y propensa a errores. El servidor siempre debe retornar JSON válido y el manejo de errores debe ser más robusto para evitar crashes cuando el servidor retorna HTML (errores 404, 500).

## What Changes

- Crear un fetcher centralizado que maneje errores automáticamente
- Eliminar verificación manual de content-type en el cliente
- El servidor debe siempre retornar JSON válido (incluyendo errores)
- Estandarizar el manejo de respuestas HTTP en toda la app

## Capabilities

### New Capabilities
- `centralized-fetcher`: Fetcher reutilizable con manejo de errores robusto

### Modified Capabilities
- `profile-page-ui`: Actualizar para usar el fetcher centralizado

## Impact

- Nuevo: `src/lib/fetcher.ts` (mejoras)
- Frontend: `src/app/profile/page.tsx` - actualizar para usar fetcher
- Backend: Todos los endpoints deben retornar JSON válido
