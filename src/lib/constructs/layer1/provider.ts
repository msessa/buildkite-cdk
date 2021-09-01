import * as cdk from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdanodejs from '@aws-cdk/aws-lambda-nodejs';
import * as path from 'path';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';

export interface BuildkiteCfnProviderProps {
  /**
   * secretsmanager secret containing the buildkite api token used for authentication
   */
  readonly apiTokenSecret: secretsmanager.ISecret;
  /**
   * timeout for the lambda function, default: 15sec
   */
  readonly timeout?: cdk.Duration;
}

export class BuildkiteCfnProvider extends cdk.Construct {
  private readonly _provider: cr.Provider;
  private readonly _org: string;

  constructor(scope: cdk.Construct, id: string, props: BuildkiteCfnProviderProps) {
    super(scope, id);

    const onEventFunc = new lambdanodejs.NodejsFunction(this, 'Handler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: path.join(__dirname, '../../../handler/main.js'),
      handler: 'on_event',
      timeout: props.timeout ? props.timeout : cdk.Duration.seconds(15),
      environment: {
        BUILDKITE_API_TOKEN_SECRET_ARN: props.apiTokenSecret.secretArn,
      },
    });

    // Give access to the SecretsManager Secret containing the API Token
    props.apiTokenSecret.grantRead(onEventFunc.role!);

    this._provider = new cr.Provider(this, 'Provider', {
      onEventHandler: onEventFunc,
    });
  }

  public get serviceToken() {
    return this._provider.serviceToken;
  }
}
