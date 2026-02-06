# Improvement Plan

**Project:** Virtual CV (Zoomable CV Graph)
**Date:** 2026-02-06
**Source:** [Quality & Sustainability Audit](audit-report.md), [Architecture Assessment](architecture.md#architecture-assessment)

This plan complements the product [backlog](backlog.md). P0/P1 items should be completed before new product features; P2/P3 items can be interleaved with feature work.

---

## Priority Framework

| Priority | Criteria |
|----------|----------|
| **P0 — Critical** | Security vulnerabilities, data loss risk, broken CI |
| **P1 — High** | Missing test infrastructure, operational blind spots, blocking tech debt |
| **P2 — Medium** | Maintainability, developer experience, architectural improvements |
| **P3 — Low** | Polish, optimization, standards alignment |

---

## Milestone 1: CI/CD Hardening & Lint Fix (P0) — COMPLETED

**Theme:** Build pipeline trust — ensure CI catches regressions before production.
**Branch:** `improvement/ci-hardening`
**Status:** All 5 items completed. Lint passes with 0 errors/warnings. Build passes. Backend compiles.

### 1.1 Fix ESLint Errors

- **ID:** MAINT-01
- **Title:** Fix 6 ESLint errors blocking clean lint
- **Priority:** P0
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Lint errors accumulate unchecked. The `isDraggingRef` mutations and `SearchDialog` setState-in-useEffect may cause subtle runtime bugs.
- **Risk if done wrong:** Changing hook dependencies or effect timing could break drag behavior or search filtering.
- **Acceptance criteria:**
  - `npm run lint` exits with 0 errors, 0 warnings
  - Drag-to-position still works
  - Search dialog still filters correctly
- **Dependencies:** None
- **Files affected:**
  - `virtual-cv-ui/src/App.tsx:229,293,299`
  - `virtual-cv-ui/src/components/SearchDialog.tsx:95,103`
  - `virtual-cv-ui/src/components/Toast.tsx:21`

### 1.2 Add Lint Step to Frontend CI

- **ID:** CICD-01a
- **Title:** Add `npm run lint` to frontend deployment pipeline
- **Priority:** P0
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Lint errors continue shipping to production undetected.
- **Risk if done wrong:** A failing lint step blocks all deployments. Must fix MAINT-01 first.
- **Acceptance criteria:**
  - `deploy.yml` runs `npm run lint` before `npm run build`
  - Pipeline fails if lint errors are introduced
- **Dependencies:** 1.1 (MAINT-01) — lint must pass first
- **Files affected:**
  - `.github/workflows/deploy.yml`

### 1.3 Add Backend Test Job to CI

- **ID:** CICD-01b / TEST-02 / CICD-02
- **Title:** Run backend tests in CI with PostgreSQL service container
- **Priority:** P0
- **Effort:** M (1–4 hours)
- **Risk if deferred:** Backend regressions deploy to production uncaught. The 11 existing repository tests have zero value without CI execution.
- **Risk if done wrong:** Flaky tests could block deployments. Testcontainers + GitHub Actions Docker setup needs careful configuration.
- **Acceptance criteria:**
  - `deploy-api.yml` has a `test` job that runs `./gradlew test`
  - The `test` job uses a PostgreSQL service container
  - The `build-and-push` job depends on the `test` job passing
  - All 11 existing tests pass in CI
- **Dependencies:** None
- **Files affected:**
  - `.github/workflows/deploy-api.yml`

### 1.4 Fix Stale "Soft Delete" Comment

- **ID:** B2 (from architecture assessment)
- **Title:** Update stale comment referencing soft delete
- **Priority:** P0
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Misleading comments cause confusion during future development.
- **Risk if done wrong:** None.
- **Acceptance criteria:**
  - `CvController.java:94` no longer references "soft" delete
  - Comment accurately says "hard delete with cascade"
- **Dependencies:** None
- **Files affected:**
  - `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/controller/CvController.java:94`

### 1.5 Delete Dead Code

- **ID:** MAINT-03
- **Title:** Remove unused `cv-content.ts` data file
- **Priority:** P0
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Dead code confuses contributors and inflates the codebase.
- **Risk if done wrong:** If the file is dynamically imported, removing it breaks the app. (Verified: no imports exist.)
- **Acceptance criteria:**
  - `virtual-cv-ui/src/data/cv-content.ts` is deleted
  - `npm run build` still passes
  - No runtime errors
- **Dependencies:** None
- **Files affected:**
  - `virtual-cv-ui/src/data/cv-content.ts` (delete)
  - `virtual-cv-ui/src/data/` directory may be removable if empty

---

## Milestone 2: Security Baseline (P0)

**Theme:** Protect production data from unauthorized modification.
**Branch:** `improvement/security-baseline`

### 2.1 Restrict Write Endpoints to Authenticated Users

- **ID:** SEC-01
- **Title:** Add API key authentication for POST/PUT/DELETE endpoints
- **Priority:** P0
- **Effort:** M (1–4 hours)
- **Risk if deferred:** Anyone on the internet can delete the entire CV tree with a single request. Combined with no backups (OPS-01), this means permanent unrecoverable data loss.
- **Risk if done wrong:** Could lock out the edit mode feature. Must ensure GET requests remain public. Must provide a way to configure the API key per environment.
- **Acceptance criteria:**
  - `GET /cv/**` remains `permitAll()`
  - `POST`, `PUT`, `DELETE` under `/cv/**` require a valid API key header
  - API key is configured via environment variable (not hardcoded)
  - Unauthorized requests return 401
  - Existing backend tests still pass
  - Frontend edit mode sends the API key when configured via `VITE_API_KEY` env var
- **Dependencies:** None
- **Files affected:**
  - `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/config/SecurityConfig.java`
  - `virtual-cv-api/src/main/resources/application-local.properties`
  - `virtual-cv-api/src/main/resources/application-prod.properties`
  - `virtual-cv-ui/src/api/fetcher.ts` (add API key header for write requests)
  - `k8s/api-deployment.yaml` (add API key secret)
- **New dependencies:** None — Spring Security already supports request header authentication.

### 2.2 Tighten CORS Configuration

- **ID:** SEC-03
- **Title:** Restrict CORS allowedHeaders and remove allowCredentials
- **Priority:** P0
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Overly permissive headers could be exploited if a vulnerability exists on an allowed origin.
- **Risk if done wrong:** Blocking the `Content-Type` or new `X-API-Key` header would break API calls from the frontend.
- **Acceptance criteria:**
  - `allowedHeaders` lists specific values: `Content-Type`, `Accept`, `Authorization`, `X-API-Key`
  - `allowCredentials(true)` removed (or set to `false`)
  - Frontend API calls still work from all 3 allowed origins
- **Dependencies:** 2.1 (SEC-01) — need to know which headers to allow (e.g., `X-API-Key`)
- **Files affected:**
  - `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/config/CorsConfig.java`

### 2.3 Document CSRF Decision

- **ID:** SEC-02
- **Title:** Add code comment documenting why CSRF is disabled
- **Priority:** P0
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Future contributors may re-enable CSRF without understanding the implications, or miss that it should be re-evaluated when adding session-based auth.
- **Risk if done wrong:** None.
- **Acceptance criteria:**
  - `SecurityConfig.java` has a comment explaining CSRF is disabled because the API is stateless and uses API key auth (not cookies/sessions)
- **Dependencies:** 2.1 (SEC-01) — comment should reference the auth model
- **Files affected:**
  - `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/config/SecurityConfig.java`

---

## Milestone 3: Frontend Test Foundation (P1)

**Theme:** Enable safe UI changes with automated regression detection.
**Branch:** `improvement/frontend-tests`

### 3.1 Install Frontend Test Infrastructure

- **ID:** TEST-01 / MAINT-04
- **Title:** Add Vitest + React Testing Library + jsdom
- **Priority:** P1
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Every UI change risks undetected regressions. No test runner means the barrier to writing the first test remains high.
- **Risk if done wrong:** Misconfigured test setup could produce false positives or slow CI.
- **Acceptance criteria:**
  - `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` added as devDependencies
  - `package.json` has `"test": "vitest run"` script
  - `vitest.config.ts` configured with jsdom environment
  - `npm test` runs and exits cleanly (even with zero tests)
- **Dependencies:** None
- **Files affected:**
  - `virtual-cv-ui/package.json`
  - `virtual-cv-ui/vitest.config.ts` (new)
  - `virtual-cv-ui/src/test/setup.ts` (new, for testing-library/jest-dom setup)
- **New dependencies:**
  - `vitest` — Vite-native test runner, zero-config with existing Vite setup
  - `@testing-library/react` — standard React component testing
  - `@testing-library/jest-dom` — DOM matchers
  - `jsdom` — DOM environment for Node.js
  - Alternatives considered: Jest (heavier, requires separate Babel/TS config), Playwright (E2E only, heavier setup). Vitest is the natural choice for a Vite project.

### 3.2 Write Initial Smoke Tests

- **ID:** TEST-01 (continued)
- **Title:** Add smoke tests for critical UI paths
- **Priority:** P1
- **Effort:** M (1–4 hours)
- **Risk if deferred:** No regression safety net for the most critical UI flows.
- **Risk if done wrong:** Brittle tests that break on every change provide negative value.
- **Acceptance criteria:**
  - At least 5 test cases covering:
    - `computeNodeState` returns correct states (detailed/quickview/dormant)
    - `buildNodes` creates nodes with correct data shape
    - Content service parses markdown correctly
    - Feature flag system reads/writes localStorage
    - API error classes construct correctly
  - All tests pass via `npm test`
- **Dependencies:** 3.1
- **Files affected:**
  - `virtual-cv-ui/src/services/__tests__/cv.mapper.test.ts` (new)
  - `virtual-cv-ui/src/services/__tests__/content.service.test.ts` (new)
  - `virtual-cv-ui/src/utils/__tests__/feature-flags.test.ts` (new)
  - `virtual-cv-ui/src/api/__tests__/errors.test.ts` (new)

### 3.3 Add Frontend Test Step to CI

- **ID:** CICD-01c
- **Title:** Add `npm test` to frontend deployment pipeline
- **Priority:** P1
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Tests exist but don't gate deployments.
- **Risk if done wrong:** Must ensure test failures block deployment.
- **Acceptance criteria:**
  - `deploy.yml` runs `npm test` after lint, before build
  - Pipeline fails if any test fails
- **Dependencies:** 3.1, 3.2, 1.2 (lint step already added)
- **Files affected:**
  - `.github/workflows/deploy.yml`

---

## Milestone 4: Backend Test Expansion (P1)

**Theme:** Cover critical backend business logic with automated tests.
**Branch:** `improvement/backend-tests`

### 4.1 Add CvNodeService Unit Tests

- **ID:** TEST-03a
- **Title:** Unit tests for service layer with mocked repository
- **Priority:** P1
- **Effort:** M (1–4 hours)
- **Risk if deferred:** Recursive delete, attribute merge, and command dispatch logic remain untested. Bugs in these paths would silently reach production.
- **Risk if done wrong:** Over-mocking could make tests pass while real behavior differs.
- **Acceptance criteria:**
  - Tests cover: recursive delete (parent + children), attribute merge (existing + new), each create command type dispatches correctly, update with null fields is no-op
  - All tests pass via `./gradlew test`
- **Dependencies:** None
- **Files affected:**
  - `virtual-cv-api/src/test/java/de/fschmidt/virtualcv/service/CvNodeServiceTest.java` (new)

### 4.2 Add CvController WebMvc Tests

- **ID:** TEST-03b
- **Title:** HTTP-level tests for REST controller
- **Priority:** P1
- **Effort:** M (1–4 hours)
- **Risk if deferred:** HTTP status codes, request validation, path variable handling, and error responses are untested.
- **Risk if done wrong:** WebMvcTest requires careful Spring context slicing to avoid loading the full application.
- **Acceptance criteria:**
  - Tests cover: GET /cv returns 200, GET /cv/nodes/{id} returns 404 for missing, POST returns 201 with Location header, PUT with mismatched id returns 400, DELETE returns 204
  - All tests pass via `./gradlew test`
- **Dependencies:** None
- **Files affected:**
  - `virtual-cv-api/src/test/java/de/fschmidt/virtualcv/controller/CvControllerTest.java` (new)

### 4.3 Add Validation to UpdateNodeCommand

- **ID:** MAINT-05
- **Title:** Add missing validation constraints to update command
- **Priority:** P1
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Update operations can set labels to empty strings, bypassing creation-time invariants. This degrades data quality and breaks graph rendering.
- **Risk if done wrong:** Overly strict validation (e.g., requiring all fields) would break partial update semantics.
- **Acceptance criteria:**
  - `label` field has `@Size(min=1, max=255)` when non-null
  - `description` field has `@Size(max=5000)` when non-null
  - Existing backend tests still pass
  - New validation test cases added
- **Dependencies:** None
- **Files affected:**
  - `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/command/UpdateNodeCommand.java`

---

## Milestone 5: Operational Readiness (P1)

**Theme:** Protect production data and improve observability.
**Branch:** `improvement/ops-readiness`

### 5.1 Add PostgreSQL Backup CronJob

- **ID:** OPS-01
- **Title:** Automated database backup via Kubernetes CronJob
- **Priority:** P1
- **Effort:** M (1–4 hours)
- **Risk if deferred:** Any data loss event (accidental deletion, disk failure, SEC-01 exploit) results in permanent unrecoverable data loss.
- **Risk if done wrong:** Backup CronJob that silently fails gives false confidence. Must verify backups are actually created.
- **Acceptance criteria:**
  - K8s CronJob runs `pg_dump` on a daily schedule
  - Dump is stored on a separate PVC or uploaded to object storage
  - CronJob manifest committed to `k8s/`
  - `k8s/README.md` updated with backup/restore instructions
- **Dependencies:** None
- **Files affected:**
  - `k8s/backup-cronjob.yaml` (new)
  - `k8s/README.md`

### 5.2 Add Search Query Length Constraint

- **ID:** MAINT-06
- **Title:** Add `@Size` constraint to search query parameter
- **Priority:** P2
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Minor DoS vector via extremely long query strings.
- **Risk if done wrong:** Too-short limit could break legitimate searches.
- **Acceptance criteria:**
  - `GET /cv/search?q=` rejects queries longer than 200 characters with 400 Bad Request
  - Existing search functionality unaffected for normal queries
- **Dependencies:** None
- **Files affected:**
  - `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/controller/CvController.java`

---

## Milestone 6: Code Maintainability (P2)

**Theme:** Reduce complexity in the largest files.
**Branch:** `improvement/maintainability`

### 6.1 Extract Graph State Hook from App.tsx

- **ID:** MAINT-02a / F1
- **Title:** Move graph state management into `useGraphState` custom hook
- **Priority:** P2
- **Effort:** M (1–4 hours)
- **Risk if deferred:** `App.tsx` continues growing as features are added. The 10 useState + 8 useCallback pattern makes the component hard to reason about.
- **Risk if done wrong:** Breaking the React Flow integration by incorrectly separating state that must be co-located. Hook dependencies must be carefully preserved.
- **Acceptance criteria:**
  - New `virtual-cv-ui/src/hooks/useGraphState.ts` contains: node CRUD callbacks, drag handling, dialog orchestration
  - `App.tsx` reduced to under 200 lines
  - All existing functionality works (drag, CRUD, search, deep linking)
  - `npm run build` and `npm run lint` pass
- **Dependencies:** Milestone 3 (frontend tests exist to catch regressions)
- **Files affected:**
  - `virtual-cv-ui/src/hooks/useGraphState.ts` (new)
  - `virtual-cv-ui/src/App.tsx`

### 6.2 Fix `customFetch` Type Safety

- **ID:** F3 (from architecture assessment)
- **Title:** Fix unsafe `as T` cast in fetcher.ts
- **Priority:** P2
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Type system is silently lying about return types. Any new API consumer could misuse the return value.
- **Risk if done wrong:** Changing the return type could break all callers. Must verify all call sites.
- **Acceptance criteria:**
  - `customFetch` return type accurately reflects the actual shape
  - No `as T` or `as unknown` casts in fetcher.ts
  - `npm run build` passes (TypeScript catches any mismatches)
- **Dependencies:** None
- **Files affected:**
  - `virtual-cv-ui/src/api/fetcher.ts`

---

## Summary

| Milestone | Theme | Priority | Items | Total Effort |
|-----------|-------|----------|-------|-------------|
| 1 | CI/CD Hardening & Lint Fix | P0 | 5 | S+S+M+S+S |
| 2 | Security Baseline | P0 | 3 | M+S+S |
| 3 | Frontend Test Foundation | P1 | 3 | S+M+S |
| 4 | Backend Test Expansion | P1 | 3 | M+M+S |
| 5 | Operational Readiness | P1 | 2 | M+S |
| 6 | Code Maintainability | P2 | 2 | M+S |

### Audit Coverage

Every Critical and High finding from [audit-report.md](audit-report.md) is addressed:

| Finding | Severity | Milestone | Item |
|---------|----------|-----------|------|
| SEC-01 | Critical | 2 | 2.1 |
| CICD-01 | Critical | 1 + 3 | 1.2, 1.3, 3.3 |
| TEST-01 | Critical | 3 | 3.1, 3.2 |
| OPS-01 | High | 5 | 5.1 |
| TEST-02 | High | 1 | 1.3 |
| TEST-03 | High | 4 | 4.1, 4.2 |
| CICD-02 | High | 1 | 1.3 |
| MAINT-01 | High | 1 | 1.1 |
| MAINT-02 | High | 6 | 6.1 |
| SEC-02 | High | 2 | 2.3 |
| SEC-03 | High | 2 | 2.2 |

### Items Explicitly Deferred (acceptable as-is)

| Finding | Severity | Reason |
|---------|----------|--------|
| MAINT-07 | Low | Generated API client in VCS is a valid tradeoff |
| SEC-05 | Medium | Local dev password in docker-compose is standard practice |
| SEC-06 | Low | Rate limiting disproportionate for portfolio project scale |
| OPS-03 | Medium | Prod profile already restricts actuator correctly |
| TEST-04 | Medium | Empty context load test is standard Spring Boot practice |
| OPS-02 | Medium | Structured logging is nice-to-have, not blocking |
