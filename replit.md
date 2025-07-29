# Wishkeepers - Digital Legacy Vault Web Application

## Overview

Wishkeepers is a secure, encrypted web application designed as a digital "green box" for storing sensitive legacy-related data. The application helps individuals prepare for life's most important moments by securely storing funeral wishes, insurance information, banking details, and personal messages. Users can nominate trusted contacts who can request access to this information when needed.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Overall Architecture Pattern
The application follows a full-stack monorepo architecture with a clear separation between client, server, and shared components. It uses a modern React frontend with an Express.js backend, connected through a RESTful API design.

### Technology Stack
- **Frontend**: React with TypeScript, using Vite as the build tool
- **UI Library**: Radix UI components with Tailwind CSS for styling (shadcn/ui design system)
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Session-based authentication with bcrypt password hashing
- **Email**: Nodemailer for email notifications and invitations
- **Encryption**: AES-256-GCM for field-level encryption of sensitive data

## Key Components

### Frontend Architecture
- **Component Structure**: Uses a feature-based organization with reusable UI components
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with CSS custom properties for theming

### Backend Architecture
- **API Design**: RESTful endpoints with consistent error handling
- **Session Management**: Express session with secure cookie configuration
- **Middleware**: Authentication and authorization middleware for protected routes
- **Storage Pattern**: Repository pattern with PostgreSQL database using Drizzle ORM

### Database Schema
- **Users**: Core user accounts with admin role support
- **Vaults**: Encrypted storage for legacy information with completion tracking
- **Trusted Contacts**: Invitation system for designated contacts
- **Data Release Requests**: Admin-approved access control system

## Data Flow

### User Registration and Authentication
1. Users register with email/password credentials
2. Passwords are hashed using bcrypt before storage
3. Session-based authentication maintains user state
4. Admin users have elevated permissions for request approval

### Vault Management
1. Users create and update their digital vault information
2. All sensitive fields are encrypted using AES-256-GCM before database storage
3. Completion percentage is calculated based on filled sections
4. Vault data is only accessible to the owner unless released

### Trusted Contact System
1. Vault owners nominate trusted contacts via email invitation
2. Email invitations contain secure tokens for acceptance
3. Trusted contacts can create accounts or act solely as wishkeepers
4. Access is granted only through the data release request process

### Data Release Process
1. Trusted contacts submit declaration of death forms
2. Admin manually validates requests for security
3. Upon approval, encrypted data is decrypted and made accessible
4. Email notifications confirm the release process

## External Dependencies

### Core Runtime Dependencies
- **Database**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Authentication**: bcrypt for password hashing, express-session for session management
- **Email**: Nodemailer for transactional emails and invitations
- **Validation**: Zod for runtime type validation and schema definitions
- **UI Components**: Extensive Radix UI component library for accessible components

### Development Dependencies
- **Build Tools**: Vite for fast development and optimized production builds
- **TypeScript**: Full TypeScript support across frontend and backend
- **Code Quality**: ESBuild for server bundling, PostCSS for CSS processing

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds the React application to static assets
- **Backend**: ESBuild bundles the Node.js server with external package handling
- **Database**: Drizzle Kit handles schema migrations and database updates

### Environment Configuration
- **Database**: Requires DATABASE_URL environment variable for PostgreSQL connection
- **Email**: SMTP configuration for email delivery (defaults to Ethereal for development)
- **Security**: SESSION_SECRET and ENCRYPTION_KEY for secure operations
- **Base URL**: Configurable base URL for email link generation

### Production Considerations
- **Security**: Secure cookie configuration in production environments
- **Performance**: Static asset serving with proper caching headers
- **Monitoring**: Comprehensive request logging and error tracking
- **Scalability**: Stateless server design ready for horizontal scaling

### Development vs Production
- **Development**: Hot module replacement, debug logging, development SMTP
- **Production**: Optimized builds, secure configurations, production database connections

## Recent Changes

### January 28, 2025
- **Database Integration**: Successfully migrated from in-memory storage to PostgreSQL database
  - Added Neon serverless PostgreSQL with Drizzle ORM integration
  - Created persistent database schema for all entities (users, vaults, trusted contacts, data release requests)
  - Maintained field-level encryption for sensitive vault data
  - Preserved test user accounts: leo@thel30project.com (Test25) and admin@wishkeepers.com (admin123)
  - Application now provides persistent data storage across server restarts

### January 29, 2025
- **Admin Interface Redesign**: Complete separation of admin and user experiences
  - Created dedicated admin-only interface with left navigation sidebar
  - Admin users bypass general dashboard and go directly to admin interface upon login
  - Removed general user features (dashboard, vault, trusted contacts) from admin view
  - Added third parties management system for tracking partner organizations with referral links
  - Created Users & Vaults overview page showing administrative metadata without exposing sensitive vault content
  - Fixed admin sign out functionality and API routing issues
  - Updated navigation to show only relevant sections based on user role