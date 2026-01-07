# Setup & Installation Guide

Welcome! Your personal portfolio project is ready. This comprehensive guide covers everything from initial setup through deployment.

## 🚀 Quick Start (5 minutes)

### Prerequisites
- **Node.js 18+** - [Download](https://nodejs.org/) LTS version
- **npm** - Comes with Node.js
- **PostgreSQL 15+** OR **Docker** - [Download](https://www.postgresql.org/download/)
- **Git** - Optional but recommended

### Quick Installation
```bash
# 1. Navigate to project
cd personal-portfolio

# 2. Install all dependencies
npm run install:all

# 3. Setup environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 4. Start development
npm run dev
```

**Access at:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/health

---

## 📁 Project Overview

```
personal-portfolio/
├── frontend/          # Next.js React application (Port 3000)
├── backend/           # Express API server (Port 3001)
├── docs/              # Documentation
├── deploy/            # Deployment scripts & database
├── docker-compose.yml # Container orchestration
└── README.md          # Main project documentation
```

---

## 🔧 Detailed Installation

### Step 1: Install Node.js

1. Visit https://nodejs.org/
2. Download the **LTS** (Long Term Support) version
3. Run the installer and follow the wizard
4. Verify installation:
   ```bash
   node --version    # Should be 18+
   npm --version     # Should be 8+
   ```

### Step 2: Setup Database

#### Option A: Docker (Recommended)
```bash
docker run --name portfolio-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=portfolio \
  -p 5432:5432 \
  -d postgres:15-alpine
```

#### Option B: Local PostgreSQL
```bash
createdb portfolio
```

Verify connection:
```bash
psql -U postgres -d portfolio -c "SELECT 1;"
```

### Step 3: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Backend `.env` template:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-min-32-chars
API_PORT=3001
CORS_ORIGIN=http://localhost:3000
RESEND_API_KEY=optional
```

**Key variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random 32+ character string for tokens
- `API_PORT` - Port for backend server

### Step 4: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Frontend `.env.local` template:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-min-32-chars
```

**Key variables:**
- `NEXT_PUBLIC_API_URL` - Backend API endpoint
- `NEXTAUTH_SECRET` - Random 32+ character string

### Step 5: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
✅ Database connected
🚀 Server running on http://localhost:3001
📝 API endpoints available
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
  ▲ Next.js 14.x
  ✓ Ready in 2.5s
  - Local: http://localhost:3000
```

**Verify Both Running:**
```bash
# In new terminal
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

---

## 🔐 Initial User Setup

Create your admin account to log in.

### Option 1: Using Database CLI (Recommended)

```bash
# Install bcrypt password hasher
npm install -g bcrypt-cli

# Generate password hash
bcrypt your-secure-password
# Output will look like: $2a$10$...
```

Connect to database and create user:
```bash
psql -U postgres -d portfolio

# Paste this, replacing the hash:
INSERT INTO users (id, email, password, name, bio)
VALUES (
  gen_random_uuid(),
  'your@email.com',
  '$2a$10$...',  -- paste hash from bcrypt output
  'Your Name',
  'Your bio'
);
```

### Option 2: Online Tool (Quick but not recommended for production)

1. Visit https://bcrypt-generator.com/
2. Enter your desired password
3. Click "Hash"
4. Copy the result and use in SQL INSERT above

### First Login

1. Go to http://localhost:3000/login
2. Enter email and password
3. Click "Login"

---

## 🐳 Docker Setup (Complete Environment)

### Prerequisites
- Docker Desktop - [Download](https://www.docker.com/products/docker-desktop)
- Docker Compose - Included with Docker Desktop

### Quick Docker Deployment

```bash
cd c:\Repositories\personal-portfolio

# Setup environment
cp .env.example .env

# Edit .env with your secrets
nano .env

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps
```

Expected output:
```
NAME              STATUS
portfolio-db      Up (healthy)
portfolio-api     Up
portfolio-web     Up
```

### Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Database**: localhost:5432

### Verify Installation

```bash
# Check database
docker-compose exec db psql -U postgres -d portfolio \
  -c "SELECT COUNT(*) FROM users;"

# Check API health
curl http://localhost:3001/health

# View logs
docker-compose logs -f api
```

### Stop Services

```bash
# Stop all containers (keep data)
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

---

## 📊 Project Structure

```
personal-portfolio/
│
├── backend/                     # Express.js API
│   ├── src/
│   │   ├── entities/           # Database models (TypeORM)
│   │   │   ├── User.ts
│   │   │   ├── Entry.ts
│   │   │   ├── Media.ts
│   │   │   └── Embed.ts
│   │   ├── routes/             # API endpoint definitions
│   │   ├── services/           # Business logic layer
│   │   ├── middleware/         # Auth, error handling, CORS
│   │   ├── config/             # Database configuration
│   │   └── index.ts            # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                    # Next.js React app
│   ├── src/
│   │   ├── app/                # Pages (Next.js App Router)
│   │   │   ├── page.tsx        # Home page
│   │   │   ├── login/          # Login page
│   │   │   ├── dashboard/      # Admin dashboard
│   │   │   └── timeline/       # Timeline view
│   │   ├── components/         # Reusable React components
│   │   ├── lib/                # Utilities and API client
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript types
│   │   └── styles/             # CSS and Tailwind
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/                        # Documentation
│   ├── SETUP_GUIDE.md          # This file
│   ├── NAS_DEPLOYMENT.md       # NAS self-hosting
│   ├── API_REFERENCE.md        # Complete API docs
│   └── (Local test & NAS deploy notes are now in this guide; see section below)
│
├── deploy/                      # Deployment tools
│   ├── database/               # Database schema & seeds
│   ├── scripts/                # Deployment scripts
│   └── deploy-database.js
│
└── docker-compose.yml          # Multi-container setup
```

---

## 📖 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/logout` - Logout

### Entries (Blog Posts)
- `GET /api/entries` - Get all entries (paginated)
- `GET /api/entries/timeline` - Get timeline by month/year
- `GET /api/entries/month/:year/:month` - Entries for specific month
- `GET /api/entries/:id` - Get single entry
- `POST /api/entries` - Create entry (auth required)
- `PUT /api/entries/:id` - Update entry (auth required)
- `DELETE /api/entries/:id` - Delete entry (auth required)

### Media Files
- `POST /api/media/upload` - Upload image/video/document
- `GET /api/media/entry/:entryId` - Get media for entry
- `DELETE /api/media/:id` - Delete media file (auth required)

### Embeds
- `POST /api/embeds` - Create embed (Instagram, YouTube, etc)
- `DELETE /api/embeds/:id` - Delete embed (auth required)

See [API_REFERENCE.md](./API_REFERENCE.md) for complete documentation.

---

## 🌐 Features Overview

### Home Page
- Landing page with feature showcase
- Navigation to timeline and login
- Responsive design with dark mode

### Timeline (Public)
- Browse entries organized by year and month
- Entry previews with media thumbnails
- Click to read full entries
- Shows media and embed counts

### Dashboard (Private - Login Required)
- Create new entries
- Edit/delete existing entries
- Upload media (images, videos, documents)
- Manage entry status (draft, published, archived)
- View entry statistics

### Entry Features
- **Content**: Title, body text, summary, publication date
- **Media**: Upload images, videos, documents
- **Embeds**: Instagram, YouTube, TikTok, Twitter, Vimeo, Spotify
- **Organization**: Auto-grouped by month/year
- **Status**: Draft, Published, or Archived

---

## 📸 Supported Media Types

### Images
- JPG, JPEG, PNG, GIF, WebP
- Automatic thumbnail generation
- Optimized for web display
- Max 50MB per file

### Videos
- MP4, MOV, WebM
- Embedded players
- Max 50MB per file

### Documents
- PDF, DOC, DOCX
- Stored and linked in entries
- Max 50MB per file

---

## 🔗 Embed Support

Automatically detects and embeds:
- **Instagram** - Posts and reels
- **YouTube** - Videos with thumbnails and play buttons
- **TikTok** - Full video players
- **Twitter/X** - Tweet embeds
- **Vimeo** - Video player embeds
- **Spotify** - Track and album players
- **Generic Links** - Any URL with Open Graph metadata

---

## 🎨 Customization

### Change Colors & Theme
Edit [frontend/tailwind.config.js](../frontend/tailwind.config.js):
```javascript
module.exports = {
  theme: {
    colors: {
      primary: '#your-color',
      // ... more colors
    }
  }
}
```

### Change Portfolio Name/Title
Edit [frontend/src/app/layout.tsx](../frontend/src/app/layout.tsx):
```typescript
export const metadata = {
  title: 'Your Portfolio Name',
  description: 'Your portfolio description',
}
```

### Add Custom Pages
Create new files in [frontend/src/app/](../frontend/src/app/):
```typescript
// frontend/src/app/about/page.tsx
export default function About() {
  return <h1>About Me</h1>
}
```

### Modify API Logic
Edit [backend/src/services/](../backend/src/services/):
- Add business logic here
- Modify data transformations
- Add new endpoints in [backend/src/routes/](../backend/src/routes/)

---

## 🔒 Environment Variables

### Backend Variables
| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:pw@localhost:5432/portfolio` | Database connection |
| `NODE_ENV` | `development` | Environment (development/production) |
| `JWT_SECRET` | `abc123...` | Secret for JWT tokens (32+ chars) |
| `API_PORT` | `3001` | Port for API server |
| `CORS_ORIGIN` | `http://localhost:3000` | Frontend URL for CORS |
| `RESEND_API_KEY` | `re_xxx` | Email service API key (optional) |

### Frontend Variables
| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | Backend API URL |
| `NEXTAUTH_URL` | `http://localhost:3000` | Your app URL |
| `NEXTAUTH_SECRET` | `xyz789...` | Auth secret (32+ chars) |

Generate random secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📱 Creating Your First Entry

1. **Log in**
   - Navigate to http://localhost:3000/login
   - Enter your email and password

2. **Create entry**
   - Click "Dashboard" link
   - Click "New Entry" button
   - Fill in:
     - **Title** - Main topic
     - **Content** - Your story/thoughts (markdown supported)
     - **Date** - When this happened
     - **Summary** - Short preview for timeline
     - **Tags** - Comma-separated (travel, photography, etc)

3. **Add media**
   - Click upload area
   - Select images, videos, or documents
   - Images auto-optimize

4. **Add embeds**
   - Paste Instagram, YouTube, TikTok, etc. links
   - System auto-detects and embeds

5. **Publish**
   - Choose status (Draft or Published)
   - Click "Create Entry"

6. **View on timeline**
   - Visit http://localhost:3000/timeline
   - Browse by month/year

---

## 🐛 Troubleshooting

### "Port Already in Use"

```bash
# Find process using port (Windows)
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Or change ports in .env
API_PORT=3002
```

### Database Connection Error

```bash
# Check if database is running
psql -U postgres -d portfolio

# Create database if needed
createdb portfolio

# Reset with Docker
docker-compose restart db
docker-compose logs db
```

### npm install Fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules

# Reinstall
npm install
```

### API/Frontend Can't Connect

```bash
# Check API is running
curl http://localhost:3001/health

# Verify NEXT_PUBLIC_API_URL in frontend/.env.local
# Should be: http://localhost:3001/api

# Check CORS_ORIGIN in backend/.env
# Should be: http://localhost:3000
```

### Docker Issues

```bash
# View logs
docker-compose logs -f api

# Rebuild images
docker-compose up -d --build

# Clean everything (WARNING: deletes data)
docker-compose down -v
```

### "Cannot find module" Errors

```bash
# Clear TypeScript cache
rm -rf backend/dist
rm -rf frontend/.next

# Rebuild
npm run build
```

---

## 🔄 Common Commands

### Backend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm test             # Run tests
npm run typeorm      # Run TypeORM CLI
```

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run ESLint
```

### Docker Commands
```bash
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs -f            # View logs
docker-compose ps                 # List containers
docker-compose exec api sh        # Enter API container
docker-compose exec db psql ...   # Run psql commands
```

---

## 📱 Multi-Device Access

Your portfolio works on:
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Tablets (iPad, Android tablets)
- ✅ Smartphones (iOS, Android)
- ✅ All modern browsers

Just log in with the same credentials on any device. Data syncs automatically.

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Generate new `JWT_SECRET` (32+ random characters)
- [ ] Generate new `NEXTAUTH_SECRET` (32+ random characters)
- [ ] Set `NODE_ENV=production` in backend
- [ ] Use HTTPS (SSL certificate)
- [ ] Configure strong CORS_ORIGIN
- [ ] Set up database backups
- [ ] Enable firewall rules
- [ ] Review .env file (never commit it)
- [ ] Test on multiple devices

---

## 📚 Next Steps

1. **Explore the dashboard** - Create a few test entries
2. **Customize appearance** - Change colors and branding
3. **Deploy locally** - Use Docker for consistent environment
4. **Self-host on NAS** - See [NAS_DEPLOYMENT.md](./NAS_DEPLOYMENT.md)
5. **Set up backups** - Database and file backups
6. **Add custom domain** - Configure DNS and SSL

---

## 🆘 Getting Help

If something doesn't work:

1. **Check logs**
   ```bash
   docker-compose logs -f api
   docker-compose logs -f web
   ```

2. **Verify database**
   ```bash
   psql -U postgres -d portfolio -c "\dt"
   ```

3. **Test API**
   ```bash
   curl http://localhost:3001/health
   ```

4. **Read documentation**
   - [API_REFERENCE.md](./API_REFERENCE.md) - API details
   - [NAS_DEPLOYMENT.md](./NAS_DEPLOYMENT.md) - Deployment
   - Local Test & NAS Deploy Cheat Sheet (see section below) - Quick tips

---

## Local Test & NAS Deploy Cheat Sheet

A compact reference for running the project locally and deploying to your NAS via Git pulls.

### Stack & Ports
- Frontend: Next.js (port 3000)
- API: Express/TypeORM (port 3001)
- DB: Postgres (port 5432)
- Compose services: db, api, web (see [docker-compose.yml](../docker-compose.yml))
- Persistent data: Postgres volume `postgres_data`, media uploads bind-mounted from `backend/uploads`

### Quick Local Test
**Option A – Docker (recommended)**
1. From repo root: `cp .env.example .env` and fill values.
2. Start DB only first (avoids API boot errors if DB isn’t ready): `docker-compose up -d db`.
3. Start everything: `docker-compose up -d`.
4. Verify: `docker-compose ps`, then open http://localhost:3000 and http://localhost:3001/health.

**Option B – Node processes**
1. Backend: `cd backend && npm install && cp .env.example .env && npm run dev` (requires local Postgres running at `DATABASE_URL`).
2. Frontend (new terminal): `cd frontend && npm install && cp .env.example .env.local && npm run dev`.
3. Open http://localhost:3000.

### NAS Deploy via Git Pulls (Synology-friendly)
Prereqs: SSH enabled on NAS, Git, Docker, Docker Compose installed; folder like `/volume1/docker/portfolio`.

**First-time setup**
1. SSH to NAS and clone: `git clone <your-repo-url> /volume1/docker/portfolio`.
2. `cd /volume1/docker/portfolio`.
3. Copy env: `cp .env.example .env`, then set at minimum:
   - DB_USER, DB_PASSWORD, DB_NAME
   - JWT_SECRET (32+ chars), NEXTAUTH_SECRET (32+ chars)
   - CORS_ORIGIN (e.g., http://nas-ip:3000 or your domain)
   - NEXTAUTH_URL (frontend URL)
4. Ensure uploads folder exists on host: `mkdir -p backend/uploads`.
5. Start DB: `docker-compose up -d db` and wait for healthy status.
6. Start/initialize API+web: `docker-compose up -d --build`.
7. (If migrations are enabled) run once: `docker-compose exec api npm run migrate`.
8. Verify: `docker-compose ps`, curl `http://localhost:3001/health`, open `http://localhost:3000` (or your domain if proxied).

**Updating to latest code**
1. SSH to NAS → `cd /volume1/docker/portfolio`.
2. Pull code: `git pull`.
3. Rebuild/restart: `docker-compose up -d --build`.
4. Run migrations if present: `docker-compose exec api npm run migrate`.
5. Optionally prune old images: `docker image prune -f`.

### Data & Backups
- DB data persists in `postgres_data` volume; avoid `docker-compose down --volumes` unless you intend to wipe data.
- Uploads live in `backend/uploads` (host-mounted); include in NAS backups.
- Manual DB backup: `docker-compose exec db pg_dump -U postgres ${DB_NAME:-portfolio} > backup.sql`.
- Restore: `docker-compose exec -T db psql -U postgres ${DB_NAME:-portfolio} < backup.sql`.

### Troubleshooting (fast checks)
- API can’t start / `ECONNREFUSED 5432`: ensure DB is up and `DATABASE_URL` matches `db:5432` in Compose.
- View logs: `docker-compose logs -f api` (or `web`, `db`).
- Healthcheck: `curl http://localhost:3001/health`.
- Port conflicts: edit port mappings in [docker-compose.yml](../docker-compose.yml) (e.g., change `3000:3000` to `8000:3000`).

### Security Notes
- Set strong, unique values for JWT_SECRET and NEXTAUTH_SECRET.
- Keep `.env` off Git and backed up privately.
- Add HTTPS and a reverse proxy when exposing to the internet (see [docs/NAS_DEPLOYMENT.md](NAS_DEPLOYMENT.md)).

### Related Docs
- Main README: [README.md](../README.md)
- Setup guide: [docs/SETUP_GUIDE.md](SETUP_GUIDE.md)
- Full NAS guide: [docs/NAS_DEPLOYMENT.md](NAS_DEPLOYMENT.md)
- API reference: [docs/API_REFERENCE.md](API_REFERENCE.md)

---

## Deployment

This section covers quick deployment commands, health checks, and production hosting on Fly.io.

### Quick Start Commands

**Fresh Local Deployment (Recommended first run)**
```bash
# From repo root
npm run install:all
cp .env.example .env
npm run deploy:local:fresh
```

Services:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Database: localhost:5432

**Update Existing Local Deployment**
```bash
npm run deploy:local
```

### Common Commands
```bash
# Development
npm run dev              # Run API and frontend in dev mode
npm run dev:api          # Run API only
npm run dev:web          # Run frontend only

# Deployment
npm run deploy:local         # Local Docker deploy
npm run deploy:local:fresh   # Fresh local deploy (deletes data)
npm run deploy:flyio         # Fly.io deploy
npm run deploy:db            # Database deploy only
npm run deploy:db:fresh      # Fresh database (deletes all data)

# Health Checks
npm run health          # Local health check
npm run health:flyio    # Fly.io health check

# Docker Management
npm run docker:up       # Start containers
npm run docker:down     # Stop containers
npm run docker:logs     # View logs
npm run docker:clean    # Remove data/containers
```

### Initial Setup Checklist

1. Copy `.env.example` to `.env` and update secrets:
```env
JWT_SECRET=<32+ char random>
NEXTAUTH_SECRET=<32+ char random>
```
2. Customize admin user in [deploy/database/seeds/01-create-admin-user.sql](../deploy/database/seeds/01-create-admin-user.sql)
3. First deploy: `npm run deploy:local:fresh`

To generate a password hash:
```bash
node -e "const bcrypt=require('bcryptjs');console.log(bcrypt.hashSync('your-password',10));"
```

### Verify Deployment
```bash
npm run health
```
Expected:
```
✓ API is healthy
✓ Frontend is healthy
✓ Database is healthy
```

### Fly.io Deployment (Production)

1. Install CLI and login:
```bash
iwr https://fly.io/install.ps1 -useb | iex
flyctl auth login
```
2. Create apps and database:
```bash
flyctl postgres create --name your-portfolio-db
cd backend && flyctl launch
cd ../frontend && flyctl launch
```
3. Attach database and set secrets:
```bash
flyctl postgres attach --app your-api-app your-portfolio-db
flyctl secrets set JWT_SECRET=xxx RESEND_API_KEY=yyy -a your-api-app
flyctl secrets set NEXTAUTH_SECRET=zzz -a your-web-app
```
4. Deploy:
```bash
npm run deploy:flyio
```

### Deployment Troubleshooting

Ports in use:
```bash
npm run docker:down
# Or edit port mappings in docker-compose.yml
```

Database connection failed:
```bash
docker-compose logs db
docker-compose restart db
```

API not starting:
```bash
docker-compose logs api
docker-compose up -d --build api
```

## 📄 License

MIT - Personal use

---

**Made with ❤️ for sharing your life's stories**

Need more help? Check the other documentation files or review the source code comments.
