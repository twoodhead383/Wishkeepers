# Wishkeepers - Digital Legacy Vault Web Application

## Overview
Wishkeepers is a secure, encrypted web application serving as a digital "green box" for sensitive legacy data. It enables individuals to securely store funeral wishes, insurance, banking details, and personal messages, with the ability to nominate trusted contacts for access in crucial moments. The project aims to provide peace of mind and simplify end-of-life planning.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Overall Architecture Pattern
The application utilizes a full-stack monorepo architecture, separating client, server, and shared components. It features a React frontend, an Express.js backend, and a RESTful API.

### Technology Stack
- **Frontend**: React with TypeScript, Vite, Radix UI, Tailwind CSS (shadcn/ui), Wouter, React Hook Form with Zod, React Query.
- **Backend**: Node.js with Express.js, bcrypt, Nodemailer, Drizzle ORM.
- **Database**: PostgreSQL (Neon Database) with Drizzle ORM.
- **Authentication**: Session-based authentication, bcrypt for password hashing.
- **Email**: Nodemailer for notifications and invitations.
- **Encryption**: AES-256-GCM for field-level encryption.

### Key Components
- **Frontend**: Feature-based component organization, React Query for server state, Wouter for routing, React Hook Form for forms.
- **Backend**: RESTful API design, Express session for state, authentication/authorization middleware, Repository pattern.
- **Database Schema**: Users, Vaults (encrypted storage), Trusted Contacts (invitation system), Data Release Requests (admin-approved access).

### Data Flow Highlights
- **User Management**: Email-verified registration, bcrypt password hashing, session-based authentication. Admin users bypass email verification.
- **Vault Management**: Encrypted storage of sensitive data (AES-256-GCM), completion tracking, owner-only access unless released.
- **Trusted Contact System**: Email invitations, secure token acceptance, role-based dashboards, self-service removal.
- **Data Release Process**: Trusted contacts submit declaration of death forms, admin validation, encrypted data decryption upon approval.

### Deployment Strategy
- **Build Process**: Vite for frontend, ESBuild for backend, Drizzle Kit for database migrations.
- **Environment Configuration**: Relies on environment variables for database, email, security keys (SESSION_SECRET, ENCRYPTION_KEY), and base URL.
- **Security**: Secure cookie configuration, rate limiting, input validation, secure error handling.
- **Scalability**: Stateless server design.

## External Dependencies
- **Database**: Drizzle ORM for PostgreSQL.
- **Authentication**: bcrypt, express-session.
- **Email**: Nodemailer.
- **Validation**: Zod.
- **UI Components**: Radix UI.

## Recent Changes

### October 23, 2025

#### Automatic Base URL Detection for Email Links
- **Production Email Fix**: Fixed broken localhost URLs in production emails
  - Created `getBaseUrl()` helper function with smart environment detection
  - Priority order: BASE_URL (user-set custom domain) → REPLIT_DEV_DOMAIN (auto-detected Replit domain) → http://localhost:5000 (local development)
  - Updated all email templates to use the helper function:
    - Trusted contact invitation emails (accept link)
    - Welcome emails (dashboard link)
    - Vault completion reminders (vault link)
    - Prospect invitation emails (register link)
  - **URL normalization**: Automatically strips trailing slashes to prevent double-slash issues
  - **Debug logging**: Logs which URL source was selected for easy troubleshooting
  - **No configuration required**: Email links automatically work correctly in Replit deployments
  - **Custom domain support**: Set BASE_URL environment variable to override auto-detection (without trailing slash)
  - Updated DEPLOYMENT.md to document the automatic URL detection and priority order

### October 22, 2025

#### Database Connection Pool Error Handling
- **Critical Fix**: Added comprehensive error handling to prevent server crashes from database connection termination
  - Configured Neon connection pool with proper timeouts (30s idle, 10s connection timeout, max 10 connections)
  - Added error event handlers to catch and log unexpected database pool errors
  - Implemented graceful shutdown process that properly closes database connections on SIGTERM/SIGINT
  - Added connection lifecycle logging (connect/remove events) for monitoring
  - Prevents unhandled rejection crashes when Neon terminates idle connections

#### Email Logo Fix for Mobile Gmail
- **Mobile Compatibility**: Fixed broken logo images in mobile Gmail app
  - Switched from base64 data URI embedding to CID (Content-ID) inline attachments
  - Mobile Gmail blocks data URIs for security, but CID references work universally
  - Logo now attached as inline Microsoft Graph attachment with `contentId: 'wishkeepers-logo'`
  - Implemented caching to avoid repeated disk reads on high-volume sends
  - All 5 email templates now use `cid:wishkeepers-logo` reference:
    - Trusted contact invitation emails
    - Welcome emails for new users
    - Vault completion reminder emails
    - Email verification code emails
    - Trusted contact removal notification emails
  - Logo displays consistently at 40px height across all email clients (desktop and mobile)
  - Graceful degradation if logo file cannot be loaded

#### Comprehensive Favicon Implementation
- **Cross-Platform Compatibility**: Implemented fully compliant, device-agnostic favicon system
  - Created `client/public/` directory structure for static assets served by Vite
  - Added wishkeepers favicon (`favicon.png`) in public folder
  - Comprehensive meta tag coverage in `index.html`:
    - Standard favicons for desktop browsers (16x16, 32x32)
    - Apple Touch Icons for iOS devices (76x76, 120x120, 152x152, 180x180)
    - Android/Chrome icons for Android devices (192x192, 512x512)
    - Microsoft tile configuration with brand color (#1e3a8a)
    - Theme color meta tag for mobile browsers
  - Created `site.webmanifest` for Progressive Web App (PWA) support
    - Enables "Add to Home Screen" on mobile devices
    - Defines app name, colors, and icon references
    - Configured for standalone display mode
  - Enhanced SEO with comprehensive meta tags:
    - Page title and description
    - Open Graph tags for social media sharing
    - Twitter Card tags for Twitter sharing
  - All assets verified and tested successfully across platforms

#### Autoscale Deployment Fixes
- **Production Deployment Compatibility**: Fixed critical issues preventing Autoscale deployments
  - Removed `reusePort: true` option from server.listen() - incompatible with Autoscale
  - Changed to standard Node.js server.listen() syntax: `server.listen(port, "0.0.0.0", callback)`
  - Added catch block to async IIFE for better startup error handling
    - Logs fatal errors with full stack traces
    - Exits with non-zero status code on initialization failure
  - Created comprehensive `DEPLOYMENT.md` documentation
    - Lists all required environment variables (DATABASE_URL, SESSION_SECRET, ENCRYPTION_KEY, Microsoft Graph credentials)
    - Documents optional variables (BASE_URL, PERPLEXITY_API_KEY)
    - Provides pre-deployment checklist
    - Includes troubleshooting guidance

#### Admin User Management Features
- **User Deletion with Cascade**: Implemented safe user deletion for data retention compliance
  - Admin users page with search functionality (filters by name or email)
  - Delete button for each user (disabled for self-deletion protection)
  - Atomic transaction-based cascade deletion: trusted_contacts → data_release_requests → vaults → user
  - Confirmation dialog before deletion to prevent accidental data loss
  - DELETE `/api/admin/users/:id` endpoint with `requireAdmin` protection
  
- **Prospect Invitation System**: Marketing tool for sending branded invitations to potential users
  - Two invitation modes: single entry form and CSV bulk upload
  - Email template matching existing brand design with logo via CID attachment
  - Zod validation enforcing max 100 invitations per batch, email format validation, name requirements
  - Automatic case-insensitive email deduplication to prevent duplicate sends
  - Row-level error tracking for bulk uploads with detailed failure reporting
  - POST `/api/admin/invite-prospects` endpoint processes invitations via Microsoft Graph
  - CSV format: `email,firstName` (one prospect per line)
  - Success/failure reporting with sent count, skipped duplicates, and error details