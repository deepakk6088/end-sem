import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

const mockStats = {
  latitude: '51.5074 N',
  longitude: '0.1278 W',
  speed: '27,600 km/h',
  place: 'North Atlantic Ocean',
  tracked: 12,
}

const mockTrail = [
  { lat: 51.5, lon: -0.1 },
  { lat: 53.1, lon: -5.2 },
  { lat: 54.9, lon: -10.4 },
  { lat: 57.2, lon: -13.7 },
  { lat: 59.3, lon: -17.2 },
  { lat: 61.4, lon: -20.5 },
  { lat: 63.1, lon: -18.0 },
  { lat: 65.0, lon: -12.4 },
  { lat: 64.0, lon: -5.3 },
  { lat: 61.7, lon: 1.4 },
  { lat: 59.0, lon: 4.1 },
  { lat: 56.1, lon: 2.0 },
]

const mockTrend = [18, 21, 27, 25, 30, 28, 33, 38, 34, 39, 42, 45, 44, 48, 51]

const mockNews = [
  {
    id: 1,
    headline: 'Mission systems report nominal status across primary telemetry channels',
    source: 'Orbital Ops',
    time: '2 min ago',
    summary: 'All systems are stable. Orbit insertion and communications are performing within expected parameters for the current pass.',
  },
  {
    id: 2,
    headline: 'Ground teams prepare contingency staging for coastal ascent trajectory',
    source: 'Launch Control',
    time: '12 min ago',
    summary: 'Backup support units are standing by for the next scheduled maneuver. Weather outlook remains favorable for the operation window.',
  },
  {
    id: 3,
    headline: 'Global space news: emergency satellite repositioning completed successfully',
    source: 'Space News',
    time: '27 min ago',
    summary: 'An adjacent orbital asset executed an avoidance burn. Mission control continues to monitor conjunction risk on the descending node.',
  },
  {
    id: 4,
    headline: 'Crew briefing: planned EVA scheduled in 3 hours',
    source: 'Crew Ops',
    time: '41 min ago',
    summary: 'Final systems checks for spacesuit telemetry, airlock pressure, and telerobotics support are on track as planned.',
  },
]

function buildTrendPath(values) {
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100
    const normalized = ((value - Math.min(...values)) / (Math.max(...values) - Math.min(...values))) * 72
    const y = 80 - normalized
    return `${x},${y}`
  })
  return `M ${points.join(' L ')}`
}

function App() {
  const [theme, setTheme] = useState('light')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('latest')
  const [expanded, setExpanded] = useState([])
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const filteredNews = useMemo(() => {
    const base = mockNews.filter((item) =>
      item.headline.toLowerCase().includes(search.toLowerCase()) ||
      item.source.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase()),
    )

    if (sort === 'latest') {
      return base.sort((a, b) => b.id - a.id)
    }

    return base.sort((a, b) => a.source.localeCompare(b.source))
  }, [search, sort])

  const toggleExpanded = (id) => {
    setExpanded((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const trendPath = useMemo(() => buildTrendPath(mockTrend), [])

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header card">
        <div>
          <p className="eyebrow">Mission Control Dashboard</p>
          <h1>Real-Time ISS and News Intelligence</h1>
          <p className="hero-copy">A warm, mission-focused command surface for orbital telemetry, breaking intelligence, and conversational assistant support.</p>
        </div>

        <button className="mode-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
      </header>

      <main className="dashboard-grid">
        <section className="panel card left-panel">
          <div className="panel-header">
            <div>
              <p className="panel-label">ISS Live Tracking</p>
              <h2>Orbit telemetry overview</h2>
            </div>
            <div className="panel-actions">
              <button className="secondary-button">Auto-refresh</button>
              <button className="primary-button">Refresh now</button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-title">Latitude</p>
              <p className="stat-value">{mockStats.latitude}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Longitude</p>
              <p className="stat-value">{mockStats.longitude}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Speed</p>
              <p className="stat-value">{mockStats.speed}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Tracked positions</p>
              <p className="stat-value">{mockStats.tracked}</p>
            </div>
          </div>

          <div className="map-card card inset-card">
            <div className="map-card-header">
              <p className="panel-label">Live orbit map</p>
              <span className="mini-chip">Last 12 fixes</span>
            </div>
            <MapContainer center={[mockTrail[0].lat, mockTrail[0].lon]} zoom={2} scrollWheelZoom={false} attributionControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
              <Polyline positions={mockTrail.map((point) => [point.lat, point.lon])} pathOptions={{ color: '#ff7f50', weight: 4, opacity: 0.9 }} />
              <CircleMarker center={[mockTrail[0].lat, mockTrail[0].lon]} radius={8} pathOptions={{ color: '#fff', weight: 2, fillColor: '#ff7f50', fillOpacity: 1 }}>
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  Current ISS position
                </Tooltip>
              </CircleMarker>
            </MapContainer>
          </div>
        </section>

        <aside className="panel card right-panel">
          <div className="panel-header small-header">
            <div>
              <p className="panel-label">ISS Speed Trend</p>
              <h2>Velocity pulse</h2>
            </div>
          </div>

          <div className="trend-card card inset-card">
            <div className="trend-header">
              <span>Past orbit revolutions</span>
              <strong>+5.2% vs last hour</strong>
            </div>
            <svg className="trend-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff9971" />
                  <stop offset="100%" stopColor="#ff4f1a" />
                </linearGradient>
              </defs>
              <path d={trendPath} fill="none" stroke="url(#line-gradient)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="100" cy="20" r="3.5" fill="#ff7f50" />
            </svg>
            <div className="trend-footnotes">
              <span>Average speed: 27,680 km/h</span>
              <span>Peak drift: 51 km/h</span>
            </div>
          </div>

          <div className="news-panel card inset-card">
            <div className="panel-header small-header">
              <div>
                <p className="panel-label">Breaking News</p>
                <h2>Mission intelligence feed</h2>
              </div>
              <button className="secondary-button">Refresh</button>
            </div>

            <div className="news-controls">
              <input
                className="search-input"
                type="search"
                placeholder="Filter news, sources, or keywords"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="latest">Newest first</option>
                <option value="source">Source</option>
              </select>
            </div>

            <div className="news-list">
              {filteredNews.map((item) => {
                const isOpen = expanded.includes(item.id)
                return (
                  <article key={item.id} className={`news-item ${isOpen ? 'open' : ''}`}>
                    <button type="button" className="news-toggle" onClick={() => toggleExpanded(item.id)}>
                      <div>
                        <p className="news-headline">{item.headline}</p>
                        <div className="news-meta">
                          <span>{item.source}</span>
                          <span>{item.time}</span>
                        </div>
                      </div>
                      <span className="expand-icon">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && <p className="news-summary">{item.summary}</p>}
                  </article>
                )
              })}
            </div>
          </div>
        </aside>
      </main>

      <button className="chat-button" onClick={() => setChatOpen((value) => !value)}>
        AI Assistant
      </button>

      {chatOpen && (
        <div className="chat-window card">
          <div className="chat-header">
            <div>
              <p className="panel-label">AI Mission Assistant</p>
              <h3>Ask about the ISS or mission alerts</h3>
            </div>
            <button className="close-chat" onClick={() => setChatOpen(false)}>×</button>
          </div>
          <div className="chat-messages">
            <div className="chat-bubble incoming">
              <p>Ready to help. Ask me about the orbit path, crew status, or latest intelligence.</p>
            </div>
            <div className="chat-bubble outgoing">
              <p>What is the current predicted crossing time over Cape Town?</p>
            </div>
            <div className="chat-bubble incoming">
              <p>Estimated crossing in 18 minutes. Countdown and relay windows are green.</p>
            </div>
          </div>
          <div className="chat-input-row">
            <input type="text" placeholder="Type a mission query..." />
            <button className="primary-button">Send</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
