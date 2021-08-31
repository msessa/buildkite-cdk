import * as cdk from '@aws-cdk/core';
import * as cdkbk from '../../index';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';

const app = new cdk.App({
  autoSynth: true,
  context: {
    '@aws-cdk/core:newStyleStackSynthesis': true,
  },
});

const stack = new cdk.Stack(app, 'sample-app-stack');

new cdkbk.CfnBuildkitePipeline(stack, 'BasicPipeline', {
  apiTokenSecret: secretsmanager.Secret.fromSecretNameV2(stack, 'ApiToken', 'buildkite-api-token'),
  orgSlug: 'service-victoria',
  pipelineName: 'xxx-my-basic-pipeline',
  repository: 'git@github.com:service-victoria/updating.git',
  configuration: '',
});
