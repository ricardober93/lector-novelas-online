# Diseño de la solución: fix-turbopack-login-crash

Propósito:
- Describir el enfoque técnico para eliminar el fallo de Turbopack en /login.

Enfoque propuesto (alto nivel):
- Reproducir y aislar el fallo en un entorno de desarrollo/CI.
- Actualizar dependencias (Next.js) a una versión estable compatible con Turbopack y el resto del stack.
- Reducir carga inicial en la página de login cargando de forma diferida dependencias pesadas; evitar server components o importaciones dinámicas problemáticas en la ruta de login si están presentes.
- Añadir manejo de errores y fallbacks para rutas críticas (login) para evitar caídas completas del renderizado.
- Reforzar registro de errores en la ruta de login para facilitar futuras intervenciones.

Cambios técnicos provisionales (opcional, según hallazgos):
- Revisión de app/login/page.* y api/auth/login para evitar dependencias que disparen Turbopack a fallar.
- Configuración de Next para desactivar características inestables si fueran necesarias.

Criterios de aceptación:
- Reproducción del fallo eliminado o mitigado sin introducir regressions.
- Pruebas que cubran la ruta /login y flujo de autenticación básico.
