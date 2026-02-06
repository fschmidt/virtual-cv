# Quality & Sustainability Audit Report

**Project:** Virtual CV (Zoomable CV Graph)
**Date:** 2026-02-06
**Scope:** Maintainability, test health, CI/CD, security baseline, operational readiness

---

## Summary

| Category | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| Maintainability | 0 | 2 | 3 | 2 | 7 |
| Test Health | 1 | 2 | 1 | 0 | 4 |
| CI/CD | 1 | 1 | 0 | 0 | 2 |
| Security | 1 | 2 | 2 | 1 | 6 |
| Operational Readiness | 0 | 1 | 2 | 0 | 3 |
| **Total** | **3** | **8** | **8** | **3** | **22** |

---

## 1. Maintainability

### MAINT-01 -- ESLint Errors Blocking Clean Builds (High) — RESOLVED

**File(s):**
- `virtual-cv-ui/src/App.tsx:229` -- `_content` unused variable
- `virtual-cv-ui/src/App.tsx:293` -- assignment to `isDraggingRef.current` in `useCallback` (ref immutability violation)
- `virtual-cv-ui/src/App.tsx:299` -- assignment to `isDraggingRef.current` in `useCallback` (ref immutability violation)
- `virtual-cv-ui/src/components/SearchDialog.tsx:95` -- `setState` called synchronously in `useEffect`
- `virtual-cv-ui/src/components/SearchDialog.tsx:103` -- `setState` called synchronously in `useEffect`
- `virtual-cv-ui/src/components/Toast.tsx:21` -- fast refresh `only-export-components` violation
- `virtual-cv-ui/src/api/generated.ts:24` -- unused `eslint-disable` directive (warning)

**Description:** `npm run lint` reports 6 errors and 1 warning. The build succeeds because `tsc -b && vite build` does not invoke ESLint, but these are real code quality issues. The `useCallback` ref mutations could cause subtle bugs; the `SearchDialog` synchronous `setState` in `useEffect` risks infinite re-render loops.

**Impact:** Code quality issues accumulate silently. The ref immutability violations and synchronous setState in useEffect can produce runtime bugs that are difficult to trace.

**Recommendation:** Fix all 6 errors. For `isDraggingRef`, move mutations out of `useCallback` dependency arrays or suppress with targeted eslint-disable comments and an explanation. For `SearchDialog`, restructure the effect to use a callback pattern. For `Toast`, co-locate the component export properly for fast refresh.

---

### MAINT-02 -- Oversized Files (High)

**File(s):**
- `virtual-cv-ui/src/App.css` -- 2,431 lines
- `virtual-cv-ui/src/components/InspectorPanel.tsx` -- 696 lines
- `virtual-cv-ui/src/App.tsx` -- 408 lines
- `virtual-cv-ui/src/components/CreateNodeDialog.tsx` -- 327 lines

**Description:** Four files exceed the 300-line maintainability threshold. `App.css` is by far the largest at 2,431 lines, containing all application styles in a single flat file. `InspectorPanel.tsx` at 696 lines combines node detail display, edit form, markdown rendering, and multiple UI states.

**Impact:** Large files are harder to navigate, review, and test. Merge conflicts become more frequent. Onboarding new contributors takes longer.

**Recommendation:**
- `App.css`: Split into module-scoped CSS files per component (e.g., `GraphNode.module.css`, `InspectorPanel.module.css`).
- `InspectorPanel.tsx`: Extract edit form, read-only view, and markdown preview into separate sub-components.
- `App.tsx`: Extract graph event handlers and state management into a custom hook (e.g., `useGraphState`).

---

### MAINT-03 -- Dead Code: `cv-content.ts` (Medium) — RESOLVED

**File(s):** `virtual-cv-ui/src/data/cv-content.ts` (171 lines)

**Description:** This file contains hardcoded CV data (profile, categories, work items, skills, education, positions) that was used before the backend API was integrated. It is never imported anywhere in the codebase. The application now fetches data from the REST API, and the only content import is `content.service.ts` which imports from `../content/cv-content.md?raw` (a different file).

**Impact:** Dead code confuses contributors, inflates bundle analysis, and creates a false sense of where data originates.

**Recommendation:** Delete `virtual-cv-ui/src/data/cv-content.ts`. Verify no dynamic imports reference it before removal.

---

### MAINT-04 -- No Frontend Test Infrastructure (Medium)

**File(s):** `virtual-cv-ui/package.json`

**Description:** The frontend `package.json` contains zero test-related dependencies (no Vitest, Jest, React Testing Library, Playwright, or Cypress). There is no `test` script defined. This is not just "no tests written" -- there is no test runner installed to even begin writing tests.

**Impact:** Any future test effort requires infrastructure setup first, creating a higher barrier to starting. Regressions in the UI go completely undetected.

**Recommendation:** Install Vitest + React Testing Library as devDependencies. Add a `test` script to `package.json`. Start with smoke tests for critical paths (node selection, search, edit mode).

---

### MAINT-05 -- `UpdateNodeCommand` Missing Validation (Medium)

**File(s):** `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/command/UpdateNodeCommand.java`

**Description:** `UpdateNodeCommand` only validates `id` with `@NotBlank`. Fields like `label`, `description`, and `parentId` have no constraints. In contrast, all `Create*Command` records validate `id` and `label` with `@NotBlank`. The asymmetry means an update could set a label to an empty string or whitespace-only value, bypassing the creation-time invariant.

**Impact:** Data integrity degradation over time. Nodes with blank labels render poorly in the graph and break search.

**Recommendation:** Add `@Size(max=...)` constraints to string fields. Consider whether `label` should be `@NotBlank` on update as well, or if null means "no change."

---

### MAINT-06 -- Search Query Without Length Constraint (Low)

**File(s):**
- `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/controller/CvController.java:44`
- `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/repository/CvNodeRepository.java:54-63`

**Description:** The `GET /cv/search?q=` endpoint accepts the `q` parameter with no length constraint. The value is passed directly into a JPQL `LIKE` query via `LOWER(CONCAT('%', :query, '%'))`. While JPQL parameterized queries prevent SQL injection, an extremely long query string could cause performance degradation.

**Impact:** Minor denial-of-service vector. Unlikely to be exploited on a personal CV site but represents a missing input boundary.

**Recommendation:** Add `@Size(max = 200)` or similar constraint to the `q` parameter, or add a `@RequestParam @Length(max=200)` annotation.

---

### MAINT-07 -- Generated API Client Checked Into VCS (Low)

**File(s):** `virtual-cv-ui/src/api/generated.ts`

**Description:** The Orval-generated TypeScript API client is committed to the repository. Generated files can cause noisy diffs and merge conflicts. However, committing it ensures the frontend can build without running the backend, which is a valid tradeoff for this project size.

**Impact:** Minor: noisy diffs on regeneration. This is a known tradeoff.

**Recommendation:** No immediate action required. If regeneration becomes frequent, consider adding `generated.ts` to `.gitignore` and generating it in CI.

---

## 2. Test Health

### TEST-01 -- Zero Frontend Tests (Critical)

**File(s):** `virtual-cv-ui/` (entire frontend directory)

**Description:** The frontend has no test files, no test runner, and no test dependencies in `package.json`. There are no unit tests, integration tests, component tests, or end-to-end tests for the React application. The UI contains significant interactive logic: three-state node system, drag-to-position, search dialog, edit mode, create/delete workflows, and deep linking.

**Impact:** Any change to the frontend risks introducing regressions that will only be caught by manual testing or end-user reports. The lack of test infrastructure means adding tests requires setup work first, increasing the cost of the first test.

**Recommendation:**
1. Install Vitest + `@testing-library/react` + `jsdom` as devDependencies.
2. Add `"test": "vitest"` to `package.json` scripts.
3. Write initial tests for: node state transitions, search filtering, URL deep linking, API error handling.
4. Consider Playwright for E2E tests covering the full graph interaction flow.

---

### TEST-02 -- Backend Tests Require Docker (High)

**File(s):**
- `virtual-cv-api/src/test/java/de/fschmidt/virtualcv/repository/CvNodeRepositoryTest.java`
- `virtual-cv-api/src/test/java/de/fschmidt/virtualcv/TestcontainersConfiguration.java`

**Description:** All backend tests use Testcontainers with PostgreSQL, requiring a running Docker daemon. The tests themselves are well-written (11 test methods covering CRUD, search, parent-child relationships, draft workflow, and seed data verification), but they cannot run without Docker. This is confirmed by the Dockerfile using `./gradlew build -x test` (skipping tests entirely during the Docker build).

**Impact:** Tests are never executed in CI (see CICD-01). Developers without Docker running locally cannot run tests. The test suite exists but is effectively dormant in automated pipelines.

**Recommendation:** In CI, use a Docker-in-Docker or service container approach (GitHub Actions supports `services: postgres:...`). Alternatively, add an H2-based profile for fast unit tests alongside the Testcontainers integration tests.

---

### TEST-03 -- No Service or Controller Layer Tests (High)

**File(s):**
- `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/service/CvNodeService.java`
- `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/controller/CvController.java`

**Description:** Backend tests cover only the repository layer (`CvNodeRepositoryTest.java`) and application context loading (`VirtualCvApiApplicationTests.java`). There are no tests for:
- `CvNodeService` -- business logic including recursive delete, attribute merging, type-specific command handling
- `CvController` -- HTTP status codes, request validation, path variable / body mismatch checks, error responses

**Impact:** The recursive delete logic in `CvNodeService.deleteRecursively()` is untested. The attribute merge logic in `update()` is untested. The controller's `id` mismatch check (`!id.equals(command.id())`) is untested. Bugs in these layers would not be caught by existing tests.

**Recommendation:** Add `@WebMvcTest` tests for `CvController` covering happy paths and error cases. Add unit tests for `CvNodeService` with a mocked repository to verify recursive delete, attribute merging, and command dispatch logic.

---

### TEST-04 -- Context Load Test Has No Assertions (Medium)

**File(s):** `virtual-cv-api/src/test/java/de/fschmidt/virtualcv/VirtualCvApiApplicationTests.java`

**Description:** The `contextLoads()` test method is empty. While it implicitly verifies that the Spring application context starts without errors (which is valuable), it has no explicit assertions about bean wiring, configuration properties, or profile activation.

**Impact:** Minimal -- the implicit context load verification is standard Spring Boot practice. However, it could be enhanced.

**Recommendation:** Low priority. Optionally inject key beans and assert they are non-null to catch configuration issues earlier.

---

## 3. CI/CD

### CICD-01 -- No Test Gates in Either Pipeline (Critical)

**File(s):**
- `.github/workflows/deploy.yml:43-45` -- frontend pipeline runs `npm run build` only, no `npm run lint` or `npm test`
- `.github/workflows/deploy-api.yml` -- backend pipeline delegates to `Dockerfile:7` which runs `./gradlew build -x test`

**Description:** Neither CI pipeline runs any tests or lint checks before deploying to production.

Frontend pipeline (`deploy.yml`):
- Step 43-45: Only runs `npm run build`. Does not run `npm run lint`. No test step exists.

Backend pipeline (`deploy-api.yml`):
- The Docker build stage explicitly skips tests with `-x test`. There is no separate test step in the workflow.

Both pipelines deploy on every push to `main` with zero quality gates.

**Impact:** Broken code, lint errors, and test failures are deployed directly to production. The 6 existing lint errors (MAINT-01) have been shipping to production undetected. Any backend regression would be deployed without being caught.

**Recommendation:**
1. Frontend: Add `npm run lint` and `npm test` steps before `npm run build` in `deploy.yml`.
2. Backend: Add a separate `test` job in `deploy-api.yml` that runs `./gradlew test` using a PostgreSQL service container, and make the `build-and-push` job depend on it.
3. Consider adding branch protection rules requiring CI to pass before merging to `main`.

---

### CICD-02 -- Dockerfile Skips Tests (High)

**File(s):** `virtual-cv-api/Dockerfile:7`

**Description:** The Dockerfile build command is `RUN ./gradlew build -x test --no-daemon`. Tests are explicitly excluded from the build. While this is common when tests require external services (Testcontainers needs Docker-in-Docker), it means the built artifact has never been validated by tests.

**Impact:** The Docker image deployed to production is built from untested code. Combined with CICD-01 (no CI test step), there is no point in the pipeline where backend tests are executed.

**Recommendation:** Do not run tests inside the Dockerfile (that would require Docker-in-Docker). Instead, add a dedicated test job in the CI workflow that runs before the Docker build step, using GitHub Actions' PostgreSQL service container.

---

## 4. Security

### SEC-01 -- All CRUD Endpoints Unauthenticated (Critical)

**File(s):** `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/config/SecurityConfig.java:20`

**Description:** The security configuration sets `.requestMatchers("/cv/**").permitAll()`. All REST endpoints are under `/cv/` including:
- `POST /cv/nodes/profile` -- create nodes
- `PUT /cv/nodes/{id}` -- update nodes
- `DELETE /cv/nodes/{id}` -- delete nodes (with cascade)

This means **anyone on the internet can create, modify, or delete all CV data** without authentication.

The code comment says "Public read endpoints" but the `/**` wildcard matches all HTTP methods (GET, POST, PUT, DELETE) on all paths under `/cv/`.

**Impact:** Complete data integrity compromise. An attacker could delete all nodes, inject malicious content, or deface the CV. The cascade delete means a single `DELETE /cv/nodes/profile` request would wipe the entire CV tree.

**Recommendation:**
1. Restrict `permitAll()` to `GET` requests only: `.requestMatchers(HttpMethod.GET, "/cv/**").permitAll()`.
2. Require authentication for `POST`, `PUT`, `DELETE` methods. Use API keys, JWT tokens, or basic auth.
3. Until authentication is implemented, restrict write operations by IP or use a separate admin path prefix.

---

### SEC-02 -- CSRF Disabled (High)

**File(s):** `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/config/SecurityConfig.java:17`

**Description:** CSRF protection is explicitly disabled: `.csrf(csrf -> csrf.disable())`. For a stateless REST API this is standard practice when using token-based authentication. However, since there is NO authentication (SEC-01), and CORS allows credentials (`allowCredentials(true)`), a CSRF attack vector exists if any authenticated session is ever added without re-enabling CSRF.

**Impact:** Currently low because there is no authentication to exploit via CSRF. Becomes high if session-based authentication is added without re-enabling CSRF.

**Recommendation:** Acceptable for now given the stateless API design. Document the decision. When authentication is added, evaluate whether to re-enable CSRF or use token-based auth exclusively.

---

### SEC-03 -- CORS Allows All Headers with Credentials (High)

**File(s):** `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/config/CorsConfig.java:21,24`

**Description:** CORS configuration uses `setAllowedHeaders(List.of("*"))` combined with `setAllowCredentials(true)`. While the allowed origins are restricted to 3 specific domains (which is good), the wildcard headers with credentials is overly permissive. Any header from the allowed origins will be accepted.

**Impact:** If a vulnerability exists on any of the 3 allowed origins, an attacker could craft requests with arbitrary headers. The `allowCredentials(true)` setting is unnecessary since there is no authentication mechanism.

**Recommendation:** Restrict `allowedHeaders` to the specific headers used: `Content-Type`, `Accept`, `Authorization`. Remove `allowCredentials(true)` until authentication requires it.

---

### SEC-04 -- Placeholder Passwords in K8s Manifests (Medium)

**File(s):**
- `k8s/postgresql.yaml:11` -- `POSTGRES_PASSWORD: changeme-in-production`
- `k8s/api-deployment.yaml:11` -- `SPRING_DATASOURCE_PASSWORD: changeme-in-production`

**Description:** Kubernetes Secret manifests contain placeholder passwords in `stringData` fields. These files are committed to the repository. While the passwords say "changeme-in-production" (suggesting they are placeholders), there is no verification that they have actually been changed in the deployed cluster.

**Impact:** If these manifests are applied as-is, the production database uses a known password committed to a public repository. Even if changed post-deploy, the placeholder pattern trains developers to commit secrets.

**Recommendation:** Remove password values from the committed manifests. Use `kubectl create secret` commands, sealed-secrets, or an external secrets manager (e.g., HashiCorp Vault, AWS Secrets Manager) to inject credentials at deploy time. Add a CI check that rejects committed secrets.

---

### SEC-05 -- Local Dev Password in Docker Compose (Medium)

**File(s):** `virtual-cv-api/docker-compose.yml:8` -- `POSTGRES_PASSWORD: localdev`

**Description:** The local development Docker Compose file contains a hardcoded PostgreSQL password `localdev`. This is standard practice for local development environments.

**Impact:** Low. This is a local-only development file. Risk exists only if someone uses this configuration in a non-local environment.

**Recommendation:** Acceptable for local development. No action required. Ensure this file is never used for production deployment.

---

### SEC-06 -- No Rate Limiting (Low)

**File(s):**
- `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/controller/CvController.java`
- `virtual-cv-api/src/main/java/de/fschmidt/virtualcv/config/SecurityConfig.java`

**Description:** No rate limiting is configured at the application or infrastructure level. All endpoints, including write operations, can be called at unlimited frequency.

**Impact:** The API is susceptible to brute-force abuse, data flooding (creating thousands of nodes), or simple denial-of-service by overwhelming the database with requests.

**Recommendation:** Add rate limiting via Spring Boot filter, API gateway, or Kubernetes Ingress annotations (e.g., `nginx.ingress.kubernetes.io/limit-rps`). Start with reasonable limits on write endpoints (e.g., 10 requests/minute for POST/PUT/DELETE).

---

## 5. Operational Readiness

### OPS-01 -- No PostgreSQL Backup Strategy (High)

**File(s):**
- `k8s/postgresql.yaml` -- no backup CronJob or sidecar
- `docs/backlog.md:57` -- listed as a known TODO

**Description:** The production PostgreSQL deployment uses a single `PersistentVolumeClaim` with no backup mechanism. There is no CronJob for `pg_dump`, no WAL archiving, no point-in-time recovery capability, and no off-cluster backup storage. The backlog acknowledges this gap but it remains unaddressed.

**Impact:** Any data loss event (accidental deletion, disk failure, cluster issue, or malicious action via SEC-01) would result in permanent, unrecoverable data loss. Combined with the unauthenticated delete endpoint, the risk is compounded.

**Recommendation:**
1. Add a Kubernetes CronJob that runs `pg_dump` on a schedule and uploads to object storage (S3, GCS, or similar).
2. Test restore procedures.
3. Consider a managed PostgreSQL service that includes automated backups.

---

### OPS-02 -- No Structured Logging (Medium)

**File(s):** `virtual-cv-api/src/main/resources/application.properties`, `application-prod.properties`

**Description:** The application uses default Spring Boot console logging. No structured logging format (JSON) is configured. No log aggregation destination is defined. `show-sql=true` is set in the local profile (acceptable), and `show-sql=false` in prod (correct).

**Impact:** Log analysis in production requires manual parsing. Searching for specific errors across time ranges is difficult. No correlation IDs exist for request tracing.

**Recommendation:** Add structured JSON logging for production (e.g., `logback-spring.xml` with JSON encoder). Consider adding request correlation IDs via Spring's `micrometer-tracing` or a simple MDC filter.

---

### OPS-03 -- Actuator Exposure Mismatch Between Profiles (Medium)

**File(s):**
- `virtual-cv-api/src/main/resources/application-local.properties:15` -- `management.endpoints.web.exposure.include=*`
- `virtual-cv-api/src/main/resources/application-prod.properties:14` -- `management.endpoints.web.exposure.include=health`

**Description:** The local profile exposes all Actuator endpoints (including `env`, `beans`, `configprops`, `heapdump`, `threaddump`), while production correctly restricts to health only. The local configuration is not a security risk in development but could be if the local profile is accidentally activated in production.

**Impact:** If `SPRING_PROFILES_ACTIVE` is not set or defaults incorrectly, all actuator endpoints would be exposed in production, leaking environment variables, bean definitions, and enabling heap dumps.

**Recommendation:** The prod profile configuration is correct. Ensure the K8s deployment always sets `SPRING_PROFILES_ACTIVE=prod` (currently it does in `api-deployment.yaml:42`). Consider adding actuator security even for exposed endpoints.

---

## Appendix: Files Reviewed

| File | Purpose |
|---|---|
| `virtual-cv-ui/package.json` | Frontend dependencies and scripts |
| `virtual-cv-ui/src/App.tsx` | Main application component |
| `virtual-cv-ui/src/App.css` | All application styles |
| `virtual-cv-ui/src/components/InspectorPanel.tsx` | Node detail panel |
| `virtual-cv-ui/src/components/SearchDialog.tsx` | Search modal |
| `virtual-cv-ui/src/components/Toast.tsx` | Toast notification component |
| `virtual-cv-ui/src/components/CreateNodeDialog.tsx` | Node creation form |
| `virtual-cv-ui/src/api/generated.ts` | Generated API client |
| `virtual-cv-ui/src/data/cv-content.ts` | Dead code (unused hardcoded CV data) |
| `virtual-cv-ui/src/services/content.service.ts` | Content loading service |
| `virtual-cv-api/src/main/java/.../config/SecurityConfig.java` | Security configuration |
| `virtual-cv-api/src/main/java/.../config/CorsConfig.java` | CORS configuration |
| `virtual-cv-api/src/main/java/.../controller/CvController.java` | REST controller |
| `virtual-cv-api/src/main/java/.../service/CvNodeService.java` | Business logic |
| `virtual-cv-api/src/main/java/.../repository/CvNodeRepository.java` | Data access layer |
| `virtual-cv-api/src/main/java/.../command/UpdateNodeCommand.java` | Update DTO |
| `virtual-cv-api/src/main/java/.../command/Create*Command.java` | Create DTOs (5 files) |
| `virtual-cv-api/src/test/java/.../repository/CvNodeRepositoryTest.java` | Repository tests (11 tests) |
| `virtual-cv-api/src/test/java/.../VirtualCvApiApplicationTests.java` | Context load test |
| `virtual-cv-api/src/test/java/.../TestcontainersConfiguration.java` | Testcontainers setup |
| `virtual-cv-api/src/main/resources/application*.properties` | App configuration (3 profiles) |
| `virtual-cv-api/Dockerfile` | Docker build definition |
| `virtual-cv-api/docker-compose.yml` | Local dev Docker Compose |
| `.github/workflows/deploy.yml` | Frontend CI/CD pipeline |
| `.github/workflows/deploy-api.yml` | Backend CI/CD pipeline |
| `k8s/postgresql.yaml` | K8s PostgreSQL deployment |
| `k8s/api-deployment.yaml` | K8s API deployment |
