import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { ArnPrincipal } from "aws-cdk-lib/aws-iam";
import * as eks from 'aws-cdk-lib/aws-eks';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as team from '../lib/teams';
import * as infrastructure from '../lib/infrastrucuture';

const app = new cdk.App();

// use environment variables to pass in the parameters
declare var process : {
  env: {
    CDK_DEFAULT_ACCOUNT: string
    CDK_DEFAULT_REGION: string
  }
}

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
}

// Declare Teams for EKS blueprint
const platformTeam = new team.TeamPlatform(env.account)
const teams: Array<blueprints.Team> = [ platformTeam ];



// Policy Resource for AwsForFluentBitAddOn
const cloudWatchLogPolicy = new iam.PolicyStatement({
    actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
    ],
    resources: ["*"],
})

//Domain Name for ExternalDnsAddOn
const domainName = "verticalrelevancelabs.com";

// Declare Addon for EKS blueprint
const addOns: Array<blueprints.ClusterAddOn> = [
    new blueprints.addons.ArgoCDAddOn(),
    new blueprints.addons.MetricsServerAddOn,
    new blueprints.addons.AwsLoadBalancerControllerAddOn(),
    new blueprints.addons.ExternalDnsAddOn({
        hostedZoneResources: ["HostedZone"]
    }),
    new blueprints.addons.VpcCniAddOn(),
    new blueprints.addons.KarpenterAddOn( {
        subnetTags: {
            "aws:cloudformation:stack-name": "blueprint",
            "aws-cdk:subnet-type": "Private"

        },
        securityGroupTags: {
            "kubernetes.io/cluster/blueprint": "owned",
        }
    }
    ),
    new blueprints.addons.AwsForFluentBitAddOn({ 
        version: '0.1.22',
        iamPolicies: [cloudWatchLogPolicy],
        values: {
            cloudWatch: {
                enabled: true,
                region: env.region,
            },
            firehose: {
                enabled: false,
            },
            kinesis: {
                enabled: false,
            },
            elasticSearch: {
                enabled: false,
            }
        }
    }),
];

// create the blueprint EKS stack
const stack = blueprints.EksBlueprint.builder()
    .account(env.account)
    .region(env.region)
    .resourceProvider("HostedZone", new blueprints.LookupHostedZoneProvider(domainName))
    .addOns(...addOns)
    .teams(...teams)
    .build(app, 'blueprint');

const vpc = stack.getClusterInfo().cluster.vpc;
const clusterSecurityGroup = stack.getClusterInfo().cluster.clusterSecurityGroup;

const backend = new infrastructure.AppBackendInfrastructureStack(app, 'RDSStack', { 
    vpc: vpc, 
    env: { account: env.account, region: env.region } 
});
backend.rdsSecurityGroup.addIngressRule(clusterSecurityGroup, ec2.Port.tcp(3306), 'Access from cluster Security Group');

const springBackendPipeline = new infrastructure.PipelineStack(app, 'SpringBackendPipelineStack',  { rdsCluster: backend.rdsCluster, rdsSecretName: backend.rdsSecretName, pipelineName: 'spring-backend', env: { account: env.account, region: env.region } });
const springFrontendPipeline = new infrastructure.PipelineStack(app, 'SpringFrontendPipelineStack',  { rdsCluster: backend.rdsCluster, rdsSecretName: backend.rdsSecretName, pipelineName: 'spring-frontend', env: { account: env.account, region: env.region } });

