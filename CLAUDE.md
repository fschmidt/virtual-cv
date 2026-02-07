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
│       │   ├── generated.ts        # Generated API client
│       │   ├── fetcher.ts          # Custom fetch with error handling
│       │   └── errors.ts           # Typed API errors
│       ├── components/
│       │   ├── GraphNode.tsx           # Unified node component (3 states)
│       │   ├── InspectorPanel.tsx      # Side panel for node details/editing
│       │   ├── ViewToggle.tsx          # Graph/CV/Edit mode toggle
│       │   ├── CreateNodeDialog.tsx    # Node creation dialog
│       │   ├── DeleteConfirmDialog.tsx # Delete confirmation modal
│       │   ├── SearchDialog.tsx        # Cmd+K search
│       │   ├── StandardCVView.tsx      # Linear CV view
│       │   ├── FeatureTogglePopup.tsx  # Dev feature flag toggle
│       │   ├── SectionIcon.tsx         # Category SVG icons
│       │   ├── LoadingSkeleton.tsx     # Loading placeholder
│       │   └── Toast.tsx              # Toast notifications
│       ├── types/
│       │   ├── cv.types.ts         # Domain model
│       │   └── graph.types.ts      # UI types
│       ├── services/
│       │   ├── cv.service.ts       # API service wrapper with caching
│       │   ├── cv.mapper.ts        # Data → React Flow transform
│       │   ├── content.service.ts  # Markdown content parsing
│       │   └── layout.service.ts   # Node size calculations
│       ├── utils/
│       │   └── feature-flags.ts    # Feature toggle system
│       ├── App.tsx
│       └── App.css
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
│   ├── audit-report.md        # Quality & sustainability audit
│   ├── backlog.md             # Current backlog and roadmap
│   ├── improvement-plan.md    # Prioritized improvement roadmap
│   └── initial-roadmap.md     # Original project roadmap (read-only)
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

- Dark theme: `#0d0d14` background, `#1a1a2e` nodes
- Purple accent: `#667eea` → `#764ba2` gradient
- Draft nodes: dashed border, amber color
- All sizes in `rem` for quickview nodes

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

## Design Principles

- Progressive disclosure: overview → details on click
- Rich content in inspector panel, not on canvas nodes
- Dark, modern aesthetic matching business card style
- Nodes small in preview, expand on selection
