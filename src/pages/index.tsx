import { useState, useEffect } from 'react'
import { DateString, UsageSummary } from '@/shared'

import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

import {
  Box,
  Tab,
  Tabs,
  Chip,
  Card,
  Grid2,
  Table,
  Paper,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Typography,
  CardContent,
  TableContainer,
  CircularProgress
} from '@mui/material'

import { styled } from '@mui/material/styles'
import Alert from '@mui/material/Alert';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  marginBottom: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
}))

const SummaryCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(5),
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
}))

const formatDate = (dateString: DateString): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  })
}

// Main component
const EnergyUsageDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)
  const [serverResp, setServerResp] = useState<UsageSummary | undefined>(
    undefined
  )

  // State for loading spinner
  const [isLoading, setIsLoading] = useState(true)
  // State for last X days to view, or view all says
  const [daysToView, setDaysToView] = useState<number | 'all'>('all')

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }
  const handleDaysToViewChange = (newDaysToView: string) => {
    setDaysToView(newDaysToView === 'all' ? 'all' : Number(newDaysToView))
  }

  useEffect(() => {
    ;(async () => {
      setIsLoading(true) // Start loading
      try {
        const resp = await fetch('/api/usage')
        const data: UsageSummary = await resp.json()
        setServerResp(data)
      } catch (error) {
        console.error('Error fetching usage data:', error)
      } finally {
        setIsLoading(false) // End loading
      }

    })()
  }, [])

  const displayedDays = serverResp?.days
  ? (daysToView === 'all'
      ? serverResp.days
      : serverResp.days.slice(-daysToView)) // Get the last 'daysToView' days
  : []

  // Transform data for chart
  const chartData = displayedDays?.map((day) => ({
    kWh: day.totalKwhForDay,
    date: formatDate(day.date),
    peak: day.usagePeak?.kw || 0,
  }))

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 5 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 'bold', marginBottom: '40px' }}
      >
        Energy Usage Dashboard
      </Typography>

      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <CircularProgress />
        </Box>
      ) : serverResp && (
        <>
          <SummaryCard>
              <CardContent>
                <Alert severity="warning">Changing the Vier Period does not affect the summary stats</Alert>

                <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle1">Total Usage</Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {serverResp.totalKwh.toFixed(1)} kWh
                  </Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle1">Daily Average</Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {serverResp.averageDailyKwh.toFixed(1)} kWh
                  </Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle1">Period</Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {/* Decision: don't update this when daysToView changes because summary data should show things from the entire period of UsageSummary */}
                      {formatDate(serverResp.startDate)} -{' '}
                    {formatDate(serverResp.endDate)}
                  </Typography>
                </Grid2>
              </Grid2>
            </CardContent>
          </SummaryCard>

          <Typography variant='h5'>
            View Period:
          </Typography>
          <select
            value={daysToView}
            onChange={e => handleDaysToViewChange(e.target.value)}
          >
            <option value={'all'}>All Days</option>
            <option value={'7'}>Last 7 Days</option>
            <option value={'30'}>Last 30 Days</option>
            <option value={'60'}>Last 60 Days</option>
          </select>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ mb: 2 }}
            variant="fullWidth"
          >
            <Tab label="Daily Usage Chart" />
            <Tab label="Detailed Usage" />
          </Tabs>

          {tabValue === 0 && (
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Energy Consumption
                </Typography>
                <Box sx={{ height: 350, width: '100%' }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" interval={2} />
                      <YAxis
                        label={{
                          value: 'kWh',
                          angle: -90,
                          position: 'insideLeft',
                        }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="kWh"
                        fill="#2196f3"
                        name="Total Usage (kWh)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </StyledCard>
          )}

          {tabValue === 1 && (
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Usage Details
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography fontWeight="bold">Date</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">Total (kWh)</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            Hourly Avg (kWh)
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">Peak Usage</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">Peak Time</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedDays.map((day) => (
                        <TableRow key={day.date} hover>
                          <TableCell>{formatDate(day.date)}</TableCell>
                          <TableCell align="right">
                            {day.totalKwhForDay.toFixed(1)}
                          </TableCell>
                          <TableCell align="right">
                            {day.averageHourlyKwh.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {day.usagePeak && (
                              <Chip
                                label={`${day.usagePeak.kw.toFixed(1)} kW`}
                                color={
                                  day.usagePeak.kw > 1.5 ? 'error' : 'success'
                                }
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {day.usagePeak?.hour}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </StyledCard>
          )}
        </>
      )}

    </Box>
  )
}

export default EnergyUsageDashboard
