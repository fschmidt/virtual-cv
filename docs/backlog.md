# Virtual CV - Backlog

Forward-looking backlog. For completed work, see [previous iterations](archive/previous-iterations.md).

---

## Next Up

### Iteration A: PDF Export & Content

- [ ] PDF export (human-readable, styled CV document)
- [ ] Populate CV content (work experience, skills, projects, education)

### Iteration B: Content Finetuning

- [ ] Structural adaptations to the data model or UI for specific content needs
- [ ] Adjust node types, attributes, or layout to better present certain entries

---

## Planned

### Export Features
- [ ] ATS-friendly PDF (plain text, parseable)
- [ ] Markdown export
- [ ] JSON export/import

### UI Polish
- [ ] Light/dark theme toggle
- [ ] Minimap as an on/off option

### Viewer Modes
- [ ] Define viewer types: `recruiter`, `engineer`, `manager`, `public`
- [ ] Visibility flags per node (which viewers see what)
- [ ] URL parameter or toggle to switch viewer mode
- [ ] Filter graph data based on selected viewer
- [ ] Viewer-specific exports (filtered by audience)

### Permission System
- [ ] Simple per-feature permission system (no roles)
- [ ] Users table in the database
- [ ] User creation form, only accessible when holding a specific permission
- [ ] Owner user seeded via Flyway migration with all permissions

---

## Future Features

### Multi-User Support
- [ ] Open the system for others by allowing each user to have their own CV

### Advanced Features
- [ ] Media upload for images
- [ ] Graph validation (orphan detection, broken refs)
- [ ] Guided tour / onboarding mode
- [ ] Analytics (which nodes get viewed most)
- [ ] Frontend e2e tests (Playwright)
- [ ] Structured logging / basic metrics (observability)
- [ ] Graph payload caching / lazy loading of node details

---

## Ideas / Parking Lot

_Unscoped ideas for later consideration:_

- CLI client (`cv search "react"`, `cv node job-a`, `cv export`)
- CV import assistant (parse PDF/DOCX, AI-assisted mapping)
- Link previews for projects (fetch metadata)
- Public sharing with unique URLs
- Multilingual support
- CV Life Simulator (roguelike game based on CV content)
