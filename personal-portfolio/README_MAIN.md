# Personal Life Portfolio

A beautiful, modern personal portfolio website for sharing your daily life, travels, and moments with the world.

## 🌟 Features

- **📅 Timeline View** - Browse your life organized by months and years
- **📸 Rich Media** - Upload photos, videos, and documents
- **🎬 Embed Content** - Embed Instagram posts, YouTube videos, and more
- **📝 Blog Posts** - Write and share your thoughts and experiences
- **🔐 Secure** - Single-user authentication, only you can create entries
- **📱 Multi-Device** - Access and edit from any device
- **🌐 Self-Hosted** - Deploy on your NAS for complete control
- **🎨 Beautiful UI** - Modern, responsive design with dark mode support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+ (or Docker)
- Docker & Docker Compose (for containerized deployment)

### Development Setup

1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database URL
   npm run dev
   ```

2. **Frontend** (in another terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```

3. Access at http://localhost:3000

### Docker Deployment

```bash
# Create .env file
cp .env.example .env

# Edit .env with your settings

# Start all services
docker-compose up -d

# Initialize database
docker-compose exec api npm run migrate
```

## 📚 Documentation

- [Setup & Installation Guide](docs/SETUP_GUIDE.md) - Detailed setup instructions
- [NAS Deployment](docs/NAS_DEPLOYMENT.md) - Deploy to your NAS
- [API Reference](docs/API_REFERENCE.md) - Complete API documentation

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **SWR** - Data fetching library

### Backend
- **Express** - Node.js web framework
- **TypeORM** - Database ORM
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens

### DevOps
- **Docker** - Container platform
- **Docker Compose** - Multi-container orchestration
- **nginx** - Reverse proxy & load balancer (optional)

## 📖 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile

### Entries
- `GET /api/entries` - Get all entries (paginated)
- `GET /api/entries/timeline` - Get timeline view
- `POST /api/entries` - Create entry (auth required)
- `PUT /api/entries/:id` - Update entry (auth required)
- `DELETE /api/entries/:id` - Delete entry (auth required)

### Media
- `POST /api/media/upload` - Upload media (auth required)
- `GET /api/media/entry/:entryId` - Get media for entry
- `DELETE /api/media/:id` - Delete media (auth required)

### Embeds
- `POST /api/embeds` - Create embed (auth required)
- `DELETE /api/embeds/:id` - Delete embed (auth required)

## 🎯 Features Coming Soon

- [ ] Android mobile app
- [ ] Image gallery views
- [ ] Full-text search
- [ ] Advanced analytics
- [ ] Social sharing buttons
- [ ] Comments and reactions
- [ ] Custom domains
- [ ] Backup & export tools
- [ ] Theme customization
- [ ] API for third-party integrations

## 📦 Project Structure

```
personal-portfolio/
├── frontend/                    # Next.js frontend app
│   ├── src/
│   │   ├── app/                # Pages
│   │   ├── components/         # React components
│   │   ├── lib/                # Utilities & API
│   │   ├── hooks/              # Custom hooks
│   │   └── styles/             # CSS
│   └── package.json
│
├── backend/                     # Express API server
│   ├── src/
│   │   ├── entities/           # Database models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Auth & error handling
│   │   └── index.ts
│   └── package.json
│
├── docs/                        # Documentation
│   ├── SETUP_GUIDE.md
│   ├── NAS_DEPLOYMENT.md
│   └── API_REFERENCE.md
│
├── docker-compose.yml           # Container orchestration
└── README.md
```

## 🔒 Security

- Password hashing with bcrypt
- JWT-based authentication
- CORS protection
- SQL injection prevention (TypeORM)
- XSS protection (React)
- HTTPS support (production)

## 💾 Database

PostgreSQL with TypeORM migrations. Includes tables for:
- Users (single admin user)
- Entries (blog posts)
- Media (images, videos, documents)
- Embeds (external content)

## 🌍 Deployment

### Local Development
```bash
npm run dev
```

### Docker (Recommended)
```bash
docker-compose up -d
```

### NAS Self-Hosting
See [NAS_DEPLOYMENT.md](docs/NAS_DEPLOYMENT.md)

### Cloud Hosting
Compatible with:
- AWS (EC2, RDS)
- DigitalOcean
- Heroku
- Railway
- Vercel (frontend)

## 📱 Mobile App

Android app coming soon! Will include:
- Create and edit entries on-the-go
- Upload photos and videos
- Manage media library
- View timeline offline
- Push notifications

## 🤝 Contributing

This is a personal project, but you're welcome to fork and customize for your own use.

## 📄 License

MIT - Feel free to use for personal projects

## 🆘 Support

### Troubleshooting
1. Check [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for common issues
2. Review logs: `docker-compose logs -f api`
3. Verify database: `docker-compose exec db psql -U postgres -d portfolio`

### Getting Help
- Check documentation in `/docs` folder
- Review API responses for error messages
- Enable debug logging in environment

## 🎉 Features Showcase

### Timeline Organization
Browse your entire life organized chronologically by months and years. Beautiful UI makes it easy to find memories.

### Rich Media Support
Upload and display high-quality photos, videos, and documents. Automatic thumbnail generation and image optimization.

### Embed External Content
Embed Instagram posts, YouTube videos, TikTok videos, Spotify tracks, Twitter posts, and more in your entries.

### Blog Posts
Write detailed blog posts about your travels, thoughts, and daily experiences with full markdown support.

### Multi-Device Access
Create and edit entries from your phone, tablet, or computer. Always synced and up-to-date.

### Self-Hosted
Keep your data private by hosting on your own NAS. Complete control over your content and data.

## 🙏 Credits

Built with ❤️ using modern web technologies.

Technologies used:
- Next.js
- Express
- PostgreSQL
- Docker
- Tailwind CSS
- TypeScript
- And many other great open-source projects

---

**Made with ❤️ for sharing your life's stories**
