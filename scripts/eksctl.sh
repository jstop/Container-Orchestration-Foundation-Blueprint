source ./aws_variables.sh

eksctl create cluster -f ../eksctl-cluster-definition.yaml
