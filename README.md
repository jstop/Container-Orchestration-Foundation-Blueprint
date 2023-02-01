# Container-Orchestration-Foundation-Blueprint

## Install and run CDK
cdk bootstrap
cdk deploy
###Update kubeconfig with output from cdk 
`blueprint.blueprintConfigCommand37F7A7C0 = aws eks update-kubeconfig --name blueprint --region us-east-2 --role-arn arn:aws:iam::899456967600:role/blueprint-blueprintMastersRole9B2DF7A4-PP08QIFZI11O`

### Setup Argo Proxy
kubectl port-forward service/blueprints-addon-argocd-server -n argocd 8080:443
Install k8-dashboard via argo dashboard script
./scripts/k8-dashboard.sh

browse to argocd UI
localhost:8080
username: admin
password: `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`

### Setup Sample App
With proxy enable run `./cdk/scripts/springapp.sh`

### Other Manual Steps
Open the rds SG api node server SG
