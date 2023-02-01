account_id=$(aws sts get-caller-identity --query "Account" --output text)
oidc_provider=$(aws eks describe-cluster --name blueprint --query "cluster.identity.oidc.issuer" --output text | sed -e "s/^https:\/\///")
export namespace=api
export service_account=polling-app-server
cat >trust-relationship.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::$account_id:oidc-provider/$oidc_provider"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "$oidc_provider:aud": "sts.amazonaws.com",
          "$oidc_provider:sub": "system:serviceaccount:$namespace:$service_account"
        }
      }
    }
  ]
}
EOF
aws iam create-role --role-name polling-app-server --assume-role-policy-document file://trust-relationship.json --description "Role for my service account"
aws iam attach-role-policy --role-name polling-app-server --policy-arn=arn:aws:iam::$account_id:policy/SecretsManagerReadWrite
