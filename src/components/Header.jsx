export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="dashboard-header card">
      <div>
        <p className="eyebrow">MISSION CONTROL DASHBOARD</p>
        <h1>Real-Time ISS and News Intelligence</h1>
      </div>

      <button className="pill-button secondary" onClick={onToggleTheme} type="button">
        {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
      </button>
    </header>
  )
}
