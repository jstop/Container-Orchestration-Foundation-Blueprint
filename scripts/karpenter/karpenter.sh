export KARPENTER_VERSION=v0.16.3

export AWS_REGION=us-east-2
export AWS_PROFILE=lab
export CLUSTER_NAME=$(eksctl get clusters -o json | jq -r '.[0].Name')
export ACCOUNT_ID=$(aws sts get-caller-identity --output text --query Account)

echo "Cluster Name: $CLUSTER_NAME"
echo "Account ID: $ACCOUNT_ID"

TEMPOUT=$(mktemp)

#curl -fsSL https://karpenter.sh/"${KARPENTER_VERSION}"/getting-started/getting-started-with-eksctl/cloudformation.yaml  > $TEMPOUT \
##&& aws cloudformation deploy \
#  --stack-name "Karpenter-${CLUSTER_NAME}" \
#  --template-file "${TEMPOUT}" \
#  --capabilities CAPABILITY_NAMED_IAM \
#  --parameter-overrides "ClusterName=${CLUSTER_NAME}"
#
#eksctl create iamidentitymapping \
#  --username system:node:{{EC2PrivateDNSName}} \
#  --cluster  ${CLUSTER_NAME} \
#  --arn "arn:aws:iam::${ACCOUNT_ID}:role/KarpenterNodeRole-${CLUSTER_NAME}" \
#  --group system:bootstrappers \
#  --group system:nodes

eksctl utils associate-iam-oidc-provider --cluster ${CLUSTER_NAME} --approve

eksctl create iamserviceaccount \
  --cluster "${CLUSTER_NAME}" --name karpenter --namespace karpenter \
  --role-name "${CLUSTER_NAME}-karpenter" \
  --attach-policy-arn "arn:aws:iam::${ACCOUNT_ID}:policy/KarpenterControllerPolicy-${CLUSTER_NAME}" \
  --role-only \
  --approve

aws iam create-service-linked-role --aws-service-name spot.amazonaws.com
