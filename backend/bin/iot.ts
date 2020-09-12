#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support/register";
import { IoTStack } from "../lib/iot-stack";

const app = new cdk.App();
new IoTStack(app, "IoTStack");
