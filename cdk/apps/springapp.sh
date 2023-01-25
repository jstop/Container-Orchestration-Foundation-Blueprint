export ARGO_SVC=$(kubectl get svc -n argocd -l app.kubernetes.io/name=argocd-server -o name)
export ARGO_PWD=`kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`
argocd login localhost:8080 --username admin --password $ARGO_PWD --insecure

#After installing argo you can use it to install the polling app
kubectl create namespace polling-app
argocd app create polling-app --repo https://github.com/jstein-vr/spring-security-react-ant-design-polls-app.git  --dest-server https://kubernetes.default.svc --dest-namespace polling-app --path ./deployments
argocd app sync polling-app

echo "login to the dashboard with the following commands"
echo "kubectl proxy"
echo "http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/"
echo "get token command found in cdk output"
