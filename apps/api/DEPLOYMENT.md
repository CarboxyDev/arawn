# Deployment Guide

This guide covers deploying the Arawn monorepo to production, with a focus on Railway deployment for the Fastify API backend.

## Table of Contents

- [Railway Deployment (Recommended)](#railway-deployment-recommended)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)

---

## Railway Deployment (Recommended)

Railway provides the easiest deployment experience for the Fastify API with automatic scaling, built-in PostgreSQL, and seamless GitHub integration.

### Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub repository connected to Railway
- Railway CLI (optional): `npm install -g @railway/cli`

### Step 1: Create Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Select "Deploy from GitHub repo"
3. Choose your repository (`arawn`)
4. Railway will auto-detect the monorepo structure

### Step 2: Setup PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will provision a PostgreSQL database
4. Copy the `DATABASE_URL` from the database service variables

### Step 3: Configure API Service

1. Create a new service for the API
2. Set the root directory to `apps/api`
3. Railway will auto-detect Node.js and use these commands:
   - **Build Command**: `pnpm install && pnpm --filter @repo/api db:generate && pnpm build`
   - **Start Command**: `pnpm --filter @repo/api start`

**Alternative**: Use custom Railway settings:

```json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm --filter @repo/api db:generate && pnpm --filter @repo/api build"
  },
  "deploy": {
    "startCommand": "pnpm --filter @repo/api start",
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 4: Set Environment Variables

In Railway dashboard, add these variables to your API service:

**Required Variables:**

```bash
NODE_ENV=production
PORT=${{PORT}}  # Railway auto-provides this
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Reference from PostgreSQL service
COOKIE_SECRET=<generate-with-openssl-rand-hex-32>
API_URL=https://your-api.railway.app
FRONTEND_URL=https://your-frontend.vercel.app
LOG_LEVEL=normal
```

**Generate COOKIE_SECRET:**

```bash
openssl rand -hex 32
```

### Step 5: Run Database Migrations

**Option A: Using Railway CLI**

```bash
railway login
railway link  # Link to your project
railway run --service api pnpm --filter @repo/api db:migrate
```

**Option B: One-time deployment command**

In Railway dashboard, temporarily change start command to:

```bash
pnpm --filter @repo/api db:migrate && pnpm --filter @repo/api start
```

After first deployment, revert to: `pnpm --filter @repo/api start`

### Step 6: Deploy

1. Push to your main branch or trigger manual deploy
2. Railway will build and deploy automatically
3. Monitor logs in Railway dashboard
4. Access your API at `https://your-api.railway.app`

### Railway Configuration File (Optional)

Create `railway.json` in project root for advanced configuration:

```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 10
  }
}
```

### Railway Best Practices

1. **Use Service References**: `${{Postgres.DATABASE_URL}}` instead of hardcoding
2. **Enable Auto-Deploy**: Connect GitHub for automatic deployments
3. **Use Private Networking**: Connect services via private URLs
4. **Monitor Logs**: Use Railway dashboard or CLI (`railway logs`)
5. **Set Resource Limits**: Configure memory/CPU in service settings
6. **Enable Health Checks**: Railway uses `/health` endpoint automatically

---

## Docker Deployment

For self-hosted deployments or platforms requiring Docker (Render, Fly.io, AWS ECS, etc.).

### Build Docker Image

```bash
# From project root
docker build -f apps/api/Dockerfile -t arawn-api:latest .
```

### Run Docker Container

```bash
docker run -d \
  --name arawn-api \
  -p 8080:8080 \
  --env-file apps/api/.env.local \
  arawn-api:latest
```

### Docker Compose (Full Stack)

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: arawn_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    restart: unless-stopped
    ports:
      - '8080:8080'
    environment:
      NODE_ENV: production
      PORT: 8080
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/arawn_prod
      COOKIE_SECRET: ${COOKIE_SECRET}
      API_URL: ${API_URL}
      FRONTEND_URL: ${FRONTEND_URL}
      LOG_LEVEL: normal
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8080/health']
      interval: 30s
      timeout: 3s
      retries: 3

volumes:
  postgres_data:
```

### Deploying to Other Platforms

**Render:**

1. Connect GitHub repo
2. Select "Docker" as environment
3. Set Dockerfile path: `apps/api/Dockerfile`
4. Add environment variables

**Fly.io:**

```bash
fly launch --dockerfile apps/api/Dockerfile
fly secrets set COOKIE_SECRET=xxx DATABASE_URL=xxx ...
fly deploy
```

**AWS ECS / Fargate:**

1. Push image to ECR: `docker push xxx.ecr.region.amazonaws.com/arawn-api:latest`
2. Create ECS task definition with environment variables
3. Deploy to Fargate service

---

## Environment Variables

### Required Variables (API)

| Variable        | Description                               | Example                               |
| --------------- | ----------------------------------------- | ------------------------------------- |
| `NODE_ENV`      | Environment mode                          | `production`                          |
| `PORT`          | Server port (Railway auto-provides)       | `8080`                                |
| `DATABASE_URL`  | PostgreSQL connection string              | `postgresql://user:pass@host:5432/db` |
| `COOKIE_SECRET` | Secret for cookie signing (32+ chars)     | `<openssl rand -hex 32>`              |
| `API_URL`       | Public API URL                            | `https://api.example.com`             |
| `FRONTEND_URL`  | Frontend URL for CORS                     | `https://example.com`                 |
| `LOG_LEVEL`     | Logging verbosity (minimal/normal/detail) | `normal`                              |

### Required Variables (Frontend)

| Variable              | Description                      | Example                   |
| --------------------- | -------------------------------- | ------------------------- |
| `NODE_ENV`            | Environment mode                 | `production`              |
| `NEXT_PUBLIC_API_URL` | Public API URL (browser-exposed) | `https://api.example.com` |

### Generating Secrets

**COOKIE_SECRET** (required for session security):

```bash
openssl rand -hex 32
```

---

## Database Setup

### Automated Migration (Railway)

Railway automatically runs migrations on deploy if you include `db:migrate` in build/start command.

**Recommended approach:**

1. Include migration in build command (first deploy)
2. Remove from subsequent deploys (or use separate migration job)

### Manual Migration

```bash
# Via Railway CLI
railway run --service api pnpm --filter @repo/api db:migrate

# Via Docker
docker exec arawn-api pnpm --filter @repo/api db:migrate

# Locally with production DB
DATABASE_URL=<prod-url> pnpm --filter @repo/api db:migrate
```

### Database Seeding (Optional)

```bash
pnpm --filter @repo/api db:seed
```

### Database Reset (DANGEROUS)

```bash
# Only for development/staging
pnpm --filter @repo/api db:reset
```

---

## Frontend Deployment (Vercel)

The Next.js frontend deploys seamlessly to Vercel.

### Step 1: Create Vercel Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Next.js

### Step 2: Configure Build Settings

- **Root Directory**: `apps/frontend`
- **Build Command**: `pnpm build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `pnpm install`

### Step 3: Environment Variables

Add these in Vercel dashboard:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

### Step 4: Deploy

Push to main branch or trigger manual deploy. Vercel will build and deploy automatically.

### Vercel + Railway Integration

1. Deploy API to Railway first
2. Copy API URL from Railway
3. Set `NEXT_PUBLIC_API_URL` in Vercel with Railway API URL
4. Deploy frontend to Vercel
5. Update `FRONTEND_URL` in Railway with Vercel URL

---

## Health Checks

### API Health Endpoint

**Endpoint**: `GET /health`

**Successful Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2025-11-13T10:30:00.000Z",
  "database": "connected"
}
```

**Failed Response (503 Service Unavailable):**

```json
{
  "status": "error",
  "timestamp": "2025-11-13T10:30:00.000Z",
  "database": "disconnected"
}
```

### Platform-Specific Health Checks

**Railway**: Automatically monitors `/health` endpoint

**Docker**: Health check included in Dockerfile

**Kubernetes**:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
```

---

## Troubleshooting

### API fails to start

**Check logs for:**

1. **Environment variable validation errors**:

   ```
   Error: Environment validation failed
   ```

   → Ensure all required variables are set (see [Environment Variables](#environment-variables))

2. **Database connection errors**:

   ```
   Error: Can't reach database server
   ```

   → Verify `DATABASE_URL` is correct and database is accessible

3. **Port binding errors**:
   ```
   Error: Address already in use
   ```
   → Ensure `PORT` environment variable is set correctly

### Database migrations fail

1. **Check database accessibility**: Test connection string
2. **Run migrations manually**: See [Database Setup](#database-setup)
3. **Check migration files**: Ensure `apps/api/prisma/migrations/` exists

### CORS errors in frontend

1. **Verify `FRONTEND_URL`**: Must match exact origin (including protocol)
2. **Check API logs**: Look for CORS-related errors
3. **Test with curl**:
   ```bash
   curl -H "Origin: https://your-frontend.vercel.app" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        https://your-api.railway.app/health
   ```

### Docker build fails

1. **Check Docker context**: Build from project root
2. **Verify Dockerfile path**: `apps/api/Dockerfile`
3. **Check dependencies**: Ensure pnpm-lock.yaml is committed
4. **Use build args**:
   ```bash
   docker build --build-arg NODE_ENV=production -f apps/api/Dockerfile .
   ```

### High memory usage

1. **Enable production logging**: Set `LOG_LEVEL=minimal`
2. **Check for memory leaks**: Monitor with Railway metrics
3. **Increase memory limit**: Adjust in Railway service settings
4. **Enable Node.js garbage collection**:
   ```bash
   NODE_OPTIONS="--max-old-space-size=512" node dist/src/main.js
   ```

### Slow API responses

1. **Check database query performance**: Use Prisma query logs
2. **Enable query optimization**: Add database indexes
3. **Monitor request logs**: Look for slow endpoints
4. **Use Fastify benchmarking**: `autocannon http://localhost:8080/health`

---

## Additional Resources

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Fastify Deployment**: [fastify.dev/docs/latest/Guides/Deployment](https://fastify.dev/docs/latest/Guides/Deployment)
- **Prisma Deployment**: [prisma.io/docs/guides/deployment](https://prisma.io/docs/guides/deployment)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

## Security Checklist

Before deploying to production:

- [ ] All secrets generated securely (`COOKIE_SECRET`)
- [ ] Environment variables not committed to git
- [ ] `NODE_ENV=production` set
- [ ] CORS restricted to frontend domain only
- [ ] Rate limiting enabled (30 req/60s)
- [ ] Helmet security headers enabled
- [ ] Database credentials secure and rotated
- [ ] API authentication working (Better Auth)
- [ ] HTTPS enabled (automatic on Railway/Vercel)
- [ ] Health checks configured
- [ ] Logging enabled with appropriate verbosity
- [ ] Database backups configured (Railway auto-backups)
