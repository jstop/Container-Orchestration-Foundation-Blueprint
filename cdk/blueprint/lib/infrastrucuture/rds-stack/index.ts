import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as rds from 'aws-cdk-lib/aws-rds';

import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';

interface RedisStackProps extends cdk.StackProps {
  vpc: IVpc;
  redisSecurityGroup: ISecurityGroup;
}

export class RedisStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: RedisStackProps) {
    super(scope, id, props);
   
    // Get the vpc and redisSecurityGroup from vpc and security stack
    const { vpc, redisSecurityGroup } = props;

    // Get projectName and env from context variables
    const projectName = this.node.tryGetContext('project-name');
    const env = this.node.tryGetContext('env');

    // Get all private subnet ids
    const privateSubnets = vpc.privateSubnets.map((subnet) => {
      return subnet.subnetId
    });

    // Create redis subnet group from private subnet ids
    const redisSubnetGroup = new redis.CfnSubnetGroup(this, 'RedisSubnetGroup', {
      subnetIds: privateSubnets,
      description: "Subnet group for redis"
    });

    // Create Redis Cluster
    const redisCluster = new redis.CfnCacheCluster(this, 'RedisCluster', {
      autoMinorVersionUpgrade: true,
      cacheNodeType: 'cache.t2.small',
      engine: 'redis',
      numCacheNodes: 1,
      cacheSubnetGroupName: redisSubnetGroup.ref,
      clusterName: `${projectName}${env}`,
      vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId]
    });
    
    // Define this redis cluster is depends on redis subnet group created first
    const rds_cluster = new rds.DatabaseCluster(this, "Database",
            engine=rds.DatabaseClusterEngine.aurora_mysql(version=rds.AuroraMysqlEngineVersion.VER_2_08_1),
            instance_props={
                "instance_type": ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.SMALL),
                "vpc_subnets": {
                    "subnet_type": ec2.SubnetType.PRIVATE
                },
                "vpc": vpc
            }
        )

        return rds_cluster
    redisCluster.addDependsOn(redisSubnetGroup);
  }
}
