# Kubernetes Deployment (Virtual CV API)

Manifests for the Virtual CV **application** on the shared k3s cluster.

> **Cluster, PostgreSQL, and backups now live in the [`fschmidt/infrastructure`](https://github.com/fschmidt/infrastructure) repo.**
> This repo only owns the app:
> - `api-deployment.yaml` — ConfigMap + Deployment + Service + Ingress (Traefik/LE)
> - `api-secret.yaml` — DB password (managed manually, not applied by CI/CD)
>
> The database is the shared instance at `postgresql.data.svc.cluster.local:5432`
> (database `virtualcv`). Cluster provisioning, the `cert-manager` ClusterIssuer,
> the Postgres instance, and the Google-Drive backup CronJob are all in
> `infrastructure/` — see its `kubernetes/` and `postgres/` folders.

## Cluster (reference)

| Property | Value |
|----------|-------|
| Provider | Hetzner Cloud |
| Node Type | cx33 (4 vCPU, 8GB RAM) |
| Location | Nuremberg (nbg1) |
| K3s Version | v1.34.3+k3s1 |
| Node IP | 46.225.79.87 |
| Namespace | `virtual-cv` |

## Prerequisites

- `kubectl` + a kubeconfig (canonical copy lives in the `infrastructure` repo).
- The shared Postgres `virtualcv` database/role exists (see `infrastructure/postgres/`).
- `cert-manager` + the `letsencrypt-prod` ClusterIssuer installed (see `infrastructure/kubernetes/`).

## Deploy

The API is normally deployed by the GitHub Actions workflow
(`.github/workflows/deploy-api.yml`, manual `workflow_dispatch`), which substitutes
the branch image tag and applies `api-deployment.yaml`. Manually:

```bash
kube-cv apply -f k8s/api-secret.yaml       # once / when the secret changes
kube-cv apply -f k8s/api-deployment.yaml
kube-cv get all -n virtual-cv
```

> CI applies only `api-deployment.yaml` (which includes the non-secret ConfigMap).
> `api-secret.yaml` is managed manually so placeholder credentials never overwrite
> production values.

## API Access

Exposed via Traefik Ingress with Let's Encrypt TLS:

```
https://api.fschmidts.net/api/cv
https://api.fschmidts.net/actuator/health
```

DNS: A record `api.fschmidts.net` → `46.225.79.87`

## Connect to the database

```bash
kube-cv port-forward -n data svc/postgresql 5432:5432
psql -h localhost -U virtualcv -d virtualcv
```

## Database backups

Handled centrally by the shared-Postgres backup CronJob in the `infrastructure`
repo (`postgres/backup/`, daily `pg_dumpall` → Google Drive covering all databases).

## Security Notes

⚠️ `api-secret.yaml` holds the DB password and is applied manually. It must match
`VIRTUALCV_DB_PASSWORD` in `infrastructure/postgres/secret.yaml`.
