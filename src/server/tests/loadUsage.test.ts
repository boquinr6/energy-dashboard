import { loadUsage } from '../loadUsage'
import { DailyUsage, UsagePeak } from '@/shared';
import { writeFileSync, promises } from 'fs';

const CSV_HEADERS = `NMI,METER SERIAL NUMBER,CON/GEN,DATE,ESTIMATED?,00:00 - 00:30,00:30 - 01:00,01:00 - 01:30,01:30 - 02:00,02:00 - 02:30,02:30 - 03:00,03:00 - 03:30,03:30 - 04:00,04:00 - 04:30,04:30 - 05:00,05:00 - 05:30,05:30 - 06:00,06:00 - 06:30,06:30 - 07:00,07:00 - 07:30,07:30 - 08:00,08:00 - 08:30,08:30 - 09:00,09:00 - 09:30,09:30 - 10:00,10:00 - 10:30,10:30 - 11:00,11:00 - 11:30,11:30 - 12:00,12:00 - 12:30,12:30 - 13:00,13:00 - 13:30,13:30 - 14:00,14:00 - 14:30,14:30 - 15:00,15:00 - 15:30,15:30 - 16:00,16:00 - 16:30,16:30 - 17:00,17:00 - 17:30,17:30 - 18:00,18:00 - 18:30,18:30 - 19:00,19:00 - 19:30,19:30 - 20:00,20:00 - 20:30,20:30 - 21:00,21:00 - 21:30,21:30 - 22:00,22:00 - 22:30,22:30 - 23:00,23:00 - 23:30,23:30 - 00:00`;
const INCORRECT_DATE_CSV_HEADERS = `NMI,METER SERIAL NUMBER,CON/GEN,invalid_date_header,ESTIMATED?,00:00 - 00:30,00:30 - 01:00,01:00 - 01:30,01:30 - 02:00,02:00 - 02:30,02:30 - 03:00,03:00 - 03:30,03:30 - 04:00,04:00 - 04:30,04:30 - 05:00,05:00 - 05:30,05:30 - 06:00,06:00 - 06:30,06:30 - 07:00,07:00 - 07:30,07:30 - 08:00,08:00 - 08:30,08:30 - 09:00,09:00 - 09:30,09:30 - 10:00,10:00 - 10:30,10:30 - 11:00,11:00 - 11:30,11:30 - 12:00,12:00 - 12:30,12:30 - 13:00,13:00 - 13:30,13:30 - 14:00,14:00 - 14:30,14:30 - 15:00,15:00 - 15:30,15:30 - 16:00,16:00 - 16:30,16:30 - 17:00,17:00 - 17:30,17:30 - 18:00,18:00 - 18:30,18:30 - 19:00,19:00 - 19:30,19:30 - 20:00,20:00 - 20:30,20:30 - 21:00,21:00 - 21:30,21:30 - 22:00,22:00 - 22:30,22:30 - 23:00,23:00 - 23:30,23:30 - 00:00`;
const INCOMPLETE_CSV_HEADERS = `NMI,METER SERIAL NUMBER,CON/GEN,DATE,ESTIMATED?,00:00 - 00:30,00:30 - 01:00,01:00 - 01:30,01:30 - 02:00,02:00 - 02:30,02:30 - 03:00,03:00 - 03:30,03:30 - 04:00,04:00 - 04:30,04:30 - 05:00,05:00 - 05:30,05:30 - 06:00,06:00 - 06:30,06:30 - 07:00,07:00 - 07:30,07:30 - 08:00,08:00 - 08:30,08:30 - 09:00,09:00 - 09:30,09:30 - 10:00,10:00 - 10:30,10:30 - 11:00,11:00 - 11:30,11:30 - 12:00,12:00 - 12:30,12:30 - 13:00,13:00 - 13:30,13:30 - 14:00,14:00 - 14:30,14:30 - 15:00,15:00 - 15:30,15:30 - 16:00,16:00 - 16:30,16:30 - 17:00,17:00 - 17:30,17:30 - 18:00,18:00 - 18:30,18:30 - 19:00,19:00 - 19:30,19:30 - 20:00,20:00 - 20:30,20:30 - 21:00,21:00 - 21:30,21:30 - 22:00,22:00 - 22:30,22:30 - 23:00,23:00 - 23:30`;
const sampleRows = `\n1111111111,1111111,Consumption,01/Dec/2013,N,0.07,0.089,0.095,0.127,0.143,0.141,0.135,0.117,0.14,0.14,0.148,0.113,0.133,0.273,0.143,0.077,0.198,0.258,0.188,0.085,0.089,0.135,0.114,0.102,0.083,0.086,0.083,0.08,0.081,0.067,0.096,0.109,0.079,0.517,0.525,0.467,0.989,0.558,0.152,0.214,0.192,0.283,0.327,0.48,0.197,0.339,0.217,0.116\n1111111111,1111111,Consumption,02/Dec/2013,N,0.112,0.109,0.108,0.107,0.106,0.117,0.107,0.095,0.097,0.13,0.096,0.074,0.156,0.16,0.434,0.286,0.171,0.1,0.16,0.136,0.13,0.098,0.096,0.093,0.095,0.093,0.311,0.554,0.66,0.697,0.693,0.684,0.711,0.673,0.711,0.844,0.687,0.443,0.225,0.18,0.173,0.461,0.158,0.121,0.304,0.088,0.081,0.083`;
// TEST CSV Paths
const TEST_CSV_DIR = './src/server/tests/test_csvs';
const testValidCsvPath = `${TEST_CSV_DIR}/valid_usage.csv`;
const emptyCsvPath = `${TEST_CSV_DIR}/empty_usage.csv`;
const incompleteCsvPath = `${TEST_CSV_DIR}/incomplete_usage.csv`;
const invalidDateCsvPath = `${TEST_CSV_DIR}/invalid_date_header_usage.csv`;
const invalidKwhCsv = `${TEST_CSV_DIR}/invalid_kwh_usage.csv`;

async function cleanupTestCsvs() {
    try {
        await promises.rm(TEST_CSV_DIR, { recursive: true, force: true });
    } catch (error) {
        console.error('Error cleaning up test CSVs:', error);
    }
}

describe('loadUsage', () => {
    beforeAll(() => {
        const validCsv = `${CSV_HEADERS}${sampleRows}`;
        writeFileSync(testValidCsvPath, validCsv);

        // Empty CSV with correct headers
        const emptyCsv = `${CSV_HEADERS}\n`;
        writeFileSync(emptyCsvPath, emptyCsv);

        // Invalid CSV with incorrect date header
        const invalidDateHeaderCsv = `${INCORRECT_DATE_CSV_HEADERS}${sampleRows}`;
        writeFileSync(invalidDateCsvPath, invalidDateHeaderCsv);

        // Invalid CSV with missing headers
        const incompleteCsv = `${INCOMPLETE_CSV_HEADERS}\n1111111111,1111111,Consumption,01/Dec/2013,N,0.07,0.089,0.095,0.127,0.143,0.141,0.135,0.117,0.14,0.14,0.148,0.113,0.133,0.273,0.143,0.077,0.198,0.258,0.188,0.085,0.089,0.135,0.114,0.102,0.083,0.086,0.083,0.08,0.081,0.067,0.096,0.109,0.079,0.517,0.525,0.467,0.989,0.558,0.152,0.214,0.192,0.283,0.327,0.48,0.197,0.339,0.217\n1111111111,1111111,Consumption,02/Dec/2013,N,0.112,0.109,0.108,0.107,0.106,0.117,0.107,0.095,0.097,0.13,0.096,0.074,0.156,0.16,0.434,0.286,0.171,0.1,0.16,0.136,0.13,0.098,0.096,0.093,0.095,0.093,0.311,0.554,0.66,0.697,0.693,0.684,0.711,0.673,0.711,0.844,0.687,0.443,0.225,0.18,0.173,0.461,0.158,0.121,0.304,0.088,0.081`;
        writeFileSync(incompleteCsvPath, incompleteCsv);

        // Invalid CSV with incorrect kwh values
        const invalidKwhCsv = `${CSV_HEADERS}\n1111111111,1111111,Consumption,01/Dec/2013,N,0.07,0.089,0.095,0.127,0.143,0.141,0.135,0.117,0.14,0.14,0.148,0.113,0.133,0.273,0.143,0.077,0.198,0.258,0.188,0.085,0.089,0.135,0.114,0.102,0.083,0.086,0.083,0.08,0.081,0.067,0.096,0.109,0.079,0.517,0.525,0.467,0.989,0.558,0.152,0.214,0.192,0.283,0.327,0.48,0.197,0.339,0.217,0.116\n1111111111,1111111,Consumption,02/Dec/2013,N,0.112,0.109,0.108,0.107,0.106,0.117,0.107,0.095,0.097,0.13,0.096,0.074,0.156,0.16,0.434,0.286,0.171,0.1,0.16,0.136,0.13,0.098,0.096,0.093,0.095,0.093,0.311,0.554,0.66,0.697,0.693,0.684,0.711,0.673,0.711,0.844,0.687,0.443,0.225,0.18,0.173,0.461,0.158,0.121,0.304,0.088,incorrectFloatValue,0.083`;
        writeFileSync(`${TEST_CSV_DIR}/invalid_kwh_usage.csv`, invalidKwhCsv);
    })

    afterAll(async () => {
        await cleanupTestCsvs();
    });

    describe('when an invalid csv', () => {
        it('throws an error when headers are not found', async () => {
            await expect(loadUsage(invalidDateCsvPath)).rejects.toThrow('Validation Error: Missing headers: DATE');
        });

        describe('when a csv with missing headers', () => {
            it('throws an error when headers are not found', async () => {
                await expect(loadUsage(incompleteCsvPath)).rejects.toThrow('Validation Error: Missing headers: 23:30 - 00:00');
            });
        });

        describe('when a csv with invalid kwh value', () => {
            it('throws an error', async () => {
                await expect(loadUsage(invalidKwhCsv)).rejects.toThrow('Validation Error: Invalid kwh value for header 23:00 - 23:30');
            });
        })
    });

    describe('when a valid csv', () => {
        describe('when an empty csv with valid headers', () => {
            it('returns an empty UsageSummary object', async () => {
                const summary = await loadUsage(emptyCsvPath);
                expect(summary).toEqual({
                    totalKwh: 0,
                    averageDailyKwh: 0,
                    startDate: '',
                    endDate: '',
                    days: []
                });
            });
        });

        describe('when a non-empty csv', () => {
            it('returns a UsageSumary object', async () => {
                const summary = await loadUsage(testValidCsvPath);
                // day 1: 9.59 , day 2: 13.008 , total: 22.598, avg: 11.299
                // day 1
                const usagePeak1: UsagePeak = {
                    hour: '18:00',
                    kw: 1.547,
                }
                const day1: DailyUsage = {
                    date: '2013-12-01',
                    totalKwhForDay: 9.59,
                    averageHourlyKwh: 0.4,
                    usagePeak: usagePeak1
                }
                // day 2
                const usagePeak2: UsagePeak = {
                    hour: '17:00',
                    kw: 1.555,
                }
                const day2: DailyUsage = {
                    date: '2013-12-02',
                    totalKwhForDay: 13.008,
                    averageHourlyKwh: 0.542,
                    usagePeak: usagePeak2
                }

                expect(summary.startDate).toEqual('2013-12-01');
                expect(summary.endDate).toEqual('2013-12-02');
                expect(summary.totalKwh).toEqual(22.598);
                expect(summary.averageDailyKwh).toEqual(11.299);
                expect(summary.days).toEqual([day1, day2]);
            })
        });
    });
});
