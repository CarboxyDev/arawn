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

### Step 3: Configure API Service with Docker

1. Create a new service for the API
2. In service settings, go to **Build** section
3. Select **Builder**: "Dockerfile" (not Railpack or Nixpacks)
4. **Important**: Leave **Root Directory** empty (or set to `/`)
5. Set **Dockerfile Path**: `Dockerfile`
6. Railway will build using the Dockerfile at project root
7. No need to configure build/start commands - Docker handles everything

### Step 4: Set Environment Variables

In Railway dashboard, add these variables to your API service:

**Required Variables:**

```bash
NODE_ENV=production
PORT=8080
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Reference from PostgreSQL service
COOKIE_SECRET=<generate-with-openssl-rand-hex-32>
BETTER_AUTH_SECRET=<generate-with-openssl-rand-hex-32>
BETTER_AUTH_URL=https://your-api.railway.app
API_URL=https://your-api.railway.app
FRONTEND_URL=https://your-frontend.vercel.app
LOG_LEVEL=minimal  # Use minimal for production
```

**Generate secrets:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Note:** Railway will automatically map internal port 8080 to their public proxy. The Dockerfile exposes port 8080.

### Step 5: Deploy

1. Push your code (including `Dockerfile`) to your main branch
2. Railway will automatically:
   - Build the Docker image
   - Run database migrations (via CMD in Dockerfile)
   - Start the API server
3. Monitor logs in Railway dashboard
4. Access your API at `https://your-api.railway.app`

### Railway Best Practices

1. **Use Service References**: `${{Postgres.DATABASE_URL}}` instead of hardcoding
2. **Enable Auto-Deploy**: Connect GitHub for automatic deployments on push
3. **Use Private Networking**: Connect database via private URL (Railway provides both)
4. **Monitor Logs**: Use Railway dashboard or CLI (`railway logs`)
5. **Set Resource Limits**: Configure memory/CPU in service settings (recommended: 1GB RAM)
6. **Enable Health Checks**: Railway automatically monitors `/health` endpoint
7. **Database Migrations**: Handled automatically in Dockerfile CMD on each deploy

### Troubleshooting Railway Deployment

**Build fails with "npm install" error:**

- Ensure you're using **Dockerfile** builder (not Railpack/Nixpacks)
- Railpack doesn't support pnpm workspaces properly

**Database connection fails on startup:**

- **Symptom**: `Can't reach database server at postgres.railway.internal:5432`
- **Cause**: Railway serverless PostgreSQL is in sleep mode (hobby tier)
- **Solution**: The startup script ([start.sh](apps/api/start.sh)) automatically handles database wake-up with retry logic (up to 30 attempts)
- **Verify**: Check that `DATABASE_URL=${{Postgres.DATABASE_URL}}` references your PostgreSQL service correctly
- **Alternative**: Upgrade to Railway Pro for always-on databases

**Database migrations fail:**

- Check that `DATABASE_URL` is correctly set
- Verify PostgreSQL service is running and healthy
- Check migration files exist in `apps/api/prisma/migrations/`
- Review startup logs for migration errors

**Port binding errors:**

- Ensure `PORT=8080` environment variable is set
- Railway proxies external traffic to internal port 8080

**Better Auth errors:**

- **Symptom**: `You are using the default secret`
- **Solution**: Set `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` environment variables
- Generate secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## Docker Deployment

For self-hosted deployments, local production testing, or platforms requiring Docker (Render, Fly.io, AWS ECS, DigitalOcean, etc.).

### Local Production Testing

Test your production Docker build locally before deploying:

```bash
# Start production environment with Docker Compose
docker-compose -f docker-compose.prod.yml up --build

# API will be available at http://localhost:8080
# PostgreSQL at localhost:5433 (to avoid conflict with dev database)
```

The `docker-compose.prod.yml` file at the project root provides:

- PostgreSQL 17 Alpine (production database)
- API service built from Dockerfile
- Automatic health checks
- Auto-restart on failure
- Isolated from development environment

**Stopping the production environment:**

```bash
docker-compose -f docker-compose.prod.yml down

# Remove volumes (wipes data)
docker-compose -f docker-compose.prod.yml down -v
```

### Manual Docker Build

```bash
# From project root
docker build -t arawn-api:latest .

# Run container
docker run -d \
  --name arawn-api \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e COOKIE_SECRET=your-secret \
  -e API_URL=http://localhost:8080 \
  -e FRONTEND_URL=http://localhost:3000 \
  -e PORT=8080 \
  -e LOG_LEVEL=normal \
  arawn-api:latest

# View logs
docker logs -f arawn-api

# Stop container
docker stop arawn-api && docker rm arawn-api
```

### Docker Image Details

The multi-stage Dockerfile provides:

**Stage 1 (deps)**: Installs dependencies

- Uses pnpm 9.15.4
- Frozen lockfile for reproducible builds
- Installs workspace dependencies

**Stage 2 (builder)**: Builds the application

- Generates Prisma Client
- Compiles TypeScript to JavaScript
- Builds shared packages

**Stage 3 (runner)**: Production runtime

- Minimal Node.js Alpine image
- Non-root user for security
- Only production files included
- Health checks configured
- Auto-runs migrations on startup

**Final image size:** ~350MB (optimized with Alpine Linux)

### Deploying to Other Platforms

**Render:**

1. Connect GitHub repo
2. Select "Docker" as environment
3. Dockerfile is auto-detected at project root
4. Add environment variables in Render dashboard
5. Deploy

**Fly.io:**

```bash
# Initialize (will detect Dockerfile automatically)
fly launch

# Set secrets
fly secrets set \
  NODE_ENV=production \
  DATABASE_URL=xxx \
  COOKIE_SECRET=xxx \
  API_URL=https://your-app.fly.dev \
  FRONTEND_URL=https://your-frontend.vercel.app \
  LOG_LEVEL=normal

# Deploy
fly deploy
```

**DigitalOcean App Platform:**

1. Create new app from GitHub
2. Select "Dockerfile" as build method
3. Configure environment variables
4. Deploy

**AWS ECS / Fargate:**

```bash
# Build and tag
docker build -t arawn-api:latest .
docker tag arawn-api:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/arawn-api:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/arawn-api:latest

# Create ECS task definition and service
aws ecs create-service --cluster production --service-name arawn-api ...
```

**Google Cloud Run:**

```bash
# Build and push to Artifact Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/arawn-api

# Deploy
gcloud run deploy arawn-api \
  --image gcr.io/PROJECT_ID/arawn-api \
  --platform managed \
  --region us-central1 \
  --set-env-vars NODE_ENV=production,DATABASE_URL=xxx,...
```

---

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

- [ ] All secrets generated securely (`COOKIE_SECRET`, `BETTER_AUTH_SECRET`)
- [ ] Environment variables not committed to git
- [ ] `NODE_ENV=production` set
- [ ] `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` configured
- [ ] CORS restricted to frontend domain only
- [ ] Rate limiting enabled (30 req/60s)
- [ ] Helmet security headers enabled
- [ ] Database credentials secure and rotated
- [ ] API authentication working (Better Auth)
- [ ] HTTPS enabled (automatic on Railway/Vercel)
- [ ] Health checks configured
- [ ] Logging set to `minimal` for production
- [ ] Database backups configured (Railway auto-backups)
- [ ] Railway PostgreSQL not in sleep mode (or startup script handles wake-up)
