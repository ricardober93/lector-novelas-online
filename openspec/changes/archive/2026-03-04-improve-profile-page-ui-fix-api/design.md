## Context

La página de perfil actual usa estilos inline básicos y no tiene un endpoint API funcional. El error "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" indica que `/api/user` retorna 404 HTML en lugar de JSON.

## Goals / Non-Goals

**Goals:**
- Crear endpoint `/api/user` que retorne JSON válido
- Mejorar UI de perfil con Tailwind CSS consistente
- Agregar manejo de errores robusto
- Usar NextAuth session para obtener datos del usuario

**Non-Goals:**
- No agregar validación de avatar URL (se aceptará cualquier URL)
- No crear sistema de notificaciones (por ahora)

## Decisions

1. **API usa NextAuth session**: En lugar de crear un modelo de usuario adicional, usaremos la sesión existente de NextAuth para obtener email, nombre e imagen.

2. **GET /api/user retorna datos de sesión**: Retornará `{ name, email, image }` de la sesión actual.

3. **PUT /api/user permite actualizar perfil**: Por ahora solo retornará éxito, no almacenaremos bio/notificaciones en BD.

4. **UI mejorada con Tailwind**: Usar mismos estilos que otras páginas del proyecto (cards, inputs con clases de Tailwind).

## Risks / Trade-offs

- [Riesgo] La sesión de NextAuth puede no tener todos los datos → Mitigation: Verificar session existe, retornar datos disponibles

## Migration Plan

1. Crear `src/app/api/user con GET/route.ts` y PUT
2. Actualizar `src/app/profile/page.tsx` con UI mejorada
3. Probar que el perfil carga sin errores JSON
