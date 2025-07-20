
// TODO: add runtime validation for DateString and TimeString to check for valid formats
// ISO8601 ie 2021-02-28
export type DateString = string

// HH:MM in 24hr format ie 17:00
export type TimeString = string

export interface UsageSummary {
  totalKwh: number
  averageDailyKwh: number
  startDate: DateString
  endDate: DateString
  days: DailyUsage[]
}

export interface DailyUsage {
  date: DateString
  totalKwhForDay: number
  averageHourlyKwh: number
  usagePeak?: UsagePeak
}

export interface UsagePeak {
  hour: TimeString
  kw: number
}
