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

    // SNSトピックの作成
    const topic = new Topic(this, "sns-sqs-lambda-topic", {
      topicName: "sns-sqs-lambda-topic",
      displayName: "SNS to SQS to Lambda Demo Topic",
    });

    // SQSキューの作成
    const queue = new Queue(this, "sns-sqs-lambda-queue", {
      queueName: "sns-sqs-lambda-queue",
      visibilityTimeout: cdk.Duration.seconds(300),
      retentionPeriod: cdk.Duration.days(4),
    });

    // SNSトピックにSQSキューをサブスクライブ
    topic.addSubscription(new SqsSubscription(queue));

    // Lambda関数の作成
    const lambdaFunction = new NodejsFunction(this, "sns-sqs-lambda-function", {
      functionName: "sns-sqs-lambda-function",
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, "../lambda/index.ts"),
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        NODE_ENV: "production",
      },
    });

    // Lambda関数にSQSイベントソースを追加
    lambdaFunction.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 10,
        maxBatchingWindow: cdk.Duration.seconds(5),
      })
    );

    // 出力
    new cdk.CfnOutput(this, "TopicArn", {
      value: topic.topicArn,
      description: "SNS Topic ARN",
    });

    new cdk.CfnOutput(this, "QueueUrl", {
      value: queue.queueUrl,
      description: "SQS Queue URL",
    });

    new cdk.CfnOutput(this, "LambdaFunctionName", {
      value: lambdaFunction.functionName,
      description: "Lambda Function Name",
    });
  }
}
