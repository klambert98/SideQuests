# 🎉 Welcome to Side Quests - Personal Portfolio!

Your complete personal life portfolio application has been created and is ready to use.

## 📖 What to Read First

### **👉 [Setup & Installation Guide](docs/SETUP_GUIDE.md)** ← Start Here!

Complete setup guide covering:
- Quick start (5 minutes)
- Detailed installation steps
- Docker setup
- Creating your first entry
- Troubleshooting & common commands

### **📖 [README.md](README.md)** - Full Project Documentation

Comprehensive overview of features, tech stack, and all available documentation.

## ⚡ Quick Start (3 Steps)

### Step 1: Install Prerequisites
```bash
# Download & install Node.js from nodejs.org
# Verify installation:
node --version  # Should be 18+
npm --version
```

### Step 2: Setup Project
```bash
cd personal-portfolio
cp .env.example .env
npm run install:all
```

### Step 3: Start Application
```bash
# Option A: Docker (Recommended)
npm run deploy:local:fresh

# Option B: Local Node.js
npm run dev
```

Then open: **http://localhost:3000**

## 🎯 What's Included

✅ **Full-stack web application**
- Next.js React frontend
- Express.js backend API
- PostgreSQL database
- Docker containerization

✅ **Core features**
- Timeline organized by months
- Upload/edit entries from any device
- Embed Instagram, YouTube, TikTok, and more
- Beautiful responsive UI with dark mode
- Single-user authentication
- Media management

✅ **Complete documentation**
- Setup guides and tutorials
- API reference documentation
- Deployment instructions (NAS, Docker, Fly.io)
- Architecture explanations

✅ **Ready to deploy**
- Docker Compose for local/NAS deployment
- Fly.io deployment scripts
- Environment configuration
- Database setup and seeds

## 📖 Documentation by Use Case
Welcome! For the latest setup and usage, read:

- Setup & Installation: [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)
- Project Overview: [README.md](README.md)
- Deployment: [docs/SETUP_GUIDE.md#deployment](docs/SETUP_GUIDE.md#deployment)
- Architecture: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- API Reference: [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

Open the setup guide to begin: [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)
