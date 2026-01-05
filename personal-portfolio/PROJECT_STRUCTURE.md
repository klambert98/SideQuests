# Project Structure & Architecture

## Complete File Layout

```
personal-portfolio/
│
├── 📄 README.md                    # Main project documentation
├── 📄 README_MAIN.md               # Main README with overview
├── 📄 GETTING_STARTED.md           # Quick start guide (START HERE!)
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .env.example                 # Environment variables template
├── 🐳 docker-compose.yml           # Docker multi-container setup
│
├── 📁 frontend/                    # Next.js React Frontend
│   ├── 📄 package.json             # Dependencies & scripts
│   ├── 📄 tsconfig.json            # TypeScript configuration
│   ├── 📄 next.config.js           # Next.js configuration
│   ├── 📄 tailwind.config.js       # Tailwind CSS configuration
│   ├── 📄 postcss.config.js        # PostCSS configuration
│   ├── 📄 .eslintrc.json           # ESLint configuration
│   ├── 📄 .eslintignore            # ESLint ignore rules
│   ├── 📄 .env.example             # Frontend env template
│   ├── 📄 .gitignore               # Frontend git ignore
│   ├── 🐳 Dockerfile               # Docker image for frontend
│   │
│   ├── 📁 public/                  # Static assets
│   │   └── (favicon, manifest, etc)
│   │
│   └── 📁 src/                     # Source code
│       ├── 📁 app/                 # Next.js App Router pages
│       │   ├── 📄 layout.tsx       # Root layout
│       │   ├── 📄 page.tsx         # Home page
│       │   ├── 📁 login/           # Login page
│       │   │   └── 📄 page.tsx
│       │   ├── 📁 logout/          # Logout handler
│       │   │   └── 📄 page.tsx
│       │   ├── 📁 dashboard/       # Admin dashboard
│       │   │   └── 📄 page.tsx
│       │   ├── 📁 timeline/        # Timeline view
│       │   │   └── 📄 page.tsx
│       │   └── 📁 about/           # About page (optional)
│       │
│       ├── 📁 components/          # Reusable React components
│       │   ├── 📄 Timeline.tsx      # Timeline component
│       │   ├── 📄 EntryCard.tsx     # Entry display card
│       │   ├── 📄 MediaGallery.tsx  # Media gallery
│       │   └── 📄 EmbedRenderer.tsx # Embed renderer
│       │
│       ├── 📁 hooks/               # Custom React hooks
│       │   └── 📄 useAuth.ts        # Authentication hook
│       │
│       ├── 📁 lib/                 # Utilities & helpers
│       │   └── 📄 api.ts            # API client functions
│       │
│       ├── 📁 types/               # TypeScript type definitions
│       │   └── 📄 index.ts          # All types
│       │
│       └── 📁 styles/              # Global styles
│           └── 📄 globals.css       # Tailwind & global styles
│
├── 📁 backend/                     # Express.js API Server
│   ├── 📄 package.json             # Dependencies & scripts
│   ├── 📄 tsconfig.json            # TypeScript configuration
│   ├── 📄 .env.example             # Backend env template
│   ├── 📄 .gitignore               # Backend git ignore
│   ├── 🐳 Dockerfile               # Docker image for backend
│   │
│   └── 📁 src/                     # Source code
│       ├── 📄 index.ts             # Application entry point
│       │
│       ├── 📁 config/              # Configuration files
│       │   └── 📄 database.ts       # Database connection
│       │
│       ├── 📁 entities/            # Database models (TypeORM)
│       │   ├── 📄 User.ts           # User entity
│       │   ├── 📄 Entry.ts          # Blog entry entity
│       │   ├── 📄 Media.ts          # Media files entity
│       │   └── 📄 Embed.ts          # Embedded content entity
│       │
│       ├── 📁 routes/              # API endpoint definitions
│       │   ├── 📄 auth.ts           # Authentication routes
│       │   ├── 📄 entries.ts        # Entry CRUD routes
│       │   ├── 📄 media.ts          # Media upload routes
│       │   └── 📄 embeds.ts         # Embed routes
│       │
│       ├── 📁 controllers/         # Request handlers (optional)
│       │   └── (business logic in services/)
│       │
│       ├── 📁 middleware/          # Express middleware
│       │   ├── 📄 authenticate.ts   # JWT authentication
│       │   └── 📄 errorHandler.ts   # Error handling
│       │
│       ├── 📁 services/            # Business logic
│       │   ├── 📄 AuthService.ts    # Authentication logic
│       │   ├── 📄 EntryService.ts   # Entry operations
│       │   ├── 📄 MediaService.ts   # Media handling
│       │   └── 📄 EmbedService.ts   # Embed extraction
│       │
│       ├── 📁 utils/               # Utility functions
│       │   └── (helpers, validators, etc)
│       │
│       ├── 📁 migrations/          # Database migrations
│       │   └── (TypeORM migrations)
│       │
│       └── 📁 uploads/             # Uploaded media storage
│           ├── images/
│           ├── videos/
│           └── documents/
│
└── 📁 docs/                        # Documentation
    ├── 📄 SETUP_GUIDE.md           # Installation & setup
    ├── 📄 NAS_DEPLOYMENT.md        # NAS deployment guide
    └── 📄 API_REFERENCE.md         # Complete API docs

```

## Architecture Overview

### Frontend Architecture (Next.js)

```
┌─────────────────────────────────────┐
│     Next.js App Router              │
│  (pages/layouts/components)         │
└──────────────┬──────────────────────┘
               │
               ├─ Server Components
               │  (Layout, Pages)
               │
               ├─ Client Components
               │  (useAuth, useEffect)
               │
               └─ React Hooks
                  (useState, useEffect)
                       │
                       ↓
              ┌──────────────────┐
              │   API Client     │
              │   (lib/api.ts)   │
              └────────┬─────────┘
                       │
                       ↓
              ┌──────────────────┐
              │  Backend API     │
              │  (localhost:3001)│
              └──────────────────┘
```

### Backend Architecture (Express)

```
┌──────────────────────────────┐
│   HTTP Requests              │
│   (from Frontend)            │
└──────────────┬───────────────┘
               │
               ↓
        ┌─────────────┐
        │  Express    │
        │  Server     │
        └──────┬──────┘
               │
         ┌─────┴─────┐
         │           │
         ↓           ↓
    ┌────────┐  ┌─────────────┐
    │Routes  │  │ Middleware  │
    │        │  │             │
    │/api/.. │  │- Auth       │
    └───┬────┘  │- Error      │
        │       │- CORS       │
        ↓       └─────────────┘
    ┌────────┐
    │Services│
    │        │
    │- Auth  │
    │- Entry │
    │- Media │
    │- Embed │
    └───┬────┘
        │
        ↓
   ┌────────────────┐
   │  TypeORM       │
   │  Models        │
   └────────┬───────┘
            │
            ↓
   ┌──────────────────┐
   │  PostgreSQL      │
   │  Database        │
   │                  │
   │- users           │
   │- entries         │
   │- media           │
   │- embeds          │
   └──────────────────┘
```

### Database Schema

```
┌──────────────────┐
│ users            │
├──────────────────┤
│ id (uuid)        │
│ email            │
│ password (hash)  │
│ name             │
│ avatar           │
│ bio              │
│ createdAt        │
│ updatedAt        │
└────────┬─────────┘
         │
         │ (1:N)
         │
         ↓
┌──────────────────┐
│ entries          │
├──────────────────┤
│ id (uuid)        │
│ title            │
│ content          │
│ slug             │
│ status           │
│ entryDate        │
│ summary          │
│ tags (array)     │
│ views            │
│ authorId         │
│ createdAt        │
│ updatedAt        │
├─────────┬────────┤
│         │
│ (1:N)   │ (1:N)
│         │
↓         ↓
┌────────┐ ┌──────────────────┐
│ media  │ │ embeds           │
├────────┤ ├──────────────────┤
│ id     │ │ id (uuid)        │
│ url    │ │ type             │
│ size   │ │ url              │
│ type   │ │ embedCode        │
│ ..     │ │ thumbnail        │
│        │ │ metadata         │
└────────┘ │ entryId          │
           └──────────────────┘
```

## Key Files Explained

### Frontend Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Home page with landing |
| `src/app/dashboard/page.tsx` | Admin dashboard for creating/editing |
| `src/app/timeline/page.tsx` | Public timeline view |
| `src/app/login/page.tsx` | Authentication page |
| `src/lib/api.ts` | API client functions |
| `src/hooks/useAuth.ts` | Authentication hook |
| `src/types/index.ts` | TypeScript type definitions |
| `tailwind.config.js` | Styling theme configuration |

### Backend Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Express app initialization |
| `src/config/database.ts` | Database connection setup |
| `src/entities/*.ts` | Database model definitions |
| `src/routes/*.ts` | API endpoint definitions |
| `src/services/*.ts` | Business logic implementation |
| `src/middleware/authenticate.ts` | JWT authentication middleware |
| `src/services/MediaService.ts` | File upload handling |
| `src/services/EmbedService.ts` | External content extraction |

## Data Flow Examples

### Creating an Entry

```
Frontend                          Backend                    Database
   │                                │                           │
   └─ POST /api/entries ────────────┤                           │
      (title, content, etc)         │                           │
                                    └─ validate ──────────────┐ │
                                    │                         │ │
                                    │ ◄──────────────────────┘ │
                                    │                           │
                                    └─ save entry ─────────────>│
                                    │                           │
                                    │ ◄────── return entry ────│
                                    │                           │
   ◄───────── 201 Created ─────────┘
   (entry object)
```

### Uploading Media

```
Frontend                          Backend                    File System
   │                                │                           │
   └─ POST /api/media/upload ──────>│                           │
      (file bytes)                  │                           │
                                    └─ validate ──────────────┐ │
                                    │                         │ │
                                    │ ◄──────────────────────┘ │
                                    │                           │
                                    ├─ save file ───────────────>│
                                    │                           │
                                    ├─ generate thumbnail ──────┤
                                    │ (for images)              │
                                    │                           │
                                    ├─ save metadata ──────────>│
                                    │  (to database)       Database
                                    │                           │
   ◄───────── 201 Created ─────────┘
   (media object with URL)
```

### Rendering Timeline

```
Frontend                          Backend                    Database
   │                                │                           │
   └─ GET /api/entries/timeline ───>│                           │
                                    └─ query entries ──────────>│
                                    │ (grouped by month)        │
                                    │                           │
                                    │ ◄──── return data ────────│
                                    │                           │
   ◄──────── 200 OK ────────────────┘
   (nested structure)
   {
     "2026": {
       "01": [{...}, {...}],
       "02": [{...}]
     },
     "2025": {...}
   }
```

## Technology Decisions

| Aspect | Choice | Why |
|--------|--------|-----|
| Frontend Framework | Next.js 14 | SSR, App Router, built-in optimizations |
| Frontend Styling | Tailwind CSS | Utility-first, responsive, rapid development |
| Backend Framework | Express.js | Lightweight, flexible, great ecosystem |
| Database | PostgreSQL | Reliable, ACID-compliant, great for structured data |
| ORM | TypeORM | TypeScript support, migrations, relations |
| Authentication | JWT | Stateless, mobile-friendly, works with self-hosting |
| File Storage | Local filesystem | Self-hosted, no external dependencies |
| Containerization | Docker | Consistent across environments, easy deployment |
| Reverse Proxy | nginx | Lightweight, fast, SSL support (optional) |

## Performance Considerations

- Next.js App Router for optimized page loads
- Image optimization with Sharp (thumbnails)
- Database query optimization with relations
- File caching headers for static assets
- Pagination for timeline (prevent huge loads)
- JWT tokens for stateless authentication
- Docker volumes for database persistence

## Security Features

- Password hashing with bcrypt
- JWT authentication with expiration
- CORS protection
- TypeORM prevents SQL injection
- React XSS protection
- Environment variables for secrets
- HTTPS ready (Docker + nginx setup)
- Input validation on backend
- No public registration (single user)

---

This architecture provides a scalable, maintainable foundation for your personal portfolio that you can easily host on your NAS or cloud servers.
