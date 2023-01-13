# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

    Outputs:
eks-blueprint.KarpenterInstanceNodeRole = eks-blueprint-eksblueprintkarpenternoderoleE0AFEB0-1MDDH8JP6KTDJ
eks-blueprint.KarpenterInstanceProfilename = KarpenterNodeInstanceProfile-6f1799745c986338673671ee1c339755
eks-blueprint.eksblueprintClusterNameF2A3938C = eks-blueprint
eks-blueprint.eksblueprintConfigCommandC5F2ABDA = aws eks update-kubeconfig --name eks-blueprint --region us-east-2 --role-arn arn:aws:iam::899456967600:role/eks-blueprint-eksblueprintMastersRoleDF959839-KLZ4TRAH2B3L
eks-blueprint.eksblueprintGetTokenCommandD17B69F1 = aws eks get-token --cluster-name eks-blueprint --region us-east-2 --role-arn arn:aws:iam::899456967600:role/eks-blueprint-eksblueprintMastersRoleDF959839-KLZ4TRAH2B3L
eks-blueprint.platformteamadmin = arn:aws:iam::899456967600:role/aws-reserved/sso.amazonaws.com/AWSReservedSSO_AWSAdministratorAccess_30f517a3940f0385
Stack ARN:
arn:aws:cloudformation:us-east-2:899456967600:stack/eks-blueprint/fcb196c0-9296-11ed-871f-0a49eeb41f8e
