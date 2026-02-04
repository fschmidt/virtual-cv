# Virtual CV - Backlog

Organized tasks and ideas for future development.

---

## Phase 2: Backend Foundation

### 2.1 API Setup
- [ ] Create Java Spring Boot API project (`virtual-cv-api/`)
- [ ] Define domain model (Node, Edge, ViewerType)
- [ ] Implement REST endpoints for graph data
- [ ] Add CORS configuration for frontend

### 2.2 Frontend Integration
- [ ] Connect frontend to backend API (replace static data)
- [ ] Environment-based API URL configuration (dev/prod)
- [ ] Add loading states and error handling

---

## Phase 3: Infrastructure (Oracle Cloud + Kubernetes)

### 3.1 Cluster Setup
- [ ] Create Oracle Cloud account and configure OKE
- [ ] Provision ARM node pool (free tier)
- [ ] Create PostgreSQL deployment + PVC
- [ ] Deploy Spring Boot API
- [ ] Configure Nginx ingress for API routing

### 3.2 Automation & Reliability
- [ ] Create cluster provisioning script (Terraform or shell)
- [ ] Document cluster recreation steps
- [ ] Backup strategy for PostgreSQL (pg_dump to object storage)
- [ ] Restore procedure for cluster upgrades
- [ ] CI/CD pipeline for API deployment

---

## Phase 4: Viewer Modes

### 4.1 Audience-Based Filtering
- [ ] Define viewer types: `recruiter`, `engineer`, `manager`, `public`
- [ ] Add visibility flags to nodes (which viewers see what)
- [ ] URL parameter or toggle to switch viewer mode
- [ ] Filter graph data based on selected viewer
- [ ] Persist viewer preference (localStorage or URL)

---

## Phase 5: Content Management

### 5.1 CMS-like Editing
- [ ] Admin authentication (JWT or basic auth)
- [ ] CRUD endpoints for nodes and edges
- [ ] Simple admin UI for editing graph content
- [ ] Draft/publish workflow
- [ ] Media upload for profile photos

---

## Phase 6: AI Features

### 6.1 CV Import Assistant
- [ ] Upload traditional CV (PDF/DOCX)
- [ ] Parse document and extract structured data
- [ ] AI-assisted mapping to graph nodes
- [ ] Review and edit before saving

---

## Phase 7: Export

### 7.1 PDF Generation
- [ ] Human-readable PDF (formatted, styled)
- [ ] ATS-friendly PDF (plain text, parseable)
- [ ] Viewer-specific exports (filtered by audience)
- [ ] Download button in UI

---

## Ideas / Parking Lot

_Unscoped ideas for later consideration:_

- Link previews for projects (fetch metadata)
- Guided tour / onboarding mode
- Analytics (which nodes get viewed most)
- Public sharing with unique URLs
- Multilingual support
- Dark/light theme toggle

---

## Priority Order

1. **Phase 2** - Backend (enables real data)
2. **Phase 3** - Infrastructure (enables persistence + deployment)
3. **Phase 4** - Viewer modes (core differentiator)
4. **Phase 7** - Export (immediate value)
5. **Phase 5** - CMS (nice to have)
6. **Phase 6** - AI (future enhancement)
