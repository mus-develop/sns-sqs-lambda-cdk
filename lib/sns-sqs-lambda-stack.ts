import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import path = require("path");

export class SnsSqsLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const topic = new Topic(this, "topic", {
      topicName: "testTopic",
    });

    const queue = new Queue(this, "queue", {
      queueName: "testQueue",
    });

    topic.addSubscription(new SqsSubscription(queue));

    const lambdaFunction = new lambda.Function(this, "lambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, `../lambda/index.ts`)),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(10),
    });  
    lambdaFunction.addEventSource(new SqsEventSource(queue));
  }
}
