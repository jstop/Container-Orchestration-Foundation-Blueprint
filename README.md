# Container-Orchestration-Foundation-Blueprint
The Container Orchestration Foundation Blueprint is an [AWS CDK](https://aws.amazon.com/cdk/) application that is designed to set up an EKS cluster, including all of the underlying resources, along with AWS CodePipeline, CodeBuild, and ECR to create and host the container images. The cluster is created with the CDK's [EKS Blueprint](https://aws-quickstart.github.io/cdk-eks-blueprints/getting-started/), which follows the AWS best practices for managing EKS. In order to deploy the container images to the EKS cluster, we utilize [ArgoCD](https://argo-cd.readthedocs.io/en/stable/). A React frontend and Java Spring backend that utilizes RDS MySQL are provided, along with [helm charts](https://helm.sh) for each. Together, the frontend, backend, and database comprise a three-tier archicture polling application. The app is meant to be hosted at `https://polling.yourdomain.com`, where `yourdomain.com` is the hosted zone name of your hosted zone.

The following EKS addons are installed:

* [Kube Proxy](https://aws-quickstart.github.io/cdk-eks-blueprints/addons/kube-proxy/) - Enables network communication to pods
* [Core DNS](https://aws-quickstart.github.io/cdk-eks-blueprints/addons/coredns/) - Provides DNS resolution for all pods in the cluster
* [VPC CNI](https://aws-quickstart.github.io/cdk-eks-blueprints/addons/vpc-cni/) - Adds support for the VPC CNI plugin, which allows pods to have to have the same IP address inside the pod as they do on the VPC network
* [Secrets Store](https://aws-quickstart.github.io/cdk-eks-blueprints/secrets-store/) - Used for mounting secrets in the pods
* [ArgoCD](https://aws-quickstart.github.io/cdk-eks-blueprints/addons/argo-cd/) - A declarative GitOps CI/CD tool for Kubernetes. This addon will be used to deploy the helm charts to the cluster
* [Metrics Server](https://aws-quickstart.github.io/cdk-eks-blueprints/addons/metrics-server/) - Needed for Horizontal Pod Autoscaler
* [AWS Load Balancer Controller](https://aws-quickstart.github.io/cdk-eks-blueprints/addons/aws-load-balancer-controller/) - Allows provisioning of AWS Application Load Balancers through ingress resources
* [External DNS](https://aws-quickstart.github.io/cdk-eks-blueprints/addons/external-dns/) - Creates Route53 records by using annotations on the ingress resources. This will configure the domains to automatically point at the load balancers
* [Karpenter](https://aws-quickstart.github.io/cdk-eks-blueprints/addons/karpenter/) - Provisions and removes nodes automatically when pods are created or deleted
* [AWS for Fluent Bit](https://aws-quickstart.github.io/cdk-eks-blueprints/addons/aws-for-fluent-bit/) - Configures logging with CloudWatch Logs


![image](/Container_Orchestration.drawio.png)


## Prerequisites
1. [Homebrew](https://brew.sh) installed on your local machine (tested with MacOS)
1. A GitHub repository with an SSH Key Pair
1. An AWS Account
1. A Route53 hosted zone registered in the AWS account. See [Registering and managing domains using Amazon Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/registrar.html) in the AWS Developer Guide for details. The following records must be available: `polling`, `polling-api`, `argo`.
1. A [Platform team user role](https://aws-quickstart.github.io/cdk-eks-blueprints/teams/teams/#platformteam). This is a role that will your team will be allowed to assume in order to administer the cluster.

## Create a GitHub repository and SSH Key Pair
* [Create a repo](https://docs.github.com/en/get-started/quickstart/create-a-repo) (e.g. `github.com/mycompany/Container-Orchestration-Foundation-Blueprint`) (take note of the SSH clone URL)
* [Set up an SSH Key pair with GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent?platform=mac)

## Clone the repository and set up a new origin and branch
```bash
export GITHUB_OWNER=mycompany # update this with your org or user
git clone git@github.com:VerticalRelevance/Container-Orchestration-Foundation-Blueprint.git
cd Container-Orchestration-Foundation-Blueprint/
git remote remove origin
git remote add origin git@github.com:${GITHUB_OWNER}/Container-Orchestration-Foundation-Blueprint.git
git push -u origin main
```

## Configuration
Configuration is done through environment variables. The `.env` file in the root of this repository will be included when running make commands. Crucially, the `HOSTED_ZONE_NAME` and `PLATFORM_TEAM_USER_ROLE_ARN` variables must be specified. Optionally, `SSH_PRIVATE_KEY_PATH` can be specified.

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

This step:
* Installs the homebrew dependencies, if needed.
* Runs the CDK `deploy` and generates the output JSON file (which is needed for the next step)
    * Provisions the Wildcard ACM certicate and CodeCommit repo
    * Provisions the VPC, EKS Cluster, EKS Addons
    * Provisions the RDS Database Cluster
    * Provisions the Pipelines (spring-frontend and spring-backend) and ECR Repositories
* Provisions the Karpenter template (see https://karpenter.sh/docs/getting-started/getting-started-with-karpenter/#5-create-provisioner)
* Pushes the application code the the CodeCcommit repos, which triggers the CodePipelines (so that the images are built and pushed into ECR)

## Update the values files for argocd
This step utilizes the outputs of the CDK and configures the helm chart values that are needed for deployment. The values files are automatically parsed, modified, then rendered back out as a string in-place.

```bash
make update-values
git add charts/
git commit -m "Update values files"
git push
```

### Setup Argo Proxy
`make argo-proxy`
This will not complete and should be left open. Use another terminal while this is running to finish dashboard and app installation.

### Install Dashboard and Apps
With argo-proxy running:
```
make dashboard # optional
make spring-apps
```

The `make spring-apps` will install the polling-app, which is comprised of the two helm charts: spring-frontend and spring-backend. Each chart is configured with an ingress (which in turn creates an Application Load Balancer) and annotations to utilize the wildcard ACM certificate created from the previous CDK step, as well as an external-dns annotation for automatic Route53 record configuration.

### argocd UI
* https://localhost:8080
* username: admin
* password: `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`

### Cleanup 
In order to clean up we must first delete the argo applications and then tear down the cluster. Therefore, we should run `make argo-destroy` before `make destroy`.

With argo-proxy running:

```bash
make argo-destroy
```

To destroy the CDK Stacks:

`make destroy`

This will
* Delete the argocd namespace from the cluster (if it exists)
* Remove any remaining images from the ECR repositories
* Run cdk destroy to delete the CloudFormation Stacks
