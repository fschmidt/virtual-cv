# Project Backlog

## Pending

- [ ] Create PostgreSQL backup script (pg_dump to local machine)
- [ ] Implement REST controller (`/api/cv/**` endpoints)
- [ ] Add seed data migration (V2)
- [ ] Configure Google OAuth2
- [ ] Create `allowed_users` table and auth filter

## In Progress

- [ ] First deployment to k3s cluster

## Setup Required (One-time)

1. Add `KUBECONFIG` secret to GitHub repo (base64 encoded)
2. After first push, make ghcr.io package public

## API Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Java version | 21 (LTS) | Latest LTS, virtual threads, modern features |
| Build tool | Gradle | Learning opportunity (familiar with Maven) |
| Entity strategy | Single table, self-referencing parent | Simple, pragmatic for prototype |
| Migrations | Flyway | SQL-first, simple, sufficient for single DB |
| Testing | Testcontainers + PostgreSQL | Real DB in tests, Flyway runs automatically |
| Auth | Google OAuth2 + email allowlist | Invite-only via `allowed_users` table |
| Registry | GitHub Container Registry (ghcr.io) | Free, integrates with Actions |
| Ingress | Traefik (path-based) | Already in k3s, route `/api/*` |

## API Stack

- Spring Boot 3.5.x
- Spring Data JPA
- Spring Security + OAuth2 Client (Google)
- PostgreSQL driver
- Flyway
- Testcontainers
- Spring Actuator
- Bean Validation

## API Endpoints

```
GET  /api/cv                      → all nodes + positions
GET  /api/cv/nodes/{id}           → single node
GET  /api/cv/nodes/{id}/children  → child nodes
GET  /api/cv/search?q=            → search nodes
```

## Deployment Flow

```
Push to main (virtual-cv-api/**)
    → GitHub Actions builds Docker image
    → Push to ghcr.io/fschmidt/virtual-cv-api
    → kubectl rollout restart
    → Available at http://46.225.79.87/api/
```

## Completed

- [x] Create namespace `virtual-cv`
- [x] Deploy PostgreSQL with persistent storage
- [x] Scaffold Spring Boot API (entity, repository, tests)
- [x] Create Dockerfile
- [x] Create k8s manifests (Deployment, Service, Ingress)
- [x] Create GitHub Actions workflow
- [x] Configure CORS for GitHub Pages frontend
