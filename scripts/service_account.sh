# An example of ClusterConfig with IAMServiceAccounts:
mkdir tmp
cat > tmp/service_account.yaml <<EOF
---
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: blueprint
  region: ${AWS_REGION}

iam:
  withOIDC: true
  serviceAccounts:
  - metadata:
      name: spring-backend
      # if no namespace is set, "default" will be used;
      # the namespace will be created if it doesn't exist already
      namespace: api
    roleName: spring-backend
    attachPolicyARNs:
    - "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
EOF

eksctl utils associate-iam-oidc-provider --config-file=./tmp/service_account.yaml --approve
eksctl create iamserviceaccount --config-file=./tmp/service_account.yaml --approve --override-existing-serviceaccounts
