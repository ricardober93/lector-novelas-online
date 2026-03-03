# Panels - Tareas de Implementación

## Fase 1: Setup Inicial (Semana 1-2)

### 1.1 Proyecto y Configuración

- [ ] Crear proyecto Next.js 14 con App Router
  ```bash
  npx create-next-app@latest panels --typescript --tailwind --app
  ```

- [ ] Configurar TypeScript
  - Strict mode habilitado
  - Paths absolutos (@/)

- [ ] Configurar Tailwind CSS
  - Tema base (colores, tipografía)
  - Utility classes para componentes comunes

- [ ] Setup de Git
  - Inicializar repositorio
  - Configurar .gitignore
  - Branches: main, develop

- [ ] Configurar ESLint y Prettier
  - Reglas de Next.js
  - Reglas de TypeScript
  - Auto-format on save

### 1.2 Base de Datos

- [ ] Crear cuenta en Neon
  - Obtener connection string

- [ ] Configurar Prisma
  ```bash
  npm install prisma @prisma/client
  npx prisma init
  ```

- [ ] Definir schema completo
  - models: User, Series, Volume, Chapter, Page, ReadingHistory, Moderation
  - enums: Role, ContentType, SeriesStatus, ChapterStatus, ModerationStatus
  - relations e índices

- [ ] Ejecutar migración inicial
  ```bash
  npx prisma migrate dev --name init
  ```

- [ ] Generar Prisma Client
  ```bash
  npx prisma generate
  ```

### 1.3 Autenticación

- [ ] Crear cuenta en Resend
  - Verificar dominio (desarrollo: localhost)
  - Obtener API key

- [ ] Instalar NextAuth.js
  ```bash
  npm install next-auth @auth/prisma-adapter
  ```

- [ ] Configurar NextAuth
  - Provider: Resend (magic link)
  - Adapter: Prisma
  - Callbacks: signIn, session

- [ ] Crear API routes
  - app/api/auth/[...nextauth]/route.ts
  - app/api/auth/signin/route.ts
  - app/api/auth/signout/route.ts

- [ ] Crear UI de login
  - Componente LoginForm
  - Página /login
  - Manejo de estados (loading, error, emailSent)

- [ ] Configurar middleware
  - Proteger rutas /creator/*
  - Proteger API routes /api/series/*, /api/chapters/*

- [ ] Testing de auth
  - Flujo completo de magic link
  - Creación de usuarios
  - Sesiones

## Fase 2: CRUD de Contenido (Semana 3-4)

### 2.1 Modelos de Series

- [ ] API routes para series
  - GET /api/series (listar todas)
  - GET /api/series/[id] (detalle)
  - POST /api/series (crear)
  - PATCH /api/series/[id] (actualizar)
  - DELETE /api/series/[id] (soft delete)

- [ ] Componentes de UI para series
  - SeriesCard (preview en home)
  - SeriesList (grid de series)
  - SeriesDetail (página de serie individual)
  - SeriesForm (crear/editar)

### 2.2 Modelos de Volúmenes

- [ ] API routes para volúmenes
  - GET /api/volumes (listar por serie)
  - GET /api/volumes/[id] (detalle)
  - POST /api/volumes (crear)
  - PATCH /api/volumes/[id] (actualizar)
  - DELETE /api/volumes/[id] (soft delete)

- [ ] Componentes de UI para volúmenes
  - VolumeCard
  - VolumeList
  - VolumeForm

### 2.3 Modelos de Capítulos

- [ ] API routes para capítulos
  - GET /api/chapters/[id] (detalle con páginas)
  - POST /api/chapters (crear sin páginas)
  - PATCH /api/chapters/[id] (actualizar metadata)
  - DELETE /api/chapters/[id] (soft delete)

- [ ] Componentes de UI para capítulos
  - ChapterCard
  - ChapterList
  - ChapterMetadataForm (sin páginas aún)

### 2.4 Panel de Creador

- [ ] Dashboard de creador
  - Lista de mis series
  - Estadísticas básicas (views, capítulos)
  - Acciones rápidas

- [ ] Flujo de creación de serie
  - Step 1: Info de serie (título, descripción, tipo, +18)
  - Step 2: Crear primer volumen
  - Step 3: Subir capítulos (placeholder para fase 3)

## Fase 3: Upload de Imágenes (Semana 5-6)

### 3.1 Configuración de Storage

- [ ] Configurar Vercel Blob
  - Obtener BLOB_READ_WRITE_TOKEN
  - Crear bucket para imágenes

- [ ] Instalar dependencias
  ```bash
  npm install @vercel/blob sharp adm-zip file-type
  ```

### 3.2 Procesamiento de Imágenes

- [ ] Crear utilidades de procesamiento
  - validateImage() - validar formato y tamaño
  - optimizeImage() - redimensionar y comprimir
  - uploadToBlob() - subir a Vercel Blob

- [ ] Crear utilidades de ZIP
  - extractZip() - descomprimir ZIP
  - validateZipContents() - validar imágenes dentro

### 3.3 API de Upload

- [ ] POST /api/chapters/upload (ZIP)
  - Recibir FormData con ZIP
  - Validar ZIP
  - Descomprimir
  - Procesar cada imagen
  - Subir a Blob
  - Crear Chapter y Pages en DB
  - Crear Moderation pendiente

- [ ] POST /api/pages/upload (individual)
  - Recibir FormData con imagen
  - Validar imagen
  - Procesar
  - Subir a Blob
  - Crear Page en DB

- [ ] PATCH /api/pages/reorder
  - Reordenar páginas de un capítulo

- [ ] DELETE /api/pages/[id]
  - Eliminar página de DB
  - Eliminar imagen de Blob

### 3.4 UI de Upload

- [ ] Componente ChapterUploadForm
  - Tabs: ZIP vs Individual
  - Drag & drop zone
  - Preview de thumbnails
  - Reordenamiento (drag & drop)
  - Eliminar páginas individuales
  - Progress bar durante upload
  - Manejo de errores

- [ ] Componente DropZone
  - Área de drag & drop
  - Feedback visual
  - Validación de archivos

- [ ] Componente PagePreview
  - Thumbnail de página
  - Número de página
  - Botón eliminar
  - Drag handle

## Fase 4: Lector (Semana 7-8)

### 4.1 Componentes de Lectura

- [ ] Componente ChapterReader
  - Scroll infinito vertical
  - Intersection Observer para detectar página actual
  - Lazy loading de imágenes

- [ ] Componente PageImage
  - Imagen con lazy loading
  - Placeholder mientras carga
  - Responsive sizing
  - Alt text

- [ ] Componente ProgressBar
  - Barra visual de progreso
  - Texto: "67% (13 de 20)"
  - Click para saltar (opcional)

### 4.2 Tracking de Progreso

- [ ] Hook useProgressTracking
  - Detectar página actual
  - Calcular progreso
  - Guardar cada 3 páginas
  - Guardar al cerrar tab

- [ ] API de historial
  - POST /api/reading-history (actualizar)
  - GET /api/reading-history (listar)

### 4.3 UI de Historial

- [ ] Componente ContinueReading
  - Lista de últimos 5 capítulos en progreso
  - Mostrar: título, progreso, fecha
  - Botón "Continuar" → lleva a última página

- [ ] Integrar en Home
  - Sección "Continuar leyendo"
  - Mostrar solo si hay historial

### 4.4 Navegación

- [ ] Navegación entre capítulos
  - Botón "Siguiente capítulo" al final
  - Link a serie en header
  - Navegación mantiene scroll

## Fase 5: Moderación y Filtros (Semana 9-10)

### 5.1 Sistema de Moderación

- [ ] Panel de admin
  - Cola de moderación (chapters pendientes)
  - Previsualizar capítulo
  - Botones Aprobar/Rechazar
  - Campo de notas (feedback al creador)

- [ ] API de moderación
  - GET /api/admin/moderation (listar pendientes)
  - PATCH /api/admin/moderation/[id] (aprobar/rechazar)
  - Actualizar status de Chapter

- [ ] Notificaciones a creadores
  - Email cuando capítulo es aprobado
  - Email cuando capítulo es rechazado (con feedback)

### 5.2 Filtro de Contenido Adulto

- [ ] Toggle en perfil de usuario
  - PATCH /api/user/preferences
  - Actualizar user.showAdult

- [ ] Filtrar contenido
  - No mostrar series +18 si showAdult = false
  - Mensaje "Contenido no disponible" si intenta acceder

### 5.3 Roles y Permisos

- [ ] Middleware de roles
  - Solo CREATOR puede crear series/capítulos
  - Solo ADMIN puede moderar

- [ ] UI condicional
  - Mostrar "Panel de creador" solo a CREATOR
  - Mostrar "Moderación" solo a ADMIN

## Fase 6: UI Polish y Publicidad (Semana 11-12)

### 6.1 Diseño Final

- [ ] Refinar diseño minimalista
  - Tipografía
  - Espaciado
  - Colores
  - Iconografía

- [ ] Responsive design
  - Mobile-first
  - Breakpoints: 375px, 768px, 1024px, 1440px
  - Touch-friendly

- [ ] Dark mode (opcional para MVP)
  - CSS variables
  - Toggle en perfil

### 6.2 Publicidad

- [ ] Configurar Google AdSense
  - Crear cuenta
  - Obtener ad client y slot IDs
  - Verificar dominio

- [ ] Componente AdBanner
  - Banner horizontal
  - Responsive
  - Fallback si no carga

- [ ] Integrar en lector
  - Insertar cada 5 páginas
  - No interrumpir flujo de lectura

### 6.3 Optimización

- [ ] SEO
  - Meta tags dinámicos
  - Open Graph tags
  - Sitemap
  - robots.txt

- [ ] Performance
  - Optimizar imágenes (ya con sharp)
  - Code splitting
  - Lazy loading de componentes
  - Bundle size audit

- [ ] Accessibility
  - Alt text en imágenes
  - Focus states
  - Contraste de colores
  - Keyboard navigation (básico)

## Fase 7: Testing y Deployment

### 7.1 Testing

- [ ] Tests unitarios
  - Utilidades de procesamiento de imágenes
  - Cálculos de progreso
  - Validaciones

- [ ] Tests de integración
  - Flujos de autenticación
  - CRUD de series/volúmenes/capítulos
  - Upload de imágenes
  - Tracking de progreso

- [ ] Tests E2E (Playwright o Cypress)
  - Flujo completo de registro y login
  - Crear serie y subir capítulo
  - Leer capítulo completo

### 7.2 Deployment

- [ ] Configurar Vercel
  - Conectar repositorio
  - Configurar dominio panels.lat
  - Variables de entorno

- [ ] Verificar producción
  - Auth funciona
  - Upload funciona
  - Lectura funciona
  - Ads muestran

- [ ] Monitoreo
  - Vercel Analytics
  - Error tracking (Sentry opcional)
  - Logs de Resend

### 7.3 Launch

- [ ] Content seeding
  - Subir 5-10 series de prueba
  - Moderar y aprobar

- [ ] Beta testing
  - Invitar 10-20 usuarios
  - Recolectar feedback
  - Iterar

- [ ] Launch público
  - Anunciar en redes
  - Documentación de uso
  - Soporte (email)

## Post-MVP (Futuro)

### Mejoras de Performance

- [ ] Service Worker para offline
- [ ] Prefetching inteligente
- [ ] CDN custom domain

### Features Adicionales

- [ ] Búsqueda avanzada
- [ ] Filtros por género, tipo, estado
- [ ] Favoritos/bookmarks
- [ ] Comentarios y ratings
- [ ] Recomendaciones personalizadas
- [ ] Estadísticas de lectura

### Monetización Avanzada

- [ ] Premium tier sin ads
- [ ] Revenue share con creadores
- [ ] Donaciones a creadores

### Mobile App

- [ ] React Native app
- [ ] Sync de progreso
- [ ] Push notifications
- [ ] Offline reading

## Notas

- Las estimaciones de tiempo son aproximadas
- Algunas tareas pueden hacerse en paralelo
- Priorizar MVP: auth → CRUD → upload → lectura → moderación → polish
- Iterar basado en feedback de usuarios reales
