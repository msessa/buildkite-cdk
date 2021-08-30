import * as cdk from '@aws-cdk/core';
import * as cdkbk from '../lib';

const app = new cdk.App({
  autoSynth: true,
  context: {
    '@aws-cdk/core:newStyleStackSynthesis': true,
  },
});

const stack = new cdk.Stack(app, 'sample-app-stack');

new cdkbk.CfnBuildkitePipeline(stack, 'BasicPipeline', {
  pipelineName: 'my-basic-pipeline',
  repository: 'git@github.com:service-victoria/sample.git',
  configuration: '',
});
