import * as cdk from '@aws-cdk/core';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import {BuildkiteCfnProvider, CfnBuildkitePipeline} from '../layer1';

const app = new cdk.App({
  autoSynth: true,
  context: {
    '@aws-cdk/core:newStyleStackSynthesis': true,
  },
});

const stack = new cdk.Stack(app, 'sample-app-stack');

const provider = new BuildkiteCfnProvider(stack, 'BkProvider', {
  apiTokenSecret: secretsmanager.Secret.fromSecretNameV2(stack, 'ApiToken', 'buildkite-api-token'),
});

new CfnBuildkitePipeline(stack, 'Pipeline', {
  provider: provider,
  organization: 'service-victoria',
  pipelineName: 'xxx-testing',
  repository: 'git@github.com:service-victoria/updating.git',
  configuration: '',
});
