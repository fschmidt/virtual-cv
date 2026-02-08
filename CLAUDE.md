# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zoomable CV Graph - an interactive, graph-based CV website that serves as both a virtual CV and a portfolio project. Users explore professional information through a zoomable canvas with progressive disclosure (overview → details).

**Live URL:** https://fschmidt.github.io/virtual-cv/

## Current State

### Completed Features

**Frontend (React + React Flow)**
- Interactive mind-map style graph
- Three-state node system (detailed/quickview/dormant)
- Business card profile node with photo
- Inspector panel with markdown rendering
- Dark theme with purple accent colors
- Navigation: home button, search (Cmd+K), deep linking
- Standard CV view (alternative to graph)
- Edit mode toggle (feature-flagged via Ctrl+Shift+D)
- Create/edit/delete nodes with confirmation dialogs
- Draft/publish workflow
- Toast notifications

**Backend (Spring Boot + PostgreSQL)**
- REST API with full CRUD operations
- PostgreSQL persistence with Flyway migrations
- Hard delete with cascade to children
- Repository tests with Testcontainers

**Integration**
- Generated TypeScript API client from OpenAPI spec
- Environment-based API URL (`VITE_API_URL`)
- Custom fetch with typed error handling

**Deployment**
- GitHub Pages for frontend (GitHub Actions)
- Docker Compose for local development
- Backend deployment with CI/CD pipeline

### Next Steps
See [docs/backlog.md](docs/backlog.md) for the full roadmap. Key priorities:
- Viewer modes (recruiter/engineer/public views)
- Export features (PDF, Markdown)
- UI polish (animations, auto-layout)

## Monorepo Structure

```
virtual-cv/
├── virtual-cv-ui/              # React + Vite + TypeScript frontend
│   └── src/
│       ├── api/
│       │   ├── generated.ts        # Auto-generated API client (NEVER edit)
│       │   ├── fetcher.ts          # Custom fetch with error handling
│       │   └── errors.ts           # Typed API errors
│       ├── components/
│       │   ├── GraphNode.tsx/.css       # Unified node component (3 states)
│       │   ├── InspectorPanel.tsx/.css  # Side panel orchestrator
│       │   ├── NodeView.tsx             # Generic node detail view
│       │   ├── NodeViewProfile.tsx      # Profile node detail view
│       │   ├── NodeEditForm.tsx         # Generic node edit form
│       │   ├── NodeEditProfile.tsx      # Profile node edit form
│       │   ├── DialogOverlay.tsx        # Shared dialog overlay + Escape/click handling
│       │   ├── CreateNodeDialog.tsx/.css # Node creation dialog
│       │   ├── DeleteConfirmDialog.tsx/.css # Delete confirmation modal
│       │   ├── SearchDialog.tsx/.css    # Cmd+K search
│       │   ├── ViewToggle.tsx/.css      # Graph/CV/Edit mode toggle + PDF download
│       │   ├── CVDocument.tsx           # react-pdf Document (A4 PDF layout)
│       │   ├── CVPDFView.tsx/.css       # PDF viewer wrapper (replaces StandardCVView)
│       │   ├── FeatureTogglePopup.tsx/.css # Dev feature flag + auth toggle
│       │   ├── Toast.tsx/.css           # Toast notifications
│       │   ├── LoadingSkeleton.tsx/.css  # Loading placeholder
│       │   └── SectionIcon.tsx          # Category SVG icons
│       ├── hooks/
│       │   └── useGraphState.ts    # Graph state management (CRUD, drag, selection)
│       ├── types/
│       │   ├── cv.types.ts         # Domain model
│       │   └── graph.types.ts      # UI types
│       ├── services/
│       │   ├── cv.service.ts       # API service wrapper with caching
│       │   ├── cv.mapper.ts        # Data → React Flow transform
│       │   ├── content.service.ts  # Markdown content parsing
│       │   ├── layout.service.ts   # Node size calculations
│       │   └── auth.service.ts     # Google OAuth token lifecycle
│       ├── utils/
│       │   ├── feature-flags.ts    # Feature toggle system
│       │   └── node-utils.ts       # Shared node helpers (labels, parent chain)
│       ├── App.tsx
│       └── App.css                 # Globals: :root vars, layout, shared keyframes
├── virtual-cv-api/             # Java Spring Boot backend
│   └── src/main/java/de/fschmidt/virtualcv/
│       ├── controller/CvController.java
│       ├── service/CvNodeService.java
│       ├── repository/CvNodeRepository.java
│       ├── domain/CvNode.java
│       ├── dto/                   # CvDataDto, CvNodeDto
│       ├── command/               # Create/Update command records
│       └── config/                # SecurityConfig, CorsConfig
├── docs/
│   ├── architecture.md        # Architecture overview & assessment
│   ├── backlog.md             # Current backlog and roadmap
│   └── archive/               # Completed plans and historical docs
│       ├── previous-iterations.md  # Summary of completed iterations
│       ├── improvement-plan.md     # Quality improvement plan (all 8 milestones completed)
│       ├── audit-report.md         # Quality & sustainability audit (all findings resolved)
│       └── initial-roadmap.md      # Original project roadmap
├── k8s/                       # Kubernetes deployment manifests
└── .github/workflows/
    ├── deploy.yml             # Frontend → GitHub Pages
    └── deploy-api.yml         # Backend → Docker → K8s
```

## Commands

### Frontend (virtual-cv-ui)

```bash
cd virtual-cv-ui
npm install          # install dependencies
npm run dev          # start dev server (http://localhost:5173)
npm run build        # production build (outputs to dist/)
npm test             # run tests (Vitest)
npm run lint         # run ESLint
npm run preview      # preview production build
npm run generate-api # regenerate API client from OpenAPI spec
```

### Backend (virtual-cv-api)

```bash
cd virtual-cv-api
./gradlew bootRun    # start API server (http://localhost:9823)
./gradlew test       # run tests (requires Docker for Testcontainers)
./gradlew build      # build JAR
```

## Architecture Details

### Node System

All nodes use a single `GraphNode` component with three states:

| State | Appearance | When |
|-------|------------|------|
| **detailed** | Full content, large | Node is selected |
| **quickview** | Circular, 5rem, label visible | Child of selected OR ancestor of selected |
| **dormant** | Small dot (10px) | Everything else |

### Node Types

- `profile` - Business card with photo, title, experience, contact
- `category` - Top-level groups (Work, Skills, Projects, Education)
- `item` - Individual entries (jobs, projects, degrees)
- `skill-group` - Skill categories (Frontend, Backend, DevOps)
- `skill` - Individual skills (React, Java, Docker)

### Data Flow

```
Backend (PostgreSQL) → REST API → Generated TS Client → cvService → React Flow
```

### API Configuration

- Default API URL: `http://localhost:9823`
- Override via environment variable: `VITE_API_URL`

### Styling

- Theme colors defined as CSS custom properties in `:root` (see `App.css`)
- Dark theme: `--bg-body` background, `--bg-surface` nodes
- Purple accent: `--color-accent` → `--color-accent-alt` gradient
- Draft nodes: dashed border, amber (`--color-warning`)
- All sizes in `rem` for quickview nodes
- Each component has a co-located `.css` file (e.g., `GraphNode.tsx` → `GraphNode.css`)
- `App.css` contains only globals: `:root` variables, base layout, React Flow overrides, shared keyframes

### Feature Flags

Toggle features via `Ctrl+Shift+D`:
- `EDIT_MODE` - Shows edit toggle button in floating menu

## Testing

All new features and bug fixes must follow test-driven development (TDD):
1. Write failing tests first that define the expected behavior
2. Implement the minimum code to make tests pass
3. Refactor while keeping tests green

### Frontend
- Test runner: Vitest (`npm test` in `virtual-cv-ui/`)
- Tests live in `__tests__/` directories next to the code they test
- Use `@testing-library/react` for component tests, plain Vitest for unit tests

### Backend
- Test runner: JUnit 5 via Gradle (`./gradlew test` in `virtual-cv-api/`)
- Repository tests use Testcontainers (requires Docker)
- Use `@WebMvcTest` for controller tests, plain JUnit for service unit tests

## Coding Conventions

### Component Structure
- Keep components under ~300 lines; split when orchestrating multiple concerns
- Extract state-heavy logic into custom hooks in `hooks/` (e.g., `useGraphState`)
- Shared utilities go in `utils/` — don't duplicate helpers across components
- Use `DialogOverlay` for all modal dialogs (handles overlay click, Escape key, focus)
- Use `getNodeTypeLabel()` from `utils/node-utils.ts` for human-readable node type names

### CSS
- **Never hardcode hex/rgba colors** — use CSS custom properties from `:root` in `App.css`
- For rgba with variable alpha: `rgba(var(--rgb-accent), 0.3)` (RGB channel variables)
- Co-locate component CSS: `ComponentName.tsx` imports `./ComponentName.css`
- `App.css` is for globals only: `:root` variables, base layout, React Flow overrides, shared `@keyframes`
- ESLint enforces file size: warning at 350 lines, error at 500 lines

### API Client
- `generated.ts` is auto-generated from OpenAPI — **never edit manually**
- Regenerate with `npm run generate-api` after backend API changes

## Design Principles

- Progressive disclosure: overview → details on click
- Rich content in inspector panel, not on canvas nodes
- Dark, modern aesthetic matching business card style
- Nodes small in preview, expand on selection
