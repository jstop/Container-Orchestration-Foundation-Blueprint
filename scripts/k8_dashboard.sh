export ARGO_SVC=$(kubectl get svc -n argocd -l app.kubernetes.io/name=argocd-server -o name)
export ARGO_PWD=`kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`
argocd login localhost:8080 --username admin --password $ARGO_PWD --insecure

#After installing argo you can use it to install the kubernetes dashboard
argocd app create k8-dashboard --repo https://github.com/jstein-vr/k8-dashboard.git  --dest-server https://kubernetes.default.svc --dest-namespace kubernetes-dashboard --path ./
argocd app sync k8-dashboard
argocd app sync k8-dashboard

echo "login to the dashboard with the following commands"
echo "kubectl proxy"
echo "http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/"
echo "get token command found in cdk output"
