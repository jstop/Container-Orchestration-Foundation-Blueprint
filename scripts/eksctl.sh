source ./aws_variables.sh
export $EKS_KEY_ARN

eksctl create cluster -f ../eksworkshop.yaml
