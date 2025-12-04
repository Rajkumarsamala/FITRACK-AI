# Fitness Tracker Application

## Overview

A comprehensive dual-goal fitness tracking web application that supports both weight loss and weight gain journeys. Users can set personalized goals, track nutrition and workouts, monitor progress with visualizations, and receive AI-powered tips. The application features a modern, responsive design with Material Design principles implemented via Tailwind CSS and shadcn/ui components.

## Recent Changes (December 2024)

### Premium AI Features Added
- **AI Body Scan Tool**: Uses MediaPipe Pose Detection to analyze posture, body alignment, and potential fitness issues directly in the browser
- **Posture Analysis**: Evaluates shoulder alignment, hip alignment, spine position, head position, and body symmetry
- **Premium Subscription**: $9.99/month subscription plan via Stripe for unlimited AI body scans
- **Free Trial**: One free body scan for all users before requiring premium subscription
- **Privacy-First**: All AI analysis happens client-side - no images are uploaded to servers

### Stripe Integration (Updated)
- **Replit Stripe Connector**: Using managed Stripe integration with automatic webhook handling
- **stripe-replit-sync**: Database synchronization between Stripe and PostgreSQL
- **Managed Webhooks**: Automatic webhook configuration with UUID-based routing for security
- **Product Created**: FitTrack AI Premium product with $9.99/month pricing (price_1SaXDN8OBA84u8hKEs94pkp9)

### New Database Tables
- `subscriptions`: Tracks user subscription status, Stripe customer/subscription IDs
- `body_scans`: Stores posture analysis results and historical data
- `trial_usage`: Tracks whether users have used their free trial
- `stripe.*`: Stripe schema managed by stripe-replit-sync (products, prices, customers, etc.)

### New Pages
- `/body-scan`: AI-powered posture and body analysis page
- `/premium`: Premium subscription upgrade page with Stripe integration

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework Stack**
- React 19 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- React Query (TanStack Query) for server state management

**UI Component System**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS v4 for utility-first styling with custom design tokens
- Custom "New York" style variant with dark purple gradient theme
- Responsive design system with fluid typography scale (clamp functions)
- 12-column grid layout on desktop (≥1024px) with 1200px max-width container

**State Management**
- React Context API for global state (GoalContext, UserContext)
- Separate data persistence per goal type (lose-weight vs gain-weight)
- localStorage for client-side data persistence (no backend database required)

**Design System**
- Fluid type scale: H1 (32-48px), H2 (26-36px), H3 (22-28px), body (16-18px)
- Spacing scale: 8px to 48px (--space-1 to --space-6)
- Glass-morphism effects with gradient borders and glow states
- Consistent card padding (p-6 lg:p-8) and section spacing (mt-16 lg:mt-20)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for type-safe API development
- HTTP server created via Node.js http module
- Custom middleware for request logging and JSON parsing

**API Design**
- RESTful API structure with /api prefix for all endpoints
- Modular route registration system (registerRoutes in server/routes.ts)
- Static file serving for production builds (dist/public)

**Development vs Production**
- Development: Vite dev server with HMR via middleware mode
- Production: Pre-built static assets served by Express
- Separate build scripts for client (Vite) and server (esbuild)

### Data Storage Solutions

**Database Storage (Active)**
- PostgreSQL database with Drizzle ORM for type-safe queries
- Neon Database serverless driver (@neondatabase/serverless)
- DatabaseStorage class implementing IStorage interface
- User authentication data stored in `users` table
- Session data stored in `sessions` table (PostgreSQL-backed)

**Client-Side Storage**
- localStorage for fitness profile and progress data
- Goal-specific data isolation (separate storage keys per goal type)
- Workout and nutrition preferences cached locally

**Schema**
- `users` table: id, email, firstName, lastName, profileImageUrl, timestamps
- `sessions` table: sid, sess (JSON), expire (for session management)
- `subscriptions` table: userId, stripeCustomerId, stripeSubscriptionId, status, plan
- `body_scans` table: userId, postureScore, various alignment metrics, recommendations
- `trial_usage` table: userId, bodyScanUsed, bodyScanDate

**Data Models**
- User profiles: name, age, gender, height, current/target weight, activity level
- Daily logs: weight, calories consumed/burned, workout completion, water intake, sleep hours, mood, notes
- Progress metrics: calculated from daily logs (weight change, streak, averages)
- Nutrition plans: meal plans with macro breakdowns per goal type
- Workout plans: exercise routines categorized by goal and difficulty

### Authentication and Authorization

**Implemented with Replit Auth**
- OpenID Connect integration with Replit as the identity provider
- Supports multiple login methods: Google, GitHub, X, Apple, and email/password
- Session-based authentication with PostgreSQL session storage
- User profiles stored in PostgreSQL database

**Authentication Flow**
- `/api/login` - Initiates the login flow (redirects to Replit auth)
- `/api/callback` - Handles the OAuth callback after authentication
- `/api/logout` - Logs out the user and redirects to Replit's logout
- `/api/auth/user` - Returns the authenticated user's profile (protected route)

**Protected Routes**
- All application routes except the landing page require authentication
- Unauthenticated users are automatically redirected to login
- Client-side auth state managed via `useAuth` hook

**User Data**
- User profiles synced from Replit auth claims (email, name, profile image)
- Sessions persist for 7 days with automatic token refresh

### External Dependencies

**UI Component Libraries**
- Radix UI primitives for accessible, unstyled components (@radix-ui/react-*)
- Lucide React for consistent icon set
- Recharts for data visualization and progress charts
- Embla Carousel for touch-friendly carousels
- cmdk for command palette functionality

**Utility Libraries**
- date-fns for date manipulation and formatting
- clsx and tailwind-merge for className composition
- class-variance-authority (CVA) for variant-based component styling
- Zod for runtime type validation and schema definition
- drizzle-zod for database schema to Zod schema conversion

**Form Management**
- React Hook Form with @hookform/resolvers for form state
- Zod integration for schema-based validation

**Build Tools**
- esbuild for server bundling (with selective dependency bundling)
- Vite for client bundling with React Fast Refresh
- PostCSS with Tailwind CSS and Autoprefixer
- TypeScript compiler for type checking

**Development Tools (Replit-specific)**
- @replit/vite-plugin-runtime-error-modal for error overlays
- @replit/vite-plugin-cartographer for code mapping
- @replit/vite-plugin-dev-banner for development indicators

**Database & ORM**
- Drizzle ORM (drizzle-orm) for type-safe database queries
- @neondatabase/serverless for PostgreSQL serverless connections
- drizzle-kit for schema migrations and introspection

**Calculation Engine**
- Custom calculator service (lib/calculator.ts) for:
  - BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation
  - TDEE (Total Daily Energy Expenditure) with activity multipliers
  - Goal-specific calorie adjustments (deficit/surplus)
  - Macro distribution (protein/carbs/fats) per goal type
  - BMI calculation and category classification
  - Ideal weight range estimation
  - Progress projections (weeks to goal)

### AI Body Scan Feature

**Technology Stack**
- MediaPipe Pose Detection (client-side, browser-based)
- PoseLandmarker model for real-time pose estimation
- GPU-accelerated inference where available

**Analysis Features**
- Shoulder alignment detection
- Hip alignment analysis
- Spine curvature assessment
- Head position evaluation
- Body symmetry measurement
- Overall posture scoring (0-100)

**Privacy**
- All processing happens locally in the browser
- No images or video uploaded to servers
- Only numerical analysis results are stored

### Payment Integration

**Stripe Integration**
- Managed via Replit Stripe Connector
- stripe-replit-sync for database synchronization
- Automatic webhook configuration
- Test mode (sandbox) for development

**Subscription Flow**
1. User clicks "Subscribe Now" on Premium page
2. Redirected to Stripe Checkout with premium price
3. After payment, webhook updates subscription status
4. User gains access to unlimited AI body scans

**API Endpoints**
- `/api/create-checkout-session` - Creates Stripe checkout session
- `/api/customer-portal` - Creates Stripe customer portal session
- `/api/subscription` - Gets user subscription status
- `/api/stripe/webhook/:uuid` - Handles Stripe webhooks
