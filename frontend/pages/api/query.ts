import { PrismaClient } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"

const prisma = new PrismaClient()

export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.time()
  const [{ avg, max, min }, current] = await prisma.$transaction([
    prisma.reading.aggregate({
      avg: { humidity: true, temperature: true },
      max: { humidity: true, temperature: true },
      min: { humidity: true, temperature: true },
      where: {
        clientId: "WzqhY_xFZTzwaWK_kyBxu",
        timestamp: { gt: new Date(Date.now() - 86400000), lt: new Date() },
      },
    }),
    prisma.reading.findMany({
      orderBy: { timestamp: "desc" },
      take: 1,
      where: { clientId: "WzqhY_xFZTzwaWK_kyBxu" },
    }),
  ])
  console.timeEnd()
  return res.json({
    avg: {
      humidity: Math.round((avg.humidity + Number.EPSILON) * 10) / 10,
      temperature: Math.round((avg.temperature + Number.EPSILON) * 10) / 10,
    },
    max,
    min,
    current: current[0],
  })
}
