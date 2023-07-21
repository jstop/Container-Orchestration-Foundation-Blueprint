# Container-Orchestration-Foundation-Blueprint
![image](/Container_Orchestration.drawio.png)


## Prerequisites
1. An AWS Account
1. A Route53 hosted zone registered in the AWS account. See [Registering and managing domains using Amazon Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/registrar.html) in the AWS Developer Guide for details.
1. A [Platform team user role](https://aws-quickstart.github.io/cdk-eks-blueprints/teams/teams/#platformteam).
1. A GitHub repository with an SSH Key Pair


Example .env file

```bash
echo "HOSTED_ZONE_NAME=<HOSTED_ZONE_NAME>
PLATFORM_TEAM_USER_ROLE_ARN=<PLATFORM_TEAM_USER_ROLE_ARN>" \
> .env
```

To override the the default [SSH private key path](https://argo-cd.readthedocs.io/en/stable/user-guide/private-repositories/#ssh-private-key-credential), the `SSH_PRIVATE_KEY_PATH` environment variable can be set. The default value is `~/.ssh/id_ed25519`.

```bash
echo "SSH_PRIVATE_KEY_PATH=~/.ssh/id_rsa" >> .env
```

## Install and run CDK
`make`

## Update the values files for argocd
```bash
make update-values
git commit -m "Update values files"
git push
```

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
