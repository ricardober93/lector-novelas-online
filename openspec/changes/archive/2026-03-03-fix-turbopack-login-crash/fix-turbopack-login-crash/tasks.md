# Plan de implementación: fix-turbopack-login-crash

- Objetivo general: corregir el fallo de Turbopack que provoca errores 500 al cargar /login y estabilizar el flujo de autenticación.
- Lista de tareas (implementación en orden de dependencia):
- [x] 1) Reproducir y capturar el fallo con logs completos (panic log) y confirmar alcance.
- [x] 2) Auditar dependencias relevantes: Next.js, Node.js, herramientas de build, y código de la ruta /login (app/login o pages/login).
- [x] 3) Actualizar dependencias a versiones estables compatibles.
- [x] 4) Analizar y simplificar la ruta de login para eliminar importaciones pesadas o server components problemáticos.
- [x] 5) Añadir manejo de errores en la ruta de login y en API de autenticación; introducir fallbacks si es necesario.
- [x] 6) Habilitar logging adicional para capturar errores futuros de Turbopack en desarrollo.
- [x] 7) Ejecutar pruebas locales y en CI; verificar que /login ya no falla y que el resto del sitio se mantiene estable.
- [x] 8) Documentar el cambio y preparar paso a paso para el despliegue seguro.

- Criterios de finalización:
- [x] Todas las tareas están en estado done y artefactos de openspec de este cambio creados y verificables.
- [x] Confirmación de que /login no genera 500 en entornos de desarrollo y staging.
