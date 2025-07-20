import { promisify } from 'util'
import { readFile } from 'fs'
import { UsageSummary, DailyUsage, TimeString, DateString, UsagePeak } from '../../src/shared'
import { parse, Options as CsvParseOptions } from 'csv-parse';

// Define the type for the callback-style parse function
type ParseCallback = (
  input: string | Buffer, // this will be the file path's data
  options: CsvParseOptions, // this are csv-parse options like 'columns' or 'skip_empty_lines'
  callback: (err: Error | null, records: Record<string, string>[]) => void
) => void;


const readFilePromise = promisify(readFile)
const parsePromise = promisify(parse as ParseCallback);

const REQUIRED_DATE_HEADER = 'DATE';
// represents 48 half hour intervals for a day in 00:00 - 00:30 format
const HALF_HOUR_HEADERS: string[] = [];
// loop through 0-23
for (let h = 0; h < 24; h++) {
  // loop through [00,30]
    for (let m = 0; m < 60; m += 30) {
      const startTime = timeToString(h, m);
      const endHour = h + (m === 30 ? 1 : 0);
      // if endHour is 24, h should be 0
      const endHourAdjusted = endHour === 24 ? 0 : endHour;
      const endMinute = m === 30 ? 0 : 30;
      const endTime = timeToString(endHourAdjusted, endMinute);
      HALF_HOUR_HEADERS.push(`${startTime} - ${endTime}`);
    }
}
// Define all required headers for validation (e.g., 'date' + the 48 half-hour headers)
const EXPECTED_ALL_HEADERS = [REQUIRED_DATE_HEADER, ...HALF_HOUR_HEADERS];

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

  // TODO: normalize header names

  // check if all required headers present in the actual CSV
  const missingRequiredHeaders = EXPECTED_ALL_HEADERS.filter(expectedHeader => {
      return !Object.keys(records[0]).includes(expectedHeader)
    });

  if (missingRequiredHeaders.length > 0) {
      throw new Error(`Validation Error: Missing headers`);
  }


  // Validations:

  // TODO: validate half hour columns

  // TODO: validate kWh values

  // calculate total and average kWh for each day
  const dailyRecords: DailyUsage[] = records.map(record => {
    const parsedDate = dateToString(parseDdMonYyyyToUtcDate(record[REQUIRED_DATE_HEADER]));
    if (!parsedDate) {
      throw new Error('Validation Error: Invalid Date');
    }
    // Combine half hour columns to derive total and avg hourly kWh for each day
    const totalKwhForDay: number = HALF_HOUR_HEADERS.reduce((total, header) => {
      const value = parseFloat(record[header]);
      return total + (isNaN(value) ? 0 : value);
    }, 0);

    const averageHourlyKwh = roundToThreeDecimalPlaces(totalKwhForDay / 24);

    // UsagePeak is the max energy usage for a given hour out of all 24 hours in a given day
    let maxKw: number = 0;
    let maxHour: string = '';

    // iterate 2 at a time half hours to simulate an hour at a time
    for (let h = 0; h < HALF_HOUR_HEADERS.length; h += 2) {
      const firstHalf = HALF_HOUR_HEADERS[h];
      const secondHalf = HALF_HOUR_HEADERS[h + 1];

      const valueFirstHalf = parseFloat(record[firstHalf]);
      const valueSecondHalf = parseFloat(record[secondHalf]);

      const valueFirstHalfNotNull = isNaN(valueFirstHalf) ? 0 : valueFirstHalf;
      const valueSecondHalfNotNull = isNaN(valueSecondHalf) ? 0 : valueSecondHalf;

      if (valueFirstHalfNotNull + valueSecondHalfNotNull > maxKw) {
        maxKw = valueFirstHalfNotNull + valueSecondHalfNotNull;
        maxHour = timeToString(h/2,0)
      }
    }

    const usagePeak: UsagePeak = {
      hour: maxHour,
      kw: roundToThreeDecimalPlaces(maxKw)
    };

    return {
      date: parsedDate,
      totalKwhForDay: roundToThreeDecimalPlaces(totalKwhForDay),
      averageHourlyKwh,
      usagePeak
    };
  });

  // Derive totalKwh and averageDailyKwh from entire daily usage data
  const totalKwh: number = dailyRecords.reduce((total, dailyRecord) => {
    return total + dailyRecord.totalKwhForDay
  }, 0);

  const averageDailyKwh: number = roundToThreeDecimalPlaces(
    totalKwh / dailyRecords.length
  );

  // Derive startDate and endDate from the Date column
  const dates = dailyRecords.map(dailyRecord => new Date(dailyRecord.date).getTime());
  const startDate = dateToString(new Date(Math.min(...dates)));
  const endDate = dateToString(new Date(Math.max(...dates)));

  const usageSummary: UsageSummary = {
    totalKwh,
    averageDailyKwh,
    startDate,
    endDate,
    days: dailyRecords
  }

  return usageSummary
}

// converts hour and minute numbers to 'HH:MM' format
function timeToString(hour: number, minute: number): TimeString {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

// converts Date object to string ISO8601 format
function dateToString(date: Date): DateString {
  // if date is invalid, return empty string
  if (isNaN(date.getTime())) { return ''; }

  const isoString = date.toISOString();
  return isoString.split('T')[0];
}

// parses "DD/Mon/YYYY" string into a UTC Date object
function parseDdMonYyyyToUtcDate(dateString: string): Date {
  const parts = dateString.match(/(\d{2})\/([A-Za-z]{3})\/(\d{4})/);
  if (!parts) {
    return new Date('Invalid Date'); // will be handled in dateToString
  }
  const day: number = parseInt(parts[1], 10);
  const monthAbb: string = parts[2];
  const year: number = parseInt(parts[3], 10);

  const monthMap: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  const month = monthMap[monthAbb];

  if (month === undefined) {
    return new Date('Invalid Date'); // will be handled in dateToString
  }

  // Create a UTC Date object using Date.UTC()
  return new Date(Date.UTC(year, month, day));
}

function roundToThreeDecimalPlaces(value: number) {
  return Math.round(value * 1000) / 1000;
};
