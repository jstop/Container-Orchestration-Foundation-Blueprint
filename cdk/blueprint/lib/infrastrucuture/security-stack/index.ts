import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';

interface SecurityStackProps extends cdk.StackProps {
  vpc: IVpc;
  clusterSecurityGroup: ISecurityGroup;
}

export class SecurityStack extends cdk.Stack {
  public readonly redisSecurityGroup: ISecurityGroup;
  //public readonly bastionSecurityGroup: ISecurityGroup;

  constructor(scope: Construct, id: string, props: SecurityStackProps) {
    super(scope, id, props);

    // Get the vpc from vpc stack
    const { vpc, clusterSecurityGroup } = props;

    // Create security group for redis
    const redisSecurityGroup = new ec2.SecurityGroup(this, 'RedisSecurityGroup', {
      vpc: vpc,
      allowAllOutbound: true,
      description: 'Security group for Redis Cluster',
      securityGroupName: 'RedisSecurityGroup'
    });

    // Allow access from cluster host
    redisSecurityGroup.addIngressRule(clusterSecurityGroup, ec2.Port.tcp(6379), 'Access from cluster Security Group');

    // Assign the redisSecurityGroup to class property
    this.redisSecurityGroup = redisSecurityGroup;
  }
}
