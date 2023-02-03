cat <<EOF | kubectl apply -f -
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: default
spec:
  labels:
    intent: apps
  requirements:
    - key: karpenter.sh/capacity-type
      operator: In
      values: ["spot"]
    - key: karpenter.k8s.aws/instance-size
      operator: In
      values: [nano, micro, small, medium, large]
    - key: karpenter.k8s.aws/instance-category
      operator: In
      values: [t]
  limits:
    resources:
      cpu: 1000
      memory: 1000Gi
  ttlSecondsAfterEmpty: 30
  ttlSecondsUntilExpired: 2592000
  providerRef:
    name: default
---
apiVersion: karpenter.k8s.aws/v1alpha1
kind: AWSNodeTemplate
metadata:
  name: default
spec:
  subnetSelector:
    aws:cloudformation:stack-name: blueprint
    aws-cdk:subnet-type: Private
  securityGroupSelector:
    kubernetes.io/cluster/blueprint: owned
  tags:
    KarpenerProvisionerName: "default"
    NodeType: "karpenter-workshop"
    IntentLabel: "apps"
EOF


