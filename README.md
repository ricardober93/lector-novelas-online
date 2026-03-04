# Panels - Plataforma de Lectura de Mangas y Cómics

**Panels** (panels.lat) es una plataforma web minimalista para leer mangas, cómics, novelas visuales y manguas de forma gratuita, donde creadores independientes pueden publicar su contenido.

## 🎯 Visión

Crear una plataforma accesible para lectores latinoamericanos y creadores independientes, con experiencia de lectura fluida y contenido gratuito.

## ✨ Características Principales

### Para Lectores
- 📖 Lectura con scroll infinito
- 📱 Diseño responsive (web + mobile)
- 📊 Historial de lectura automático
- 🔍 Búsqueda y descubrimiento de contenido
- ⚙️ Preferencias personalizadas (contenido +18)

### Para Creadores
- 📤 Upload simple via ZIP o drag & drop
- 📚 Organización: Serie → Volumen → Capítulo
- 📈 Panel con estadísticas básicas
- ✅ Sistema de moderación

### Para la Plataforma
- 🆓 Acceso gratuito
- 📢 Monetización mediante publicidad no intrusiva
- 🔒 Moderación de contenido
- 🌎 Enfocado en Latinoamérica

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14 (App Router)
- **Auth:** NextAuth.js + Resend (magic link)
  - **Note:** Account records are automatically created during magic link authentication via signIn callback
  - **Migration:** Run `scripts/migrate-missing-accounts.ts` to create Account records for existing users
- **Database:** Neon (PostgreSQL)
- **ORM:** Prisma
- **Storage:** Vercel Blob
- **Hosting:** Vercel

## 📁 Estructura del Proyecto

```
panels/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── (auth)/            # Auth pages
│   ├── creator/           # Creator dashboard
│   └── series/            # Series and reading pages
├── components/            # React components
├── lib/                   # Utilities and helpers
├── prisma/               # Database schema
└── public/               # Static assets
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta en [Neon](https://neon.tech)
- Cuenta en [Resend](https://resend.com)
- Cuenta en [Vercel](https://vercel.com)

### Instalación

1. **Clonar repositorio**
```bash
git clone https://github.com/tu-org/panels.git
cd panels
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```bash
DATABASE_URL="postgresql://..."          # Neon connection string
NEXTAUTH_SECRET="tu-secret-aqui"         # Generar con: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_xxxxx"                # Resend API key
BLOB_READ_WRITE_TOKEN="vercel_blob_xxx"  # Vercel Blob token
```

4. **Configurar base de datos**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📖 Documentación

La documentación completa del proyecto está en `/openspec/changes/panels-platform/`:

- **[proposal.md](./openspec/changes/panels-platform/proposal.md)** - Visión, alcance y objetivos
- **[design.md](./openspec/changes/panels-platform/design.md)** - Arquitectura técnica detallada
- **[tasks.md](./openspec/changes/panels-platform/tasks.md)** - Plan de implementación
- **[specs/](./openspec/changes/panels-platform/specs/)** - Especificaciones por funcionalidad:
  - [auth/spec.md](./openspec/changes/panels-platform/specs/auth/spec.md)
  - [upload/spec.md](./openspec/changes/panels-platform/specs/upload/spec.md)
  - [reading/spec.md](./openspec/changes/panels-platform/specs/reading/spec.md)

## 🗓️ Roadmap

### MVP (3 meses)
- [x] Autenticación con magic link
- [ ] CRUD de series, volúmenes, capítulos
- [ ] Upload de imágenes (ZIP y drag & drop)
- [ ] Lector con scroll infinito
- [ ] Historial de lectura
- [ ] Moderación de contenido
- [ ] Publicidad integrada

### Post-MVP
- [ ] Búsqueda avanzada
- [ ] Filtros por género/tipo
- [ ] Favoritos y bookmarks
- [ ] Dark mode
- [ ] App móvil (React Native)
- [ ] Offline reading

## 🤝 Contribuir

1. Fork el repositorio
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Por definir

## 👥 Equipo

- Ricardo Bermudez - Creador

## 🙏 Agradecimientos

- Next.js team
- Vercel
- Prisma team
- Resend

---

**Estado:** 🚧 En desarrollo | **Versión:** 0.1.0-alpha

Para más información, revisa la [documentación completa](./openspec/changes/panels-platform/proposal.md).
