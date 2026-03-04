## Context

El código actual en profile/page.tsx verifica `res.headers.get("content-type")` antes de parsear JSON. Esta verificación es innecesaria porque:
1. Si el servidor retorna error HTML, ya deberíamos manejarlo en el servidor
2. El cliente no debe confiar en content-type, debe intentar parsear y capturar errores

## Goals / Non-Goals

**Goals:**
- Eliminar verificación de content-type en el cliente
- Mejorar el fetcher centralizado para manejo automático de errores
- Estandarizar respuestas JSON en todos los endpoints

**Non-Goals:**
- No agregar validación de schema
- No cambiar la arquitectura de autenticación

## Decisions

1. **Mejorar fetcher existente**: En lugar de crear uno nuevo, mejorar `src/lib/fetcher.ts` existente.

2. **El fetcher debe manejar**: 
   - Verificar res.ok
   - Intentar parsear JSON
   - Si falla, intentar obtener texto del error y crear error informativo

3. **Eliminar verificación manual en profile**: Usar el fetcher mejorado directamente.

## Risks / Trade-offs

- [Riesgo] El fetcher podría no manejar todos los casos → Mitigation: Logging detallado

## Migration Plan

1. Mejorar `src/lib/fetcher.ts` con manejo robusto
2. Actualizar `src/app/profile/page.tsx` para usar fetcher
3. Verificar que build funciona
