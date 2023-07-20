# Container-Orchestration-Foundation-Blueprint
![image](https://github.com/VerticalRelevance/Container-Orchestration-Foundation-Blueprint/blob/main/Container_Orchestration.drawio.png)


## Prerequisites
1. An AWS Account
1. A Route53 hosted zone registered in the AWS account. See [Registering and managing domains using Amazon Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/registrar.html) in the AWS Developer Guide for details.
1. A [Platform team user role](https://aws-quickstart.github.io/cdk-eks-blueprints/teams/teams/#platformteam).


Example .env file

```bash
echo "HOSTED_ZONE_NAME=verticalrelevancelabs.com
PLATFORM_TEAM_USER_ROLE_ARN=arn:aws:iam::899456967600:role/AWSReservedSSO_AWSAdministratorAccess_30f517a3940f0385" \
> .env
```

## Install and run CDK
`make`

### Setup Argo Proxy
`make argo-proxy`
This will not complete and should be left open. Use another terminal while this is running to finish dashboard and app installation.

### Install Dashboard and Apps
With argo-proxy running:
```
make dashboard
make spring-apps
```

### argocd UI
localhost:8080
username: admin
password: `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`

### Cleanup 
With argo-proxy running:
```
make argo-destroy
```

`make destroy`
