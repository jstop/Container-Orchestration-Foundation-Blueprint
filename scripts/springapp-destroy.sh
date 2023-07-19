eksctl delete iamserviceaccount --config-file=./tmp/service_account.yaml --approve
argocd app delete polling-app --yes