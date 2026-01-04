# Personal Life Portfolio

A modern, full-stack personal portfolio website to share pictures, videos, blog posts, and daily life updates. Features a beautiful timeline organized by months, media embeds (Instagram, YouTube, etc.), and a secure single-user authentication system.

## Features

- 🗓️ **Timeline View**: Monthly organized scrollable timeline for daily entries
- 📸 **Media Support**: Upload and display images, videos, documents
- 🎬 **Embed Support**: Embed Instagram posts, YouTube videos, and other websites
- ✍️ **Blog Posts**: Create and manage daily blog entries
- 🔒 **Single User Auth**: Secure authentication (owner only)
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🌐 **Multi-Device Editing**: Edit from any device when logged in
- 🐳 **Docker Ready**: Easy self-hosting on NAS
- 🔧 **API-Driven**: RESTful API for future mobile app integration

## Tech Stack

### Frontend
- **Next.js 14** with TypeScript
- **React 18** with App Router
- **Tailwind CSS** for styling
- **SWR** for data fetching
- **Next Auth** for authentication

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **TypeORM** for database management
- **JWT** for token authentication
- **Multer** for file uploads
- **Sharp** for image optimization

### DevOps
- **Docker** & Docker Compose for containerization
- **nginx** for reverse proxy

## Project Structure

```
personal-portfolio/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and helpers
│   │   └── styles/          # Global styles
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                 # Express API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utilities
│   ├── migrations/          # Database migrations
│   └── package.json
│
├── docs/                    # Documentation
├── docker-compose.yml       # Docker services configuration
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL 15+ (if running without Docker)

### Development Setup

1. **Install Node.js**
   - Download from [nodejs.org](https://nodejs.org/)

2. **Clone and setup**
   ```bash
   cd personal-portfolio
   
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Configure Environment**
   ```bash
   # In backend/.env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/portfolio
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   API_PORT=3001
   
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

## Features Roadmap

- [x] Project scaffolding
- [x] Basic authentication
- [ ] Timeline UI component
- [ ] Media upload system
- [ ] Embed support (Instagram, YouTube, etc.)
- [ ] Blog entry CRUD
- [ ] Month-based organization
- [ ] Image optimization
- [ ] Search functionality
- [ ] Monthly archive view
- [ ] Admin dashboard
- [ ] Android app integration
- [ ] Analytics dashboard

## Contributing

This is a personal project. For modifications or improvements, feel free to extend it as needed.

## License

MIT - Personal use

## Support

For issues or questions about setup, refer to the docs folder for detailed guides.
