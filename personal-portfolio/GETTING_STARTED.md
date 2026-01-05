# Getting Started - Personal Portfolio

Welcome! Your personal portfolio project is ready. Here's everything you need to know to get started.

## 📁 Project Overview

Your portfolio application has been created with a modern, professional architecture:

```
personal-portfolio/
├── frontend/          # Next.js React application (Port 3000)
├── backend/           # Express API server (Port 3001)
├── docs/              # Documentation
├── docker-compose.yml # Container orchestration
└── README.md          # Main documentation
```

## 🚀 Installation Steps

### Step 1: Install Node.js

**Download and install Node.js 18 or later:**
- Visit https://nodejs.org/
- Download LTS version
- Follow installation wizard
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### Step 2: Install PostgreSQL (Optional if using Docker)

**For local development without Docker:**
- Download PostgreSQL 15+ from https://www.postgresql.org/download/
- Or use Docker: `docker run --name portfolio-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=portfolio -p 5432:5432 -d postgres:15-alpine`

### Step 3: Install Backend Dependencies

```bash
cd c:\Repositories\personal-portfolio\backend
npm install
```

### Step 4: Configure Backend

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your database URL
# Default: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio
```

### Step 5: Install Frontend Dependencies

```bash
cd c:\Repositories\personal-portfolio\frontend
npm install
```

### Step 6: Configure Frontend

```bash
cp .env.example .env.local
# No changes needed for local development (defaults are correct)
```

## 🏃 Running in Development

### Terminal 1 - Start Backend API

```bash
cd c:\Repositories\personal-portfolio\backend
npm run dev
```

Expected output:
```
✅ Database connected
🚀 Server running on http://localhost:3001
📝 API: http://localhost:3001/api
```

### Terminal 2 - Start Frontend

```bash
cd c:\Repositories\personal-portfolio\frontend
npm run dev
```

Expected output:
```
  ▲ Next.js 14.x
  ✓ Ready in 2.5s
  - Local: http://localhost:3000
```

### Access Your Application

- **Frontend**: http://localhost:3000
- **API Health**: http://localhost:3001/health
- **Default Credentials**: Email & password (you need to set this up - see below)

## 🔐 Initial User Setup

Since this is a single-user portfolio, you need to create your admin account.

### Option 1: Using Database CLI

```bash
# Connect to PostgreSQL
psql -U postgres -d portfolio

# Generate a bcrypt password hash using this command first:
# npm install -g bcrypt-cli
# bcrypt your-password

# Then insert your user (replace hash below):
INSERT INTO users (id, email, password, name, bio)
VALUES (
  gen_random_uuid(),
  'your@email.com',
  '$2a$10$...',  -- your bcrypt hash here
  'Your Name',
  'Your bio'
);
```

### Option 2: Use bcrypt-cli

```bash
# Install bcrypt globally
npm install -g bcrypt-cli

# Generate hash
bcrypt yourpassword

# Copy the hash output and paste into the SQL command above
```

### Option 3: Using Online Tool (not recommended for production)

1. Visit https://bcrypt-generator.com/
2. Enter your password
3. Generate hash
4. Insert into database

## 🐳 Docker Setup (Recommended)

### Step 1: Install Docker

Download Docker Desktop from https://www.docker.com/products/docker-desktop

### Step 2: Prepare Environment File

```bash
cd c:\Repositories\personal-portfolio
cp .env.example .env

# Edit .env with your values:
# DB_PASSWORD=your-secure-password
# JWT_SECRET=your-32-character-secret-key
# NEXTAUTH_SECRET=your-32-character-secret-key
```

### Step 3: Start Docker Services

```bash
cd c:\Repositories\personal-portfolio
docker-compose up -d
```

### Step 4: Verify Services

```bash
docker-compose ps
```

Should show:
```
NAME              STATUS
portfolio-db      Up
portfolio-api     Up
portfolio-web     Up
```

### Access Docker Application

- Frontend: http://localhost:3000
- API: http://localhost:3001/api
- Database: localhost:5432

## 🌐 Features Overview

### Home Page
- Beautiful landing page
- Feature showcase
- Quick access to timeline and login

### Timeline (Public)
- Browse entries organized by year and month
- View entry previews
- Click to read full entries
- Shows media and embed counts

### Dashboard (Private - Login Required)
- Create new entries
- Edit existing entries
- Upload media (images, videos, documents)
- Manage entries (publish, archive, delete)
- View entry statistics

### Entry Features
- **Rich Content**: Title, content, summary, date, tags
- **Media**: Upload and display images/videos
- **Embeds**: Embed Instagram, YouTube, Twitter, TikTok, Vimeo, Spotify
- **Organization**: Automatic month/year grouping
- **Status**: Draft, Published, or Archived

## 📸 Supported Media Types

### Images
- JPG, JPEG, PNG, GIF
- Automatic thumbnail generation
- Optimization for web

### Videos
- MP4, MOV, WebM
- Embed or upload directly

### Documents
- PDF, DOC, DOCX
- Stored and linked in entries

## 🔗 Embed Support

Automatically extracts metadata and generates embed code for:

- **Instagram**: Posts and reels
- **YouTube**: Videos with thumbnails
- **Twitter/X**: Posts
- **TikTok**: Videos
- **Vimeo**: Videos
- **Spotify**: Tracks and albums
- **Custom**: Any link

## 📱 Accessing from Multiple Devices

Your portfolio is designed to work on:
- Desktop browsers
- Tablets
- Mobile phones
- Different operating systems

Just log in with the same credentials on any device.

## 🔒 Security

- Only you can log in (no public registration)
- Passwords are encrypted with bcrypt
- JWT tokens for session management
- HTTPS ready for production
- CORS protection enabled
- Environment variables for secrets (never commit .env)

## 🚀 Deployment Options

### NAS Self-Hosting (Recommended)
See [docs/NAS_DEPLOYMENT.md](docs/NAS_DEPLOYMENT.md)

### Docker Local Network
Already configured in docker-compose.yml

### Cloud Hosting
Can be deployed to:
- AWS EC2 + RDS
- DigitalOcean
- Railway
- Render
- Vercel (frontend) + external API

## 📚 Documentation

- **[README.md](README.md)** - Main project overview
- **[docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)** - Detailed setup instructions
- **[docs/NAS_DEPLOYMENT.md](docs/NAS_DEPLOYMENT.md)** - NAS deployment guide
- **[docs/API_REFERENCE.md](docs/API_REFERENCE.md)** - Complete API documentation

## 🔧 Common Commands

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run typeorm      # Run TypeORM migrations
npm run seed         # Seed database with sample data
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f            # View logs
docker-compose ps                 # List running containers
docker-compose exec api npm ...   # Run commands in container
```

## 🐛 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Windows - Find process using port
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error

```bash
# Check if database is running
psql -U postgres -d portfolio

# If not, create it:
createdb portfolio

# With Docker:
docker-compose restart db
```

### npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules

# Reinstall
npm install
```

### Can't access API from frontend

```bash
# Check if API is running
curl http://localhost:3001/health

# Check CORS settings in backend/src/index.ts
# Ensure NEXT_PUBLIC_API_URL is correct in frontend/.env.local
```

## 📝 Creating Your First Entry

1. Navigate to http://localhost:3000/login
2. Enter your email and password
3. Click the "Dashboard" link
4. Click "New Entry"
5. Fill in:
   - **Title**: Main topic
   - **Content**: Your story/thoughts
   - **Date**: When this happened
   - **Summary**: Brief preview (shows on timeline)
   - **Tags**: Comma-separated (travel, photography, etc)
   - **Status**: Draft or Published
6. Click "Create Entry"
7. Upload media (optional):
   - Click to add images/videos
   - Add embed links (Instagram, YouTube, etc)
8. View on timeline at http://localhost:3000/timeline

## 🎨 Customization

### Change Colors/Theme
Edit [frontend/tailwind.config.js](frontend/tailwind.config.js)

### Change Portfolio Name
Edit [frontend/src/app/page.tsx](frontend/src/app/page.tsx) and [frontend/src/app/layout.tsx](frontend/src/app/layout.tsx)

### Add Custom Pages
Create new files in `frontend/src/app/` using Next.js App Router

### Modify API
Edit files in `backend/src/routes/` and `backend/src/services/`

## 📊 File Upload Limits

Current limits (configurable in .env):
- **Max file size**: 50MB
- **Allowed types**: jpg, jpeg, png, gif, mp4, mov, webm, pdf, doc, docx

## 🚀 Next Steps

1. **Create your user account** (see Initial User Setup above)
2. **Log in** and explore the dashboard
3. **Create your first entry** with some photos and content
4. **Customize** the appearance to match your style
5. **Deploy to NAS** for permanent hosting (see NAS_DEPLOYMENT.md)

## 📱 Mobile/Android App

Coming soon! The Android app will allow you to:
- Create and edit entries on the go
- Upload photos directly from phone
- Manage media library
- Browse timeline offline
- Receive notifications

## 🤔 Questions?

Refer to:
1. **Setup issues**: [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)
2. **API questions**: [docs/API_REFERENCE.md](docs/API_REFERENCE.md)
3. **Deployment**: [docs/NAS_DEPLOYMENT.md](docs/NAS_DEPLOYMENT.md)

## ✅ Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Update JWT_SECRET to a long random string
- [ ] Update NEXTAUTH_SECRET
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure custom domain
- [ ] Set up automated backups
- [ ] Review security settings
- [ ] Test on multiple devices
- [ ] Verify all features work

## 🎉 You're Ready!

Your personal portfolio is ready to use. Start creating entries and sharing your story!

---

**Made with ❤️ for capturing your life's moments**

Need help? Check the docs folder for detailed guides.
