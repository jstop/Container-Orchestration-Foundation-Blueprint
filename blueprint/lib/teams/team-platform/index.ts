import { PlatformTeam } from '@aws-quickstart/eks-blueprints';

const { PLATFORM_TEAM_USER_ROLE_ARN: userRoleArn } = process.env;

export class TeamPlatform extends PlatformTeam {
    constructor() {
        super({
            name: "platform",
            userRoleArn,
        })
    }
}
