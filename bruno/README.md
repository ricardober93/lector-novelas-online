# Colección Bruno - Usuarios

Esta colección asume que ya tienes una sesión de administrador activa y puedes pegar la cookie en `authCookie`.

Ejemplo de ejecución:

```bash
bru run bruno/users --env local --workspace-path .
```

Si prefieres usar otro host, cambia `baseUrl` en `bruno/environments/local.bru`.
Si necesitas autenticarte, copia la cookie de sesión del navegador en `authCookie` dentro de ese mismo archivo.
