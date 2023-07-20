import { PlatformTeam } from '@aws-quickstart/eks-blueprints';

interface TeamPlatformConfig {
    userRoleArn: string;
}

export class TeamPlatform extends PlatformTeam {
    constructor(config: TeamPlatformConfig) {
        super({
            name: "platform",
            userRoleArn: config.userRoleArn,
        });
    }
}
