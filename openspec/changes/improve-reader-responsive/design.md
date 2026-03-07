## Context

El reader actual (`ChapterReader.tsx`) funciona bien en desktop pero tiene problemas en móviles:
- Barra de progreso ocupa mucho espacio en pantallas pequeñas
- Navegación no está optimizada para touch
- No hay gestos de swipe para cambiar página
- No hay controles de zoom para ajustar imágenes
- Falta sistema de imágenes de prueba para desarrollo sin datos reales

**Stakeholders**: Usuarios finales (lectores), desarrolladores (necesitan demo data)

## Goals / Non-Goals

**Goals:**
- Reader completamente responsive en móviles (< 768px), tablets (768-1024px), desktop (> 1024px)
- Controles táctiles intuitivos (gestos swipe, tap zones)
- Sistema de imágenes de demo para desarrollo y testing
- Mejorar UX de navegación y progreso en todos los dispositivos
- Mantener funcionalidad actual de desktop

**Non-Goals:**
- No modificar la lógica de guardado de progreso
- No cambiar el sistema de ads
- No agregar modo horizontal (landscape) en esta fase
- No implementar modo de lectura continua (scroll infinito)

## Decisions

### Decision 1: Responsive Breakpoints Strategy

**Decision**: Usar breakpoints estándar de Tailwind (sm, md, lg, xl) para responsive.

**Rationale**:
- Consistencia con el resto de la aplicación
- Tailwind ya está configurado y funcionando
- breakpoints estándar: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`

**Alternatives Considered**:
1. **Container queries**: Más granulares pero menos soporte
2. **Custom breakpoints**: Más control pero inconsistente con el resto de la app

**Implementation**:
```
Mobile (< 768px):
  - Barra de progreso compacta en bottom
  - Tap zones para navegación (left/right)
  - Swipe gestures habilitados
  - Zoom controls en overlay

Tablet (768px - 1024px):
  - Layout híbrido
  - Barra de progreso en top (compacta)
  - Gestos y tap zones disponibles

Desktop (> 1024px):
  - Layout actual (max-w-4xl)
  - Barra de progreso en top
  - Keyboard shortcuts
  - Sin tap zones (mouse)
```

### Decision 2: Demo Images System

**Decision**: Crear utilidad `getDemoImages()` que retorna URLs de placeholder.com con dimensiones de manga.

**Rationale**:
- No requiere backend ni base de datos
- Funciona offline
- Fácil de mantener
- Placeholder.com genera imágenes consistentes

**Alternatives Considered**:
1. **Seed script con URLs reales**: Más realista pero requiere hosting
2. **Imágenes locales en /public**: Aumenta tamaño del repo
3. **Mock API endpoint**: Más complejo, requiere backend

**Implementation**:
```typescript
// src/lib/demoImages.ts
export function getDemoImages(count: number = 20): Page[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `demo-${i + 1}`,
    number: i + 1,
    imageUrl: `https://via.placeholder.com/800x1200/1a1a1a/ffffff?text=Page+${i + 1}`,
    width: 800,
    height: 1200,
  }));
}
```

**Usage**:
```typescript
const pages = chapter.pages?.length > 0 
  ? chapter.pages 
  : getDemoImages(20); // Fallback a demo
```

### Decision 3: Touch Navigation (Gestures)

**Decision**: Implementar con eventos nativos de React (onTouchStart, onTouchMove, onTouchEnd) sin bibliotecas externas.

**Rationale**:
- React soporta eventos touch nativamente
- Evita dependencia adicional
- Control total del comportamiento
- Bundle size menor

**Alternatives Considered**:
1. **@use-gesture/react**: Más features pero dependency adicional
2. **Hammer.js**: Biblioteca completa pero pesada

**Implementation**:
```typescript
// Touch gestures state machine
const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

const handleTouchStart = (e: React.TouchEvent) => {
  setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
};

const handleTouchEnd = (e: React.TouchEvent) => {
  if (!touchStart) return;
  
  const deltaX = e.changedTouches[0].clientX - touchStart.x;
  const threshold = 50; // pixels
  
  if (Math.abs(deltaX) > threshold) {
    if (deltaX > 0) {
      // Swipe right - previous page
      scrollToPage(currentPage - 1);
    } else {
      // Swipe left - next page
      scrollToPage(currentPage + 1);
    }
  }
  
  setTouchStart(null);
};
```

### Decision 4: Tap Zones for Navigation

**Decision**: Dividir la pantalla en 3 zonas verticales: left (prev), center (toggle UI), right (next).

**Rationale**:
- Patrón común en readers (Kindle, Apple Books)
- Intuitivo para usuarios
- No interfiere con scroll

**Implementation**:
```
┌─────────────────────────────────┐
│  33%    │    33%    │    33%   │
│  Left   │  Center   │  Right   │
│  Prev   │  Toggle   │   Next   │
│         │   UI      │          │
└─────────────────────────────────┘
```

### Decision 5: Mobile Progress Bar

**Decision**: Mover progress bar a bottom en móviles, hacerla semi-transparente con overlay.

**Rationale**:
- No ocupa espacio vertical en móviles
- Semi-transparente no bloquea contenido
- Fácil de acceder con pulgar

**Implementation**:
```typescript
// Mobile: bottom overlay
<div className="fixed bottom-0 left-0 right-0 z-50 
  bg-black/80 backdrop-blur-sm 
  md:hidden">
  {/* Compact progress bar */}
</div>

// Desktop/Tablet: top fixed
<div className="fixed top-0 left-0 right-0 z-50 
  bg-white dark:bg-black 
  hidden md:block">
  {/* Full progress bar */}
</div>
```

## Risks / Trade-offs

### Risk 1: Touch Gestures Conflicts
**Risk**: Gestos pueden interferir con scroll nativo del browser.

**Mitigation**:
- Solo activar swipe horizontal (detectar deltaX > deltaY)
- Umbral de activación de 50px para evitar activación accidental
- No prevenir default en scroll vertical

### Risk 2: Demo Images Performance
**Risk**: Cargar 20+ imágenes de placeholder.com puede ser lento.

**Mitigation**:
- Usar lazy loading (ya implementado con Next.js Image)
- Limitar a 10-20 imágenes de demo
- Considerar generar imágenes localmente en /public/demo/ si es necesario

### Risk 3: Mobile UI Complexity
**Risk**: Muchos controles pueden abrumar en pantallas pequeñas.

**Mitigation**:
- Auto-ocultar controles después de 3 segundos de inactividad
- Solo mostrar controles esenciales en móviles
- Usar iconos pequeños y compactos

### Trade-off: Bundle Size vs Features
**Decision**: No agregar biblioteca de gestos para mantener bundle pequeño.

**Trade-off**:
- ✅ Bundle size menor (~10KB menos)
- ✅ Sin dependencias adicionales
- ❌ Menos features de gestos (pinch-to-zoom requeriría más código)
- ❌ Más código custom para mantener

**Acceptance**: Aceptable porque los gestos básicos (swipe, tap) son suficientes para MVP.

## Migration Plan

### Phase 1: Non-Breaking Layout Changes
1. Agregar estilos responsive sin cambiar comportamiento desktop
2. Implementar demo images system (solo en dev mode)
3. Testing en múltiples dispositivos

### Phase 2: Touch Features (Mobile Only)
1. Implementar tap zones (solo en móviles)
2. Agregar swipe gestures (solo en móviles)
3. Testing con usuarios móviles

### Phase 3: Polish & Optimization
1. Ajustar timing de auto-hide
2. Optimizar performance de gestos
3. Refinar UI basado en feedback

**Rollback Strategy**:
- Cada fase es independiente
- Si hay problemas, revertir commit específico
- Desktop functionality no se ve afectada

## Open Questions

1. **¿Pinch-to-zoom necesario?**
   - MVP: No, usar botones de zoom
   - Future: Considerar si hay feedback de usuarios

2. **¿Auto-ocultar controles en móviles?**
   - Propuesta: Sí, después de 3 segundos
   - Alternativa: Solo ocultar en scroll down

3. **¿Mostrar demo images en producción?**
   - Propuesta: Solo en development (NODE_ENV !== 'production')
   - Alternativa: Siempre disponible como fallback

4. **¿Límite de páginas de demo?**
   - Propuesta: 20 páginas (suficiente para probar UX)
   - Alternativa: Configurable via environment variable
