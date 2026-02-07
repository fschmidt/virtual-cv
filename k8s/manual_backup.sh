#!/bin/sh
set -e

KUBECONFIG="${KUBECONFIG:-./kubeconfig}"
NAMESPACE="virtual-cv"
JOB_NAME="manual-backup-$(date +%Y%m%d-%H%M%S)"

echo "Creating backup job: $JOB_NAME"
kubectl --kubeconfig="$KUBECONFIG" create job "$JOB_NAME" \
  --from=cronjob/postgresql-backup -n "$NAMESPACE"

echo "Waiting for job to complete..."
kubectl --kubeconfig="$KUBECONFIG" wait --for=condition=complete \
  "job/$JOB_NAME" -n "$NAMESPACE" --timeout=300s

echo ""
kubectl --kubeconfig="$KUBECONFIG" logs -n "$NAMESPACE" "job/$JOB_NAME"
