import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export default function SpeedChart({ measurements }) {
  const chartData = useMemo(() => {
    const labels = measurements.map((entry) => {
      const date = new Date(entry.timestamp * 1000)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    return {
      labels,
      datasets: [
        {
          label: 'ISS Speed (km/h)',
          data: measurements.map((entry) => entry.speed),
          borderColor: '#e75d48',
          backgroundColor: 'rgba(231, 93, 72, 0.12)',
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: '#e75d48',
          fill: true,
        },
      ],
    }
  }, [measurements])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#1f2937' },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#4b5563',
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: '#4b5563',
        },
        grid: {
          color: 'rgba(31, 41, 55, 0.12)',
        },
      },
    },
  }

  return (
    <section className="panel chart-panel card">
      <div className="panel-header small-header">
        <div>
          <p className="panel-label">ISS Speed Trend</p>
          <h2>Velocity chart</h2>
        </div>
      </div>
      <div className="chart-wrapper">
        {measurements.length === 0 ? (
          <div className="chart-empty">No speed history yet.</div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </section>
  )
}
