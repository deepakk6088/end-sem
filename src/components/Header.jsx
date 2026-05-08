export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="dashboard-header card">
      <div>
        <p className="eyebrow">MISSION CONTROL DASHBOARD</p>
        <h1>Real-Time ISS and News Intelligence</h1>
        <p className="hero-copy">
          Monitor ISS telemetry, orbital crew activity, and curated science intelligence in one command center.
        </p>
        <div className="header-chips">
          <span className="mini-chip">Live updates</span>
          <span className="mini-chip">Smart summaries</span>
          <span className="mini-chip">AI assistant</span>
        </div>
      </div>

      <button className="pill-button secondary toggle-theme" onClick={onToggleTheme} type="button">
        {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
      </button>
    </header>
  )
}
