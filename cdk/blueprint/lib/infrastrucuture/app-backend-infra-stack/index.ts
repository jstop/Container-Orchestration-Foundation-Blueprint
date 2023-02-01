import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as redis from 'aws-cdk-lib/aws-elasticache';
import * as rds from 'aws-cdk-lib/aws-rds';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';

interface AppBackendInfrastructureStackProps extends cdk.StackProps {
  vpc: IVpc;
  redisSecurityGroup: ISecurityGroup;
  rdsSecurityGroup: ISecurityGroup;
}

export class AppBackendInfrastructureStack extends cdk.Stack {
  public readonly redisHostname: string;
  public readonly redisPort: string;
  public readonly rdsSecretName: string;
  public readonly rdsCluster: rds.IDatabaseCluster;

  constructor(scope: Construct, id: string, props: AppBackendInfrastructureStackProps) {
    super(scope, id, props);
   
    // Get the vpc and redisSecurityGroup from vpc and security stack
    const { vpc, redisSecurityGroup, rdsSecurityGroup } = props;

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
    redisCluster.addDependsOn(redisSubnetGroup);

      // Create an RDS Cluster with Aurora Serverless and initial database name polling
    const rdsCluster = new rds.DatabaseCluster(this, 'Database', {
        engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_2_10_0 }),
        credentials: rds.Credentials.fromGeneratedSecret('clusteradmin'), // Optional - will default to 'admin' username and generated password
        defaultDatabaseName: 'polling',
        instanceProps: {
          instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.SMALL),
          vpcSubnets: {
            subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
          },
          vpc,
          securityGroups: [rdsSecurityGroup],
        },
      });

    //Allow trafic to rds cluster from  security group
      // rdsCluster.connections.allowDefaultPortFrom(redisSecurityGroup);
    // rdsCluster.connections.allowDefaultPortFrom(vpc);
    //export redis hostname and port
      //export rds secret
    this.redisHostname = redisCluster.attrRedisEndpointAddress;
    this.redisPort = redisCluster.attrRedisEndpointPort;
    this.rdsSecretName = rdsCluster.secret?.secretName || '';
    this.rdsCluster = rdsCluster;
  }
}
