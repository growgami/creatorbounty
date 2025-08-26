# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (Next.js)
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server  
npm run lint         # Run ESLint
npm run db:init      # Initialize PostgreSQL database and tables
```

### Backend (Flask)
```bash
cd backend
pip install -r requirements.txt  # Install dependencies
python src/main.py               # Development server (port 5000)
python wsgi.py                   # Production server with Waitress (port 8000)
```

## Architecture Overview

CreatorBounty is a Plasma Testnet bounty campaign platform with strict role separation. The system enables admins to create TikTok content bounties and creators to submit entries for rewards.

### Project Structure
- `frontend/` - Next.js 15 + React 19 + TypeScript application
- `backend/` - Flask API for Web3 payments and user management

### Core Architecture Patterns

**1. Feature-Based Modularity**
Each feature is completely isolated in `/src/features/[feature-name]/` with its own:
- Components (UI elements)
- Hooks (business logic)
- Orchestrators (high-level flow controllers)
- Types (TypeScript definitions)
- Services (external integrations)

**2. Orchestrator Pattern**
High-level components that coordinate feature flows without UI implementation:
- `AdminBounties` - Manages admin bounty workflow
- `CreatorBounties` - Handles creator participation flow
- `AdminLanding`/`CreatorLanding` - Role-specific experiences

**3. Container/Presentational Separation**
- Containers: Handle state, effects, API calls
- Presentational: Pure UI components receiving props
- Custom hooks: Bridge business logic and components

**4. No Barrel Exports**
Direct imports only (e.g., `@/features/auth/hooks/useAuth`) for clarity and maintainability.

## Database Architecture

**PostgreSQL Schema with Three Core Tables:**

1. **Users Table** (`/src/models/Users.ts`)
   - Twitter OAuth integration (ID, username, profile data)
   - Role assignment (admin/creator) via config file or database
   - Wallet address for payments

2. **Bounties Table** (`/src/models/Bounty.ts`)
   - Campaign metadata (title, description, requirements)
   - Reward pool and token information
   - Status tracking (draft, active, paused, completed, ended)
   - Foreign key to creator (admin user)

3. **Submissions Table** (`/src/models/Submissions.ts`)
   - Creator submissions linked to bounties
   - Status tracking (pending, claimed, rejected)
   - URL to submitted content and transaction hashes

**Database Initialization:**
Run `npm run db:init` to execute the complete schema setup with indexes, triggers, and relationships.

## Authentication & Authorization

**Twitter OAuth 2.0 Flow:**
- NextAuth.js handles Twitter integration
- User data stored in PostgreSQL upon first login
- JWT tokens contain user ID, role, and profile data

**Role Assignment Logic:**
1. Check existing database role
2. Fallback to `/config/admin-users.json` for bootstrap admins
3. Environment variable `ADMIN_TWITTER_USERNAMES` as backup
4. Default to 'creator' role

**Authorization Patterns:**
- `useAuth()` - Authentication state and user data
- `useRole()` - Role-specific navigation and permissions
- `RBAC` component - Role-based conditional rendering
- API routes protected with role-based middleware

## Key Features Implementation

### Admin Features (`/src/features/bounty-admin/`)
- **Dashboard**: Campaign overview with metrics
- **Campaign Management**: Create/edit/delete bounties
- **Submission Review**: Approve/reject creator submissions
- **Payment Processing**: Web3 transactions via Flask API
- **Bulk Actions**: Multi-submission management

### Creator Features (`/src/features/bounty-creator/`)
- **Bounty Browser**: View available campaigns
- **Submission Workflow**: Upload TikTok content
- **Progress Tracking**: Monitor submission status
- **Reward Claims**: Receive payments for approved work

### RBAC System (`/src/features/rbac/`)
- **Role-Based Routing**: `/admin/*` vs `/creator/*`
- **Permission Gates**: Component-level access control
- **Dynamic Navigation**: Role-specific menu items
- **Authentication Modal**: Unified login/role display

## State Management Architecture

**React Query Configuration:**
- Server state with no default caching (staleTime: 0, gcTime: 0)
- Real-time data fetching for admin/creator actions
- Custom hooks for each API endpoint

**Custom Hook Patterns:**
- `useGetBounties()` - Bounty listing with filters
- `useBountyById(id)` - Single bounty details
- `useSubmissionActions()` - Submission CRUD operations
- `usePayments()` - Web3 payment processing

**Context Providers:**
- `SessionProvider` (NextAuth) - Authentication state
- `ReactQueryProvider` - Server state management
- No global client state (intentional architecture choice)

## API Integration

**Frontend APIs (Next.js API Routes):**
```
/api/auth/[...nextauth]     # Twitter OAuth handling
/api/bounty/create          # Create bounty (admin only)  
/api/bounty/[id]           # Get bounty details
/api/bounty/delete         # Delete bounty (admin only)
/api/submissions           # CRUD submissions
/api/user/role             # Role management
```

**Backend APIs (Flask):**
```
/api/payment/send          # Send Web3 payments
/api/payment/balance       # Check wallet balances
/api/payment/status        # Transaction status
/api/users                 # User management
```

**Error Handling:**
- Custom `ApiError` class with status codes
- Centralized error handling in `wsgiApiClient.ts`
- User-friendly error messages with toast notifications

## Styling System

**Tailwind CSS v4:**
- Dark theme: `#222` background, `#101010` cards
- Space Grotesk font family throughout
- Custom `AuraButton` component with glow effects
- Responsive grid backgrounds with animation

**Component Library:**
- `/src/components/ui/` - Reusable UI primitives
- `/src/components/layouts/` - Navigation and structure
- `/src/components/animations/` - Motion and transitions
- Feature-specific components in respective feature folders

## Development Workflow

**File Organization Rules:**
1. Feature code stays in `/src/features/[feature-name]/`
2. Shared components in `/src/components/`
3. Database models in `/src/models/` with full schemas
4. Types in `/src/types/` for global interfaces
5. Direct imports only - no index.ts files

**Code Patterns:**
- TypeScript strict mode throughout
- Custom hooks for all business logic
- Memoization for expensive operations
- Error boundaries for feature isolation
- Permission-based conditional rendering

**Database Management:**
- Models include PostgreSQL schemas with indexes
- Migration functions for schema updates  
- Environment-based connection strings
- Automatic table creation on startup

## Environment Configuration

**Frontend (.env.local):**
```
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
TWITTER_CLIENT_ID=your-twitter-app-id
TWITTER_CLIENT_SECRET=your-twitter-secret
PSQL_HOST=localhost
PSQL_PORT=5432
PSQL_USERNAME=postgres
PSQL_PASSWORD=your-password
PSQL_DATABASE=creatorbounty
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend (.env):**
```
SECRET_KEY=your-flask-secret
FLASK_ENV=development
PORT=5000
FORCE_HTTPS=false
```

## Critical Implementation Details

**Bounty-Specific Data Isolation:**
- ALL data fetching hooks MUST accept bountyId parameters when dealing with submissions
- Example: `useSubmitEntry(bountyId)` and `useGetSubmissions(bountyId)` 
- Without bounty filtering, user submissions appear across all bounties incorrectly
- React Query cache keys MUST include bountyId: `['submissions', bountyId]`

**Multi-Bounty Display Architecture:**
- `BountyCardContainer.tsx` with `variant="single"` renders multiple bounty cards stacked vertically
- Each `CampaignWithSubmissions` component independently fetches its own submission data
- Admin pages show multiple bounty cards by mapping over bounties array, not just first bounty
- Avoid duplicate API calls - let individual components handle their own data fetching

**Orchestrator Pattern Usage:**
- Orchestrators coordinate multiple features without implementing UI
- Handle complex state flows and business logic
- Route between different UI states based on user actions
- Example: `AdminBounties` manages submission review workflow

**Database Schema Features:**
- Automatic timestamp triggers for updated_at columns
- Composite indexes for query optimization
- Foreign key constraints with proper cascading
- JSON fields for flexible data (requirements arrays)

**API Route Patterns:**
- `/api/submissions` accepts optional `?bountyId=` query parameter for filtering
- ALL submission-related endpoints must handle bounty-specific operations
- Submission status checks must filter by both userId AND bountyId to prevent cross-bounty interference

**Security Considerations:**
- JWT tokens validated on every API request
- Role-based endpoint protection
- CORS configured for cross-origin requests
- Content Security Policy headers via Flask-Talisman

**Performance Patterns:**
- React.memo() for expensive components
- Custom hooks prevent unnecessary re-renders
- Database queries optimized with indexes
- Image optimization through Next.js

This architecture enables rapid feature development while maintaining strict role separation and security. The orchestrator pattern and feature modularity allow for complex business logic without UI coupling.