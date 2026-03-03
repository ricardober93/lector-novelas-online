# Upload de Contenido - Spec

## Capability

Sistema de upload de capítulos de manga/cómic, permitiendo a creadores subir múltiples imágenes mediante archivos ZIP o drag & drop individual, con procesamiento automático de imágenes.

## Requisitos Funcionales

### RF-1: Upload de Capítulo via ZIP

**Descripción:** Creadores pueden subir un archivo ZIP conteniendo todas las imágenes de un capítulo.

**Criterios de Aceptación:**
- GIVEN un creador autenticado
- WHEN sube un archivo ZIP válido
- THEN el sistema descomprime el archivo
- AND valida cada imagen
- AND ordena las imágenes alfanuméricamente
- AND optimiza cada imagen
- AND sube las imágenes a Vercel Blob
- AND crea el registro de Chapter con status PENDING
- AND crea los registros de Pages
- AND crea un registro de Moderation

**Formatos aceptados:**
- .zip
- Imágenes dentro: .jpg, .jpeg, .png, .webp

**Límites:**
- Tamaño máximo del ZIP: 50MB
- Máximo de imágenes por ZIP: 100
- Tamaño máximo por imagen: 10MB

### RF-2: Upload de Imágenes Individuales

**Descripción:** Creadores pueden arrastrar y soltar múltiples imágenes individualmente.

**Criterios de Aceptación:**
- GIVEN un creador autenticado
- WHEN arrastra múltiples imágenes al área de drop
- THEN el sistema valida cada imagen
- AND permite reordenar las imágenes
- AND optimiza cada imagen
- AND sube las imágenes a Vercel Blob
- AND crea el registro de Chapter con status PENDING
- AND crea los registros de Pages
- AND crea un registro de Moderation

**Formatos aceptados:**
- .jpg, .jpeg, .png, .webp

**Límites:**
- Máximo de imágenes por capítulo: 100
- Tamaño máximo por imagen: 10MB

### RF-3: Validación de Imágenes

**Descripción:** Sistema valida automáticamente las imágenes subidas.

**Criterios de Aceptación:**
- Validar formato de archivo (magic numbers, no solo extensión)
- Validar tamaño (< 10MB)
- Validar dimensiones mínimas (200x200px)
- Rechazar imágenes corruptas
- Mostrar errores claros al usuario

### RF-4: Optimización de Imágenes

**Descripción:** Sistema optimiza automáticamente las imágenes antes de almacenarlas.

**Criterios de Aceptación:**
- Redimensionar si width > 1200px (mantener aspect ratio)
- Comprimir a 80% de calidad
- Convertir a WebP si el formato original es PNG/JPG
- Mantener metadata EXIF mínima
- Generar múltiples tamaños para responsive (futuro)

### RF-5: Ordenamiento de Páginas

**Descripción:** Sistema ordena las páginas automáticamente por nombre de archivo.

**Criterios de Aceptación:**
- Ordenar alfanuméricamente (001.jpg, 002.jpg, etc.)
- Soportar nombres con ceros padding
- Permitir reordenamiento manual en UI (drag & drop)
- Guardar orden en Page.number

### RF-6: Preview de Capítulo

**Descripción:** Creadores pueden previsualizar el capítulo antes de publicar.

**Criterios de Aceptación:**
- Mostrar thumbnails de todas las páginas
- Permitir reordenar
- Permitir eliminar páginas individuales
- Mostrar progreso de upload
- Botón "Publicar" para enviar a moderación

### RF-7: Reemplazo de Capítulo

**Descripción:** Creadores pueden reemplazar las imágenes de un capítulo existente.

**Criterios de Aceptación:**
- Solo si el capítulo está en status DRAFT o REJECTED
- Eliminar imágenes anteriores de Blob
- Subir nuevas imágenes
- Actualizar registros de Pages
- Resetear status a PENDING

## Requisitos No Funcionales

### RNF-1: Rendimiento

- Upload de ZIP debe completarse en < 30 segundos (para 20 imágenes)
- Optimización de cada imagen debe tomar < 1 segundo
- Upload a Blob debe ser paralelo (máximo 5 concurrentes)
- Progress bar debe actualizarse cada imagen completada

### RNF-2: Usabilidad

- Drag & drop visual con feedback claro
- Preview de thumbnails durante upload
- Mensajes de error específicos
- Auto-retry en fallos de red (máximo 3 intentos)
- Indicador de progreso en tiempo real

### RNF-3: Confiabilidad

- Transacción atómica: si falla una imagen, no se crea el capítulo
- Cleanup automático de imágenes si el proceso falla
- Logs de errores para debugging
- Backup de imágenes originales por 7 días (opcional)

## API Endpoints

### POST /api/chapters/upload

Sube un capítulo completo via ZIP.

**Request:**
```http
POST /api/chapters/upload
Content-Type: multipart/form-data

file: chapter.zip
volumeId: clx123456
number: 5
title: "El comienzo" (opcional)
isAdult: false
```

**Response (201):**
```json
{
  "chapter": {
    "id": "clx789012",
    "volumeId": "clx123456",
    "number": 5,
    "title": "El comienzo",
    "pageCount": 20,
    "status": "PENDING",
    "pages": [
      {
        "id": "clx111111",
        "number": 1,
        "imageUrl": "https://blob.vercel-storage.com/..."
      },
      ...
    ]
  }
}
```

**Response (400):**
```json
{
  "error": "El archivo ZIP está corrupto"
}
```

**Response (413):**
```json
{
  "error": "El archivo excede el tamaño máximo de 50MB"
}
```

### POST /api/pages/upload

Sube una imagen individual para un capítulo.

**Request:**
```http
POST /api/pages/upload
Content-Type: multipart/form-data

file: page1.jpg
chapterId: clx789012
number: 1
```

**Response (201):**
```json
{
  "page": {
    "id": "clx111111",
    "chapterId": "clx789012",
    "number": 1,
    "imageUrl": "https://blob.vercel-storage.com/...",
    "width": 800,
    "height": 1200
  }
}
```

### PATCH /api/pages/reorder

Reordena las páginas de un capítulo.

**Request:**
```json
{
  "chapterId": "clx789012",
  "pageOrder": ["clx111111", "clx222222", "clx333333"]
}
```

**Response (200):**
```json
{
  "success": true
}
```

### DELETE /api/pages/[id]

Elimina una página específica.

**Response (200):**
```json
{
  "success": true
}
```

## Componentes de UI

### ChapterUploadForm

**Props:**
- `volumeId: string`
- `chapterNumber: number`

**Estado:**
- `uploadMethod: 'zip' | 'individual'`
- `files: File[]`
- `uploading: boolean`
- `progress: number` (0-100)
- `error: string | null`
- `pages: PagePreview[]`

**Comportamiento:**
1. Seleccionar método (ZIP o individual)
2. Drag & drop o click para seleccionar archivos
3. Preview de thumbnails
4. Reordenar (si es individual)
5. Click en "Publicar"
6. Progress bar durante upload
7. Redirect a lista de capítulos

### PagePreview

**Props:**
- `page: PagePreview`
- `index: number`
- `onMove: (from: number, to: number) => void`
- `onDelete: (id: string) => void`

**Funcionalidades:**
- Mostrar thumbnail
- Botón de eliminar
- Drag handle para reordenar
- Indicador de número de página

### UploadProgressBar

**Props:**
- `progress: number`
- `current: number`
- `total: number`

**Muestra:**
- Barra de progreso visual
- Texto: "Subiendo imagen 5 de 20 (25%)"

## Procesamiento de Imágenes

### Pipeline de Procesamiento

```typescript
// Concepto del flujo de procesamiento
async function processImage(file: File): Promise<ProcessedImage> {
  // 1. Validar formato
  const buffer = await file.arrayBuffer()
  const mimeType = await detectMimeType(buffer)
  
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    throw new Error('Formato no soportado')
  }
  
  // 2. Validar tamaño
  if (buffer.byteLength > 10 * 1024 * 1024) {
    throw new Error('Imagen muy grande')
  }
  
  // 3. Obtener dimensiones
  const metadata = await sharp(buffer).metadata()
  
  if (metadata.width < 200 || metadata.height < 200) {
    throw new Error('Dimensiones mínimas: 200x200px')
  }
  
  // 4. Redimensionar si es necesario
  let processedImage = sharp(buffer)
  
  if (metadata.width > 1200) {
    processedImage = processedImage.resize(1200, null, {
      fit: 'inside',
      withoutEnlargement: true
    })
  }
  
  // 5. Convertir a WebP y comprimir
  const outputBuffer = await processedImage
    .webp({ quality: 80 })
    .toBuffer()
  
  // 6. Subir a Blob
  const blob = await put(`pages/${generateId()}.webp`, outputBuffer, {
    access: 'public',
  })
  
  return {
    url: blob.url,
    width: metadata.width,
    height: metadata.height,
  }
}
```

### Librerías Necesarias

- `sharp`: Procesamiento de imágenes
- `unzipper` o `adm-zip`: Descompresión de ZIPs
- `file-type`: Detección de MIME types por magic numbers
- `@vercel/blob`: Storage

## Almacenamiento en Vercel Blob

### Estructura de Paths

```
panels-blob/
├── covers/
│   └── series-{id}.webp
├── pages/
│   ├── chapter-{id}/
│   │   ├── page-001.webp
│   │   ├── page-002.webp
│   │   └── ...
└── temp/
    └── uploads-{timestamp}/
```

### Configuración de Blob

```typescript
import { put, del } from '@vercel/blob'

// Upload
const blob = await put(path, file, {
  access: 'public',
  addRandomSuffix: false, // Usar nombres determinísticos
})

// Delete
await del(blob.url)
```

## Manejo de Errores

### Escenarios de Error

1. **ZIP corrupto:**
   - Error: "El archivo ZIP está corrupto o no es válido"
   - Acción: No crear capítulo, mostrar error

2. **Imagen muy grande:**
   - Error: "La imagen {filename} excede el tamaño máximo de 10MB"
   - Acción: Rechazar imagen específica, permitir continuar con las demás

3. **Formato no soportado:**
   - Error: "El archivo {filename} no es una imagen válida"
   - Acción: Rechazar archivo, permitir continuar

4. **Fallo de red en upload:**
   - Error: "Error al subir imagen. Reintentando..."
   - Acción: Auto-retry (máximo 3 veces), luego mostrar error

5. **Storage lleno:**
   - Error: "Error de almacenamiento. Contacta soporte."
   - Acción: No crear capítulo, rollback de imágenes ya subidas

### Rollback Strategy

```typescript
async function uploadChapter(files: File[], metadata: ChapterMetadata) {
  const uploadedBlobs: string[] = []
  
  try {
    // Subir imágenes
    for (const file of files) {
      const blob = await uploadToBlob(file)
      uploadedBlobs.push(blob.url)
    }
    
    // Crear registros en DB (transacción)
    await prisma.$transaction(async (tx) => {
      const chapter = await tx.chapter.create({...})
      await tx.page.createMany({...})
      await tx.moderation.create({...})
    })
    
  } catch (error) {
    // Rollback: eliminar blobs ya subidos
    await Promise.all(uploadedBlobs.map(url => del(url)))
    throw error
  }
}
```

## Testing

### Tests de Integración

1. **Upload ZIP exitoso:**
   - POST /api/chapters/upload con ZIP válido
   - Verificar capítulo creado con status PENDING
   - Verificar páginas creadas
   - Verificar imágenes en Blob

2. **Upload ZIP muy grande:**
   - POST /api/chapters/upload con ZIP de 60MB
   - Verificar error 413

3. **Upload imágenes individuales:**
   - POST /api/pages/upload 5 veces
   - Verificar 5 páginas creadas
   - Verificar orden correcto

4. **Reordenamiento:**
   - PATCH /api/pages/reorder con nuevo orden
   - Verificar Page.number actualizado

5. **Eliminación:**
   - DELETE /api/pages/[id]
   - Verificar página eliminada de DB
   - Verificar imagen eliminada de Blob

6. **Formato inválido:**
   - POST /api/pages/upload con archivo .txt
   - Verificar error 400

## Métricas

### Monitoreo

- Tiempo promedio de upload (por tamaño de ZIP)
- Tasa de éxito de uploads
- Distribución de tamaños de capítulos (páginas)
- Errores más frecuentes
- Uso de storage en Blob

### Alertas

- Si tasa de éxito < 90%
- Si tiempo promedio > 60 segundos
- Si storage > 80% de capacidad

## Dependencias

- sharp (^0.33.0)
- adm-zip (^0.5.0)
- file-type (^19.0.0)
- @vercel/blob (^0.15.0)

## Configuración

### Variables de Entorno

```bash
# .env.local
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
MAX_ZIP_SIZE=52428800  # 50MB en bytes
MAX_IMAGE_SIZE=10485760  # 10MB en bytes
MAX_PAGES_PER_CHAPTER=100
```

### Límites Configurables

```typescript
export const config = {
  upload: {
    maxZipSize: parseInt(process.env.MAX_ZIP_SIZE || '52428800'),
    maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE || '10485760'),
    maxPagesPerChapter: parseInt(process.env.MAX_PAGES_PER_CHAPTER || '100'),
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    concurrentUploads: 5,
  },
  optimization: {
    maxWidth: 1200,
    quality: 80,
    outputFormat: 'webp',
  },
}
```
