import { PrismaClient } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"

interface Reading {
  clientId: string
  humidity: number
  temperature: number
  timestamp: number
}
const prisma = new PrismaClient()

export default async (
  { headers, body }: NextApiRequest,
  res: NextApiResponse,
) => {
  if (
    headers["x-amz-firehose-access-key"] !== process.env.FIREHOSE_ACCESS_KEY
  ) {
    return res.status(401).end()
  }
  try {
    await prisma.$transaction(
      body.records
        .map(({ data }: { data: string }) =>
          JSON.parse(Buffer.from(data, "base64").toString("utf-8")),
        )
        .flat()
        .map(({ clientId, humidity, temperature, timestamp }: Reading) =>
          prisma.reading.create({
            data: {
              clientId,
              humidity,
              temperature,
              timestamp: new Date(timestamp * 1000),
            },
          }),
        ),
    )
    return res.json({ requestId: body.requestId, timestamp: body.timestamp })
  } catch (err) {
    console.dir(err)
    return res.json({
      requestId: body.requestId,
      timestamp: body.timestamp,
      errorMessage: err.message,
    })
  }
}
