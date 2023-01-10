STACK_NAMES=$(eksctl get nodegroup --cluster eksworkshop-eksctl -o json | jq -r '.[].StackName')
echo "STACK_NAMES: $STACK_NAMES"
#STACK_NAME=$STACK_NAMES | head -n 1
#ROLE_NAME=$(aws cloudformation describe-stack-resources --stack-name $STACK_NAME | jq -r '.StackResources[] | select(.ResourceType=="AWS::EC2::Instance") | .PhysicalResourceId')

ROLE_NAME=""eksctl-eksworkshop-eksctl-nodegro-NodeInstanceRole-QQ3S5ZDYDZ2F""
echo "export ROLE_NAME=${ROLE_NAME}" | tee -a ~/.zprofile

export EKS_KMS_ARN=$(aws kms describe-key --key-id alias/EKS --query KeyMetadata.Arn --output text)
export ECR_KMS_ARN=$(aws kms describe-key --key-id alias/ECR --query KeyMetadata.Arn --output text)

