# Cambio propuesto: fix-turbopack-login-crash

Qué cambia y por qué:
- Diagnosticar y resolver un fallo con Turbopack que provoca un 500 al cargar la ruta de inicio de sesión (/login) en la app Next.js, reflejado en los logs de turbopack.
- Este cambio busca estabilizar el build y el runtime, asegurando que la página de login se renderice correctamente y sin crashes, mejorando la experiencia de usuario y la fiabilidad del sistema.

Objetivos de éxito:
- El crash de Turbopack ya no ocurre al acceder a /login.
- Las rutas críticas de la app cargan dentro de tiempos razonables y sin errores de compilación.
- No se introduzcan regresiones en otras rutas o flujos de autenticación.

Restricciones:
- Entorno Windows (tal como se observa en los logs) y versiones de Node/Next compatibles con la base de código actual.
- Evitar cambios destructivos en producción sin tests y revisión previa.

Notas:
- Este artefacto crea el marco para implementar la corrección y documentar las decisiones, pero no implica una implementación específica aún. Se justifican pasos de investigación, pruebas y parches incrementales.
