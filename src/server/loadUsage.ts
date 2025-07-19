import { promisify } from 'util'
import { readFile } from 'fs'
import { UsageSummary } from '../../src/shared'
import { parse } from 'csv-parse';

const readFilePromise = promisify(readFile)

export async function loadUsage(): Promise<UsageSummary | undefined> {
  const data = await readFilePromise(
    './src/server/data/example-04-vic-ausnetservices-email-17122014-MyPowerPlanner.csv'
  )

  console.log('loaded data', data.toString())

  // TODO: Implement CSV parsing logic here using library
  parse(data, {
    columns: true,
    skip_empty_lines: true,
  }, (err, records: Record<string, string>[]) => {
    if (err) {
      console.error('Error parsing CSV:', err)
      return
    }
    // TODO: normalize header names

    const dates = records.map(record => record.DATE);
    console.log('Dates:', dates);

    // Validations:
    // TODO: validate date format

    // TODO: validate half hour columns

    // TODO: validate kWh values

    // Calculations:
    // TODO: Combine half hour columns to derive total kWh for each day

    // TODO: Derive hourly kWh from half hour columns, then use to calculate average hourly kWh

    // TODO: Derive usage peak from hourly kWh values

    // Derive totalKwh and averageDailyKwh from entire daily usage data

    // TODO: Derive startDate and endDate from the Date column

    // Create Objects:
    // TODO: Create DailyUsage objects for each date with totalKwh, averageHourlyKwh, and usagePeak

    // TODO: Create and return UsageSummary object with totalKwh, averageDailyKwh, startDate, endDate, and array of DailyUsage objects



  })


  throw new Error('Not Implemented Yet')
}

function hourToString(hour: number): TimeString {
  return `${hour.toString().padStart(2, '0')}:00`
}

function dayNumToDateString(day: number): DateString {
  return `2021-02-${day.toString().padStart(2, '0')}`
}
