export default function PeopleInSpace({ people, count, loading, error }) {
  return (
    <section className="panel people-panel card">
      <div className="panel-header small-header">
        <div>
          <p className="panel-label">People in Space</p>
          <h2>Current crew manifest</h2>
        </div>
      </div>
      <div className="people-summary">
        <span className="people-count">{loading ? '...' : count}</span>
        <p className="people-detail">Astronauts currently in orbit</p>
      </div>
      <div className="people-list">
        {error ? (
          <p className="error-text">{error}</p>
        ) : loading ? (
          <p className="muted-text">Loading crew data…</p>
        ) : people.length > 0 ? (
          people.map((person) => (
            <div key={`${person.name}-${person.craft}`} className="people-item">
              <span>{person.name}</span>
              <strong>{person.craft}</strong>
            </div>
          ))
        ) : (
          <p className="muted-text">No people data available.</p>
        )}
      </div>
    </section>
  )
}
