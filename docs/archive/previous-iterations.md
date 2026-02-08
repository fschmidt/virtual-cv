# Previous Iterations

Summary of completed planning iterations. Detailed documents are archived alongside this file for reference.

---

## Iteration 1: Initial Roadmap (Project Inception)

**Document:** [initial-roadmap.md](initial-roadmap.md)
**Period:** Project start through 2026-02-06

Six-phase roadmap that took the project from concept to production:

- **Phase 0 — Product Definition:** Vision, content outline, UX rules
- **Phase 1 — UI Prototype:** React + React Flow canvas, three-state nodes, inspector panel, dark theme, search, navigation, Standard CV view, GitHub Pages deployment
- **Phase 2 — Backend Foundation:** Spring Boot API, PostgreSQL with Flyway, REST CRUD endpoints, Testcontainers
- **Phase 3 — Edit Mode:** Create/edit/delete nodes, draft/publish workflow, drag-to-position, toast notifications
- **Phase 4 — Frontend-Backend Integration:** OpenAPI-generated TypeScript client, environment-based API URL, typed error handling
- **Phase 5/6 — Infrastructure & Deployment:** Docker Compose, CI/CD pipelines, Kubernetes deployment

**Still open** (moved to [backlog](../backlog.md)): light/dark theme toggle, CLI client, export formats (PDF/Markdown/JSON), media upload, graph validation, guided tour, observability, e2e tests, graph caching, CV Life Simulator.

---

## Iteration 2: Quality & Sustainability Improvement Plan

**Document:** [improvement-plan.md](improvement-plan.md)
**Period:** 2026-02-06 through 2026-02-08
**Source:** [Quality & Sustainability Audit](audit-report.md), [Architecture Assessment](../architecture.md#architecture-assessment)

Eight milestones addressing all Critical and High findings from a codebase audit:

| # | Milestone | Branch | Key Outcomes |
|---|-----------|--------|-------------|
| 1 | CI/CD Hardening | `improvement/ci-hardening` | ESLint errors fixed, lint/test steps in CI, backend tests in CI, dead code removed |
| 2 | Security Baseline | `improvement/security-baseline` | Google OAuth2 JWT auth for write endpoints, email whitelisting, CORS tightened |
| 3 | Frontend Tests | `improvement/frontend-tests` | Vitest + RTL installed, 47 smoke tests, tests gate CI |
| 4 | Backend Tests | `improvement/backend-tests` | Service unit tests, controller WebMvc tests, input validation |
| 5 | Operational Readiness | `improvement/operational-readiness` | Daily PostgreSQL backups to Google Drive, search query constraints |
| 6 | Component Refactoring | `improvement/component-refactoring` | useGraphState hook, DialogOverlay, InspectorPanel split into 4 sub-components, shared utilities |
| 7 | CSS Modernization | `improvement/css-modernization` | 28 CSS custom properties, App.css split from 2,431 to 273 lines, 10 component CSS files |
| 8 | Coding Guidelines | `improvement/coding-guidelines` | Coding conventions in CLAUDE.md, ESLint max-lines guardrails |

**Result:** All 3 Critical, 8 High, and select Medium findings resolved. Remaining Medium/Low items explicitly deferred as acceptable (see improvement plan for rationale).
