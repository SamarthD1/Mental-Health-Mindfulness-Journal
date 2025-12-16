import { useEffect, useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Line, Pie } from 'react-chartjs-2'
import './Pages.css'
import { getMoodTrend, getMoodDistribution } from '../api/insights.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  TimeScale,
)

const moodColors = {
  Great: '#10b981',
  Good: '#2563eb',
  Okay: '#6366f1',
  Low: '#f59e0b',
  Stressed: '#ef4444',
  Anxious: '#8b5cf6',
}

const moodColorArray = Object.values(moodColors)

const Insights = () => {
  const [range, setRange] = useState({
    from: '',
    to: '',
  })
  const [trend, setTrend] = useState([])
  const [distribution, setDistribution] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sortedTrend = useMemo(
    () =>
      [...trend].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [trend],
  )

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = {
          ...(range.from ? { from: range.from } : {}),
          ...(range.to ? { to: range.to } : {}),
        }
        const trendData = await getMoodTrend(params)
        const distData = await getMoodDistribution(params)
        setTrend(trendData || [])
        setDistribution(distData || [])
      } catch (err) {
        setError(err?.message || 'Failed to load insights')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [range])

  const lineData = useMemo(
    () => ({
      labels: sortedTrend.map((item) => item.date),
      datasets: [
        {
          label: 'Mood (1-5)',
          data: sortedTrend.map((item) => item.averageMood ?? item.mood),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          tension: 0.3,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBorderWidth: 2,
          pointBackgroundColor: '#2563eb',
          spanGaps: true,
        },
      ],
    }),
    [sortedTrend],
  )

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    interaction: { mode: 'nearest', intersect: false },
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: { stepSize: 1 },
        title: { display: true, text: 'Mood score' },
      },
      x: {
        type: 'time',
        time: { unit: 'day', displayFormats: { day: 'MMM d' } },
        title: { display: true, text: 'Date' },
      },
    },
  }

  const pieData = useMemo(() => {
    const labels = distribution.map((item) => item.mood)
    const data = distribution.map((item) => item.count)
    const backgroundColor = labels.map((mood, idx) => moodColors[mood] || moodColorArray[idx % moodColorArray.length])

    return {
      labels,
      datasets: [
        {
          label: 'Mood distribution',
          data,
          backgroundColor,
        },
      ],
    }
  }, [distribution])

  return (
    <section className="page">
      <div className="card">
        <h1>Insights</h1>
        <p className="muted">
          Insights from your journal entries. Choose a date range to update the charts.
        </p>
        {error && <p className="error">{error}</p>}
        {loading && <p className="muted">Loading...</p>}
        <div className="filters">
          <div className="field">
            <label htmlFor="from">From</label>
            <input
              id="from"
              type="date"
              value={range.from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            />
          </div>
          <div className="field">
            <label htmlFor="to">To</label>
            <input
              id="to"
              type="date"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="split">
        <div className="card">
          <h3>Mood trend</h3>
          <div className="chart-wrap">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
        <div className="card">
          <h3>Mood distribution</h3>
          <div className="chart-wrap">
            <Pie data={pieData} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Insights

