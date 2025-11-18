# Deployment Guide

This guide covers deploying the Arawn monorepo to production. The API can be deployed to any platform that supports Docker or Node.js, while the Next.js frontend works with any static hosting or serverless platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Deployment Methods](#deployment-methods)
  - [Docker Deployment](#docker-deployment)
  - [Node.js Deployment](#nodejs-deployment)
- [Platform-Specific Guides](#platform-specific-guides)
  - [Railway (Recommended)](#railway-recommended)
  - [Render](#render)
  - [Fly.io](#flyio)
  - [AWS](#aws)
  - [Google Cloud](#google-cloud)
  - [DigitalOcean](#digitalocean)
- [Frontend Deployment](#frontend-deployment)
- [Health Checks](#health-checks)
- [Security Checklist](#security-checklist)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying to production, ensure you have:

- **PostgreSQL Database**: Version 14+ (managed or self-hosted)
- **Node.js**: Version 20.0.0 or higher
- **pnpm**: Version 9.0.0 or higher (for non-Docker deployments)
- **Git Repository**: Code hosted on GitHub, GitLab, or Bitbucket
- **Domain** (optional): For custom URLs

### Required Services

1. **Database**: PostgreSQL (Railway, Supabase, Neon, AWS RDS, etc.)
2. **API Hosting**: Docker-compatible platform or Node.js hosting
3. **Frontend Hosting**: Vercel, Netlify, Cloudflare Pages, or any static host

---

## Environment Variables

### Required Variables (API)

These must be set in your production environment:

```bash
# Application Environment
NODE_ENV=production
PORT=8080

# API & Frontend URLs
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Security Secrets
COOKIE_SECRET=<32+ character random string>
BETTER_AUTH_SECRET=<32+ character random string>
BETTER_AUTH_URL=https://api.yourdomain.com

# Logging
LOG_LEVEL=minimal  # Use minimal for production
```

### Optional Variables

```bash
# OAuth Providers (if enabled)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret

# Email Service (if enabled)
EMAIL_ENABLED=true
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# File Storage (if using S3/R2)
STORAGE_TYPE=s3  # or 'r2' or 'local'
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_ENDPOINT=https://endpoint-url  # For R2/MinIO
```

### Generate Secure Secrets

```bash
# Generate COOKIE_SECRET and BETTER_AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Environment Variables

```bash
# Required
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Database Setup

### Initial Setup

1. **Create PostgreSQL Database**: Use your hosting provider's dashboard or CLI
2. **Get Connection String**: Format: `postgresql://user:password@host:5432/database`
3. **Set DATABASE_URL**: Add to your environment variables

### Database Migrations

Migrations run automatically on deployment when using Docker. For manual migrations:

```bash
# Via pnpm (requires DATABASE_URL in environment)
pnpm --filter @repo/api db:migrate

# Via Docker exec (if container is running)
docker exec <container-name> pnpm --filter @repo/api db:migrate

# Locally with production DB (be careful!)
DATABASE_URL=<prod-url> pnpm --filter @repo/api db:migrate
```

### Database Seeding (Optional)

```bash
# Only run once on initial deployment
pnpm --filter @repo/api db:seed
```

**Note**: Seeding creates default users. Review `apps/api/prisma/seed.ts` before running in production.

---

## Deployment Methods

### Docker Deployment

**Best for**: Platform independence, consistent environments, self-hosting

The monorepo includes a production-ready Dockerfile at the project root.

#### Local Production Testing

```bash
# Test production build locally
docker-compose -f docker-compose.prod.yml up --build

# API available at http://localhost:8080
# PostgreSQL at localhost:5433
```

#### Manual Docker Build

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
  -e BETTER_AUTH_SECRET=your-secret \
  -e BETTER_AUTH_URL=http://localhost:8080 \
  -e API_URL=http://localhost:8080 \
  -e FRONTEND_URL=http://localhost:3000 \
  -e PORT=8080 \
  -e LOG_LEVEL=minimal \
  arawn-api:latest

# View logs
docker logs -f arawn-api
```

#### Docker Image Details

The multi-stage Dockerfile:

- **Stage 1 (deps)**: Installs dependencies with pnpm
- **Stage 2 (builder)**: Builds TypeScript, generates Prisma Client
- **Stage 3 (runner)**: Minimal Alpine runtime (~350MB final image)

**Features:**

- Non-root user for security
- Automatic database migrations on startup
- Built-in health checks
- Handles serverless database wake-up (Railway-compatible)

---

### Node.js Deployment

**Best for**: Platforms without Docker support

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build all packages
pnpm build

# Generate Prisma Client
pnpm --filter @repo/api db:generate

# Run database migrations
pnpm --filter @repo/api db:migrate

# Start production server
cd apps/api
NODE_ENV=production node dist/src/main.js
```

**Requirements:**

- Node.js 20+
- pnpm 9+
- All environment variables set
- PostgreSQL accessible

---

## Platform-Specific Guides

### Railway (Recommended)

Railway provides the easiest deployment with managed PostgreSQL, automatic scaling, and GitHub integration.

#### Quick Start

1. **Sign up**: [railway.app](https://railway.app)
2. **Create Project**: Deploy from GitHub repo
3. **Add PostgreSQL**: Click "New Service" → "Database" → "PostgreSQL"
4. **Configure API Service**:
   - Builder: **Dockerfile**
   - Root Directory: `/` (project root)
   - Dockerfile Path: `Dockerfile`
5. **Set Environment Variables**: See [Environment Variables](#environment-variables)
   - Use `${{Postgres.DATABASE_URL}}` to reference database
6. **Deploy**: Push to main branch

#### Railway-Specific Configuration

```bash
# Reference PostgreSQL database
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Railway provides automatic HTTPS
API_URL=https://your-api.railway.app
BETTER_AUTH_URL=https://your-api.railway.app
```

#### Troubleshooting Railway

**Database Connection Issues:**

- **Symptom**: `Can't reach database server`
- **Cause**: Serverless PostgreSQL in sleep mode (hobby tier)
- **Solution**: Startup script ([start.sh](apps/api/start.sh)) handles automatic wake-up with retries
- **Alternative**: Upgrade to Railway Pro for always-on databases

**Build Fails:**

- Ensure using "Dockerfile" builder (not Railpack/Nixpacks)
- Railpack doesn't support pnpm workspaces

---

### Render

[render.com](https://render.com)

1. **Create Web Service**: Connect GitHub repo
2. **Environment**: Docker
3. **Dockerfile Path**: `Dockerfile` (auto-detected)
4. **Root Directory**: Leave empty
5. **Set Environment Variables**: See required vars above
6. **Create PostgreSQL**: Add managed PostgreSQL service
7. **Deploy**: Render builds and deploys automatically

---

### Fly.io

[fly.io](https://fly.io)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Initialize (auto-detects Dockerfile)
fly launch

# Set secrets
fly secrets set \
  NODE_ENV=production \
  DATABASE_URL=<your-postgres-url> \
  COOKIE_SECRET=<secret> \
  BETTER_AUTH_SECRET=<secret> \
  BETTER_AUTH_URL=https://your-app.fly.dev \
  API_URL=https://your-app.fly.dev \
  FRONTEND_URL=https://your-frontend.com \
  LOG_LEVEL=minimal

# Deploy
fly deploy
```

**Database Options:**

- Fly Postgres (managed)
- External provider (Supabase, Neon, etc.)

---

### AWS

#### ECS / Fargate

```bash
# Build and tag
docker build -t arawn-api:latest .
docker tag arawn-api:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/arawn-api:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/arawn-api:latest

# Create ECS task definition with environment variables
# Deploy as ECS service
```

**Database**: Use AWS RDS PostgreSQL

---

### Google Cloud

#### Cloud Run

```bash
# Build and push to Artifact Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/arawn-api

# Deploy
gcloud run deploy arawn-api \
  --image gcr.io/PROJECT_ID/arawn-api \
  --platform managed \
  --region us-central1 \
  --set-env-vars NODE_ENV=production,DATABASE_URL=<url>,COOKIE_SECRET=<secret>,...
```

**Database**: Use Cloud SQL PostgreSQL

---

### DigitalOcean

#### App Platform

1. **Create App**: Deploy from GitHub
2. **Build Method**: Dockerfile
3. **Environment Variables**: Add via dashboard
4. **Database**: Add managed PostgreSQL database

---

## Frontend Deployment

The Next.js frontend deploys to any static/serverless hosting platform.

### Vercel (Recommended)

1. **Import Project**: [vercel.com/new](https://vercel.com/new)
2. **Root Directory**: `apps/frontend`
3. **Build Command**: `pnpm build` (auto-detected)
4. **Environment Variables**:
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```
5. **Deploy**: Push to main branch

### Other Platforms

- **Netlify**: Same as Vercel, set build directory to `apps/frontend`
- **Cloudflare Pages**: Connect GitHub, configure build settings
- **AWS Amplify**: Connect repository, set build settings

### Connecting Frontend to API

1. Deploy API first, get URL
2. Set `NEXT_PUBLIC_API_URL` in frontend to API URL
3. Deploy frontend, get URL
4. Update `FRONTEND_URL` in API to frontend URL
5. Redeploy API (for CORS to work correctly)

---

## Health Checks

The API exposes a health check endpoint for monitoring.

### Endpoint

**URL**: `GET /health`

**Success Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2025-11-13T10:30:00.000Z",
  "database": "connected"
}
```

**Error Response (503 Service Unavailable):**

```json
{
  "status": "error",
  "timestamp": "2025-11-13T10:30:00.000Z",
  "database": "disconnected"
}
```

### Platform Health Check Configuration

**Railway**: Automatic monitoring via `/health`

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

## Security Checklist

Before deploying to production:

- [ ] All secrets generated securely (use `crypto.randomBytes(32)`)
- [ ] Environment variables not committed to git
- [ ] `.env.local` files in `.gitignore`
- [ ] `NODE_ENV=production` set
- [ ] `BETTER_AUTH_SECRET` ≥ 32 characters
- [ ] `COOKIE_SECRET` ≥ 16 characters
- [ ] CORS restricted to frontend domain only
- [ ] Rate limiting enabled (30 req/60s default)
- [ ] Helmet security headers enabled (automatic)
- [ ] Database credentials secure and not exposed
- [ ] API authentication working (test login/signup)
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] Health checks configured
- [ ] Logging set to `minimal` for production
- [ ] Database backups configured
- [ ] Secrets rotated regularly (every 90 days)

---

## Troubleshooting

### API Fails to Start

**1. Environment Variable Errors**

```
Error: Invalid environment variables
```

**Solution**: Verify all required environment variables are set. See [Environment Variables](#environment-variables).

**2. Database Connection Errors**

```
Error: Can't reach database server
```

**Solutions**:

- Verify `DATABASE_URL` is correct
- Ensure database is accessible from your deployment platform
- Check database firewall rules
- For Railway: Wait for database to wake up from sleep mode

**3. Port Binding Errors**

```
Error: Address already in use
```

**Solution**: Ensure `PORT` environment variable is set (default: 8080)

---

### Database Migrations Fail

1. **Check database accessibility**: Test connection string locally
2. **Verify migration files exist**: Check `apps/api/prisma/migrations/`
3. **Run migrations manually**: See [Database Setup](#database-setup)
4. **Check Prisma logs**: Set `LOG_LEVEL=detailed` temporarily

---

### CORS Errors in Frontend

**Symptoms**:

- API requests fail in browser
- Console shows CORS errors

**Solutions**:

1. Verify `FRONTEND_URL` matches exact origin (including protocol and port)
2. Ensure no trailing slashes in URLs
3. Test with curl:
   ```bash
   curl -H "Origin: https://your-frontend.com" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        https://your-api.com/health
   ```
4. Check API logs for CORS errors

---

### Docker Build Fails

1. **Build from project root**: Dockerfile expects root context
2. **Verify dependencies**: Ensure `pnpm-lock.yaml` is committed
3. **Clear Docker cache**: `docker build --no-cache`
4. **Check Docker version**: Requires Docker 20.10+

---

### High Memory Usage

1. **Set log level to minimal**: `LOG_LEVEL=minimal`
2. **Monitor with platform metrics**: Check memory usage over time
3. **Increase memory limit**: Configure in platform settings (recommended: 1GB)
4. **Enable Node.js GC tuning**:
   ```bash
   NODE_OPTIONS="--max-old-space-size=512"
   ```

---

### Slow API Responses

1. **Check database query performance**: Enable Prisma query logs (`LOG_LEVEL=detailed`)
2. **Add database indexes**: Review slow queries
3. **Monitor request logs**: Identify slow endpoints
4. **Check network latency**: Database should be in same region as API
5. **Use connection pooling**: Already configured in Prisma

---

## Additional Resources

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Fastify Deployment**: [fastify.dev/docs/latest/Guides/Deployment](https://fastify.dev/docs/latest/Guides/Deployment)
- **Prisma Deployment**: [prisma.io/docs/guides/deployment](https://prisma.io/docs/guides/deployment)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Docker Best Practices**: [docs.docker.com/develop/dev-best-practices](https://docs.docker.com/develop/dev-best-practices)

---

## Support

For issues specific to this template:

- **GitHub Issues**: [github.com/yourusername/arawn/issues](https://github.com/yourusername/arawn/issues)
- **Documentation**: See `CLAUDE.md` for detailed architecture info
- **Examples**: Check `apps/api/src/routes/` for API patterns
