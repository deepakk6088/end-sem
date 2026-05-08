const MODEL_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2'
const HF_TOKEN = import.meta.env.VITE_AI_TOKEN

function buildLocalAnswer(userMessage, dashboardContext) {
  const query = userMessage.toLowerCase()
  const iss = dashboardContext?.iss
  const people = Array.isArray(dashboardContext?.people) ? dashboardContext.people : []
  const news = Array.isArray(dashboardContext?.news) ? dashboardContext.news : []
  const categoryCounts = dashboardContext?.counts?.categories || {}
  const hasAny = (keywords) => keywords.some((keyword) => query.includes(keyword))

  if (hasAny(['tracked', 'track count', 'how many positions', 'positions tracked', 'history'])) {
    if (!iss || typeof iss.trackedCount !== 'number') return 'I only know dashboard data.'
    return `Tracked positions right now: ${iss.trackedCount}.`
  }

  if (hasAny(['nearest place', 'nearest', 'nearby', 'near by'])) {
    if (!iss?.nearestPlace) return 'I only know dashboard data.'
    return `Nearest place to ISS is ${iss.nearestPlace}.`
  }

  if (hasAny(['speed', 'velocity']) && iss?.speed) {
    return `ISS speed is currently ${Number(iss.speed).toFixed(2)} km/h.`
  }

  if (hasAny(['where', 'location', 'coordinates', 'lat', 'lng', 'longitude', 'latitude', 'position']) && iss) {
    return `ISS is near ${iss.nearestPlace} at ${Number(iss.lat).toFixed(3)}, ${Number(iss.lng).toFixed(3)}.`
  }

  if (hasAny(['people', 'astronaut', 'crew'])) {
    if (!people.length) return 'I only know dashboard data.'
    const topCrew = people.slice(0, 6).map((person) => `${person.name} (${person.craft})`).join(', ')
    return `There are ${people.length} people in orbit right now. Crew includes: ${topCrew}.`
  }

  if (hasAny(['news', 'article', 'headline'])) {
    if (!news.length) return 'I only know dashboard data.'
    const topHeadlines = news.slice(0, 3).map((item, index) => `${index + 1}. ${item.title}`).join(' ')
    return `Loaded news articles: ${news.length}. Top headlines: ${topHeadlines}`
  }

  if (hasAny(['category', 'distribution'])) {
    const pairs = Object.entries(categoryCounts)
    if (!pairs.length) return 'I only know dashboard data.'
    const text = pairs.map(([name, count]) => `${name}: ${count}`).join(', ')
    return `News distribution on the dashboard is ${text}.`
  }

  if (hasAny(['summary', 'status', 'overview'])) {
    if (!iss) return 'I only know dashboard data.'
    return `ISS is near ${iss.nearestPlace} at ${Number(iss.lat).toFixed(3)}, ${Number(iss.lng).toFixed(3)} with speed ${Number(iss.speed || 0).toFixed(2)} km/h. Tracked positions: ${iss.trackedCount ?? 0}.`
  }

  return 'I only know dashboard data.'
}

function extractGeneratedText(payload) {
  if (Array.isArray(payload) && payload[0]?.generated_text) {
    return payload[0].generated_text
  }

  if (payload?.generated_text) {
    return payload.generated_text
  }

  return null
}

export async function askDashboardAssistant({ systemInstruction, userMessage, dashboardContext }) {
  if (!HF_TOKEN) {
    return buildLocalAnswer(userMessage, dashboardContext)
  }

  const input = `${systemInstruction}\n\nDashboard context:\n${JSON.stringify(dashboardContext, null, 2)}\n\nUser: ${userMessage}\nAssistant:`
  const response = await fetch(MODEL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: input,
      parameters: {
        max_new_tokens: 250,
        temperature: 0,
        top_p: 0.9,
      },
      options: {
        wait_for_model: true,
      },
    }),
  })

  const data = await response.json()
  if (!response.ok || data?.error) {
    return buildLocalAnswer(userMessage, dashboardContext)
  }

  const text = extractGeneratedText(data)
  if (!text) {
    return buildLocalAnswer(userMessage, dashboardContext)
  }

  const split = text.split('Assistant:')
  const finalAnswer = (split.length > 1 ? split.at(-1) : text).trim()
  return finalAnswer || buildLocalAnswer(userMessage, dashboardContext)
}
