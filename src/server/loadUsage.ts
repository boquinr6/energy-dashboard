import { promisify } from 'util'
import { readFile } from 'fs'
import { UsageSummary, DailyUsage } from '../../src/shared'
import { parse, Options as CsvParseOptions } from 'csv-parse';

// Define the type for the callback-style parse function
type ParseCallback = (
  input: string | Buffer, // this will be the file path's data
  options: CsvParseOptions, // this are csv-parse options like 'columns' or 'skip_empty_lines'
  callback: (err: Error | null, records: Record<string, string>[]) => void
) => void;


const readFilePromise = promisify(readFile)
// in order to avoid race condition, we must be able to await csv parsing
const parsePromise = promisify(parse as ParseCallback);

const REQUIRED_DATE_HEADER = 'date';

export async function loadUsage(filePath: string): Promise<UsageSummary> {
  const data = await readFilePromise(
    filePath
  )
  const data_as_string: string = data.toString('utf8')

  // console.log('loaded data', data.toString())

  const records: Record<string, string>[] = await parsePromise(data_as_string, {
    columns: true,
    skip_empty_lines: true,
  });




    // TODO: normalize header names



    // Validations:
    // TODO: validate date format

    // TODO: validate half hour columns

    // TODO: validate kWh values

  // records.map(record =>
  //     const totalDailyKwh = record[]
  //   )
    // Calculations:
    // TODO: Combine half hour columns to derive total kWh for each day

    // TODO: Derive hourly kWh from half hour columns, then use to calculate average hourly kWh

    // TODO: Derive usage peak from hourly kWh values

    // Derive totalKwh and averageDailyKwh from entire daily usage data

    // TODO: Derive startDate and endDate from the Date column

    // Create Objects:
    // TODO: Create DailyUsage objects for each date with totalKwh, averageHourlyKwh, and usagePeak

    // TODO: Create and return UsageSummary object with totalKwh, averageDailyKwh, startDate, endDate, and array of DailyUsage objects



  const usageSummary: UsageSummary = {
    totalKwh: 0, // TODO: Placeholder
    averageDailyKwh: 0, // TODO: Placeholder
    startDate: '', // TODO: Placeholder
    endDate: '', // TODO: Placeholder
    days: [], // TODO: Placeholder
  }

  return usageSummary


  throw new Error('Not Implemented Yet')
}

function hourToString(hour: number): TimeString {
  return `${hour.toString().padStart(2, '0')}:00`
}

function dayNumToDateString(day: number): DateString {
  return `2021-02-${day.toString().padStart(2, '0')}`
}
