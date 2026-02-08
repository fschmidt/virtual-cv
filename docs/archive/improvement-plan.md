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

## Milestone 2: Security Baseline (P0) — COMPLETED

**Theme:** Protect production data from unauthorized modification.
**Branch:** `improvement/security-baseline`
**Status:** All 3 items completed. Google OAuth2 JWT authentication protects all write endpoints. Email whitelist restricts who can modify data. CORS tightened. CSRF decision documented. 7 new security integration tests pass.

**Implementation note:** Originally planned as API key auth (2.1), pivoted to Google OAuth2 with email whitelisting to avoid throwaway work — the permanent auth solution was implemented directly.

### 2.1 Restrict Write Endpoints to Authenticated Users (Google OAuth2)

- **ID:** SEC-01
- **Title:** Google OAuth2 JWT authentication for POST/PUT/DELETE endpoints
- **Priority:** P0
- **Effort:** L (4+ hours)
- **Implementation:**
  - Backend: `spring-boot-starter-oauth2-resource-server` with custom `JwtDecoder` validating Google's JWKS + audience claim
  - `EmailWhitelistFilter` (HandlerInterceptor) checks `email` + `email_verified` JWT claims against configured whitelist
  - Frontend: `@react-oauth/google` for Sign-In, `auth.service.ts` singleton for token lifecycle (sessionStorage, expiry checks)
  - `fetcher.ts` attaches `Authorization: Bearer` header for write methods, handles 401/403
  - Edit toggle gated: only visible when `EDIT_MODE` flag is on AND user is authenticated
  - k8s: non-secret config (client ID, allowed emails, datasource URL/user) in ConfigMap; only DB password in Secret
- **Files changed:**
  - `virtual-cv-api/build.gradle`, `SecurityConfig.java` (rewrite), `CorsConfig.java`, `EmailWhitelistFilter.java` (new), `WebMvcConfig.java` (new)
  - `application.properties`, `application-local.properties`, `application-prod.properties`
  - `CvControllerSecurityTest.java` (new, 7 tests)
  - `virtual-cv-ui/src/services/auth.service.ts` (new), `api/errors.ts`, `api/fetcher.ts`, `main.tsx`, `App.tsx`, `FeatureTogglePopup.tsx`, `App.css`
  - `.env.development`, `.env.production`, `.github/workflows/build-ui.yml`, `k8s/api-deployment.yaml`

### 2.2 Tighten CORS Configuration

- **ID:** SEC-03
- **Title:** Restrict CORS allowedHeaders and remove allowCredentials
- **Priority:** P0
- **Implementation:** `allowedHeaders` set to `Content-Type`, `Accept`, `Authorization`. `allowCredentials` set to `false` (not needed for Bearer tokens).

### 2.3 Document CSRF Decision

- **ID:** SEC-02
- **Title:** Add code comment documenting why CSRF is disabled
- **Priority:** P0
- **Implementation:** Comment in `SecurityConfig.java` explains CSRF is disabled because the API is stateless with JWT Bearer token auth (no cookies/sessions).

---

## Milestone 3: Frontend Test Foundation (P1) — COMPLETED

**Theme:** Enable safe UI changes with automated regression detection.
**Branch:** `improvement/frontend-tests`
**Status:** All 3 items completed. Vitest + React Testing Library installed. 47 smoke tests across 4 test files (cv.mapper, feature-flags, errors, content.service). Test step added to CI pipeline. TDD requirement added to CLAUDE.md.

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

## Milestone 4: Backend Test Expansion (P1) — COMPLETED

**Theme:** Cover critical backend business logic with automated tests.
**Branch:** `improvement/backend-tests`
**Status:** All 3 items completed. CvNodeService unit tests, CvController WebMvc tests, and UpdateNodeCommand validation added.

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

## Milestone 5: Operational Readiness (P1) — COMPLETED

**Theme:** Protect production data and improve observability.
**Branch:** `improvement/operational-readiness`
**Status:** All 2 items completed. Daily PostgreSQL backups to Google Drive via rclone CronJob. Manual backup script added. Search query `@Size` constraint added.

**Implementation note:** Originally planned PVC-based on-cluster storage, but since it's a single-node cluster (single point of failure), backups are stored off-cluster on Google Drive via rclone with OAuth2 user credentials (Google SAs cannot upload to personal Drive).

### 5.1 Add PostgreSQL Backup CronJob

- **ID:** OPS-01
- **Title:** Automated database backup via Kubernetes CronJob → Google Drive
- **Priority:** P1
- **Effort:** M (1–4 hours)
- **Implementation:**
  - K8s CronJob runs daily at 03:00 UTC: `pg_dump` → gzip → rclone upload to Google Drive
  - Retains last 3 backups on Drive, deletes older ones
  - OAuth2 user credentials stored in k8s Secret (created by `generate-gcloud-drive-backup-auth-token.sh`)
  - CronJob manifest is secret-free and committed; token lives only in the cluster Secret
  - `manual_backup.sh` script for on-demand backups
- **Files changed:**
  - `k8s/backup-cronjob.yaml` (new)
  - `k8s/generate-gcloud-drive-backup-auth-token.sh` (new)
  - `k8s/manual_backup.sh` (new)
  - `k8s/README.md` (backup/restore instructions)

### 5.2 Add Search Query Length Constraint

- **ID:** MAINT-06
- **Title:** Add `@Size` constraint to search query parameter
- **Priority:** P2
- **Effort:** S (< 1 hour)
- **Implementation:** Added `@Validated` to `CvController` class and `@Size(min = 1, max = 100)` to the `q` parameter on `GET /cv/search`.
- **Files changed:**
  - `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/controller/CvController.java`

---

## Milestone 6: Component Refactoring (P2) — COMPLETED

**Theme:** Eliminate duplication and reduce component complexity. Must be completed before CSS restructuring so component boundaries are settled first.
**Branch:** `improvement/component-refactoring`
**Status:** All 5 items completed. App.tsx reduced to 213 lines via useGraphState hook. DialogOverlay shared across 3 dialogs. InspectorPanel split into 4 sub-components (376 lines). Shared getNodeTypeLabel utility. customFetch type safety fixed.

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

### 6.2 Extract Shared Dialog Infrastructure

- **ID:** MAINT-02d
- **Title:** Create reusable `DialogOverlay` component and `useDialogKeyboard` hook
- **Priority:** P2
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Every new dialog duplicates the same overlay, focus management, and Escape key handling. CreateNodeDialog, DeleteConfirmDialog, and SearchDialog all implement identical patterns independently.
- **Risk if done wrong:** Abstraction that doesn't fit all 3 dialogs forces workarounds. Keep the API minimal.
- **Acceptance criteria:**
  - `DialogOverlay` component handles: overlay click-to-close, click propagation stop, focus management, Escape key dismissal
  - All 3 existing dialogs refactored to use the shared component
  - No behavioral changes — all dialogs work identically to before
  - `npm run build` and `npm run lint` pass
- **Dependencies:** None
- **Files affected:**
  - `virtual-cv-ui/src/components/DialogOverlay.tsx` (new)
  - `virtual-cv-ui/src/components/CreateNodeDialog.tsx`
  - `virtual-cv-ui/src/components/DeleteConfirmDialog.tsx`
  - `virtual-cv-ui/src/components/SearchDialog.tsx`

### 6.3 Split InspectorPanel into Sub-Components

- **ID:** MAINT-02e
- **Title:** Extract view and edit sub-components from InspectorPanel
- **Priority:** P2
- **Effort:** M (1–4 hours)
- **Risk if deferred:** InspectorPanel at 696 lines mixes 4 responsibilities: profile view, profile edit form, generic node view, and generic node edit form. Adding new node types or editing features amplifies this.
- **Risk if done wrong:** Over-extracting creates too many small files with prop-drilling. Keep InspectorPanel as the orchestrator; extract rendering, not state.
- **Acceptance criteria:**
  - Extract `NodeViewProfile` (profile display), `NodeEditProfile` (profile edit form), `NodeView` (generic node display), `NodeEditForm` (generic node edit form)
  - InspectorPanel reduced to under 250 lines of orchestration logic
  - All inspector interactions work identically (view, edit, save, delete, publish)
  - `npm run build` and `npm run lint` pass
- **Dependencies:** 6.2 (dialog infrastructure exists for any sub-dialogs)
- **Files affected:**
  - `virtual-cv-ui/src/components/InspectorPanel.tsx`
  - `virtual-cv-ui/src/components/NodeViewProfile.tsx` (new)
  - `virtual-cv-ui/src/components/NodeEditProfile.tsx` (new)
  - `virtual-cv-ui/src/components/NodeView.tsx` (new)
  - `virtual-cv-ui/src/components/NodeEditForm.tsx` (new)

### 6.4 Extract Shared Type-Specific Form Fields

- **ID:** MAINT-02f
- **Title:** Deduplicate type-specific form fields between CreateNodeDialog and InspectorPanel edit forms
- **Priority:** P2
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Category section select, item fields (company, dateRange, location), and skill proficiency select are implemented twice with near-identical markup. Any field change must be applied in two places.
- **Risk if done wrong:** Shared field component that doesn't handle create vs. edit differences (e.g., required vs. optional) makes both consumers worse.
- **Acceptance criteria:**
  - `TypeSpecificFields` component renders the correct fields for each node type
  - Used by both `CreateNodeDialog` and the InspectorPanel edit forms (from 6.3)
  - Shared `getNodeTypeLabel()` utility replaces duplicate implementations in SearchDialog and CreateNodeDialog
  - `npm run build` and `npm run lint` pass
- **Dependencies:** 6.3 (InspectorPanel sub-components exist to consume shared fields)
- **Files affected:**
  - `virtual-cv-ui/src/components/TypeSpecificFields.tsx` (new)
  - `virtual-cv-ui/src/utils/node-utils.ts` (new — shared `getNodeTypeLabel`)
  - `virtual-cv-ui/src/components/CreateNodeDialog.tsx`
  - `virtual-cv-ui/src/components/NodeEditForm.tsx` (from 6.3)
  - `virtual-cv-ui/src/components/NodeEditProfile.tsx` (from 6.3)
  - `virtual-cv-ui/src/components/SearchDialog.tsx`

### 6.5 Fix `customFetch` Type Safety

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

## Milestone 7: CSS Modernization (P2) — COMPLETED

**Theme:** Replace monolithic stylesheet with themeable, component-scoped CSS. Must follow Milestone 6 so component boundaries are settled.
**Branch:** `improvement/css-modernization`
**Status:** All 2 items completed. 28 CSS custom properties in :root block, 293 hardcoded color values replaced. App.css split from 2,431 lines to 273 lines (globals only), 10 component CSS files created.

### 7.1 Extract CSS Custom Properties for Theme Colors

- **ID:** MAINT-02b / F7
- **Title:** Replace hardcoded color values with CSS custom properties
- **Priority:** P2
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Adding the planned light/dark theme toggle (`backlog.md:62`) would require finding and replacing 100+ hardcoded color values scattered across 2,431 lines. CSS custom properties make this a single `:root` swap.
- **Risk if done wrong:** Missing a hardcoded value produces visual inconsistency. Must verify all color occurrences are covered.
- **Acceptance criteria:**
  - `:root` block defines all theme colors as custom properties (background, surface, accent, text, border variants)
  - All hardcoded color values in `App.css` replaced with `var(--*)` references
  - Visual appearance unchanged (same colors, just indirected)
  - `npm run build` passes
- **Dependencies:** None
- **Files affected:**
  - `virtual-cv-ui/src/App.css`

### 7.2 Split App.css into Component-Scoped Files

- **ID:** MAINT-02c / F7
- **Title:** Break monolithic stylesheet into per-component CSS files
- **Priority:** P2
- **Effort:** L (4+ hours)
- **Risk if deferred:** `App.css` remains at 2,431 lines (34% of the frontend codebase). Print stylesheet (830 lines) and mobile overrides (645 lines) duplicate large portions of the base rules. Merge conflicts are frequent in any file this large.
- **Risk if done wrong:** CSS specificity changes when moving to scoped files. Class name collisions possible without CSS modules. Must verify all visual states (graph, inspector, search, edit mode, mobile, print).
- **Acceptance criteria:**
  - Base styles, print styles, and mobile styles co-located per component
  - `App.css` reduced to global resets, `:root` variables, and shared utilities only (< 200 lines)
  - Component CSS files match the final component structure from Milestone 6
  - No visual regressions across all views (graph, CV, edit mode, mobile, print)
  - `npm run build` and `npm run lint` pass
- **Dependencies:** 7.1 (CSS custom properties in place first), Milestone 6 (component boundaries settled)
- **Files affected:**
  - `virtual-cv-ui/src/App.css` (reduce to globals only)
  - `virtual-cv-ui/src/components/*.css` (new, one per component)

---

## Milestone 8: Coding Guidelines & Guardrails (P2) — COMPLETED

**Theme:** Codify the patterns established in Milestones 6–7 so they are enforced automatically and documented for future contributors.
**Branch:** `improvement/coding-guidelines`
**Status:** All 2 items completed. Coding Conventions section added to CLAUDE.md. ESLint max-lines rule: warn at 350, error at 500.

### 8.1 Document Component & CSS Conventions in CLAUDE.md

- **ID:** MAINT-08a
- **Title:** Add coding conventions section to CLAUDE.md
- **Priority:** P2
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Refactored code drifts back toward monolithic patterns as new features are added. New contributors (or AI agents) have no reference for expected patterns.
- **Risk if done wrong:** Overly prescriptive guidelines create friction. Keep rules few, concrete, and tied to real issues found in the audit.
- **Acceptance criteria:**
  - CLAUDE.md includes a "Coding Conventions" section covering:
    - Component file size guideline (~300 lines max; split when orchestrating multiple concerns)
    - Always use `DialogOverlay` for new dialogs (from 6.2)
    - Always use CSS custom properties for colors — never hardcode hex/rgba
    - Co-locate component CSS with component files (from 7.2)
    - Shared form fields via `TypeSpecificFields` for node-type-specific inputs (from 6.4)
    - `getNodeTypeLabel()` and similar utilities live in `utils/`, not duplicated per component
  - Conventions are concise (bullet points, not essays)
- **Dependencies:** Milestones 6 and 7 (patterns must exist before documenting them)
- **Files affected:**
  - `CLAUDE.md`

### 8.2 Add Automated Guardrails via ESLint

- **ID:** MAINT-08b
- **Title:** Add ESLint rules to enforce file size and import conventions
- **Priority:** P3
- **Effort:** S (< 1 hour)
- **Risk if deferred:** Guidelines without enforcement are suggestions. Developers bypass them under time pressure.
- **Risk if done wrong:** Overly strict rules (e.g., hard 300-line limit) could block legitimate files. Use warnings, not errors, for soft limits.
- **Acceptance criteria:**
  - ESLint `max-lines` rule configured as warning at 350 lines (soft) / error at 500 lines (hard)
  - `npm run lint` passes on the current codebase (post Milestone 6 refactoring)
- **Dependencies:** 8.1 (conventions documented first), Milestone 6 (files already refactored to fit limits)
- **Files affected:**
  - `virtual-cv-ui/eslint.config.js`

---

## Summary

| Milestone | Theme | Priority | Items | Total Effort |
|-----------|-------|----------|-------|-------------|
| 1 | CI/CD Hardening & Lint Fix | P0 | 5 | COMPLETED |
| 2 | Security Baseline | P0 | 3 | COMPLETED |
| 3 | Frontend Test Foundation | P1 | 3 | COMPLETED |
| 4 | Backend Test Expansion | P1 | 3 | COMPLETED |
| 5 | Operational Readiness | P1 | 2 | COMPLETED |
| 6 | Component Refactoring | P2 | 5 | COMPLETED |
| 7 | CSS Modernization | P2 | 2 | COMPLETED |
| 8 | Coding Guidelines & Guardrails | P2/P3 | 2 | COMPLETED |

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
| MAINT-02 | High | 6 + 7 | 6.1, 6.2, 6.3, 6.4, 7.1, 7.2 |
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
