kubectl apply -f ../apps/multi-repo/argo-app-projects/

kubectl create namespace ecsdemo-crystal
kubectl create namespace ecsdemo-frontend
kubectl create namespace ecsdemo-nodejs

argocd app create dev-apps \
    --dest-namespace argocd  \
    --dest-server https://kubernetes.default.svc  \
    --repo https://github.com/aws-samples/eks-blueprints-workloads.git \
    --path "multi-repo/argo-app-of-apps/dev"

#argocd app delete dev-apps
