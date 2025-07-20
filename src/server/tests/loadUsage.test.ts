import { loadUsage } from '../loadUsage'
import { DailyUsage, UsagePeak } from '@/shared';

// TEST CSVs
const testValidCsvPath = './src/server/tests/test_csvs/test_valid_csv.csv';
const emptyValidCsvPath = './src/server/tests/test_csvs/empty_valid.csv';
// date header is incorrect, should be 'DATE' but is 'invalid_date_header'
const invalidCsvPath = './src/server/tests/test_csvs/invalid_header.csv';

describe('loadUsage', () => {
    describe('when an invalid csv', () => {
        it('throws an error when headers are not found', async () => {
            await expect(loadUsage(invalidCsvPath)).rejects.toThrow('Validation Error: Missing headers');
        });

        describe('when an empty csv with valid headers', () => {
            it('returns an empty UsageSummary object', async () => {
                await expect(loadUsage(emptyValidCsvPath)).rejects.toThrow('Validation Error: Invalid Date');

            });
        });
    });

    describe('when a valid csv', () => {
        it('', async () => {
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
