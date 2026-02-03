Zoomable CV Graph – Prototype & Portfolio Roadmap

This document describes a broad, phased roadmap for building a zoomable, graph-based CV website that also serves as a portfolio project demonstrating frontend, backend, tooling, and architectural skills.

⸻

Project Goals
	1.	Virtual CV
	•	Interactive, zoomable representation of professional profile
	•	Progressive disclosure: overview → details
	•	Visually appealing but easy to navigate
	2.	Portfolio Project
	•	Public GitHub repository
	•	Demonstrates modern frontend, backend, API design, tooling, and DX
	•	Shows architectural thinking and scope control

⸻

High-Level Architecture (Target State)
	•	Frontend: React + React Flow
	•	Backend: Java + Spring Boot (REST API)
	•	Persistence:
	•	Structured data: PostgreSQL
	•	Media: S3-compatible object storage (e.g. MinIO)
	•	Tooling:
	•	CLI client querying the backend
	•	Docker & Docker Compose
	•	CI pipeline

⸻

Phase 0 – Product Definition & Constraints

Goal: Establish clarity before writing code.

Deliverables
	•	Vision & non-goals (1–2 pages max)
	•	Content outline (categories, node types, relationships)
	•	UX rules:
	•	click vs zoom behavior
	•	navigation (home, breadcrumb, back)
	•	mobile vs desktop behavior

Notes
	•	Explicitly define what this is not (e.g. not a full CMS, not a Notion clone).
	•	Prevents premature backend/CMS overengineering.

⸻

Phase 1 – React + React Flow UI Prototype (No Backend)

Goal: Nail UX, interaction, and visual identity.

Deliverables
	•	Graph canvas with:
	•	pan / zoom / minimap
	•	smooth animated focus on node click
	•	Node system:
	•	Category nodes (Work, Skills, Projects, etc.)
	•	Item nodes (Job, Project, Education)
	•	Tag/Skill nodes
	•	Inspector panel:
	•	markdown text
	•	images
	•	links
	•	Navigation aids:
	•	breadcrumb
	•	home/reset button
	•	search (cmd/ctrl + k)
	•	Basic theming:
	•	typography
	•	spacing
	•	light/dark mode

Notes
	•	Keep nodes visually lightweight.
	•	Rich content belongs in the inspector, not directly on the canvas.
	•	Add a “guided path” mode early to avoid user confusion.

⸻

Phase 2 – Backend Foundation (Java API + Persistence)

Goal: Turn the prototype into a real system with stored content.

Deliverables
	•	Spring Boot backend
	•	Domain model:
	•	Node (id, type, title, summary, details, tags, dates, mediaRefs)
	•	Edge (from, to, type, label, order)
	•	optional: View / Scene (predefined graph entry points)
	•	Persistence:
	•	PostgreSQL for nodes & edges
	•	Object storage for media
	•	API:
	•	public read endpoints (graph, node, search)
	•	protected admin endpoints (CRUD)
	•	Simple authentication (JWT or basic auth)

Notes
	•	Start with content-as-code (JSON/YAML) if iteration speed matters.
	•	Migrate to DB once the model stabilizes.

⸻

Phase 3 – CMS-like Admin Capabilities

Goal: Demonstrate tooling and content management skills.

Deliverables
	•	Minimal admin interface OR API-first admin workflow
	•	CRUD for nodes and edges
	•	Media upload & management
	•	Draft / publish flag
	•	Graph validation:
	•	orphan detection
	•	broken references

Notes
	•	Avoid full CMS scope creep.
	•	“CMS-like” is sufficient for portfolio value.

⸻

Phase 4 – CLI Client

Goal: Showcase developer experience and API consumption.

Deliverables
	•	CLI (Java with Picocli or Node.js)
	•	Example commands:
	•	cv search "react"
	•	cv node job-a
	•	cv path work job-a
	•	cv export --format markdown|json
	•	Optional: --open flag to open the web UI at a node

Notes
	•	Keep command set small but polished.
	•	Documentation quality matters more than feature count.

⸻

Phase 5 – Portfolio Enhancements (Pick 2–3)

Possible Add-ons
	•	Export formats:
	•	Markdown CV
	•	JSON graph
	•	Observability:
	•	structured logging
	•	basic metrics
	•	Testing:
	•	backend integration tests (Testcontainers)
	•	frontend e2e tests (Playwright)
	•	Performance:
	•	graph payload caching
	•	lazy loading node details

Notes
	•	Finish a few features completely rather than many partially.

⸻

Phase 6 – Deployment & Public Presentation

Deliverables
	•	Docker Compose (frontend, backend, DB, storage)
	•	CI pipeline (build, test, lint)
	•	Public deployment
	•	High-quality README:
	•	screenshots / GIFs
	•	architecture overview
	•	API & CLI examples

⸻

Scope Guidance (What to Keep / Adjust / Drop)

Keep (High Value)
	•	Polished React Flow UX
	•	Java backend with real persistence
	•	CLI client
	•	Docker + CI

Adjust
	•	CMS scope → minimal admin first
	•	Link previews → simple metadata initially

Drop if Needed
	•	Duplicate tooling (e.g. CMS + complex admin + revision history)
	•	Over-ambitious feature sets

⸻

Suggested MVP Slice
	1.	React prototype (zoom, inspect, navigate)
	2.	Java API serving graph + node details from files
	3.	CLI: search, node, export
	4.	Migrate persistence to DB + media storage

This slice already demonstrates UX, architecture, backend, and tooling.

⸻

Next Steps (Optional)
	•	Turn this roadmap into milestone tickets
	•	Define initial JSON/YAML content schema
	•	Decide monorepo vs multi-repo layout

⸻

This roadmap intentionally balances ambition with portfolio realism.