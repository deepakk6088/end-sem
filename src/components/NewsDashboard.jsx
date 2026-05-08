import { useMemo, useState } from 'react'

export default function NewsDashboard({
  articles,
  loading,
  error,
  searchQuery,
  sortOption,
  selectedCategory,
  onSearch,
  onSort,
  onRefreshCategory,
}) {
  const [expanded, setExpanded] = useState([])

  const visibleArticles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    return articles
      .filter((article) => {
        if (selectedCategory && article.category !== selectedCategory) {
          return false
        }
        if (!normalizedQuery) {
          return true
        }
        return [article.title, article.description, article.source.name, article.author]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(normalizedQuery))
      })
      .sort((a, b) => {
        if (sortOption === 'source') {
          return a.source.name.localeCompare(b.source.name)
        }
        return new Date(b.publishedAt) - new Date(a.publishedAt)
      })
  }, [articles, searchQuery, sortOption, selectedCategory])

  const toggleExpanded = (id) => {
    setExpanded((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <section className="panel news-panel card">
      <div className="panel-header">
        <div>
          <p className="panel-label">Breaking News</p>
          <h2>Mission intelligence feed</h2>
        </div>
        <div className="panel-actions news-actions">
          <button className="pill-button secondary" onClick={() => onRefreshCategory('general')} type="button">
            Refresh General
          </button>
          <button className="pill-button secondary" onClick={() => onRefreshCategory('science')} type="button">
            Refresh Science
          </button>
        </div>
      </div>

      <div className="news-controls">
        <input
          className="search-input"
          type="search"
          placeholder="Search title, source, author..."
          value={searchQuery}
          onChange={(event) => onSearch(event.target.value)}
          aria-label="Search news"
        />
        <select value={sortOption} onChange={(event) => onSort(event.target.value)} aria-label="Sort news">
          <option value="date">Sort by Date</option>
          <option value="source">Sort by Source</option>
        </select>
      </div>

      {error && (
        <div className="news-error-banner">
          <p>{error}</p>
          <button className="pill-button secondary" onClick={() => onRefreshCategory('general')} type="button">
            Retry
          </button>
        </div>
      )}

      <div className="news-list">
        {loading
          ? Array.from({ length: 5 }, (_, index) => (
              <div key={`skeleton-${index}`} className="news-row skeleton-row">
                <div className="thumbnail-skeleton" />
                <div className="news-skeleton-content">
                  <div className="line-skeleton short" />
                  <div className="line-skeleton medium" />
                  <div className="line-skeleton long" />
                </div>
              </div>
            ))
          : visibleArticles.map((article, index) => {
              const isOpen = expanded.includes(article.id)
              return (
                <article key={article.id} className={`news-row ${isOpen ? 'open' : ''}`}>
                  <button className="news-toggle" type="button" onClick={() => toggleExpanded(article.id)}>
                    <div className="thumb-wrap">
                      <img src={article.urlToImage} alt={article.title} />
                      <span className="news-badge">{index + 1}</span>
                    </div>
                    <div className="news-meta-panel">
                      <span className="news-label">{article.category}</span>
                      <h3 className="news-heading">{article.title}</h3>
                      <div className="news-meta">
                        <span>{article.source.name}</span>
                        <span>{new Date(article.publishedAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}</span>
                      </div>
                    </div>
                    <span className="expand-icon">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="news-details">
                      <p className="news-description">{article.description}</p>
                      <div className="news-detail-row">
                        <span>{article.author}</span>
                        <a href={article.url} target="_blank" rel="noreferrer" className="pill-button primary">
                          Read More
                        </a>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
      </div>
    </section>
  )
}
