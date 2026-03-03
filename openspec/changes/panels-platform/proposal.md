# Panels - Plataforma de Lectura de Mangas y Cómics

## Visión

**Panels** (panels.lat) es una plataforma web gratuita para leer mangas, cómics, novelas visuales y manguas, donde creadores independientes pueden publicar su contenido por capítulos y lectores pueden disfrutar de una experiencia de lectura minimalista con scroll infinito.

## Problema

- Los creadores independientes de contenido visual (mangas, cómics, novelas visuales) no tienen una plataforma simple para publicar su trabajo
- Las plataformas existentes son complejas, costosas o no están optimizadas para el mercado latinoamericano
- Los lectores buscan experiencias de lectura fluidas sin barreras de pago ni interfaces complicadas

## Solución

Plataforma web minimalista con:

1. **Para Creadores:**
   - Upload simple de contenido por capítulos (ZIP o imágenes individuales)
   - Organización jerárquica: Serie → Volumen → Capítulo
   - Panel de control básico con estadísticas

2. **Para Lectores:**
   - Registro simple con email magic link
   - Lectura fluida con scroll infinito
   - Historial de lectura automático
   - Acceso gratuito a todo el contenido

3. **Para la Plataforma:**
   - Monetización mediante publicidad no intrusiva
   - Moderación de contenido
   - Filtro de contenido adulto (+18)

## Alcance (MVP)

### Incluido:
- Autenticación por email magic link
- Gestión de series, volúmenes y capítulos (CRUD)
- Upload de capítulos via ZIP o drag & drop de imágenes
- Lector con scroll infinito
- Historial de lectura
- Filtro de contenido adulto
- Moderación básica de contenido
- Publicidad en forma de banners

### No incluido (futuro):
- Aplicación móvil (React Native)
- Funcionalidades sociales (comentarios, likes)
- Monetización para creadores
- Descarga offline
- Soporte multiidioma

## Usuario Objetivo

**Creadores:**
- Dibujantes independientes en Latinoamérica
- Ya tienen el contenido listo (imágenes)
- Buscan una forma simple de publicar

**Lectores:**
- Usuarios en Latinoamérica
- Buscan contenido gratuito
- Prefieren interfaces minimalistas

## Modelo de Negocio

- **Acceso:** Gratuito para lectores
- **Monetización:** Publicidad (banners cada N páginas)
- **Futuro:** Posible modelo premium sin publicidad o revenue share con creadores

## Métricas de Éxito (MVP)

- Creadores activos: 10+ en primeros 3 meses
- Series publicadas: 20+ en primeros 3 meses
- Usuarios registrados: 100+ en primeros 3 meses
- Retención de lectura: 60%+ completan capítulos iniciados

## Stack Tecnológico

- **Frontend:** Next.js 14 (App Router)
- **Auth:** NextAuth.js + Resend (magic link)
- **Database:** Neon (PostgreSQL)
- **ORM:** Prisma
- **Storage:** Vercel Blob
- **Hosting:** Vercel

## Riesgos

1. **Contenido ilegal:** Usuarios subiendo copyrighted content
   - *Mitigación:* Moderación manual + reportes de usuarios

2. **Costo de storage:** Imágenes pesadas
   - *Mitigación:* Optimización automática de imágenes

3. **Ad-blockers:** Usuarios bloqueando publicidad
   - *Mitigación:* Ads no intrusivos, considerar modelo freemium

4. **Escalabilidad de moderación:** Crecimiento exponencial de contenido
   - *Mitigación:* Proceso automatizado con AI + moderadores

## Timeline Estimado

- **Semana 1-2:** Setup inicial, auth, DB schema
- **Semana 3-4:** CRUD de series/volúmenes/capítulos
- **Semana 5-6:** Upload y procesamiento de imágenes
- **Semana 7-8:** Lector con scroll infinito
- **Semana 9-10:** Historial, filtros, moderación
- **Semana 11-12:** UI polish, publicidad, testing

**Total:** ~3 meses para MVP

## Dependencias

- Cuenta en Resend (para magic links)
- Cuenta en Neon (database)
- Cuenta en Vercel (hosting + blob storage)
- Dominio panels.lat
- Servicio de publicidad (Google AdSense o similar)

## Alternativas Consideradas

1. **Usar PDFs en lugar de imágenes:**
   - Descartado: Scroll infinito difícil de implementar, rendimiento subóptimo

2. **Auth por SMS:**
   - Descartado: Costo elevado, email magic link es más económico

3. **Supabase en lugar de Neon:**
   - Descartado: Ya decidido usar Neon por simplicidad

4. **Solo upload individual de imágenes:**
   - Descartado: ZIP es más conveniente para creadores con muchas páginas
