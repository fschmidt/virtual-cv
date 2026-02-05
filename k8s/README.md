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

API is exposed via Traefik Ingress:

```
http://46.225.79.87/api/cv
```

## Connect to PostgreSQL

```bash
kube-cv port-forward -n virtual-cv svc/postgresql 5432:5432
psql -h localhost -U virtualcv -d virtualcv
```

## Security Notes

⚠️ The PostgreSQL password in `postgresql.yaml` is a placeholder. Change it before deploying.
