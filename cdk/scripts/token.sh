aws eks get-token --cluster-name eks-blueprint --region us-east-2 --role-arn arn:aws:iam::899456967600:role/eks-blueprint-eksblueprintMastersRoleDF959839-KLZ4TRAH2B3L | jq -r '.status.token'
#aws eks get-token --cluster-name eks-blueprint | jq -r '.status.token'

