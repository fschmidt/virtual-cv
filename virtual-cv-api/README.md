# Virtual CV API

Spring Boot REST API for the Virtual CV application.

## Tech Stack

- Java 21
- Spring Boot 3.5.x
- Spring Data JPA
- PostgreSQL
- Flyway migrations
- Testcontainers

## Local Development

### Prerequisites

- Java 21
- Docker

### Quick Start

```bash
./run_local.sh
```

This will:
1. Start PostgreSQL in Docker (port 5433)
2. Wait for the database to be ready
3. Run the Spring Boot application

### Manual Setup

```bash
# Start PostgreSQL
docker compose up -d

# Wait for it to be ready
docker exec virtualcv-postgres psql -U virtualcv -d virtualcv -c "SELECT 1"

# Run the app
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
```

### Endpoints

Once running, the API is available at `http://localhost:8080`:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cv` | Get all CV nodes |
| GET | `/api/cv/nodes/{id}` | Get single node |
| GET | `/api/cv/nodes/{id}/children` | Get children |
| GET | `/api/cv/search?q=` | Search nodes |
| POST | `/api/cv/nodes/profile` | Create profile |
| POST | `/api/cv/nodes/category` | Create category |
| POST | `/api/cv/nodes/item` | Create item |
| POST | `/api/cv/nodes/skill-group` | Create skill group |
| POST | `/api/cv/nodes/skill` | Create skill |
| PUT | `/api/cv/nodes/{id}` | Update node |
| DELETE | `/api/cv/nodes/{id}` | Soft delete node |
| GET | `/api/health` | Health check |

### Test

```bash
# Run tests (uses Testcontainers)
./gradlew test

# Test the API
curl http://localhost:8080/api/cv | jq '.nodes | length'
# Should return: 27
```

### Stop

```bash
# Stop the app: Ctrl+C

# Stop PostgreSQL
docker compose down       # keeps data
docker compose down -v    # removes data
```

## Configuration

| Profile | Database | Port |
|---------|----------|------|
| `local` | Docker PostgreSQL | 5433 |
| `prod` | K8s PostgreSQL | 5432 |

## Database

PostgreSQL runs on port **5433** locally (to avoid conflicts with local postgres installations).

Connection details:
- Host: `localhost`
- Port: `5433`
- Database: `virtualcv`
- User: `virtualcv`
- Password: `localdev`

```bash
# Connect with psql
psql -h localhost -p 5433 -U virtualcv -d virtualcv
```
