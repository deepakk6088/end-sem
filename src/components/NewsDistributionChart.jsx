import { useRef } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function NewsDistributionChart({ articles, selectedCategory, onSelectCategory }) {
  const chartRef = useRef(null)
  const counts = articles.reduce(
    (acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1
      return acc
    },
    { General: 0, Science: 0 },
  )

  const labels = Object.keys(counts)
  const data = {
    labels,
    datasets: [
      {
        data: labels.map((label) => counts[label]),
        backgroundColor: ['#10a8df', '#e75d48'],
        borderColor: ['#d8c9ad', '#d8c9ad'],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#1f2937' },
      },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.label}: ${context.parsed}`
          },
        },
      },
    },
  }

  const handleClick = (event) => {
    const chart = chartRef.current
    if (!chart) return
    const elements = chart.getElementsAtEventForMode(event.native, 'nearest', { intersect: true }, true)
    if (elements.length > 0) {
      const { index } = elements[0]
      const category = labels[index]
      onSelectCategory(category === selectedCategory ? null : category)
    }
  }

  return (
    <section className="panel distribution-panel card">
      <div className="panel-header small-header">
        <div>
          <p className="panel-label">News Distribution</p>
          <h2>Category breakdown</h2>
        </div>
        {selectedCategory && (
          <button className="pill-button secondary" onClick={() => onSelectCategory(null)} type="button">
            Clear filter
          </button>
        )}
      </div>
      <div className="distribution-chart" onClick={handleClick}>
        <Doughnut ref={chartRef} data={data} options={options} />
      </div>
    </section>
  )
}
