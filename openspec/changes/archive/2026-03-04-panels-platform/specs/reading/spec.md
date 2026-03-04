# Lectura de Mangas - Spec

## Capability

Sistema de lectura de mangas/cómics con scroll infinito, tracking automático de progreso, historial de lectura y experiencia minimalista optimizada para web y mobile.

## Requisitos Funcionales

### RF-1: Visualización de Capítulos

**Descripción:** Lectores pueden visualizar capítulos completos con scroll infinito.

**Criterios de Aceptación:**
- GIVEN un lector autenticado
- WHEN accede a un capítulo aprobado
- THEN ve todas las páginas en scroll vertical infinito
- AND las imágenes se cargan con lazy loading
- AND el scroll es suave y responsive
- AND ve indicador de progreso en header

**Experiencia:**
- Scroll vertical natural (no horizontal)
- Imágenes centradas y ajustadas al ancho del viewport
- Espaciado consistente entre páginas
- No hay paginación, solo scroll continuo

### RF-2: Lazy Loading de Páginas

**Descripción:** Sistema carga páginas de forma inteligente para optimizar rendimiento.

**Criterios de Aceptación:**
- Páginas visibles en viewport se cargan inmediatamente
- 2 páginas adelante se prefetchan
- Páginas lejanas no se cargan hasta acercarse
- Placeholder visual mientras carga (skeleton o blur)
- Imágenes usan `loading="lazy"` nativo

**Estrategia de Carga:**
```
Viewport: [Página 5, 6, 7]
Prefetch: [Página 8, 9]
No cargar: [Página 10+]
```

### RF-3: Tracking de Progreso

**Descripción:** Sistema trackea automáticamente el progreso de lectura.

**Criterios de Aceptación:**
- GIVEN un lector viendo un capítulo
- WHEN hace scroll
- THEN el sistema detecta qué página está viendo
- AND actualiza `lastPage` en ReadingHistory
- AND calcula `progress` como porcentaje
- AND guarda en DB cada 3 páginas para no sobrecargar

**Cálculo de Progreso:**
```typescript
progress = (lastPage / totalPages) * 100
```

**Frecuencia de Guardado:**
- Cada 3 páginas para no sobrecargar API
- Al cerrar tab/navegar fuera (beforeunload)
- Al completar capítulo (progress = 100%)

### RF-4: Historial de Lectura

**Descripción:** Sistema mantiene historial de lectura del usuario.

**Criterios de Aceptación:**
- Mostrar últimos 5 capítulos en progreso en home
- Cada entrada muestra:
  - Nombre de serie, volumen, capítulo
  - Progreso (porcentaje y página actual)
  - Fecha de última lectura
- Click en entrada lleva directamente al capítulo
- Click en "Continuar" lleva a la última página leída

### RF-5: Navegación entre Capítulos

**Descripción:** Lectores pueden navegar entre capítulos de una serie.

**Criterios de Aceptación:**
- Al final de un capítulo, mostrar botón "Siguiente capítulo"
- Si no hay siguiente, mostrar "Serie completada"
- Header tiene link para volver a la serie
- Navegación mantiene scroll position (no salta)

### RF-6: Indicador de Progreso Visual

**Descripción:** Barra de progreso visual en header durante lectura.

**Criterios de Aceptación:**
- Barra horizontal en header
- Se actualiza en tiempo real según scroll
- Muestra porcentaje (ej: "67%")
- Click en barra permite saltar a posición aproximada

### RF-7: Responsive Design

**Descripción:** Experiencia optimizada para desktop y mobile.

**Criterios de Aceptación:**
- Desktop: Imágenes centradas, max-width 800px
- Mobile: Imágenes full-width, sin padding lateral
- Touch scroll suave en mobile
- No zoom accidental en mobile
- Header colapsable en mobile para más espacio de lectura

### RF-8: Contenido Adulto

**Descripción:** Sistema filtra contenido adulto según preferencias.

**Criterios de Aceptación:**
- Si serie.isAdult = true y user.showAdult = false
- THEN mostrar mensaje "Contenido no disponible"
- AND link a preferencias de perfil
- No mostrar en home ni búsquedas

## Requisitos No Funcionales

### RNF-1: Rendimiento

- First Contentful Paint < 1.5s
- Tiempo de carga de imagen < 500ms (en 3G)
- Scroll a 60fps sin lag
- Tiempo de interacción < 2s

### RNF-2: Usabilidad

- Imágenes se ajustan automáticamente al viewport
- No hay scroll horizontal accidental
- Indicador de progreso siempre visible
- Fácil volver atrás (botón o gesture)

### RNF-3: Accesibilidad

- Alt text en todas las imágenes: "Página X de Y"
- Navegación por teclado (futuro)
- Alto contraste de UI elements
- Focus states claros

## API Endpoints

### GET /api/chapters/[id]

Obtiene información de un capítulo con sus páginas.

**Response (200):**
```json
{
  "chapter": {
    "id": "clx789012",
    "number": 5,
    "title": "El comienzo",
    "pageCount": 20,
    "volume": {
      "id": "clx123456",
      "number": 1,
      "series": {
        "id": "clx111111",
        "title": "Mi Manga",
        "isAdult": false
      }
    },
    "pages": [
      {
        "id": "clx111111",
        "number": 1,
        "imageUrl": "https://blob.vercel-storage.com/...",
        "width": 800,
        "height": 1200
      },
      ...
    ],
    "navigation": {
      "previous": {
        "id": "clx888888",
        "number": 4,
        "title": "Capítulo anterior"
      },
      "next": {
        "id": "clx999999",
        "number": 6,
        "title": "Capítulo siguiente"
      }
    }
  }
}
```

### GET /api/reading-history

Obtiene el historial de lectura del usuario.

**Response (200):**
```json
{
  "history": [
    {
      "id": "clx123456",
      "chapter": {
        "id": "clx789012",
        "number": 5,
        "title": "El comienzo",
        "volume": {
          "number": 1,
          "series": {
            "title": "Mi Manga"
          }
        }
      },
      "lastPage": 13,
      "progress": 65.0,
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    ...
  ]
}
```

### POST /api/reading-history

Crea o actualiza el progreso de lectura.

**Request:**
```json
{
  "chapterId": "clx789012",
  "lastPage": 13
}
```

**Response (200):**
```json
{
  "history": {
    "id": "clx123456",
    "lastPage": 13,
    "progress": 65.0
  }
}
```

## Componentes de UI

### ChapterReader

**Props:**
- `chapter: Chapter`
- `pages: Page[]`
- `navigation: Navigation`

**Estado:**
- `currentPage: number`
- `progress: number`
- `visiblePages: Set<number>`

**Comportamiento:**
1. Renderiza todas las páginas en scroll vertical
2. Intersection Observer detecta páginas visibles
3. Actualiza currentPage y progress
4. Guarda progreso cada 3 páginas
5. Muestra indicador de progreso en header

### PageImage

**Props:**
- `page: Page`
- `index: number`

**Funcionalidades:**
- Lazy loading nativo
- Placeholder mientras carga
- Responsive sizing
- Alt text descriptivo

### ProgressBar

**Props:**
- `progress: number`
- `currentPage: number`
- `totalPages: number`

**Funcionalidades:**
- Barra visual que se llena según progreso
- Texto: "67% (13 de 20)"
- Click para saltar a posición aproximada

### ContinueReading

**Props:**
- `history: ReadingHistory[]`

**Funcionalidades:**
- Muestra últimos 5 capítulos en progreso
- Cada entrada: título, progreso, botón "Continuar"
- Click lleva a la última página leída

## Implementación de Scroll Infinito

### Intersection Observer

```typescript
function ChapterReader({ pages }: { pages: Page[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = pages.length
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNumber = parseInt(entry.target.getAttribute('data-page')!)
            setCurrentPage(pageNumber)
          }
        })
      },
      { threshold: 0.5 } // 50% visible
    )
    
    const pageElements = document.querySelectorAll('[data-page]')
    pageElements.forEach((el) => observer.observe(el))
    
    return () => observer.disconnect()
  }, [pages])
  
  const progress = (currentPage / totalPages) * 100
  
  return (
    <div>
      <ProgressBar progress={progress} currentPage={currentPage} totalPages={totalPages} />
      {pages.map((page) => (
        <PageImage key={page.id} page={page} />
      ))}
    </div>
  )
}
```

### Lazy Loading de Imágenes

```typescript
function PageImage({ page }: { page: Page }) {
  const [loaded, setLoaded] = useState(false)
  
  return (
    <div className="page-container" data-page={page.number}>
      {!loaded && <Skeleton />}
      <img
        src={page.imageUrl}
        alt={`Página ${page.number}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </div>
  )
}
```

### Guardado de Progreso

```typescript
function useProgressTracking(chapterId: string, currentPage: number, totalPages: number) {
  const lastSavedPage = useRef(0)
  
  useEffect(() => {
    // Solo guardar cada 3 páginas
    if (currentPage - lastSavedPage.current >= 3) {
      saveProgress(chapterId, currentPage, totalPages)
      lastSavedPage.current = currentPage
    }
  }, [currentPage])
  
  // Guardar al cerrar tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProgress(chapterId, currentPage, totalPages)
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentPage])
}

async function saveProgress(chapterId: string, lastPage: number, totalPages: number) {
  const progress = (lastPage / totalPages) * 100
  
  await fetch('/api/reading-history', {
    method: 'POST',
    body: JSON.stringify({ chapterId, lastPage }),
  })
}
```

## Responsive Design

### Desktop Layout

```css
.chapter-reader {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-container img {
  width: 100%;
  height: auto;
  display: block;
  margin-bottom: 16px;
}
```

### Mobile Layout

```css
@media (max-width: 768px) {
  .chapter-reader {
    padding: 0;
  }
  
  .page-container img {
    margin-bottom: 0;
  }
  
  .progress-bar {
    position: sticky;
    top: 0;
    z-index: 100;
  }
}
```

## Publicidad Integrada

### Ubicación de Banners

```typescript
function ChapterReaderWithAds({ pages }: { pages: Page[] }) {
  const AD_FREQUENCY = 5 // Cada 5 páginas
  
  return (
    <div>
      {pages.map((page, index) => (
        <>
          <PageImage key={page.id} page={page} />
          {(index + 1) % AD_FREQUENCY === 0 && index < pages.length - 1 && (
            <AdBanner key={`ad-${index}`} />
          )}
        </>
      ))}
    </div>
  )
}
```

### Componente AdBanner

```typescript
function AdBanner() {
  return (
    <div className="ad-banner">
      {/* Google AdSense o similar */}
      <ins className="adsbygoogle"
        data-ad-client="ca-pub-xxxxx"
        data-ad-slot="xxxxx"
        data-ad-format="horizontal"
      />
    </div>
  )
}
```

## Optimizaciones de Rendimiento

### Image Optimization

```typescript
// Responsive images con srcset
function PageImage({ page }: { page: Page }) {
  return (
    <img
      src={page.imageUrl}
      srcSet={`
        ${page.imageUrl}?w=400 400w,
        ${page.imageUrl}?w=800 800w,
        ${page.imageUrl}?w=1200 1200w
      `}
      sizes="(max-width: 768px) 100vw, 800px"
      alt={`Página ${page.number}`}
      loading="lazy"
    />
  )
}
```

### Prefetching

```typescript
// Prefetch de siguientes capítulos
function usePrefetchNextChapter(nextChapterId: string | null) {
  useEffect(() => {
    if (nextChapterId) {
      // Prefetch data del siguiente capítulo
      fetch(`/api/chapters/${nextChapterId}`)
    }
  }, [nextChapterId])
}
```

## Testing

### Tests de Integración

1. **Visualización de capítulo:**
   - GET /api/chapters/[id]
   - Verificar páginas ordenadas
   - Verificar URLs de imágenes válidas

2. **Tracking de progreso:**
   - Scroll a página 5
   - Verificar POST /api/reading-history con lastPage: 5
   - Verificar progress calculado correctamente

3. **Historial:**
   - GET /api/reading-history
   - Verificar entradas ordenadas por updatedAt

4. **Lazy loading:**
   - Inspeccionar elementos <img>
   - Verificar loading="lazy"
   - Verificar que imágenes fuera de viewport no se cargan

5. **Responsive:**
   - Viewport 375px (mobile)
   - Verificar imágenes full-width
   - Viewport 1440px (desktop)
   - Verificar imágenes centradas con max-width

## Métricas

### Monitoreo

- Tiempo promedio de lectura por capítulo
- Tasa de finalización de capítulos (% que llegan a 100%)
- Páginas promedio leídas por sesión
- Rebote (usuarios que leen < 2 páginas)
- Distribución de progreso (histograma)

### Alertas

- Si tasa de finalización < 30%
- Si tiempo de carga de imagen > 2s
- Si errores de carga de imágenes > 5%

## Dependencias

- No se requieren dependencias externas específicas
- Intersection Observer API (nativo del browser)
- Next.js Image component (opcional)

## Configuración

### Variables de Entorno

```bash
# .env.local
ADSENSE_CLIENT_ID=ca-pub-xxxxx
ADSENSE_SLOT_ID=xxxxx
```

### Configuración de Scroll

```typescript
export const config = {
  reading: {
    adFrequency: parseInt(process.env.AD_FREQUENCY || '5'),
    progressSaveFrequency: 3, // Cada 3 páginas
    prefetchPages: 2, // 2 páginas adelante
    lazyLoadThreshold: 0.5, // 50% visible
  },
}
```

## Futuras Mejoras

### Fase 2

- Modo nocturno (dark mode)
- Ajuste de tamaño de texto (para novelas visuales)
- Modo horizontal (paginado) como alternativa
- Descarga de capítulos para offline
- Bookmarks personales
- Estadísticas de lectura (tiempo total, capítulos completados)

### Fase 3

- Sync entre dispositivos
- Compartir progreso en redes sociales
- Recomendaciones personalizadas basadas en historial
