# Local Test & NAS Deploy Cheat Sheet

A compact reference for running the project locally and deploying to your NAS via Git pulls.

## Stack & Ports
- Frontend: Next.js (port 3000)
- API: Express/TypeORM (port 3001)
- DB: Postgres (port 5432)
- Compose services: db, api, web (see [docker-compose.yml](../docker-compose.yml))
- Persistent data: Postgres volume `postgres_data`, media uploads bind-mounted from `backend/uploads`

## Quick Local Test
**Option A – Docker (recommended)**
1. From repo root: `cp .env.example .env` and fill values.
2. Start DB only first (avoids API boot errors if DB isn’t ready): `docker-compose up -d db`.
3. Start everything: `docker-compose up -d`.
4. Verify: `docker-compose ps`, then open http://localhost:3000 and http://localhost:3001/health.

**Option B – Node processes**
1. Backend: `cd backend && npm install && cp .env.example .env && npm run dev` (requires local Postgres running at `DATABASE_URL`).
2. Frontend (new terminal): `cd frontend && npm install && cp .env.example .env.local && npm run dev`.
3. Open http://localhost:3000.

## NAS Deploy via Git Pulls (Synology-friendly)
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

## Data & Backups
- DB data persists in `postgres_data` volume; avoid `docker-compose down --volumes` unless you intend to wipe data.
- Uploads live in `backend/uploads` (host-mounted); include in NAS backups.
- Manual DB backup: `docker-compose exec db pg_dump -U postgres ${DB_NAME:-portfolio} > backup.sql`.
- Restore: `docker-compose exec -T db psql -U postgres ${DB_NAME:-portfolio} < backup.sql`.

## Troubleshooting (fast checks)
- API can’t start / `ECONNREFUSED 5432`: ensure DB is up and `DATABASE_URL` matches `db:5432` in Compose.
- View logs: `docker-compose logs -f api` (or `web`, `db`).
- Healthcheck: `curl http://localhost:3001/health`.
- Port conflicts: edit port mappings in [docker-compose.yml](../docker-compose.yml) (e.g., change `3000:3000` to `8000:3000`).

## Security Notes
- Set strong, unique values for JWT_SECRET and NEXTAUTH_SECRET.
- Keep `.env` off Git and backed up privately.
- Add HTTPS and a reverse proxy when exposing to the internet (see [docs/NAS_DEPLOYMENT.md](NAS_DEPLOYMENT.md)).

## Related Docs
- Main README: [README_MAIN.md](../README_MAIN.md)
- Setup guide: [docs/SETUP_GUIDE.md](SETUP_GUIDE.md)
- Full NAS guide: [docs/NAS_DEPLOYMENT.md](NAS_DEPLOYMENT.md)
- API reference: [docs/API_REFERENCE.md](API_REFERENCE.md)
