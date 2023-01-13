
export ARGO_SVC=$(kubectl get svc -n argocd -l app.kubernetes.io/name=argocd-server -o name)

#kubectl port-forward $ARGO_SVC -n argocd 8080:443

export ARGO_PWD=`kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`
#echo $ARGO_PWD

export ARGO_SERVER='localhost:8080'
