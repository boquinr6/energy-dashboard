import { promisify } from 'util'
import { readFile } from 'fs'
import { UsageSummary } from '../../src/shared'

const readFilePromise = promisify(readFile)

export async function loadUsage(): Promise<UsageSummary | undefined> {
  const data = await readFilePromise(
    'data/example-04-vic-ausnetservices-email-17122014-MyPowerPlanner.csv'
  )

  console.log('loaded data', data.toString())

  throw new Error('Not Implemented Yet')
}
