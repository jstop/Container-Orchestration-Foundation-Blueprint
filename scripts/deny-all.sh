cat > tmp/deny-all.yaml <<EOF
---
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: default-deny
spec:
  podSelector:
    matchLabels: {}
EOF

kubectl apply -n public -f ./tmp/deny-all.yaml
kubectl apply -n api -f ./tmp/deny-all.yaml
