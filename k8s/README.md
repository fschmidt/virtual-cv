# Kubernetes Deployment

Kubernetes manifests for deploying Virtual CV to a k3s cluster on Hetzner Cloud.

## Cluster Details

| Property | Value |
|----------|-------|
| Provider | Hetzner Cloud |
| Node Type | cx33 (4 vCPU, 8GB RAM) |
| Location | Nuremberg (nbg1) |
| K3s Version | v1.34.3+k3s1 |
| Node IP | 46.225.79.87 |

## Prerequisites

- `kubectl` installed locally
- Kubeconfig at `./kubeconfig` (project root)
- Alias: `kube-cv` → `kubectl --kubeconfig=./kubeconfig`

## Namespace

All resources live in the `virtual-cv` namespace:

```bash
kube-cv create namespace virtual-cv
```

## Resource Budget

Single cx33 node (4 vCPU, 8GB RAM). K3s system uses ~1GB RAM, leaving ~7GB for workloads.

| Component | CPU Req | CPU Limit | Mem Req | Mem Limit |
|-----------|---------|-----------|---------|-----------|
| PostgreSQL | 100m | 250m | 128Mi | 256Mi |
| API | 100m | 500m | 256Mi | 512Mi |

## Initial Setup

### 1. Install cert-manager

```bash
kube-cv apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.4/cert-manager.yaml

# Wait for pods to be ready
kube-cv wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=120s

# Apply ClusterIssuer for Let's Encrypt
kube-cv apply -f k8s/cert-issuer.yaml
```

### 2. Add KUBECONFIG to GitHub Secrets

```bash
# Encode kubeconfig
cat ./kubeconfig | base64 | pbcopy
# Add as KUBECONFIG secret in GitHub repo settings
```

### 3. Deploy

```bash
# Deploy PostgreSQL
kube-cv apply -f k8s/postgresql.yaml

# Deploy API (or let GitHub Actions do it)
kube-cv apply -f k8s/api-deployment.yaml

# Verify
kube-cv get all -n virtual-cv
```

## API Access

API is exposed via Traefik Ingress with TLS (Let's Encrypt):

```
https://api.fschmidts.net/api/cv
https://api.fschmidts.net/api/health
```

DNS: A record `api.fschmidts.net` → `46.225.79.87`

## Connect to PostgreSQL

```bash
kube-cv port-forward -n virtual-cv svc/postgresql 5432:5432
psql -h localhost -U virtualcv -d virtualcv
```

## Database Backups

Automated daily backups via `pg_dump` → Google Drive (rclone). Backups are stored **off-cluster** so they survive node loss.

**How it works:** rclone is installed locally and authorized with your Google account. The OAuth token is stored in `~/.config/rclone/rclone.conf`. The `generate-gcloud-drive-backup-auth-token.sh` script reads that local config and deploys it as a k8s Secret (`rclone-config`). The CronJob pod mounts this Secret and uses it to upload backups to Google Drive. No secrets are stored in the repo.

> **Note:** We use OAuth2 user credentials (not a Service Account) because Google SAs cannot upload to personal Drive storage.

### Prerequisites

1. Install [rclone](https://rclone.org/) locally (`brew install rclone`)
2. Enable the **Google Drive API** in [Google Cloud Console](https://console.cloud.google.com/)
3. Create a folder in Google Drive for backups and note the folder ID from the URL

### Setup

```bash
# 1. First-time only: create the rclone remote (opens browser for Google login)
rclone config create gdrive drive scope drive root_folder_id <FOLDER_ID>

# 2. Authorize with Google and deploy the token as a k8s Secret
./k8s/generate-gcloud-drive-backup-auth-token.sh

# 3. Deploy the CronJob
kube-cv apply -f k8s/backup-cronjob.yaml
```

### Refresh token

OAuth tokens expire. To re-authorize, run the script again — it opens a browser for Google login, refreshes the local rclone config, and updates the k8s Secret:

```bash
./k8s/generate-gcloud-drive-backup-auth-token.sh
```

### Check backup status

```bash
# View recent backup jobs
kube-cv get jobs -n virtual-cv

# View logs of the latest backup
kube-cv logs -n virtual-cv -l job-name=postgresql-backup --tail=20
```

### Trigger a manual backup

```bash
kube-cv create job --from=cronjob/postgresql-backup manual-backup -n virtual-cv
```

### Restore from backup

```bash
# 1. Download the backup from Google Drive (via browser or rclone)

# 2. Port-forward PostgreSQL
kube-cv port-forward -n virtual-cv svc/postgresql 5432:5432

# 3. Restore
gunzip -c virtualcv-YYYYMMDD-HHMMSS.sql.gz | psql -h localhost -U virtualcv -d virtualcv
```

## Security Notes

⚠️ The PostgreSQL password in `postgresql.yaml` is a placeholder. Change it before deploying.
