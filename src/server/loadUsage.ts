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
const parsePromise = promisify(parse as ParseCallback);

const REQUIRED_DATE_HEADER = 'date';
// represents 48 half hour intervals for a day in 00:00 - 00:30 format
const HALF_HOUR_HEADERS: string[] = [];
// loop through 0-23
for (let h = 0; h < 24; h++) {
  // loop through [00,30]
    for (let m = 0; m < 60; m += 30) {
      const startTime = timeToString(h, m);
      const endHour = h + (m === 30 ? 1 : 0);
      const endMinute = m === 30 ? 0 : 30;
      const endTime = timeToString(endHour, endMinute);
      HALF_HOUR_HEADERS.push(`${startTime} - ${endTime}`);
    }
}

export async function loadUsage(filePath: string): Promise<UsageSummary> {
  const data = await readFilePromise(
    filePath
  )
  const data_as_string: string = data.toString('utf8')

  // in order to avoid race condition, we must be able to await csv parsing
  const records: Record<string, string>[] = await parsePromise(data_as_string, {
    columns: true,
    skip_empty_lines: true,
  });

  // Testing half hour headers:
  console.log(HALF_HOUR_HEADERS)
  const vals = records.map(record => record[HALF_HOUR_HEADERS[0]])
  console.log('First half hour value:', vals[0]);

  // calculate total and average kWh for each day
  const dailyRecords: DailyUsage[] = records.map(record => {
    // Combine half hour columns to derive total and avg hourly kWh for each day
    const totalKwhForDay: number = HALF_HOUR_HEADERS.reduce((total, header) => {
      const value = parseFloat(record[header]);
      return total + (isNaN(value) ? 0 : value);
    }, 0);

    const averageHourlyKwh = totalKwhForDay / 24;

    return {
      date: record.DATE,
      totalKwhForDay,
      averageHourlyKwh // TODO: implement usagePeak
    };
  });

  // Derive totalKwh and averageDailyKwh from entire daily usage data
  const totalKwh: number = dailyRecords.reduce((total, dailyRecord) => {
    return total + dailyRecord.totalKwhForDay
  }, 0);

  const averageDailyKwh: number = totalKwh / dailyRecords.length;

  // Derive startDate and endDate from the Date column
  const dates = dailyRecords.map(dailyRecord => new Date(dailyRecord.date).getTime());
  const startDate = dateToString(new Date(Math.min(...dates)));
  const endDate = dateToString(new Date(Math.max(...dates)));



    // TODO: normalize header names

    // Validations:
    // TODO: validate date format

    // TODO: validate half hour columns

    // TODO: validate kWh values

    // Calculations:

    // TODO: Derive hourly kWh from half hour columns, then
    //       derive usage peak from hourly kWh values



    // Create Objects:

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

function timeToString(hour: number, minute: number): TimeString {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

// converts Date object to string ISO8601 format
function dateToString(date: Date): DateString {
  const isoString = date.toISOString();
  return isoString.split('T')[0];
}
