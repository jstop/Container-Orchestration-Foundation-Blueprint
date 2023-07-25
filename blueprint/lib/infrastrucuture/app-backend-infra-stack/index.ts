import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';

interface AppBackendInfrastructureStackProps extends cdk.StackProps {
  vpc: IVpc;
}

export class AppBackendInfrastructureStack extends cdk.Stack {
  public readonly rdsSecretName: string;
  public readonly rdsCluster: rds.IDatabaseCluster;
  public readonly rdsSecurityGroup: ISecurityGroup;

  constructor(scope: Construct, id: string, props: AppBackendInfrastructureStackProps) {
    super(scope, id, props);
   
    // Get the vpc and rdsSecurityGroup from vpc and security stack
    const { vpc } = props;

    // Create security Group for rds Cluster
    const rdsSecurityGroup = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
        vpc,
        allowAllOutbound: true,
        description: 'Security group for RDS MySQL',
        securityGroupName: 'RDSSecurityGroup'
    });

    // Create an RDS Cluster with Aurora Serverless and initial database name polling
    const rdsCluster = new rds.DatabaseCluster(this, 'Database', {
        engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_2_11_3 }),
        credentials: rds.Credentials.fromGeneratedSecret('clusteradmin'), // Optional - will default to 'admin' username and generated password
        defaultDatabaseName: 'polling',
        instanceProps: {
          instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.SMALL),
          vpcSubnets: {
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          },
          vpc,
          securityGroups: [rdsSecurityGroup],
        },
    });

    this.rdsSecretName = rdsCluster.secret?.secretName || '';
    this.rdsCluster = rdsCluster;
    this.rdsSecurityGroup = rdsSecurityGroup;

    new cdk.CfnOutput(this, 'RDSSecretName', {
        value: this.rdsSecretName,
        description: 'RDS Secret Name',
    });

    new cdk.CfnOutput(this, 'SpringDatasourceUrl', {
        value: `jdbc-secretsmanager:mysql://${this.rdsCluster.clusterEndpoint.hostname}:${this.rdsCluster.clusterEndpoint.port}/polling?useSSL=false&serverTimezone=UTC&useLegacyDatetimeCode=false`,
        description: 'RDS Cluster Endpoint',
    });
  }
}
