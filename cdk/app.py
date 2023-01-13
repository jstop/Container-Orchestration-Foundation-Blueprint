import * as cdk from 'aws-cdk-lib';
import * as kms from '@aws-cdk/aws-kms';

class MyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a KMS key
    const key = new kms.Key(this, 'MyKey', {
      description: 'My KMS key',
      enabled: true,
      enableKeyRotation: true
    });

    // Create an alias for the key
    key.addAlias('alias/MyKeyAlias');
  }
}

const app = new cdk.App();
new MyStack(app, 'MyStack');
app.synth();
