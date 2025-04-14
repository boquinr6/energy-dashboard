import {
  DailyUsage,
  DateString,
  TimeString,
  UsagePeak,
  UsageSummary,
} from '../../src/shared'

// Sample data for frontend oriented engineers to develop UI against
//
export function sampleUsage(): UsageSummary {
  const firstDay = 1
  const lastDay = 28

  let day = firstDay

  const days: DailyUsage[] = []
  while (day <= lastDay) {
    const date = dayNumToDateString(day)

    const usagePeak: UsagePeak = {
      hour: hourToString(Math.floor(Math.random() * 24)),
      kw: Math.random() * 47,
    }

    const totalKwh = Math.random() * 23

    days.push({
      date,
      totalKwh,
      averageHourlyKwh: totalKwh / 24,
      usagePeak,
    })

    day += 1
  }

  const totalKwh = days.reduce((memo, e) => memo + e.totalKwh, 0)

  const averageDailyKwh = totalKwh / lastDay

  return {
    startDate: dayNumToDateString(firstDay),
    endDate: dayNumToDateString(lastDay),
    totalKwh,
    averageDailyKwh,
    days,
  }
}

function hourToString(hour: number): TimeString {
  return `${hour.toString().padStart(2, '0')}:00`
}

function dayNumToDateString(day: number): DateString {
  return `2021-02-${day.toString().padStart(2, '0')}`
}
