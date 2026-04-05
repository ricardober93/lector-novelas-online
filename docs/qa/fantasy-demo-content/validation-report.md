# Fantasy Demo QA Validation Report

## Contexto

Este reporte consolida la ejecución del cambio `add-fantasy-demo-content-qa`.

## Estado

- Dataset narrativo: completado
- Generación local de activos: completada
- Seed de contenido QA en base de datos: completado
- Validación de upload a blob: completada
- Validación de reader con páginas reales: completada

## Entorno

- `BLOB_READ_WRITE_TOKEN`: configurado y usable para upload real
- `DATABASE_URL`: operativa; permitió sembrar y verificar el capítulo QA
- Reader protegido por sesión: sí

## Entregables creados

- Story pack formal:
  [story-pack.md](/C:/Users/Ricardo%20Bermudez/dev/lector-manga-online/docs/qa/fantasy-demo-content/story-pack.md)
- Activos locales numerados:
  `public/qa/fantasy-demo/chapter-1/001.png` a `016.png`
- ZIP listo para upload:
  `tests/fixtures/qa-fantasy-demo/chapter-1.zip`
- Fixtures inválidos para pruebas negativas:
  `tests/fixtures/qa-fantasy-demo/invalid/`
- Manifest de generación:
  `docs/qa/fantasy-demo-content/generated/manifest.json`
- Validación técnica de activos:
  `docs/qa/fantasy-demo-content/generated/asset-validation.json`

## Resultados ejecutados

### Story pack y prompts

- Se definió una historia original de fantasía de 16 páginas.
- Se fijó un prompt maestro de estilo.
- Se redactó un prompt individual por página con beat narrativo y composición.

### Activos locales

- Se generaron 16 páginas PNG de `900x1400`.
- El set válido quedó numerado en orden estable `001-016`.
- Se generó un ZIP de `3,134,661` bytes.
- Se generaron fixtures inválidos:
  - `too-small.png`
  - `wrong-format.txt`

### Validación previa al upload

- `16/16` archivos válidos pasaron formato, dimensiones y tamaño.
- El ZIP quedó dentro del límite configurado.
- El orden numérico del ZIP es estable y coincide con los archivos fuente.

### Seed de QA

- Se reutilizó `creator@test.com`.
- Se creó o actualizó la serie interna `QA - La Llama del Umbral`.
- Se creó o actualizó el capítulo `La noche del portal`.
- Verificación DB:
  - `chapterId`: `980df689-6f51-4d45-92fe-086e0ab2bb0c`
  - `pageCount`: `16`
  - `actual_pages`: `16`

## Resultados ejecutados en runtime

### Upload ZIP

- Se creó el capítulo QA de ZIP:
  - `chapterId`: `4a9c1a7a-422a-467b-a8a7-91573fb982da`
  - título: `La noche del portal - ZIP QA`
- El endpoint `POST /api/chapters/[id]/upload` respondió `200`.
- Resultado persistido:
  - `pageCount = 16`
  - `actual_pages = 16`
  - `min_page = 1`
  - `max_page = 16`
- Las imágenes quedaron en blob storage con rutas `.webp` ordenadas `page-001` a `page-016`.
- La vista del capítulo en creator mostró las 16 páginas correctamente.

### Upload individual

- Se creó el capítulo QA inicial de individual:
  - `chapterId`: `29481dba-4f3e-4af1-b795-55e260987366`
  - título: `La noche del portal - Individual QA`
- Se inició la subida de 16 imágenes desde la UI del creator y se canceló manualmente.
- Resultado tras cancelación:
  - la UI mostró `Upload cancelado`
  - el capítulo quedó con `pageCount = 1`
  - `actual_pages = 1`
- Se probó reintento inmediato sin cleanup.
- Resultado del reintento:
  - la UI mostró error de Vercel Blob:
    `This blob already exists, use allowOverwrite: true...`
  - el flujo no es reintentable hoy después de una cancelación parcial

- Para completar la validación positiva se creó un segundo capítulo individual limpio:
  - `chapterId`: `eb744d0a-1701-43d8-bfcb-741f81f2438c`
  - título: `La noche del portal - Individual QA Retry`
- La subida individual completa terminó bien en UI.
- Resultado persistido:
  - `pageCount = 16`
  - `actual_pages = 16`
  - `min_page = 1`
  - `max_page = 16`
- Las imágenes quedaron en blob storage con rutas `.webp` ordenadas `page-001` a `page-016`.

### Reader

- Se abrió `/read/eb744d0a-1701-43d8-bfcb-741f81f2438c` con sesión válida.
- Las imágenes renderizadas provinieron de blob storage real, no del fallback de `demoImages`.
- Verificación directa:
  - primeras imágenes servidas desde `binbrexrxifhbphs.public.blob.vercel-storage.com`
  - páginas 1-5 visibles con `alt` correcto
- Navegación desktop:
  - `ArrowRight` avanzó hasta `Página 4 de 16`
  - la barra de progreso mostró `25%`
  - apareció navegación al capítulo anterior
- Persistencia de progreso:
  - `reading_history` guardó `lastPage = 3`
  - `progress = 18.75`
- Navegación móvil:
  - viewport `390x844`
  - tap en zona derecha produjo avance y actualización de progreso
  - el reader mostró controles móviles y navegación funcional

## Hallazgos

- La importación rota en `src/proxy.ts` impedía compilar la app y fue necesario corregirla.
- Un archivo reservado `nul` en la raíz rompía Turbopack en Windows; fue removido para restaurar la compilación.
- La capa de auth sigue con deriva de schema entre Better Auth y la base real.
- Para ejecutar QA fue necesario agregar una compatibilidad de sesión legacy para:
  - `/api/auth/get-session`
  - upload individual
  - upload ZIP
  - reading history
- El seed QA sigue evitando tocar `users` con Prisma porque `users.emailVerified` en la base real no coincide con el schema local.
- La subida individual no es reintentable después de cancelar:
  - deja páginas parciales persistidas
  - deja blobs ya creados
  - el reintento falla por colisión de nombre en Vercel Blob

## Diferencias observadas

- ZIP reemplaza el capítulo completo de forma atómica desde el punto de vista de páginas:
  borra páginas previas, crea el set completo y actualiza `pageCount` al final.
- Individual persiste archivo por archivo:
  el progreso visible es mejor, pero deja estado parcial si se cancela o falla.
- ZIP resultó más robusto para repetir pruebas porque reescribe el capítulo entero.
- Individual expuso un bug importante de retry:
  al cancelar, el blob de la primera página ya existe y el reintento inmediato falla por colisión.
- Ambos caminos conservaron orden 1-16 y produjeron imágenes `.webp` válidas en blob storage.
- Ambos caminos terminaron mostrando páginas reales en el reader cuando la carga fue completa.

## Siguiente Paso

- Resolver de forma definitiva la migración entre Better Auth y el schema real de base de datos.
- Corregir el flujo individual para que cancelación + reintento sean seguros:
  - cleanup de blobs parciales
  - cleanup de páginas parciales
  - o uso explícito de overwrite/ids únicos
- Decidir si el capítulo QA canónico para reader será el de ZIP o el de individual exitoso.
- Si se mantiene este dataset, considerar automatizar el reset de capítulos QA entre corridas.
