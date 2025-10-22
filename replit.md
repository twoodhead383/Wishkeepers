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