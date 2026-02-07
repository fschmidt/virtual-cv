#!/bin/sh
set -e

KUBECONFIG="${KUBECONFIG:-./kubeconfig}"
NAMESPACE="virtual-cv"
RCLONE_REMOTE="gdrive"
DRIVE_FOLDER_ID="1ku-3AQVTyjzD9LhXpqYyW9z_JWU3Jqyk"

# Check prerequisites
if ! command -v rclone >/dev/null 2>&1; then
  echo "Error: rclone is not installed. Run: brew install rclone"
  exit 1
fi
if ! command -v kubectl >/dev/null 2>&1; then
  echo "Error: kubectl is not installed."
  exit 1
fi

echo "=== Refreshing Google Drive OAuth token ==="
echo ""
echo "This will open a browser for Google login."
echo "After authorizing, the token is saved to ~/.config/rclone/rclone.conf"
echo ""

# (Re)authorize rclone — opens browser for OAuth consent
rclone config reconnect "${RCLONE_REMOTE}:" --auto-confirm

# Verify the token works
echo ""
echo "Verifying access to Google Drive..."
rclone lsf "${RCLONE_REMOTE}:/" --max-depth 1 >/dev/null
echo "Token is valid."

# Read the rclone config file
RCLONE_CONF="${HOME}/.config/rclone/rclone.conf"
if [ ! -f "$RCLONE_CONF" ]; then
  echo "Error: rclone config not found at $RCLONE_CONF"
  exit 1
fi

# Deploy the secret to k8s
echo ""
echo "Deploying rclone-config secret to k8s..."
kubectl --kubeconfig="$KUBECONFIG" -n "$NAMESPACE" create secret generic rclone-config \
  --from-file=rclone.conf="$RCLONE_CONF" \
  --dry-run=client -o yaml | kubectl --kubeconfig="$KUBECONFIG" apply -f -

echo ""
echo "=== Done ==="
echo "The rclone-config secret has been updated in the cluster."
echo "The CronJob will use the new token on its next run."
echo ""
echo "To trigger a manual backup now, run:"
echo "  ./k8s/manual_backup.sh"
