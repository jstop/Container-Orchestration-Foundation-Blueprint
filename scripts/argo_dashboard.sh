argocd app create k8-dashboard --repo https://github.com/jstein-vr/k8-dashboard.git  --dest-server https://kubernetes.default.svc --dest-namespace kubernetes-dashboard --path ./
