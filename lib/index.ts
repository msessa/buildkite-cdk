import * as cdk from '@aws-cdk/core';

export interface CdkBuildkiteProps {
  // Define construct properties here
}

export class CdkBuildkite extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: CdkBuildkiteProps = {}) {
    super(scope, id);

    // Define construct contents here
  }
}
