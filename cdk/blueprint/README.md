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
    blueprint.KarpenterInstanceNodeRole = blueprint-blueprintkarpenternoderole676A584E-1DB36P1IXZ95V
    blueprint.KarpenterInstanceProfilename = KarpenterNodeInstanceProfile-7769afd1fc54bfe87e718aed7a9e5e40
    blueprint.blueprintClusterName4832935F = blueprint
    blueprint.blueprintConfigCommand37F7A7C0 = aws eks update-kubeconfig --name blueprint --region us-east-2 --role-arn arn:aws:iam::899456967600:role/blueprint-blueprintMastersRole9B2DF7A4-HYZCZW8E8NI4
    blueprint.blueprintGetTokenCommand85DBD0C8 = aws eks get-token --cluster-name blueprint --region us-east-2 --role-arn arn:aws:iam::899456967600:role/blueprint-blueprintMastersRole9B2DF7A4-HYZCZW8E8NI4
    blueprint.platformteamadmin = arn:aws:iam::899456967600:role/aws-reserved/sso.amazonaws.com/AWSReservedSSO_AWSAdministratorAccess_30f517a3940f0385
