# Wishkeepers Deployment Guide

## Required Environment Variables

The following environment variables **must be set** in your deployment configuration for the application to run:

### Database
- **`DATABASE_URL`** - PostgreSQL connection string (provided by Replit automatically)

### Security & Authentication
- **`SESSION_SECRET`** - Secret key for session encryption (minimum 32 characters recommended)
  - Generate with: `openssl rand -hex 32`
  
- **`ENCRYPTION_KEY`** - Secret key for vault data encryption (minimum 32 characters recommended)
  - Generate with: `openssl rand -hex 32`

### Email Service (Microsoft Graph API)
- **`MICROSOFT_CLIENT_ID`** - Azure AD application client ID
- **`MICROSOFT_CLIENT_SECRET`** - Azure AD application client secret
- **`MICROSOFT_TENANT_ID`** - Azure AD tenant ID

## Optional Environment Variables

- **`BASE_URL`** - Public URL of your deployment (e.g., `https://yourdomain.com`)
  - **Auto-detected on Replit**: The application automatically uses `REPLIT_DEV_DOMAIN` when deployed on Replit
  - **Custom domains**: Set this if you're using a custom domain or deploying outside Replit
  - **Priority order**: BASE_URL (if set) → REPLIT_DEV_DOMAIN (auto-detected) → http://localhost:5000 (development)
  - **Important**: Do not include a trailing slash (use `https://yourdomain.com` not `https://yourdomain.com/`)
  - Email links will use this URL, so they'll work correctly in production without manual configuration

- **`PERPLEXITY_API_KEY`** - API key for Perplexity AI chat feature
  - Only needed if you want to enable the chat assistant feature

- **`NODE_ENV`** - Set to `production` for production deployments
  - Defaults to `development`

- **`PORT`** - Server port (defaults to 5000)
  - Usually set automatically by the platform

## Deployment Configuration

### Autoscale Compatibility
This application is configured for Replit Autoscale deployments:
- ✅ Removed `reusePort` option (incompatible with Autoscale)
- ✅ Single port exposure on `0.0.0.0`
- ✅ Proper error handling for startup failures
- ✅ Graceful shutdown for database connections

### Port Configuration
- The application listens on port 5000 by default
- Uses `0.0.0.0` for external access (not localhost)
- Only exposes a single port for web traffic

### Health Check
The application serves both the API and frontend on the same port, so any HTTP request to the root path will confirm the app is running.

## Pre-Deployment Checklist

Before deploying, ensure:

1. ✅ All required secrets are set in deployment configuration
2. ✅ `BASE_URL` is set if using a custom domain (auto-detected for Replit deployments)
3. ✅ Database migrations are applied (`npm run db:push`)
4. ✅ Microsoft Graph API credentials are valid and have proper permissions
5. ✅ Email sender (hello@wishkeepers.com) is configured in Microsoft 365

## Troubleshooting

### Application fails to initialize
- Check that all required environment variables are set
- Verify database connection string is valid
- Check deployment logs for specific error messages

### Email not sending
- Verify Microsoft Graph API credentials
- Ensure sender email (hello@wishkeepers.com) exists in your Microsoft 365 tenant
- Check that the application has been granted proper Microsoft Graph permissions

### Database connection issues
- Verify `DATABASE_URL` is correctly set
- Check that database is accessible from deployment environment
- Verify Neon database is not paused or restricted
