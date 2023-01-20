import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { ArnPrincipal } from "aws-cdk-lib/aws-iam";
import { PlatformTeam } from '@aws-quickstart/eks-blueprints';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as team from '../lib/teams'


const app = new cdk.App();
const account = '899456967600';
const region = 'us-east-2';

const platformTeam = new team.TeamPlatform(account)

const teams: Array<blueprints.Team> = [
            platformTeam
        ];


const cloudWatchLogPolicy = new iam.PolicyStatement({
    actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
    ],
    resources: ["*"],
})

const addOns: Array<blueprints.ClusterAddOn> = [
    new blueprints.addons.ArgoCDAddOn(),
    //new blueprints.addons.CalicoAddOn,
    new blueprints.addons.MetricsServerAddOn,
    new blueprints.addons.AwsForFluentBitAddOn({ 
        version: '0.1.22',
        iamPolicies: [cloudWatchLogPolicy],
        values: {
            cloudWatch: {
                enabled: true,
                region: region,
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
    //new blueprints.addons.ClusterAutoScalerAddOn,
    //new blueprints.addons.ContainerInsightsAddOn,
    new blueprints.addons.AwsLoadBalancerControllerAddOn(),
    new blueprints.addons.VpcCniAddOn(),
    new blueprints.addons.KarpenterAddOn(),
    new blueprints.addons.CertManagerAddOn(),
    //new blueprints.addons.CoreDnsAddOn(),
    //new blueprints.addons.KubeProxyAddOn(),
    //new blueprints.addons.XrayAddOn()
];

const clusterProvider = new blueprints.GenericClusterProvider({
    version: eks.KubernetesVersion.V1_23,
    managedNodeGroups: [{
      id: 'manage',
      instanceTypes: [new ec2.InstanceType('t3.small')],
      minSize: 2,
      maxSize: 4,
      desiredSize: 2        
    },
    {
      id: 'web-server',
      instanceTypes: [new ec2.InstanceType('t3.small')],
      minSize: 3,
      maxSize: 6,
      desiredSize: 3        
    },
    {
      id: 'api-server',
      instanceTypes: [new ec2.InstanceType('t3.small')],
      desiredSize: 3        
    }],
  })

const stack = blueprints.EksBlueprint.builder()
    .account(account)
    .region(region)
    .addOns(...addOns)
    .clusterProvider(clusterProvider)
    .teams(...teams)
    .build(app, 'blueprint');

