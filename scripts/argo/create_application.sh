export ARGOCD_SERVER=`kubectl get svc argocd-server -n argocd -o json | jq --raw-output '.status.loadBalancer.ingress[0].hostname'`
export ARGO_PWD=`kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`
argocd login $ARGOCD_SERVER --username admin --password $ARGO_PWD --insecure

CONTEXT_NAME=`kubectl config view -o jsonpath='{.current-context}'`
argocd cluster add $CONTEXT_NAME


kubectl create namespace ecsdemo-nodejs
argocd app create ecsdemo-nodejs --repo https://github.com/jstein-vr/ecsdemo-nodejs.git --path kubernetes --dest-server https://kubernetes.default.svc --dest-namespace ecsdemo-nodejs

sleep 15
argocd app get ecsdemo-nodejs

argocd app sync ecsdemo-nodejs

