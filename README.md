# Personal Life Portfolio

A beautiful, modern personal portfolio website to share pictures, videos, blog posts, and daily life updates. Features a timeline organized by months, media embeds (Instagram, YouTube, etc.), and a secure single-user authentication system.

## 🌟 Features

- 🗓️ **Timeline View** - Browse your life organized by months and years
- 📸 **Rich Media** - Upload photos, videos, and documents  
- 🎬 **Embed Content** - Embed Instagram posts, YouTube videos, and other websites
- ✍️ **Blog Posts** - Write and share your thoughts and experiences
- 🔒 **Secure** - Single-user authentication, only you can create entries
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌐 **Multi-Device Editing** - Access and edit from any device when logged in
- 🐳 **Docker Ready** - Easy self-hosting on NAS
- 🎨 **Beautiful UI** - Modern design with dark mode support
- 🔧 **API-Driven** - RESTful API for future integrations

## 🚀 Quick Start

**New to this project?** Start with [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for a comprehensive setup guide.

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL 15+ (only if running without Docker)

### Development Setup

1. **Install Node.js**
   - Download from [nodejs.org](https://nodejs.org/)

2. **Clone and setup**
   ```bash
   cd personal-portfolio
   npm run install:all  # Installs all dependencies
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database and secret keys
   ```

4. **Choose your setup method**

   **Option A: Docker (Recommended)**
   ```bash
   npm run deploy:local:fresh  # Fresh start with seeds
   # Access at http://localhost:3000
   ```

   **Option B: Local Node.js**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev

   # Terminal 2: Frontend
   cd frontend && npm run dev
   # Access at http://localhost:3000
   ```

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **NextAuth** - Authentication

### Backend
- **Node.js** with Express - Web framework
- **TypeORM** - Database ORM
- **PostgreSQL** - Relational database
- **JWT** - Token authentication
- **Multer** - File uploads
- **Sharp** - Image optimization

### DevOps
- **Docker** & Docker Compose - Containerization
- **nginx** - Reverse proxy

## 📁 Project Structure

```
personal-portfolio/
├── frontend/              # Next.js React application
│   ├── src/
│   │   ├── app/          # Pages and routes
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities
│   │   └── styles/       # CSS styles
│   └── public/           # Static assets
│
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── entities/     # Database models
│   │   ├── middleware/   # Auth & error handling
│   │   └── utils/        # Helpers
│   └── scripts/          # Utilities
│
├── deploy/               # Deployment tools
│   ├── database/         # Database schema & seeds
│   ├── scripts/          # Deployment scripts
│   └── utils/            # Utilities
│
├── docs/                 # Documentation
├── docker-compose.yml    # Docker services
└── .env.example          # Environment template
```

## 📚 Documentation

| Guide | Purpose |
|-------|---------|
| [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) | **👈 Start here!** Setup & installation guide |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Architecture and code organization |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | Complete API documentation |
| [docs/SETUP_GUIDE.md#deployment](docs/SETUP_GUIDE.md#deployment) | Deployment commands and hosting |

## 🎯 Common Tasks

### Create Your First Entry
1. Log in at http://localhost:3000/login
2. Click "New Post" in the dashboard
3. Add title, content, and optionally upload media
4. Click "Publish"

### Upload Media
- Images (PNG, JPG, WebP)
- Videos (MP4, WebM)
- Documents (PDF)
- Max 50MB per file

### Embed Content
Supported embeds:
- Instagram posts
- YouTube videos
- TikTok videos
- Twitter/X posts
- Spotify tracks
- Vimeo videos

## 🚀 Deployment

### Local Docker Deployment
```bash
npm run deploy:local:fresh
```

### Deploy to Fly.io
```bash
npm run deploy:flyio
```

See [docs/NAS_DEPLOYMENT.md](docs/NAS_DEPLOYMENT.md) for self-hosting on NAS.
See [docs/SETUP_GUIDE.md#deployment](docs/SETUP_GUIDE.md#deployment) for deployment commands and Fly.io.

## 🔒 Security

- Single-user authentication
- JWT-based session management
- CORS configuration
- Environment-based secrets
- Secure password hashing
- Input validation and sanitization

## 📖 API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user
- `POST /api/auth/logout` - Logout

### Entries
- `GET /api/entries` - List entries
- `GET /api/entries/timeline` - Timeline view
- `POST /api/entries` - Create (auth required)
- `PUT /api/entries/:id` - Update (auth required)
- `DELETE /api/entries/:id` - Delete (auth required)

### Media
- `POST /api/media/upload` - Upload media (auth required)
- `GET /api/media/:id` - Get media details

See [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for complete API documentation.

## 🐛 Troubleshooting

### Port Already in Use
Change ports in `docker-compose.yml` or use different ports for local development.

### Database Connection Error
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify database exists: `createdb portfolio`

### Frontend Can't Connect to API
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Ensure API is running on port 3001
- Check CORS settings in backend

See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md#troubleshooting) for more help.

## 📝 License

MIT - See LICENSE file for details

## 🙋 Support

Having issues? Check the documentation or review deployment logs:
```bash
docker-compose logs -f api
docker-compose logs -f web
```
   # In frontend/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

   Frontend: http://localhost:3000
   Backend: http://localhost:3001

## Docker Deployment (NAS)

### Prerequisites
- Docker and Docker Compose installed on your NAS
- A reverse proxy (nginx) for SSL/domain configuration

### Deploy

1. **Update configuration**
   ```bash
   # Copy and edit environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Configure nginx**
   - Point your domain to the NAS IP
   - Configure reverse proxy to forward to localhost:3000
   - Set up SSL certificate (Let's Encrypt recommended)

4. **Database initialization**
   ```bash
   docker-compose exec api npm run migrate
   ```

## API Documentation

### Authentication
- `POST /api/auth/login` - Login with password
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Entries (Posts)
- `GET /api/entries` - List all entries (paginated, organized by month)
- `GET /api/entries/:id` - Get single entry
- `POST /api/entries` - Create entry (auth required)
- `PUT /api/entries/:id` - Update entry (auth required)
- `DELETE /api/entries/:id` - Delete entry (auth required)

### Media
- `POST /api/media/upload` - Upload image/video (auth required)
- `DELETE /api/media/:id` - Delete media (auth required)

### Embeds
- `POST /api/embeds` - Create embed metadata (auth required)
- `GET /api/embeds/:id` - Get embed details

## Deployment

### Cloud Hosting (Recommended)

**Fly.io Deployment** - Cost: ~$2-3/month
- See [Deployment](docs/SETUP_GUIDE.md#deployment) for Fly.io and cloud deployment options
- Includes automatic scaling, global CDN, and free SSL

### Self-Hosting

**Docker Compose (NAS/VPS)**
- See [Setup & Installation Guide](docs/SETUP_GUIDE.md) for local development
- Requires PostgreSQL and persistent storage

## Email Notifications

The portfolio includes email notifications for comment moderation. See [Email Setup Guide](docs/EMAIL_SETUP.md) for configuration with SendGrid or other SMTP providers.

## Contributing

This is a personal project. For modifications or improvements, feel free to extend it as needed.

## License

MIT - Personal use

## Support

For issues or questions about setup, refer to the docs folder for detailed guides.
