## Context

El endpoint `/api/series` actualmente no soporta el parámetro `creatorId` para filtrar series por creador. Cuando el panel de creador intenta obtener las series del usuario autenticado, el filtro es ignorado y retorna todas las series. Además, los estados vacíos (empty states) en las páginas principal y de creador son mínimos.

## Goals / Non-Goals

**Goals:**
- Agregar soporte para filtrar series por `creatorId` en `/api/series`
- Implementar empty state completo con Call-to-Action para crear primera serie

**Non-Goals:**
- No se modificará el modelo de datos
- No se agregará paginación

## Decisions

1. **Filtro por creatorId en el API**: Se agregará lectura del parámetro `creatorId` en el searchParams y se incluirá en el where de Prisma.
   
2. **Empty State mejorado**: Se mostrará un diseño más completo con icono, mensaje descriptivo y enlace para crear serie (en el panel de creador).

## Risks / Trade-offs

- [Riesgo] El filtro por creatorId podría exponer series si el usuario no está autenticado correctamente → Mitigación: El middleware ya protege las rutas de API

## Migration Plan

1. Modificar `src/app/api/series/route.ts` para agregar filtro creatorId
2. Actualizar empty state en `src/app/page.tsx`
3. Actualizar empty state en `src/app/creator/page.tsx`
4. Verificar que las páginas cargan correctamente
