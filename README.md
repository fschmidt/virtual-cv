# Virtual CV

An interactive, graph-based CV website built as both a virtual CV and a portfolio project. Explore professional information through a zoomable canvas with progressive disclosure.

**Live:** https://fschmidt.github.io/virtual-cv/ | **API:** https://api.fschmidts.net

## Architecture

```
virtual-cv-ui (React + React Flow)  →  virtual-cv-api (Spring Boot)  →  PostgreSQL
      GitHub Pages                        Hetzner Cloud (k3s)
```

The frontend renders an interactive node graph where users click to explore CV content. The backend provides a REST API with CRUD operations. See [docs/architecture.md](docs/architecture.md) for the full architecture overview and assessment.

## Quick Start

```bash
# Frontend
cd virtual-cv-ui && npm install && npm run dev    # http://localhost:5173

# Backend (requires Docker)
cd virtual-cv-api && docker compose up -d && SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5.9, Vite 7, @xyflow/react 12 |
| Backend | Java 21, Spring Boot 3.5.10, Spring Data JPA, Flyway |
| Database | PostgreSQL 16 with JSONB attributes |
| Infrastructure | Kubernetes (k3s), Docker, GitHub Actions CI/CD |
| API Contract | OpenAPI 3.0 (springdoc) → Orval → Generated TypeScript client |

## Project Structure

```
virtual-cv/
├── virtual-cv-ui/          # React frontend
├── virtual-cv-api/         # Spring Boot backend
├── k8s/                    # Kubernetes manifests
├── docs/                   # Documentation
│   ├── architecture.md     # Architecture overview & assessment
│   ├── backlog.md          # Product roadmap & technical debt
│   ├── audit-report.md     # Quality & sustainability audit
│   └── initial-roadmap.md  # Original vision (read-only)
└── .github/workflows/      # CI/CD pipelines
```

## Documentation

- [CLAUDE.md](CLAUDE.md) -- Development guide and codebase conventions
- [docs/architecture.md](docs/architecture.md) -- Architecture, data flow, and design assessment
- [docs/backlog.md](docs/backlog.md) -- Product roadmap and technical debt
- [docs/audit-report.md](docs/audit-report.md) -- Quality audit findings
- [k8s/README.md](k8s/README.md) -- Kubernetes deployment guide
