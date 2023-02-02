# Container-Orchestration-Foundation-Blueprint

## Install and run CDK
make

### Setup Argo Proxy
make argo-proxy

### Install Dashboard and Apps
With argo-proxy running:
make dashboard
make apps

### argocd UI
localhost:8080
username: admin
password: `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`
