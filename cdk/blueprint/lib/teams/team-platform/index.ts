import { ArnPrincipal } from "aws-cdk-lib/aws-iam";

import { PlatformTeam } from '@aws-quickstart/eks-blueprints';

export class TeamPlatform extends PlatformTeam {
    constructor(accountID: string) {
        super({
            name: "platform",
            users: [new ArnPrincipal("arn:aws:sts::899456967600:assumed-role/AWSReservedSSO_AWSAdministratorAccess_30f517a3940f0385/jstein")],
            userRoleArn: "arn:aws:iam::899456967600:role/aws-reserved/sso.amazonaws.com/AWSReservedSSO_AWSAdministratorAccess_30f517a3940f0385",
        })
    }
}
