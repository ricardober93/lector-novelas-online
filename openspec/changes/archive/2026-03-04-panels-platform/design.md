# Panels - Diseño Técnico

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA PANELS                          │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   VERCEL        │
                    │   Edge Network  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────▼────────┐     │     ┌───────▼──────────┐
    │   Next.js 14     │     │     │  Vercel Blob     │
    │   App Router     │     │     │  (Images)        │
    │                  │     │     │                  │
    │  - Pages         │     │     │  - Cover images  │
    │  - API Routes    │     │     │  - Chapter pages │
    │  - Server Comp   │     │     │  - Optimized     │
    └────────┬─────────┘     │     └──────────────────┘
             │               │
    ┌────────▼────────────────▼─────────┐
    │         Prisma ORM                │
    │         (Type-safe queries)       │
    └────────┬──────────────────────────┘
             │
    ┌────────▼─────────┐
    │   Neon DB        │
    │   (PostgreSQL)   │
    │                  │
    │  - Users         │
    │  - Series        │
    │  - Volumes       │
    │  - Chapters      │
    │  - Pages         │
    │  - History       │
    └──────────────────┘
```

## Modelo de Datos

### Schema Prisma

```prisma
// Esquema conceptual (no es código final)

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  role          Role      @default(READER)
  showAdult     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  series        Series[]
  readingHistory ReadingHistory[]
  moderations   Moderation[]
}

enum Role {
  READER
  CREATOR
  ADMIN
}

model Series {
  id            String    @id @default(cuid())
  creatorId     String
  title         String
  description   String?
  type          ContentType
  isAdult       Boolean   @default(false)
  status        SeriesStatus @default(DRAFT)
  coverImage    String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  creator       User      @relation(fields: [creatorId], references: [id])
  volumes       Volume[]
  moderations   Moderation[]
}

enum ContentType {
  MANGA
  COMIC
  MANHUA
  VISUAL_NOVEL
  OTHER
}

enum SeriesStatus {
  DRAFT
  ACTIVE
  COMPLETED
  SUSPENDED
}

model Volume {
  id            String    @id @default(cuid())
  seriesId      String
  number        Int
  title         String?
  createdAt     DateTime  @default(now())
  
  series        Series    @relation(fields: [seriesId], references: [id])
  chapters      Chapter[]
  
  @@unique([seriesId, number])
}

model Chapter {
  id            String    @id @default(cuid())
  volumeId      String
  number        Int
  title         String?
  pageCount     Int       @default(0)
  status        ChapterStatus @default(PENDING)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  volume        Volume    @relation(fields: [volumeId], references: [id])
  pages         Page[]
  readingHistory ReadingHistory[]
  moderations   Moderation[]
  
  @@unique([volumeId, number])
}

enum ChapterStatus {
  PENDING     // En moderación
  APPROVED    // Aprobado y visible
  REJECTED    // Rechazado por moderador
}

model Page {
  id            String    @id @default(cuid())
  chapterId     String
  number        Int
  imageUrl      String
  width         Int?
  height        Int?
  
  chapter       Chapter   @relation(fields: [chapterId], references: [id])
  
  @@unique([chapterId, number])
}

model ReadingHistory {
  id            String    @id @default(cuid())
  userId        String
  chapterId     String
  lastPage      Int       @default(1)
  progress      Float     @default(0)
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id])
  chapter       Chapter   @relation(fields: [chapterId], references: [id])
  
  @@unique([userId, chapterId])
}

model Moderation {
  id            String    @id @default(cuid())
  seriesId      String?
  chapterId     String?
  status        ModerationStatus @default(PENDING)
  reviewerId    String?
  notes         String?
  createdAt     DateTime  @default(now())
  reviewedAt    DateTime?
  
  reviewer      User?     @relation(fields: [reviewerId], references: [id])
  series        Series?   @relation(fields: [seriesId], references: [id])
  chapter       Chapter?  @relation(fields: [chapterId], references: [id])
}

enum ModerationStatus {
  PENDING
  APPROVED
  REJECTED
}
```

## Autenticación

### Flujo Magic Link con NextAuth.js + Resend

```
┌─────────────────────────────────────────────────────────────────┐
│          FLUJO DE AUTENTICACIÓN                                 │
└─────────────────────────────────────────────────────────────────┘

    1. Usuario ingresa email
       ┌──────────────────┐
       │ usuario@email.com│
       │ [Enviar Link]    │
       └────────┬─────────┘
                │
    2. Backend genera token y envía email
       ┌─────────────────────────────────┐
       │ Email de Resend:                │
       │                                 │
       │ "Click aquí para ingresar a     │
       │  Panels: [LINK]"                │
       │                                 │
       │ Link: panels.lat/auth/verify?   │
       │       token=abc123              │
       └────────┬────────────────────────┘
                │
    3. Usuario hace click
       ┌─────────────────────────────────┐
       │ NextAuth valida token           │
       │ Crea sesión                     │
       │ Redirige a home                 │
       └─────────────────────────────────┘
```

### Configuración NextAuth

```typescript
// Concepto de configuración
import NextAuth from "next-auth"
import Resend from "next-auth/providers/resend"

export const authOptions = {
  providers: [
    Resend({
      from: "noreply@panels.lat",
      server: process.env.RESEND_API_KEY,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Crear usuario en DB si no existe
      return true
    },
  },
}
```

## Upload de Contenido

### Proceso de Upload

```
┌─────────────────────────────────────────────────────────────────┐
│          UPLOAD DE CAPÍTULO                                     │
└─────────────────────────────────────────────────────────────────┘

    FRONTEND                        BACKEND
    ─────────                       ───────
    
    1. Usuario selecciona archivo
       ┌──────────────────┐
       │ 📁 capitulo.zip  │
       │ (20 imágenes)    │
       └────────┬─────────┘
                │
    2. Upload a API Route
       POST /api/chapters/upload
       ┌──────────────────┐
       │ FormData:        │
       │ - file: ZIP      │
       │ - volumeId: 123  │
       │ - number: 5      │
       └────────┬─────────┘
                │
    3. Backend procesa
       ┌─────────────────────────────────┐
       │ a. Descomprimir ZIP             │
       │ b. Validar imágenes:            │
       │    - Formato (JPG, PNG, WebP)   │
       │    - Tamaño (< 10MB c/u)        │
       │ c. Ordenar por nombre           │
       │ d. Optimizar cada imagen:       │
       │    - Resize si muy grande       │
       │    - Comprimir (80% quality)    │
       │ e. Upload a Vercel Blob         │
       │ f. Crear registros en DB        │
       │    - Chapter                    │
       │    - Pages (20 registros)       │
       │ g. Crear moderación pendiente   │
       └────────┬────────────────────────┘
                │
    4. Response al frontend
       ┌──────────────────┐
       │ {                │
       │   success: true, │
       │   chapterId: 456 │
       │ }                │
       └──────────────────┘
```

### Alternativa: Drag & Drop de Imágenes

```
    FRONTEND                        BACKEND
    ─────────                       ───────
    
    1. Usuario arrastra imágenes
       ┌──────────────────┐
       │ 🖼️ 1.jpg         │
       │ 🖼️ 2.jpg         │
       │ 🖼️ 3.jpg         │
       │ ...              │
       └────────┬─────────┘
                │
    2. Upload secuencial
       POST /api/pages/upload
       (una por una con orden)
       ┌──────────────────┐
       │ FormData:        │
       │ - file: imagen   │
       │ - chapterId: 456 │
       │ - number: 1      │
       └────────┬─────────┘
                │
    3. Backend procesa cada una
       ┌─────────────────────────────────┐
       │ a. Validar imagen               │
       │ b. Optimizar                    │
       │ c. Upload a Blob                │
       │ d. Crear registro Page          │
       └────────┬────────────────────────┘
                │
    4. Response incremental
       ┌──────────────────┐
       │ Progress: 1/20   │
       │ Progress: 2/20   │
       │ ...              │
       └──────────────────┘
```

## Lector de Capítulos

### Scroll Infinito con Lazy Loading

```
┌─────────────────────────────────────────────────────────────────┐
│          LECTOR - SCROLL INFINITO                               │
└─────────────────────────────────────────────────────────────────┘

    ESTRATEGIA DE CARGA:
    ────────────────────
    
    Viewport
    ┌─────────────────────────────┐
    │                             │
    │  [Página 8]  ← Cargada     │
    │                             │
    │  [Página 9]  ← Cargada     │
    │                             │
    │  [Página 10] ← Cargada     │
    │                             │
    └─────────────────────────────┘
         [Página 11] ← Prefetch
         [Página 12] ← Prefetch
         [Página 13] ← No cargar
         [Página 14] ← No cargar
    
    IMPLEMENTACIÓN:
    ───────────────
    
    1. Intersection Observer para detectar visibilidad
    2. Cargar imagen cuando está a 2 páginas de distancia
    3. Lazy loading nativo: <img loading="lazy" />
    4. Placeholder mientras carga (blur hash o skeleton)
```

### Componente de Página

```typescript
// Concepto de componente
function ChapterPage({ page, index }: { page: Page; index: number }) {
  const [loaded, setLoaded] = useState(false)
  
  return (
    <div className="page-container">
      {!loaded && <Skeleton />}
      <img
        src={page.imageUrl}
        alt={`Página ${page.number}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={loaded ? 'visible' : 'hidden'}
      />
    </div>
  )
}
```

### Tracking de Progreso

```
    FLUJO DE HISTORIAL:
    ───────────────────
    
    1. Usuario abre capítulo
       → Crear/actualizar ReadingHistory
       → lastPage = 1, progress = 0%
    
    2. Usuario hace scroll
       → Intersection Observer detecta página visible
       → Actualizar lastPage cada 3 páginas
       → Calcular progress = (lastPage / totalPages) * 100
    
    3. Usuario cierra tab/navega
       → Guardar última posición
       → Actualizar progress final
```

## Moderación de Contenido

### Flujo de Moderación

```
┌─────────────────────────────────────────────────────────────────┐
│          MODERACIÓN                                             │
└─────────────────────────────────────────────────────────────────┘

    ESTADOS DE CAPÍTULO:
    ────────────────────
    
    PENDING → APPROVED → Visible público
           ↘ REJECTED → No visible (feedback al creador)
    
    PANEL DE ADMIN:
    ────────────────
    
    ┌─────────────────────────────────────┐
    │ Cola de moderación (5 pendientes)  │
    ├─────────────────────────────────────┤
    │                                     │
    │ "Mi Manga" V1 C5 - hace 2 horas    │
    │ [Previsualizar] [Aprobar] [Rechazar]│
    │                                     │
    │ "Otro Manga" V2 C3 - hace 5 horas  │
    │ [Previsualizar] [Aprobar] [Rechazar]│
    │                                     │
    └─────────────────────────────────────┘
    
    CRITERIOS DE RECHAZO:
    ────────────────────
    • Contenido ilegal (copyrighted sin permiso)
    • Contenido violento extremo sin tag +18
    • Spam o contenido no relacionado
    • Calidad muy baja (imágenes ilegibles)
```

## Publicidad

### Integración de Ads

```
┌─────────────────────────────────────────────────────────────────┐
│          PUBLICIDAD                                             │
└─────────────────────────────────────────────────────────────────┘

    UBICACIÓN:
    ──────────
    
    Lector:
    ┌─────────────────────────────┐
    │ [Página 1]                  │
    │ [Página 2]                  │
    │ [Página 3]                  │
    │ [Página 4]                  │
    │ [Página 5]                  │
    ├─────────────────────────────┤
    │ 📢 AD BANNER                │ ← Cada 5 páginas
    ├─────────────────────────────┤
    │ [Página 6]                  │
    │ [Página 7]                  │
    │ ...                         │
    └─────────────────────────────┘
    
    IMPLEMENTACIÓN:
    ───────────────
    
    • Google AdSense (inicial)
    • Componente <AdBanner /> insertado dinámicamente
    • Frecuencia configurable (actualmente cada 5 páginas)
    
    FUTURO:
    ────────
    • Considerar modelo premium sin ads
    • Revenue share con creadores populares
```

## Optimizaciones de Rendimiento

### Images

```
    ESTRATEGIA:
    ───────────
    
    1. Compresión automática en upload
       - Quality: 80%
       - Max width: 1200px
       - Format: WebP cuando sea posible
    
    2. Lazy loading nativo
       - loading="lazy" en <img>
       - Intersection Observer para prefetch
    
    3. Responsive images
       - srcset con múltiples tamaños
       - Mobile: 400px width
       - Desktop: 800px width
    
    4. Caching agresivo
       - Cache-Control headers
       - CDN de Vercel
       - Service Worker para offline (futuro)
```

### Database

```
    ÍNDICES IMPORTANTES:
    ────────────────────
    
    • User.email (unique)
    • Series.creatorId
    • Volume.seriesId
    • Chapter.volumeId
    • Page.chapterId + Page.number
    • ReadingHistory.userId + ReadingHistory.chapterId
    
    QUERIES OPTIMIZADAS:
    ────────────────────
    
    • Prisma select específico (no traer todo)
    • Paginación en listados
    • Joins mínimos
```

## Seguridad

### Consideraciones

```
    1. AUTENTICACIÓN:
       ───────────────
       • Tokens seguros (JWT con secret)
       • Sesiones con expiración (7 días)
       • HTTPS obligatorio
    
    2. UPLOAD:
       ─────────
       • Validación de tipo de archivo (magic numbers)
       • Límite de tamaño (50MB por ZIP)
       • Sanitización de nombres de archivo
       • Rate limiting (10 uploads/hora por creador)
    
    3. CONTENIDO:
       ───────────
       • Moderación antes de publicar
       • Reportes de usuarios (futuro)
       • Content Security Policy (CSP)
    
    4. DATABASE:
       ──────────
       • Prisma previene SQL injection
       • Conexiones SSL
       • Backups automáticos (Neon)
```

## Escalabilidad

### Crecimiento Esperado

```
    FASE 1 (MVP - 3 meses):
    ───────────────────────
    • 100 usuarios
    • 10 creadores
    • 20 series
    • 500 capítulos
    • 10,000 páginas
    
    Storage: ~5GB
    Database: ~100MB
    
    FASE 2 (6 meses):
    ──────────────────
    • 1,000 usuarios
    • 50 creadores
    • 100 series
    • 2,500 capítulos
    • 50,000 páginas
    
    Storage: ~25GB
    Database: ~500MB
    
    FASE 3 (1 año):
    ───────────────
    • 10,000 usuarios
    • 200 creadores
    • 500 series
    • 12,500 capítulos
    • 250,000 páginas
    
    Storage: ~125GB
    Database: ~2GB
    
    COSTOS ESTIMADOS (Vercel + Neon):
    ─────────────────────────────────
    • Fase 1: Free tier suficiente
    • Fase 2: ~$20-50/mes
    • Fase 3: ~$100-200/mes
```

## Despliegue

### CI/CD con Vercel

```
    FLUJO:
    ──────
    
    main branch → Deploy automático a producción
    develop branch → Deploy a preview
    
    VARIABLES DE ENTORNO:
    ────────────────────
    
    • DATABASE_URL (Neon)
    • RESEND_API_KEY
    • NEXTAUTH_SECRET
    • NEXTAUTH_URL
    • BLOB_READ_WRITE_TOKEN (Vercel)
```
