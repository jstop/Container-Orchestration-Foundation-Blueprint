#After installing argo you can use it to install the kubernetes dashboard
argocd app create k8-dashboard --repo https://github.com/jstein-vr/k8-dashboard.git  --dest-server https://kubernetes.default.svc --dest-namespace kubernetes-dashboard --path ./
