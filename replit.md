# replit.md

## Overview

This is a full-stack catering website application for "מאמאמיה" (Mamamia), a kosher home-style catering service. The application features a modern React frontend with a Node.js/Express backend, designed for the Israeli market with Hebrew language support and RTL (right-to-left) layout.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL with Drizzle ORM (configured but using in-memory storage currently)
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for monorepo setup
- **UI Library**: shadcn/ui components based on Radix UI primitives
- **Styling**: Tailwind CSS with custom color scheme for brand consistency
- **Layout**: RTL support with Hebrew localization
- **Responsive Design**: Mobile-first approach with responsive components

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with proper error handling
- **Storage**: Currently using in-memory storage (MemStorage class) but configured for PostgreSQL via Drizzle

### Component Structure
- **Layout Components**: Header, Footer with navigation and branding
- **Section Components**: Hero, Story, Events, Menu, Gallery, Blog, Testimonials, Price Calculator, FAQ, Contact
- **UI Components**: Comprehensive set of reusable components from shadcn/ui
- **Utility Components**: Accessibility toolbar, back-to-top button, responsive navigation

## Data Flow

1. **Contact Form Submission**: Client form data → Form validation (Zod) → API endpoint → Storage layer → Response
2. **Content Display**: Static data files → Component props → Rendered UI
3. **Navigation**: Client-side routing with smooth scrolling to sections
4. **State Management**: TanStack Query handles server state, local state for UI interactions

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React, React DOM, React Hook Form
- **UI Framework**: Radix UI primitives, Tailwind CSS, Font Awesome icons
- **Backend**: Express.js, Drizzle ORM, Zod for validation
- **Build Tools**: Vite, TypeScript, ESBuild for production builds
- **Database**: Configured for PostgreSQL with Neon Database (@neondatabase/serverless)

### Development Dependencies
- **Type Checking**: TypeScript with strict configuration
- **Linting/Formatting**: Configured through package.json scripts
- **Development Server**: Vite dev server with HMR support

## Deployment Strategy

### Development
- Uses Vite development server with middleware mode
- Express server handles API routes and serves static files in development
- Environment-specific configuration through NODE_ENV

### Production Build
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Assets**: Served through Express with proper routing fallback
- **Database**: Configured for PostgreSQL with connection pooling

### Environment Configuration
- Database URL through `DATABASE_URL` environment variable
- Production/development mode switching
- Replit-specific integrations for development environment

### Key Architectural Decisions

1. **Monorepo Structure**: Chosen for easier development and deployment of both frontend and backend together
2. **TypeScript Throughout**: Ensures type safety across the entire stack
3. **Drizzle ORM**: Provides type-safe database operations with PostgreSQL support
4. **Database Storage**: Currently using PostgreSQL with DatabaseStorage implementation
5. **Component-Based Architecture**: Modular design for maintainability and reusability
6. **RTL Support**: Built-in Hebrew and RTL layout support for target market
7. **Accessibility Features**: Dedicated accessibility toolbar and ARIA compliance
8. **Mobile-First Design**: Responsive design prioritizing mobile user experience

The application is structured to be easily scalable and maintainable, with clear separation of concerns and modern development practices throughout.