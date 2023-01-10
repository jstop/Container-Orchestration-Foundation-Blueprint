# Check karpenter is running
kubectl get all -n karpenter
kubectl get deployment -n karpenter
kubectl get pods --namespace karpenter
kubectl get pod -n karpenter --no-headers | awk '{print $1}' | head -n 1 | xargs kubectl describe pod -n karpenter
