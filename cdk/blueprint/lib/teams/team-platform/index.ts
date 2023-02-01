import { ArnPrincipal } from "aws-cdk-lib/aws-iam";

import { PlatformTeam } from '@aws-quickstart/eks-blueprints';

export class TeamPlatform extends PlatformTeam {
    constructor(accountID: string) {
        super({
            name: "platform",
            userRoleArn: "arn:aws:iam::899456967600:role/AWSReservedSSO_AWSAdministratorAccess_30f517a3940f0385",
        })
    }
}
