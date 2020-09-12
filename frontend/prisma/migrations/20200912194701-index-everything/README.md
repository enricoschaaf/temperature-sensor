# Migration `20200912194701-index-everything`

This migration has been generated by Enrico Schaaf at 9/12/2020, 9:47:01 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE INDEX "Readings.clientId_humidity_temperature_timestamp_index" ON "public"."Readings"("clientId", "humidity", "temperature", "timestamp")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200912171743-init..20200912194701-index-everything
--- datamodel.dml
+++ datamodel.dml
@@ -2,19 +2,21 @@
 // learn more about it in the docs: https://pris.ly/d/prisma-schema
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 generator client {
   provider = "prisma-client-js"
+  previewFeatures = ["transactionApi"]
 }
 model Reading {
   clientId String
+  humidity Float
+  temperature Float
   timestamp DateTime
-  temperature Float
-  humidity Float
   @@id([clientId, timestamp])
+  @@index([clientId, humidity, temperature, timestamp])
   @@map(name: "Readings")
 }
```