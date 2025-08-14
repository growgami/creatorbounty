# CreatorBounty Frontend

A modular, TypeScript-first Next.js application for managing creator bounty campaigns on the Plasma Testnet. This project features a robust campaign workflow, wallet integration, TikTok embed/review, and a highly organized codebase following strict architectural and code quality standards.

---

## Project Directory Structure

```
frontend/
├── docs/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   └── ...
├── .windsurf/
├── .gitignore
├── package.json
├── tsconfig.json
├── ...
```

### Top-Level Folders

- **docs/**: Architecture, RBAC, campaign workflow, and design documentation.
- **public/**: Static assets (images, icons, etc.) served by Next.js.
- **src/**: Main application source code (features, components, app config).
- **.windsurf/**: Workspace rules, workflows, and custom automation.
- **Config files**: ESLint, TypeScript, Next.js, PostCSS, etc.

---

## Detailed Folder & File Breakdown

### `/src`
Main source code directory. Contains all features, shared components, and app configuration.

#### `/src/app`
- **(pages)/**: Next.js routing (app directory).
- **api/**: API routes (if present).
- **globals.css**: Global Tailwind and custom styles.
- **layout.tsx**: Root layout component.
- **page.tsx**: Main landing page.

#### `/src/components`
- **animations/**: Animation utilities (e.g., `FadeInTransition.tsx`).
- **layouts/**: Layout components (e.g., `Navbar.tsx`).
- **shared/**: Shared UI elements:
  - `BountyCards.tsx`: Shared bounty card UI.
  - `Buttons.tsx`: Shared button components.
  - `Toast.tsx`: Shared toast notification component.

#### `/src/features`
Feature modules for distinct app flows.

##### `/features/bounty-admin`
- **components/**: Admin dashboard UI (modals, overlays, TikTok embed, toast, confetti, etc.)
  - `ConfettiAnimation.tsx`, `ToastNotification.tsx`, `WalletOverlay.tsx`, `TikTokEmbed.tsx`, `RejectionWorkflow.tsx`, etc.
  - **modals/**: `ConfirmationModal.tsx`, `ReviewModal.tsx` for admin actions.
- **containers/**: Orchestrator/parent components for admin flows.
- **hooks/**: Custom hooks for admin logic.
- **orchestrator/**: High-level orchestrator logic for admin features.

##### `/features/bounty-creator`
- **components/**: Creator view UI (campaign card, header, submission modal, progress bar, etc.)
  - `CampaignCard.tsx`, `CampaignHeader.tsx`, `SubmissionModal.tsx`, `ProgressBar.tsx`, `TabContent.tsx`, etc.
- **hooks/**: Submission logic and state management (`useSubmission.ts`, `useSubmit.ts`).
- **types/**: TypeScript interfaces and types for creator features (`types.ts`).
- **orchestrator/**: Orchestrator logic for creator flows.

##### `/features/landing-pages`, `/features/intro`, `/features/rbac`
- Additional flows for onboarding, role-based access, and landing experiences.

#### `/docs`
- `rbac-architecture.md`: Role-based access control design.
- `campaign-implementation-plan.md`: Campaign workflow planning.
- `react-design-patterns.md`: UI/React best practices.
- `file-structure-plan.md`, `campaign-workflow.md`, etc.: Implementation guides and technical plans.

#### `/public`
- Static files and images for the web app.

---

## Coding & Architectural Standards
- **TypeScript-first**: All logic and components use explicit interfaces and types.
- **Feature Modularity**: Each feature is isolated for maintainability and scalability.
- **Component Structure**: Orchestrator/Container pattern, reusable shared components.
- **Styling**: Tailwind CSS with template literals only for complex dynamic logic.
- **No Barrel Exports**: Direct imports for clarity and tree-shaking.
- **State/Error Handling**: Custom hooks, error boundaries, and loading states throughout.

---

## Getting Started

Run the development server:

```bash
npm run dev
```

Run the database initialization script:

```bash
npm run db:init
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

For more details, see the `/docs` folder for architecture, design patterns, and implementation plans.
