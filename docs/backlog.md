# Virtual CV - Backlog

Organized tasks for current and future development.

---

## ✅ Completed

### Phase 1: UI Prototype
- [x] Interactive graph canvas with React Flow
- [x] Three-state node system (detailed/quickview/dormant)
- [x] Business card profile node with photo
- [x] Inspector panel with markdown rendering
- [x] Dark theme with purple accents
- [x] Navigation: home button, search (Cmd+K)
- [x] Deep linking via URL hash
- [x] Keyboard navigation (Escape to deselect)
- [x] Standard CV view (alternative to graph)
- [x] GitHub Pages deployment

### Phase 2: Backend Foundation
- [x] Spring Boot API (`virtual-cv-api/`)
- [x] Domain model (CvNode with type, label, parentId, attributes)
- [x] PostgreSQL persistence with Flyway migrations
- [x] CORS configuration
- [x] REST endpoints: GET /cv, POST/PUT/DELETE for nodes
- [x] Repository tests with Testcontainers

### Phase 3: Edit Mode & Content Management
- [x] Edit mode toggle (feature-flagged, pencil button in menu)
- [x] Create node dialog (categories, items, skill groups, skills)
- [x] Edit node (label, description, content)
- [x] Delete node with confirmation + cascade
- [x] Draft/publish workflow (isDraft attribute)
- [x] Toast notifications for actions
- [x] Hard delete (replaces soft-delete)
- [x] Drag-to-position nodes (persists to backend)
- [x] Add child node via + button on graph nodes

### Phase 4: Frontend-Backend Integration
- [x] Generated TypeScript API client from OpenAPI spec
- [x] Connect frontend to real API
- [x] Environment-based API URL (`VITE_API_URL`)
- [x] Custom fetch with typed error handling
- [x] Loading states during API calls

### Phase 5: Infrastructure & Deployment
- [x] Docker Compose for local development (API + PostgreSQL)
- [x] Backend deployment (Oracle Cloud VM or Kubernetes)
- [x] CI/CD pipeline for API deployment

---

## 🚧 Up Next

### Infrastructure Enhancements
- [x] PostgreSQL backup strategy (daily CronJob → Google Drive via rclone)

### UI Polish
- [x] Smooth animations/transitions when nodes expand
- [x] Mobile-responsive improvements
- [ ] Light/dark theme toggle
- [ ] Minimap as an on/off option 

### Viewer Modes
- [ ] Define viewer types: `recruiter`, `engineer`, `manager`, `public`
- [ ] Visibility flags per node (which viewers see what)
- [ ] URL parameter or toggle to switch viewer mode
- [ ] Filter graph data based on selected viewer

### Export Features
- [ ] PDF export (human-readable, styled)
- [ ] ATS-friendly PDF (plain text, parseable)
- [ ] Markdown export
- [ ] JSON export/import
- [ ] Viewer-specific exports (filtered by audience)

---

### Permission System
- [ ] Simple per-feature permission system (no roles)
- [ ] Users table in the database
- [ ] User creation form, only accessible when holding a specific permission
- [ ] Owner user seeded via Flyway migration with all permissions

## 📦 Future Features

### Multi-User Support
- [ ] Open the system for others by allowing each user to have their own CV

### Advanced Features
- [ ] Media upload for images
- [ ] Graph validation (orphan detection, broken refs)
- [ ] Guided tour / onboarding mode
- [ ] Analytics (which nodes get viewed most)

---

## 💡 Ideas / Parking Lot

_Unscoped ideas for later consideration:_

- CLI client (`cv search "react"`, `cv node job-a`, `cv export`)
- CV import assistant (parse PDF/DOCX, AI-assisted mapping)
- Link previews for projects (fetch metadata)
- Public sharing with unique URLs
- Multilingual support
- CV Life Simulator (roguelike game based on CV content)

---

## Priority Order

1. **Viewer Modes** - core differentiator
2. **Export Features** - immediate value for users
3. **UI Polish** - refinement and accessibility
4. **Advanced Features** - polish and differentiation

---

## Technical Debt

_Findings from the [Quality & Sustainability Audit](audit-report.md) (2026-02-06). Critical and High severity items requiring attention. See [improvement-plan.md](improvement-plan.md) for the prioritized, milestone-based implementation roadmap._

### Critical

- [x] **SEC-01: All CRUD endpoints unauthenticated.** Resolved: Google OAuth2 JWT authentication for write endpoints with email whitelisting. (Milestone 2)
- [x] **CICD-01: No test gates in either CI pipeline.** Resolved: Both CI pipelines now run tests. Frontend: lint → test → build. Backend: test → build with PostgreSQL service container. (Milestones 1, 3)
- [x] **TEST-01: Zero frontend tests.** Resolved: Vitest + React Testing Library installed. 47 smoke tests covering cv.mapper, feature-flags, errors, and content.service. Tests gate CI. (Milestone 3)

### High

- [x] **OPS-01: No PostgreSQL backup strategy.** Resolved: Daily CronJob runs pg_dump → gzip → rclone upload to Google Drive. Retains last 3 backups. Manual backup script provided. (Milestone 5)
- [x] **TEST-02: Backend tests require Docker, never run in CI.** Resolved: CI runs tests with PostgreSQL service container. (Milestone 1)
- [x] **TEST-03: No service or controller layer tests.** Resolved: CvNodeService unit tests and CvController WebMvc tests added. (Milestone 4)
- [x] **CICD-02: Dockerfile skips tests.** Resolved: Tests run in separate CI step before Docker image build. (Milestone 1)
- [x] **MAINT-01: 6 ESLint errors shipping to production.** Resolved: All ESLint errors fixed. Lint step added to CI. (Milestone 1)
- [ ] **MAINT-02: Oversized files.** `App.css` (2,431 lines), `InspectorPanel.tsx` (696 lines). Split into module-scoped CSS files and extract sub-components.
- [x] **SEC-02: CSRF disabled with no authentication.** Resolved: CSRF decision documented in SecurityConfig.java. Stateless JWT auth makes CSRF inapplicable. (Milestone 2)
- [x] **SEC-03: CORS allows all headers with credentials.** Resolved: allowedHeaders restricted to Content-Type, Accept, Authorization. allowCredentials set to false. (Milestone 2)
