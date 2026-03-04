## Context

El middleware actual usa `getToken({ req: request })` de next-auth/jwt. Sin embargo, con estrategia de sesión "database", el token JWT no está disponible en las cookies porque next-auth usa una cookie de sesión de base de datos en lugar de JWT.

## Goals / Non-Goals

**Goals:**
- Hacer que el middleware funcione correctamente con sesiones de base de datos
- Permitir que usuarios autenticados accedan a /api/user y /profile
- Dar rol ADMIN a ribermudezt@gmail.com

**Non-Goals:**
- No cambiar la estrategia de sesión (mantener database)

## Decisions

1. **Usar getAuth en middleware**: Next-auth proporciona `getAuth` que puede leer la sesión de la cookie de sesión de next-auth, independientemente de la estrategia.

2. **Alternativa: generar JWT**: Another option is to generate JWT in callbacks for token, but getAuth is simpler.

## Migration Plan

1. Modificar middleware para usar getAuth de next-auth/react
2. Actualizar rol de usuario en BD usando Prisma Studio o script
3. Verificar que /api/user retorna datos correctamente
