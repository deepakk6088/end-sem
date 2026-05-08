const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY
const NEWS_BASE_URL = 'https://newsapi.org/v2/top-headlines'

const fallbackArticles = [
  {
    title: 'Mission control confirms nominal orbital insertion for ISS pass',
    description:
      'Telemetry remains steady and the ISS continues its planned trajectory with no anomalies detected during the last orbit.',
    source: { name: 'Orbital Intelligence' },
    author: 'Ava Stevens',
    publishedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    url: 'https://example.com/mission-control-nominal',
    urlToImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Space weather advisory issued for low-Earth orbit systems',
    description:
      'A high-latitude geomagnetic disturbance could impact radio communications for several ground stations during the next pass.',
    source: { name: 'Space Weather Daily' },
    author: 'Liam Carter',
    publishedAt: new Date(Date.now() - 36 * 60 * 1000).toISOString(),
    url: 'https://example.com/space-weather-advisory',
    urlToImage: 'https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'New telemetry analytics platform highlights ISS speed surge',
    description:
      'The latest orbital data shows a slight increase in velocity as the station crosses equatorial regions.',
    source: { name: 'Launch Desk' },
    author: 'Maya Patel',
    publishedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    url: 'https://example.com/telemetry-analytics-iss',
    urlToImage: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Ground crews monitor trajectory adjustments for upcoming ISS relay',
    description:
      'A planned orbital adjustment is scheduled after the next sun-synchronous pass over the Atlantic sector.',
    source: { name: 'Mission Updates' },
    author: 'Nora Bennett',
    publishedAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    url: 'https://example.com/trajectory-adjustments',
    urlToImage: 'https://images.unsplash.com/photo-1505236737170-3601237f0d97?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Satellite network status: no active alerts in the ISS orbital corridor',
    description:
      'Monitoring continues across primary and secondary communication channels with all assets green.',
    source: { name: 'Command Center' },
    author: 'Ethan Moore',
    publishedAt: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
    url: 'https://example.com/satellite-network-status',
    urlToImage: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=800&q=80',
  },
]

const fallbackScience = [
  {
    title: 'New payload module arrives at ISS for climate research',
    description:
      'The module is expected to begin experiments focused on polar ice melting and atmospheric composition.',
    source: { name: 'Science Bulletin' },
    author: 'Rachel Kim',
    publishedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    url: 'https://example.com/payload-module-arrives',
    urlToImage: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Cosmic ray detector on ISS begins new data collection run',
    description:
      'Researchers expect better understanding of particle flux during solar quiet periods.',
    source: { name: 'Space Tech Review' },
    author: 'Daniel Reed',
    publishedAt: new Date(Date.now() - 41 * 60 * 1000).toISOString(),
    url: 'https://example.com/cosmic-ray-detector',
    urlToImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Scientists onboard ISS test plant growth under microgravity',
    description:
      'Early results show promising adaptation in nutrient uptake for the next generation of agriculture systems.',
    source: { name: 'Lab Weekly' },
    author: 'Sofia Ramirez',
    publishedAt: new Date(Date.now() - 67 * 60 * 1000).toISOString(),
    url: 'https://example.com/plant-growth-microgravity',
    urlToImage: 'https://images.unsplash.com/photo-1508154048109-de555266b220?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'AI-assisted orbital prediction improves ISS collision avoidance',
    description:
      'A new model is reducing false positives and improving response time for debris conjunction warnings.',
    source: { name: 'Tech Orbit' },
    author: 'Jason Lee',
    publishedAt: new Date(Date.now() - 102 * 60 * 1000).toISOString(),
    url: 'https://example.com/ai-orbital-prediction',
    urlToImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Quantum experiment aboard ISS enters second phase',
    description:
      'The team is now analyzing entanglement stability under orbital radiation conditions.',
    source: { name: 'Quantum Frontier' },
    author: 'Aiden Shaw',
    publishedAt: new Date(Date.now() - 148 * 60 * 1000).toISOString(),
    url: 'https://example.com/quantum-experiment-iss',
    urlToImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
  },
]

function normalizeArticle(article, category, index) {
  return {
    id: `${category}-${index}-${article.publishedAt ?? Date.now()}`,
    title: article.title || 'Untitled report',
    description: article.description || 'No description available.',
    source: article.source || { name: 'Unknown source' },
    author: article.author || 'Unknown author',
    publishedAt: article.publishedAt || new Date().toISOString(),
    url: article.url || '#',
    urlToImage: article.urlToImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    category,
  }
}

async function fetchCategory(category) {
  if (!NEWS_API_KEY) {
    return category === 'science'
      ? fallbackScience.map((article, index) => normalizeArticle(article, 'Science', index))
      : fallbackArticles.map((article, index) => normalizeArticle(article, 'General', index))
  }

  const url = `${NEWS_BASE_URL}?country=us&pageSize=5&category=${category}&apiKey=${NEWS_API_KEY}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`News API error: ${response.status}`)
  }

  const data = await response.json()
  if (!Array.isArray(data.articles)) {
    throw new Error('News API returned unexpected results')
  }

  return data.articles.map((article, index) => normalizeArticle(article, category === 'science' ? 'Science' : 'General', index))
}

export async function fetchNewsByCategory(category) {
  if (category !== 'general' && category !== 'science') {
    throw new Error('Unsupported news category')
  }
  return fetchCategory(category)
}
