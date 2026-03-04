## Why

La lista de series en la página principal y el panel de creador está generando errores porque el API `/api/series` no filtra correctamente por `creatorId`, y además falta un estado vacío (empty state) más completo cuando no hay series disponibles.

## What Changes

- Agregar soporte para filtrar series por `creatorId` en el endpoint GET `/api/series`
- Mejorar el empty state en la página principal y panel de creador con diseño más completo
- Agregar manejo de errores más robusto en la carga de series

## Capabilities

### New Capabilities
- `series-filter-by-creator`: Agregar filtrado por creatorId en el API de series

### Modified Capabilities
- (ninguno - solo cambios de implementación)

## Impact

- API: `src/app/api/series/route.ts` - agregar filtro por creatorId
- Frontend: `src/app/page.tsx` - mejorar empty state
- Frontend: `src/app/creator/page.tsx` - mejorar empty state
