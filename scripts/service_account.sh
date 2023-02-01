# An example of ClusterConfig with IAMServiceAccounts:
cat > service_account.yaml <<EOF
---
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: blueprint
  region: us-east-2

iam:
  withOIDC: true
  serviceAccounts:
  - metadata:
      name: polling-app-server
      # if no namespace is set, "default" will be used;
      # the namespace will be created if it doesn't exist already
      namespace: api
    roleName: polling-app-server
    attachPolicyARNs:
    - "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
EOF

eksctl utils associate-iam-oidc-provider --config-file=./service_account.yaml --approve
eksctl create iamserviceaccount --config-file=./service_account.yaml --approve --override-existing-serviceaccounts
