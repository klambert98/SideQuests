# Setup & Installation Guide

## Quick Start (Development)

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org/))
- npm (comes with Node.js)
- PostgreSQL 15+ ([download](https://www.postgresql.org/download/)) or Docker
- Git

### 1. Clone/Setup Project

```bash
cd personal-portfolio
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your database URL and secrets
nano .env
```

**Backend .env example:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/portfolio
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this
API_PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup

**Option A: Using Docker**
```bash
docker run --name portfolio-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=portfolio \
  -p 5432:5432 \
  -d postgres:15-alpine
```

**Option B: Local PostgreSQL**
```bash
createdb portfolio
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Update .env.local
nano .env.local
```

**Frontend .env.local example:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### 5. Start Development Servers

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

Access at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

## Initial Setup

### Create Admin User

You'll need to set up your password in the database. For development, you can use bcrypt to generate a hash:

```bash
# Install bcrypt-cli
npm install -g bcrypt-cli

# Generate password hash
bcrypt your-password
# Copy the hash
```

Then insert into database:

```bash
# Connect to database
psql portfolio

# Insert user
INSERT INTO users (id, email, password, name, bio)
VALUES (
  gen_random_uuid(),
  'your@email.com',
  '$2a$10$...',  -- paste hash here
  'Your Name',
  'Your bio'
);
```

### First Login

1. Go to http://localhost:3000/login
2. Enter your email and password
3. Click "Login"

## Docker Deployment

### Prerequisites
- Docker ([install](https://docs.docker.com/get-docker/))
- Docker Compose ([install](https://docs.docker.com/compose/install/))

### Production Build

```bash
# Create .env file in root
cp .env.example .env

# Edit with your production values
nano .env

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Verify Installation

```bash
# Check database
docker-compose exec db psql -U postgres -d portfolio -c "SELECT COUNT(*) FROM users;"

# Check API
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3000
```

## Project Structure

```
personal-portfolio/
├── backend/                 # Express API
│   ├── src/
│   │   ├── entities/       # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, error handling
│   │   └── index.ts        # App entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/               # Next.js app
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities & API calls
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # CSS & Tailwind
│   ├── public/            # Static files
│   ├── package.json
│   └── Dockerfile
│
├── docs/                  # Documentation
│   └── NAS_DEPLOYMENT.md
│
└── docker-compose.yml     # Docker services
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `POST /api/auth/logout` - Logout

### Entries (Blog Posts)
- `GET /api/entries` - Get all (paginated)
- `GET /api/entries/timeline` - Get timeline organized by month
- `GET /api/entries/month/:year/:month` - Get entries for specific month
- `GET /api/entries/:id` - Get single entry
- `POST /api/entries` - Create entry (auth required)
- `PUT /api/entries/:id` - Update entry (auth required)
- `DELETE /api/entries/:id` - Delete entry (auth required)

### Media
- `POST /api/media/upload` - Upload file (auth required)
- `GET /api/media/entry/:entryId` - Get media for entry
- `DELETE /api/media/:id` - Delete media (auth required)

### Embeds
- `POST /api/embeds` - Create embed (auth required)
- `DELETE /api/embeds/:id` - Delete embed (auth required)

## Common Tasks

### Create New Entry

1. Log in to dashboard
2. Click "New Entry"
3. Fill in title, content, date
4. Upload images/videos
5. Add embed links (Instagram, YouTube, etc)
6. Click "Create Entry"

### Upload Media

Media is uploaded when creating an entry. Supported formats:
- **Images**: JPG, PNG, GIF
- **Videos**: MP4, MOV, WebM
- **Documents**: PDF, DOC, DOCX

### Embed Content

Supported embeds:
- Instagram posts
- YouTube videos
- Twitter/X posts
- TikTok videos
- Vimeo videos
- Spotify tracks
- Custom links

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Kill process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check if database is running
psql -U postgres -d portfolio

# Reset database
dropdb portfolio
createdb portfolio
```

### Build Fails

```bash
# Clear caches
cd frontend && npm cache clean --force && rm -rf node_modules
cd ../backend && npm cache clean --force && rm -rf node_modules

# Reinstall
npm install
```

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - development, production, test
- `JWT_SECRET` - Secret for JWT tokens (min 32 chars)
- `API_PORT` - Port API runs on (default 3001)
- `CORS_ORIGIN` - Frontend URL for CORS

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXTAUTH_URL` - Your application URL
- `NEXTAUTH_SECRET` - Secret for NextAuth (min 32 chars)

## Next Steps

1. [NAS Deployment Guide](./docs/NAS_DEPLOYMENT.md) - Deploy to your NAS
2. Create Android app - Coming soon
3. Set up automated backups
4. Configure custom domain
5. Set up SSL certificate (Let's Encrypt)

## Support & Troubleshooting

For issues:
1. Check logs: `docker-compose logs api`
2. Verify database: `docker-compose exec db psql -U postgres -d portfolio`
3. Test API: `curl http://localhost:3001/health`
4. Check all containers: `docker-compose ps`

## License

MIT - Personal use

## Credits

Built with:
- Next.js 14
- Express
- PostgreSQL
- TypeORM
- Tailwind CSS
- Docker
