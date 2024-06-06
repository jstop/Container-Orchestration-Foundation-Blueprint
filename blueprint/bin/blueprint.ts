import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as team from '../lib/teams';
import * as infrastructure from '../lib/infrastrucuture';

const app = new cdk.App();
const version = 'auto';

// use environment variables to pass in the parameters
declare var process : {
    env: {
        CDK_DEFAULT_ACCOUNT: string;
        CDK_DEFAULT_REGION: string;
    };
}

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
}

// Declare Teams for EKS blueprint
const platformTeam = new team.TeamPlatform({ 
    userRoleArn: app.node.tryGetContext('platformTeamUserRoleArn'),
});

const teams: Array<blueprints.Team> = [ platformTeam ];

// Policy Resource for AwsForFluentBitAddOn
const cloudWatchLogPolicy = new iam.PolicyStatement({
    actions: [
        'logs:DescribeLogStreams',
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
    ],
    resources: ["*"],
})

//Domain Name for ExternalDnsAddOn
const domainName = app.node.tryGetContext('domainName');
const argoHost = `argo.${domainName}`;

const prereqsStack = new infrastructure.PrerequisitesStack(app, 'PrerequisitesStack', { env, domainName });

// Declare Addon for EKS blueprint
const addOns: Array<blueprints.ClusterAddOn> = [
    new blueprints.addons.SecretsStoreAddOn,
    new blueprints.addons.ArgoCDAddOn({
        bootstrapRepo: {
            repoUrl: prereqsStack.codeCommitRepo.repositoryCloneUrlSsh,
            path: 'apps',
        },
        namespace: "argocd",
        values: {
            server: {
                ingress: {
                    enabled: true,
                    hosts: [
                        argoHost
                    ],
                    ingressClassName: "alb",
                    annotations: {
                        "alb.ingress.kubernetes.io/certificate-arn": prereqsStack.certificate.certificateArn,
                        "alb.ingress.kubernetes.io/scheme": "internet-facing",
                        "alb.ingress.kubernetes.io/target-type": "ip",
                        "external-dns.alpha.kubernetes.io/hostname": argoHost
                    }
                }
            }
        }
    
    }),
    new blueprints.addons.MetricsServerAddOn,
    new blueprints.addons.AwsLoadBalancerControllerAddOn(),
    new blueprints.addons.ExternalDnsAddOn({
        hostedZoneResources: ["HostedZone"]
    }),
    new blueprints.addons.KubeProxyAddOn(),
    new blueprints.addons.CoreDnsAddOn(),
    new blueprints.addons.VpcCniAddOn(),
    new blueprints.addons.KarpenterAddOn({
        version: 'v0.33.1',
        nodePoolSpec: {
          labels: {
              type: "karpenter-test"
          },
          annotations: {
              "eks-blueprints/owner": "young"
          },
          taints: [{
              key: "workload",
              value: "test",
              effect: "NoSchedule",
          }],
          requirements: [
              { key: 'node.kubernetes.io/instance-type', operator: 'In', values: ['t2.medium'] },
              { key: 'topology.kubernetes.io/zone', operator: 'In', values: ['us-east-1a','us-east-1b', 'us-east-1c']},
              { key: 'kubernetes.io/arch', operator: 'In', values: ['amd64','arm64']},
              { key: 'karpenter.sh/capacity-type', operator: 'In', values: ['spot']},
          ]
        }
            /*
        subnetTags: {
            "aws:cloudformation:stack-name": "blueprint",
            "aws-cdk:subnet-type": "Private"

        },
        securityGroupTags: {
            "kubernetes.io/cluster/blueprint": "owned",
        }
    */
          
    }),
    new blueprints.addons.AwsForFluentBitAddOn({ 
        version: '0.1.27',
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
    new blueprints.addons.ContainerInsightsAddOn(),
];

// create the blueprint EKS stack
const stack = blueprints.EksBlueprint.builder()
    .account(env.account)
    .region(env.region)
    .version(version)
    .resourceProvider("HostedZone", new blueprints.LookupHostedZoneProvider(domainName))
    .addOns(...addOns)
    .teams(...teams)
    .build(app, 'blueprint');

const cluster = stack.getClusterInfo().cluster;

const backend = new infrastructure.AppBackendInfrastructureStack(app, 'RDSStack', { 
    vpc: cluster.vpc,
    env,
});
backend.rdsSecurityGroup.addIngressRule(cluster.clusterSecurityGroup, ec2.Port.tcp(backend.rdsCluster.clusterEndpoint.port), 'Access from cluster Security Group');

new infrastructure.PipelineStack(app, 'SpringBackendPipelineStack',  { pipelineName: 'spring-backend', env });
new infrastructure.PipelineStack(app, 'SpringFrontendPipelineStack',  { pipelineName: 'spring-frontend', env });
