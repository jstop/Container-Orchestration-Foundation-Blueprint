aws eks get-token --cluster-name blueprint --region us-east-2 --role-arn arn:aws:iam::899456967600:role/blueprint-blueprintMastersRole9B2DF7A4-HYZCZW8E8NI4 | jq -r '.status.token'
#aws eks get-token --cluster-name eks-blueprint | jq -r '.status.token'

