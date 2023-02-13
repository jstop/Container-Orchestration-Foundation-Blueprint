echo $PWD
./scripts/service_account.sh
export ARGO_SVC=$(kubectl get svc -n argocd -l app.kubernetes.io/name=argocd-server -o name)
export ARGO_PWD=`kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`
argocd login localhost:8080 --username admin --password $ARGO_PWD --insecure

#After installing argo you can use it to install the polling app
kubectl create namespace public
kubectl create namespace api

#Create network policy to deny all traffic to the api and public  namespace
./scripts/deny-all.sh

argocd repo add git@github.com:VerticalRelevance/Container-Orchestration-Foundation-Blueprint.git --ssh-private-key-path ~/.ssh/id_ed25519
argocd app create polling-app --repo git@github.com/VerticalRelevance/Container-Orchestration-Foundation-Blueprint.git --revision dev --dest-server https://kubernetes.default.svc  --dest-namespace default --path ./charts/apps --validate=false --sync-policy automated --auto-prune --helm-set replicaCount=2

argocd app sync polling-app
argocd app sync spring-frontend
argocd app sync spring-backend


echo "login to the dashboard with the following commands"
echo "kubectl proxy"
echo "http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/"
echo "get token command found in cdk output"
