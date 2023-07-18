import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';

interface PrerequisitesStackProps extends cdk.StackProps {
    domainName: string;
}

export class PrerequisitesStack extends cdk.Stack {
  public readonly codeCommitRepo: codecommit.Repository;
  public readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string, props: PrerequisitesStackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: props.domainName,
    });

    this.certificate = new acm.Certificate(this, 'Certificate', {
        domainName: `*.${hostedZone.zoneName}`,
        certificateName: `${hostedZone.zoneName} wildcard certificate for blueprint`,
        validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    //  create CodeCommit repo for charts
    this.codeCommitRepo = new codecommit.Repository(this, "CodeCommitRepository", {
        repositoryName: "blueprint-apps"
    });

    new cdk.CfnOutput(this, 'CertificateArn', {
        value: this.certificate.certificateArn,
        description: 'The wildcard certificate ARN',
    });
  }
}
