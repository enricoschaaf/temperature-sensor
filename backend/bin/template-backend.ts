#!/usr/bin/env node
import * as cdk from "@aws-cdk/core"
import "source-map-support/register"
import { TemplateBackendStack } from "../lib/template-backend-stack"

const app = new cdk.App()
new TemplateBackendStack(app, "TemplateBackendStack")
