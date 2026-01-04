# NAS Deployment Guide

This guide explains how to deploy your Personal Portfolio on your NAS using Docker.

## Prerequisites

- **NAS with Docker Support**: Synology, QNAP, or any NAS running Docker
- **Docker & Docker Compose**: Installed on your NAS
- **Domain Name** (recommended): For SSL and remote access
- **Static IP/Port Forwarding**: For accessing from outside your network

## Step 1: Prepare Your NAS

### Enable SSH Access
1. Go to NAS Control Panel → Terminal & SNMP
2. Enable SSH service
3. Note your NAS IP address (e.g., `192.168.1.100`)

### Create Project Directory
```bash
ssh admin@192.168.1.100
mkdir -p /volume1/docker/portfolio
cd /volume1/docker/portfolio
```

## Step 2: Copy Project Files

Transfer the project to your NAS:

```bash
# From your development machine
scp -r personal-portfolio/* admin@192.168.1.100:/volume1/docker/portfolio/
```

Or use a SFTP client to upload the files.

## Step 3: Configure Environment

SSH into your NAS and create the `.env` file:

```bash
ssh admin@192.168.1.100
cd /volume1/docker/portfolio
cp .env.example .env
nano .env
```

Update these critical values:

```env
# Database
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_NAME=portfolio

# Backend
JWT_SECRET=your-very-secure-jwt-secret-32-chars-minimum
API_PORT=3001

# Frontend
NEXTAUTH_URL=https://yourdomain.com  # or http://nas-ip:3000
NEXTAUTH_SECRET=your-nextauth-secret-32-chars-minimum

# CORS
CORS_ORIGIN=https://yourdomain.com
```

## Step 4: Initialize Database

```bash
# Create uploads directory
mkdir -p ./backend/uploads
chmod 777 ./backend/uploads

# Start database only first
docker-compose up -d db

# Wait 10 seconds for database to start
sleep 10

# Run migrations (if using TypeORM migrations)
docker-compose run api npm run migrate
```

## Step 5: Start All Services

```bash
docker-compose up -d
```

Verify all services are running:

```bash
docker-compose ps
```

Expected output:
```
NAME              COMMAND                  STATUS
portfolio-db      docker-entrypoint.s…     Up 2 minutes
portfolio-api     npm start                Up 1 minute
portfolio-web     npm start                Up 1 minute
```

## Step 6: Configure Reverse Proxy (nginx)

If your NAS has an existing web server, configure it to forward requests:

### Option A: Use nginx (Recommended for HTTPS)

```bash
mkdir -p ./nginx/ssl
nano ./nginx/nginx.conf
```

Create `nginx.conf`:

```nginx
upstream frontend {
    server web:3000;
}

upstream api {
    server api:3001;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static uploads
    location /uploads {
        proxy_pass http://api;
        proxy_cache_bypass $http_request_time;
    }
}
```

## Step 7: Verify Installation

1. **Check Services**:
   ```bash
   curl http://localhost:3000
   curl http://localhost:3001/health
   ```

2. **View Logs**:
   ```bash
   docker-compose logs -f api
   docker-compose logs -f web
   ```

3. **Access Application**:
   - Frontend: `http://your-nas-ip:3000`
   - API: `http://your-nas-ip:3001/health`

## Step 8: Setup Domain & SSL

### Using Let's Encrypt with Certbot

```bash
sudo apt-get install certbot
certbot certonly --standalone -d yourdomain.com

# Copy certificates to nginx folder
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./nginx/ssl/key.pem
```

### Port Forwarding (if needed)
1. Log into your router
2. Forward port 80 → NAS:3000 (HTTP)
3. Forward port 443 → NAS:443 (HTTPS, if using nginx)
4. Update DNS records to point to your public IP

## Step 9: Create Initial User

Connect to the database and create your admin user:

```bash
docker-compose exec db psql -U postgres -d portfolio
```

```sql
INSERT INTO users (id, email, password, name, bio)
VALUES (
  gen_random_uuid(),
  'your@email.com',
  '$2a$10$...hashed-password...',  -- Use bcrypt hash
  'Your Name',
  'My bio'
);
```

Or create via API after setup is complete.

## Maintenance

### View Logs
```bash
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db
```

### Update Application

1. Pull latest changes
2. Rebuild containers: `docker-compose down && docker-compose up -d --build`
3. Run migrations: `docker-compose exec api npm run migrate`

### Backup Database

```bash
docker-compose exec db pg_dump -U postgres portfolio > backup.sql
```

### Restore Database

```bash
docker-compose exec db psql -U postgres portfolio < backup.sql
```

### Stop Services

```bash
docker-compose down

# Keep data
docker-compose down --volumes  # Remove data
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs api

# Restart
docker-compose restart api
```

### Database connection error
```bash
# Ensure db is running
docker-compose ps

# Restart database
docker-compose restart db
docker-compose restart api
```

### Port already in use
Edit `docker-compose.yml` and change port mappings:
```yaml
ports:
  - "8000:3000"  # Use 8000 instead of 3000
```

### Permission denied errors
```bash
sudo chown -R 1000:1000 ./backend/uploads
chmod 777 ./backend/uploads
```

## Performance Tips

1. **Enable Swap** on your NAS for better performance
2. **Monitor Resources**: `docker stats`
3. **Set Resource Limits** in docker-compose.yml
4. **Backup Regularly**: Automated daily backups recommended
5. **Update Regularly**: Keep images updated for security patches

## Security Recommendations

- [ ] Change default password immediately
- [ ] Use strong JWT_SECRET and NEXTAUTH_SECRET
- [ ] Enable firewall rules
- [ ] Use HTTPS (Let's Encrypt)
- [ ] Regular backups
- [ ] Keep Docker images updated
- [ ] Monitor logs for suspicious activity

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify all containers are running: `docker-compose ps`
3. Test API health: `curl http://localhost:3001/health`
4. Check NAS resources: CPU, memory, disk space
