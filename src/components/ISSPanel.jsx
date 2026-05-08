import ISSMap from './ISSMap.jsx'

export default function ISSPanel({
  currentPosition,
  speed,
  nearestPlace,
  trackedCount,
  loading,
  error,
  autoRefreshOn,
  onRefresh,
  onToggleAutoRefresh,
}) {
  return (
    <section className="panel iss-panel card">
      <div className="panel-header">
        <div>
          <p className="panel-label">ISS Live Tracking</p>
          <h2>Live telemetry overview</h2>
        </div>
        <div className="panel-actions">
          <button className="pill-button secondary" onClick={onToggleAutoRefresh} type="button">
            Auto-Refresh: {autoRefreshOn ? 'ON' : 'OFF'}
          </button>
          <button className="pill-button primary" onClick={onRefresh} type="button">
            Refresh Now
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Latitude / Longitude</p>
          <p className="stat-value">
            {loading || !currentPosition
              ? 'Loading...'
              : `${currentPosition.lat.toFixed(3)}, ${currentPosition.lng.toFixed(3)}`}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Speed</p>
          <p className="stat-value">{loading ? 'Calculating...' : `${speed.toFixed(2)} km/h`}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Nearest Place</p>
          <p className="stat-value">{loading ? 'Loading...' : nearestPlace}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Tracked Positions</p>
          <p className="stat-value">{trackedCount}</p>
        </div>
      </div>

      <ISSMap positions={currentPosition ? [currentPosition, ...[]} : []} />

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button className="pill-button secondary" onClick={onRefresh} type="button">
            Retry
          </button>
        </div>
      )}
    </section>
  )
}
