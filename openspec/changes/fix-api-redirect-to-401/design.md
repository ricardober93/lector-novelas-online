## Context

El middleware actual:
- Rutas protegidas: `/creator`, `/read`, `/api/series`, `/api/chapters`, `/api/user`
- Si no hay token, redirige a /login (NextResponse.redirect)

Problema: Para rutas API (/api/*), el redirect causa que el cliente reciba HTML en lugar de JSON.

## Goals / Non-Goals

**Goals:**
- Rutas API deben retornar 401 con JSON { error: "No autorizado" }
- Rutas de página (/creator, /read) siguen redirigiendo a /login

**Non-Goals:**
- No cambiar la lógica de rutas de admin

## Decisions

1. **Separar lógica de API vs páginas**: Verificar si la ruta startsWith "/api/" y retornar 401 JSON.

## Migration Plan

1. Modificar middleware para detectar rutas API
2. Retornar NextResponse.json({ error: "No autorizado" }, { status: 401 }) para APIs sin auth
3. Mantener redirect para rutas de página
