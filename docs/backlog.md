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
- [ ] PostgreSQL backup strategy

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

## 📦 Future Features

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
- multiple cv's and multiple users

---

## Priority Order

1. **Viewer Modes** - core differentiator
2. **Export Features** - immediate value for users
3. **UI Polish** - refinement and accessibility
4. **Advanced Features** - polish and differentiation
