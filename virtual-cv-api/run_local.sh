#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Starting PostgreSQL container on port 5433..."
docker compose up -d

echo "Waiting for database to be ready..."
until docker exec virtualcv-postgres psql -U virtualcv -d virtualcv -c "SELECT 1" > /dev/null 2>&1; do
  sleep 1
done
echo "Database ready!"

echo "Starting Spring Boot application..."
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
