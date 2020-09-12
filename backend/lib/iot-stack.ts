import * as iam from "@aws-cdk/aws-iam";
import * as iot from "@aws-cdk/aws-iot";
import * as firehose from "@aws-cdk/aws-kinesisfirehose";
import * as s3 from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/core";
import { config } from "dotenv";
config();

export class IoTStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const iotBucket = new s3.Bucket(this, "IoTBucket");

    if (!process.env.ENDPOINT_URL)
      throw new Error("ENDPOINT_URL is undefined.");
    if (!process.env.FIREHOSE_ACCESS_KEY) {
      throw new Error("FIREHOSE_ACCESS_KEY is undefined.");
    }

    const firehoseRole = new iam.Role(this, "firehoseRole", {
      assumedBy: new iam.ServicePrincipal("firehose.amazonaws.com"),
    });
    iotBucket.grantWrite(firehoseRole);

    const iotFirehose = new firehose.CfnDeliveryStream(this, "IoTFirehose", {
      deliveryStreamName: "IoTFirehose",
      httpEndpointDestinationConfiguration: {
        bufferingHints: { intervalInSeconds: 60 },
        s3Configuration: {
          bucketArn: iotBucket.bucketArn,
          roleArn: firehoseRole.roleArn,
        },
        endpointConfiguration: {
          url: process.env.ENDPOINT_URL,
          accessKey: process.env.FIREHOSE_ACCESS_KEY,
        },
      },
    });

    if (!iotFirehose.deliveryStreamName) {
      throw new Error("iotFirehose.deliveryStreamName is undefined.");
    }

    const iotTopicRole = new iam.Role(this, "IoTTopicRole", {
      assumedBy: new iam.ServicePrincipal("iot.amazonaws.com"),
    });
    iotTopicRole.attachInlinePolicy(
      new iam.Policy(this, "TemperatureSensorPolicy", {
        statements: [
          new iam.PolicyStatement({
            actions: ["firehose:PutRecord"],
            resources: [iotFirehose.attrArn],
          }),
        ],
      })
    );

    const firehoseAction: iot.CfnTopicRule.FirehoseActionProperty = {
      deliveryStreamName: iotFirehose.deliveryStreamName,
      roleArn: iotTopicRole.roleArn,
    };

    new iot.CfnTopicRule(this, "TemperatureSensorRule", {
      topicRulePayload: {
        actions: [
          {
            firehose: firehoseAction,
          },
        ],
        ruleDisabled: false,
        sql: "SELECT *",
      },
    });
  }
}
