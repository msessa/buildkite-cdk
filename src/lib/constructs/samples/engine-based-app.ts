import * as cdk from '@aws-cdk/core';
import {BuildkiteCdkPipeline} from '../../engine';
import {ManualApprovalStep, ShellStep} from '@aws-cdk/pipelines';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';

const app = new cdk.App({
  autoSynth: true,
  context: {
    '@aws-cdk/core:newStyleStackSynthesis': true,
  },
});

export class SimpleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);
  }
}

export class SimpleStage extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props: cdk.StageProps) {
    super(scope, id, props);

    new SimpleStack(this, 'Stack');
  }
}

/**
 * The stack that defines the application pipeline
 */
export class SimpleCdkPipeline extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new BuildkiteCdkPipeline(this, 'cdk-pipeline', {
      apiTokenSecret: secretsmanager.Secret.fromSecretNameV2(this, 'ApiToken', 'buildkite-api-token'),
      repositoryUrl: '',
      organization: 'service-victoria',
      synth: new ShellStep('Synth', {
        // Install dependencies, build and run cdk synth
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
    });

    pipeline.addStage(
      new SimpleStage(this, 'dev', {
        env: {account: '026506256920', region: 'ap-southeast-2'},
      })
    );

    pipeline.addStage(
      new SimpleStage(this, 'uat', {
        env: {account: '026506256920', region: 'ap-southeast-2'},
      }),
      {
        pre: [new ManualApprovalStep('manual')],
      }
    );
  }
}

new SimpleCdkPipeline(app, 'engine-based-app', {env: {account: '026506256920', region: 'ap-southeast-2'}});
