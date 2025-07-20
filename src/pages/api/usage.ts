import type { NextApiRequest, NextApiResponse } from 'next'

import { UsageSummary } from '@/shared'
import { loadUsage } from '@/server/loadUsage'
import { sampleUsage } from '@/server/sampleUsage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UsageSummary>
) {
  // Uncomment the `loadUsage` function and implement that, whilst
  // commenting out the `sampleUsage` function. You may leave the
  // `simulateSlowNetwork` if you wish to do so.`
  await simulateSlowNetwork()
  const usageData = loadUsage(
    './src/server/data/example-04-vic-ausnetservices-email-17122014-MyPowerPlanner.csv'
  );
  // const usageData = sampleUsage()
  res.status(200).json(await usageData)
}

function simulateSlowNetwork(delayMs = 1500): Promise<void> {
  console.log(
    `Simulating network delay of ${delayMs}ms`
  )
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}
