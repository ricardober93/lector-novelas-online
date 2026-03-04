# Autenticación - Spec

## Capability

Sistema de autenticación de usuarios mediante email magic link, permitiendo dos roles: lectores y creadores.

## Requisitos Funcionales

### RF-1: Registro de Usuarios

**Descripción:** Usuarios nuevos pueden registrarse proporcionando su email.

**Criterios de Aceptación:**
- GIVEN un usuario no registrado
- WHEN ingresa su email en el formulario de registro
- THEN recibe un email con un magic link válido por 24 horas
- AND el link redirige al usuario a la home logueado
- AND se crea un registro en la tabla `users` con rol `READER`

**Flujo:**
```
Usuario → Email → Backend genera token → Resend envía email → 
Usuario click link → Backend valida token → Crea sesión → Home
```

### RF-2: Login de Usuarios

**Descripción:** Usuarios existentes pueden loguearse con su email.

**Criterios de Aceptación:**
- GIVEN un usuario ya registrado
- WHEN ingresa su email en el formulario de login
- THEN recibe un magic link
- AND el link redirige a la home con sesión activa

**Nota:** No hay diferencia entre registro y login - si el email no existe, se crea usuario automáticamente.

### RF-3: Logout

**Descripción:** Usuarios pueden cerrar sesión.

**Criterios de Aceptación:**
- GIVEN un usuario logueado
- WHEN hace click en "Cerrar sesión"
- THEN la sesión se invalida
- AND es redirigido a la home pública

### RF-4: Roles de Usuario

**Descripción:** Sistema soporta dos roles principales: `READER` y `CREATOR`.

**Criterios de Aceptación:**
- `READER`: Puede leer contenido, gestionar historial, configurar preferencias
- `CREATOR`: Todo lo de READER + crear/editar series, volúmenes, capítulos
- Los roles se asignan manualmente por admin (inicialmente)
- Futuro: proceso de solicitud para ser creador

### RF-5: Preferencias de Usuario

**Descripción:** Usuarios pueden configurar preferencias en su perfil.

**Criterios de Aceptación:**
- GIVEN un usuario logueado
- WHEN accede a su perfil
- THEN puede togglear "Mostrar contenido adulto (+18)"
- AND la preferencia se guarda en `user.showAdult`
- AND afecta qué contenido ve en home y búsquedas

## Requisitos No Funcionales

### RNF-1: Seguridad

- Tokens de magic link expiran en 24 horas
- Tokens son single-use (se invalidan después de usar)
- Sesiones expiran después de 7 días de inactividad
- HTTPS obligatorio en producción
- NEXTAUTH_SECRET debe ser un secret fuerte (256 bits)

### RNF-2: Usabilidad

- Email se envía en menos de 10 segundos
- Magic link es clickable directamente desde el email
- Email tiene diseño responsive y minimalista
- Usuario ve feedback claro: "Email enviado, revisa tu bandeja"
- Usuario puede solicitar reenvío después de 60 segundos

### RNF-3: Disponibilidad

- Sistema de autenticación tiene 99.9% uptime
- Fallback: si Resend falla, mostrar mensaje de error claro
- Rate limiting: máximo 5 emails por hora por IP

## API Endpoints

### POST /api/auth/signin

Envía magic link al email proporcionado.

**Request:**
```json
{
  "email": "usuario@email.com"
}
```

**Response (200):**
```json
{
  "message": "Email enviado exitosamente"
}
```

**Response (429):**
```json
{
  "error": "Demasiados intentos, espera 60 segundos"
}
```

### GET /api/auth/verify?token={token}

Verifica magic link y crea sesión.

**Response (302):**
- Redirect a `/` con sesión activa

**Response (400):**
```json
{
  "error": "Token inválido o expirado"
}
```

### POST /api/auth/signout

Cierra la sesión actual.

**Response (200):**
```json
{
  "message": "Sesión cerrada"
}
```

### GET /api/auth/session

Obtiene información de la sesión actual.

**Response (200):**
```json
{
  "user": {
    "id": "clx123456",
    "email": "usuario@email.com",
    "role": "READER",
    "showAdult": false
  }
}
```

### PATCH /api/user/preferences

Actualiza preferencias del usuario.

**Request:**
```json
{
  "showAdult": true
}
```

**Response (200):**
```json
{
  "user": {
    "id": "clx123456",
    "showAdult": true
  }
}
```

## Componentes de UI

### LoginForm

**Props:**
- `mode: 'signin' | 'signup'` (opcional, default: 'signin')

**Estado:**
- `email: string`
- `loading: boolean`
- `error: string | null`
- `emailSent: boolean`

**Comportamiento:**
1. Usuario ingresa email
2. Click en "Enviar magic link"
3. Muestra "Email enviado" con instrucciones
4. Usuario click en link del email
5. Redirect a home logueado

### UserProfile

**Props:**
- `user: User`

**Funcionalidades:**
- Mostrar email
- Toggle "Mostrar contenido adulto"
- Ver historial de lectura (últimos 5)
- Botón "Cerrar sesión"

## Integración con NextAuth.js

### Configuración

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import Resend from "next-auth/providers/resend"

const handler = NextAuth({
  providers: [
    Resend({
      from: "noreply@panels.lat",
      server: process.env.RESEND_API_KEY!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Crear usuario en DB si no existe
      await prisma.user.upsert({
        where: { email: user.email! },
        update: {},
        create: {
          email: user.email!,
          role: "READER",
        },
      })
      return true
    },
    async session({ session, user }) {
      // Agregar rol y preferencias a la sesión
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      })
      return {
        ...session,
        user: {
          ...session.user,
          id: dbUser.id,
          role: dbUser.role,
          showAdult: dbUser.showAdult,
        },
      }
    },
  },
})

export { handler as GET, handler as POST }
```

### Middleware

```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export const config = {
  matcher: [
    "/creator/:path*",
    "/api/series/:path*",
    "/api/chapters/:path*",
    "/api/user/:path*",
  ],
}
```

## Email Template

### Magic Link Email

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .button {
      background-color: #000;
      color: #fff;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 8px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <h1>Ingresar a Panels</h1>
  <p>Haz click en el siguiente enlace para ingresar a tu cuenta:</p>
  <a href="{{magic_link}}" class="button">Ingresar a Panels</a>
  <p><small>Este enlace expira en 24 horas.</small></p>
  <p><small>Si no solicitaste este email, puedes ignorarlo.</small></p>
</body>
</html>
```

## Testing

### Tests de Integración

1. **Registro exitoso:**
   - POST /api/auth/signin con email nuevo
   - Verificar email enviado
   - GET /api/auth/verify con token
   - Verificar sesión creada

2. **Login exitoso:**
   - POST /api/auth/signin con email existente
   - Verificar email enviado
   - GET /api/auth/verify con token
   - Verificar sesión creada

3. **Token expirado:**
   - GET /api/auth/verify con token expirado
   - Verificar error 400

4. **Token ya usado:**
   - GET /api/auth/verify con token ya usado
   - Verificar error 400

5. **Rate limiting:**
   - POST /api/auth/signin 6 veces seguidas
   - Verificar error 429 en la 6ta

6. **Preferencias:**
   - PATCH /api/user/preferences con showAdult: true
   - Verificar en GET /api/auth/session

## Métricas

### Monitoreo

- Tasa de entrega de emails (debe ser > 98%)
- Tiempo de entrega de emails (debe ser < 10s)
- Tasa de conversión (emails enviados → logins exitosos)
- Distribución de roles (% READER vs % CREATOR)
- Errores de autenticación (debe ser < 1%)

### Alertas

- Si tasa de entrega < 95%
- Si tiempo de entrega > 30s
- Si errores de autenticación > 5% en 1 hora

## Dependencias

- NextAuth.js (^4.24.0)
- Resend SDK (^2.0.0)
- Prisma Client (^5.0.0)

## Configuración

### Variables de Entorno

```bash
# .env.local
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=re_xxxxx
DATABASE_URL=postgresql://...
```

### Resend Setup

1. Crear cuenta en resend.com
2. Verificar dominio panels.lat
3. Configurar DNS records
4. Obtener API key
5. Configurar webhook para tracking (opcional)
