## Why

El reader actual no está optimizado para dispositivos móviles y tablets. Los controles de navegación y la barra de progreso son difíciles de usar en pantallas pequeñas, y no hay sistema de imágenes de prueba para desarrollo, lo que dificulta probar la experiencia de lectura sin datos reales.

## What Changes

- Optimizar layout del reader para móviles, tablets y desktop
- Mejorar controles de navegación con mejor touch support
- Implementar sistema de imágenes de demo/prueba para desarrollo
- Agregar controles de zoom y ajuste de imagen
- Mejorar barra de progreso para pantallas pequeñas
- Implementar gestos de navegación (swipe) en móviles

## Capabilities

### New Capabilities
- `reader-responsive-controls`: Controles de navegación y UI optimizados para móviles y tablets
- `demo-images-system`: Sistema de imágenes de prueba para desarrollo y testing
- `reader-gestures`: Gestos táctiles para navegación (swipe left/right, tap zones)

### Modified Capabilities
- `reader-layout`: Layout del reader adaptativo para diferentes tamaños de pantalla

## Impact

### Frontend
- `src/components/reader/ChapterReader.tsx` - Layout responsive
- `src/components/reader/ProgressBar.tsx` - Controles móviles
- `src/components/reader/NavigationControls.tsx` - Nuevo componente
- `src/components/reader/ImageControls.tsx` - Nuevo componente
- `src/lib/demoImages.ts` - Utilidad para imágenes de prueba

### Backend
- No hay cambios de backend (todo es frontend)

### Dependencies
- Posible uso de biblioteca de gestos (e.g., @use-gesture/react) si es necesario
