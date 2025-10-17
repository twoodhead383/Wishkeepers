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
2. Email verification is required before account access
   - 6-digit verification code sent via email
   - Codes expire after 15 minutes
   - Users can request new codes if needed
3. Passwords are hashed using bcrypt before storage
4. Session-based authentication maintains user state
5. Admin users have elevated permissions and bypass email verification

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
- **Admin Analytics Dashboard**: Added comprehensive analytics and charts
  - Interactive line chart tracking user registrations over time (12 months)
  - Bar chart showing data release requests over time
  - Pie chart displaying vault completion time distribution
  - System insights with average completion times and approval rates
  - Real-time stats cards for quick overview
- **Enhanced Home Page**: Improved "Learn More" modal with comprehensive information
  - Key benefits section explaining time savings, stress reduction, and peace of mind
  - Data protection details covering bank-level encryption and zero-knowledge access
  - Smart estate planning tips including using wishes for gifting outside the will
  - Thoughtful recommendations for asset exposure reduction and probate optimization
- **Navigation Content Modals**: Added comprehensive information modals for top navigation
  - "How it Works" modal with step-by-step process, feature details, and access procedures
  - "Security" modal explaining AES-256 encryption, zero-knowledge access, and privacy rights
  - "Support" modal with contact options, FAQ section, and emergency support information
  - All modals feature professional design with icons, color-coded sections, and clear information hierarchy
- **Funeral Plan Summary Generation**: Auto-populate traditional text area with wizard results
  - Generate human-readable summaries from structured wizard data
  - Allow editing of generated summaries for personalization
  - Clear visual indicators when content is auto-generated vs manually written
- **Dashboard Navigation Enhancement**: Fixed section-specific navigation
  - Dashboard tiles now navigate directly to correct vault sections
  - URL parameters pass section information for proper routing
  - Improved user experience with targeted section access

### January 30, 2025
- **Comprehensive Security Audit and Hardening**: Major security improvements implemented
  - **Fixed Critical Encryption Vulnerability**: Replaced deprecated `createCipher` with secure `createCipheriv`
  - **Enhanced Password Security**: Strengthened password requirements (8+ chars, mixed case, numbers) and increased bcrypt rounds to 12
  - **Added Security Headers**: Implemented Helmet.js with Content Security Policy, XSS protection, and other security headers
  - **Rate Limiting Protection**: Added comprehensive rate limiting (100 req/15min general, 5 auth attempts/15min)
  - **Session Security**: Enhanced session configuration with httpOnly cookies, sameSite protection, and secure naming
  - **Input Validation**: Strengthened Zod schemas with proper length limits and format validation
  - **Error Handling**: Implemented secure error handling that doesn't leak sensitive information in production
  - **Environment Security**: Added mandatory checks for ENCRYPTION_KEY and SESSION_SECRET environment variables
  - **Database Security**: Added proper error handling and logging for all database operations
  - **Type Safety**: Fixed TypeScript issues and improved type safety across the application

### October 17, 2025
- **Email Verification System**: Implemented mandatory email verification for new user registrations
  - Added database fields for email verification status and codes (emailVerified, verificationCode, verificationCodeExpiry)
  - New users receive a 6-digit verification code via email upon registration
  - Verification codes expire after 15 minutes for security
  - Created dedicated email verification page with code input and resend functionality
  - Users must verify email before accessing the application (admin users bypass this requirement)
  - Improved error handling to preserve JSON error data for better UX feedback
  - Updated registration and login flows to redirect to verification when needed
  - Enhanced email templates with professional verification code display
  - Security patch: Fixed GCM authentication tag validation vulnerability in encryption module
- **Trusted Contact Invitation and Dashboard System**: Complete implementation of trusted contact user experience
  - **Invitation Acceptance Flow**: Created /invite/:token page for accepting nominations
    - Users set password and create account without email verification (invite link validates email ownership)
    - Backend automatically sets email_verified to true for invited users
    - Updates trusted contact status to 'confirmed' and establishes user session
  - **Dual-Mode Dashboard**: Adaptive dashboard based on user's role
    - "You're a Trusted Contact" section shows people user is nominated for
    - Quick action buttons: "No Longer Wish to Be Trusted Contact" and "Notify of Passing"
    - "Create Your Own Vault" section appears for trusted contacts without their own vault
    - Conditional rendering adapts to whether user owns vault, is trusted contact, or both
  - **Remove as Trusted Contact**: Self-service removal functionality
    - Updates contact status to 'denied' in database
    - Sends automated email notifications to both vault owner and trusted contact
    - Immediately removes card from dashboard after confirmation
  - **Death Declaration Workflow**: Formal process for requesting vault access
    - Modal displays declaration with deceased person's name
    - Creates data release request with 'pending' status for admin review
    - Success message explains admin review process
  - **Schema Fix**: Corrected insertDataReleaseRequestSchema to omit requesterId (backend injects from session)
  - **Storage Enhancement**: Added getTrustedContactsByEmail method for dashboard queries
  - **End-to-End Testing**: Playwright tests confirm complete flow from invitation through death declaration