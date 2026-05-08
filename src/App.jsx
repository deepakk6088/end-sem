import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import ISSPanel from './components/ISSPanel.jsx'
import SpeedChart from './components/SpeedChart.jsx'
import NewsDashboard from './components/NewsDashboard.jsx'
import NewsDistributionChart from './components/NewsDistributionChart.jsx'
import PeopleInSpace from './components/PeopleInSpace.jsx'
import Chatbot from './components/Chatbot.jsx'
import Toast from './components/Toast.jsx'
import { calculateSpeed } from './utils/calculateSpeed.js'
import {
  loadFromStorage,
  saveToStorage,
  loadFromStorageWithExpiry,
  saveToStorageWithExpiry,
} from './utils/storage.js'
import { fetchIssPosition, fetchPeopleInSpace, fetchNearestPlace } from './services/issApi.js'
import { fetchNewsByCategory } from './services/newsApi.js'
import './App.css'

function App() {
  const [theme, setTheme] = useState('light')
  const [positions, setPositions] = useState([])
  const [speedHistory, setSpeedHistory] = useState([])
  const [trackedCount, setTrackedCount] = useState(0)
  const [nearestPlace, setNearestPlace] = useState('Over ocean / remote area')
  const [issLoading, setIssLoading] = useState(false)
  const [issError, setIssError] = useState(null)
  const [autoRefreshOn, setAutoRefreshOn] = useState(true)
  const [peopleData, setPeopleData] = useState({ count: 0, people: [] })
  const [newsByCategory, setNewsByCategory] = useState({ general: [], science: [] })
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsError, setNewsError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('date')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const currentPosition = positions[0] || null

  const speed = useMemo(() => {
    if (positions.length < 2) return 0

    return calculateSpeed(
      { lat: positions[1].lat, lng: positions[1].lng },
      { lat: positions[0].lat, lng: positions[0].lng },
      positions[0].timestamp - positions[1].timestamp,
    )
  }, [positions])

  const allArticles = useMemo(() => [...newsByCategory.general, ...newsByCategory.science], [newsByCategory])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  useEffect(() => {
    const storedTheme = loadFromStorage('dashboard-theme')
    const storedPositions = loadFromStorage('iss-history')
    const storedSpeeds = loadFromStorage('iss-speed-history')
    const storedTracked = loadFromStorage('tracked-count')
    const storedPlace = loadFromStorage('nearest-place')
    const storedAuto = loadFromStorage('auto-refresh-enabled')
    const storedPeople = loadFromStorage('people-in-space')
    const storedNews = loadFromStorageWithExpiry('news-cache')

    if (storedTheme) setTheme(storedTheme)
    if (Array.isArray(storedPositions)) setPositions(storedPositions)
    if (Array.isArray(storedSpeeds)) setSpeedHistory(storedSpeeds)
    if (typeof storedTracked === 'number') setTrackedCount(storedTracked)
    if (storedPlace) setNearestPlace(storedPlace)
    if (typeof storedAuto === 'boolean') setAutoRefreshOn(storedAuto)
    if (storedPeople && typeof storedPeople === 'object') setPeopleData(storedPeople)
    if (storedNews && typeof storedNews === 'object') setNewsByCategory(storedNews)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    saveToStorage('dashboard-theme', theme)
  }, [theme])

  useEffect(() => {
    saveToStorage('auto-refresh-enabled', autoRefreshOn)
  }, [autoRefreshOn])

  const refreshPeople = useCallback(async () => {
    try {
      const result = await fetchPeopleInSpace()
      setPeopleData(result)
      saveToStorage('people-in-space', result)
    } catch (error) {
      console.error(error)
      showToast('People in space update failed', 'error')
    }
  }, [showToast])

  const refreshIssData = useCallback(async () => {
    setIssLoading(true)
    setIssError(null)

    try {
      const position = await fetchIssPosition()
      const place = await fetchNearestPlace(position.lat, position.lng)
      const newPosition = { ...position, place }
      const previousPosition = positions[0]

      setPositions((current) => {
        const next = [newPosition, ...current].slice(0, 15)
        saveToStorage('iss-history', next)
        return next
      })
      setNearestPlace(place)
      saveToStorage('nearest-place', place)

      setTrackedCount((current) => {
        const next = current + 1
        saveToStorage('tracked-count', next)
        return next
      })

      if (previousPosition) {
        const speedValue = calculateSpeed(
          { lat: previousPosition.lat, lng: previousPosition.lng },
          { lat: newPosition.lat, lng: newPosition.lng },
          newPosition.timestamp - previousPosition.timestamp,
        )

        setSpeedHistory((current) => {
          const next = [{ timestamp: newPosition.timestamp, speed: speedValue }, ...current].slice(0, 30)
          saveToStorage('iss-speed-history', next)
          return next
        })
      }

      showToast('ISS data refreshed', 'success')
    } catch (error) {
      const message = error?.message || 'Failed to load ISS data'
      setIssError(message)
      showToast(`ISS refresh failed: ${message}`, 'error')
    } finally {
      setIssLoading(false)
    }
  }, [positions, showToast])

  useEffect(() => {
    const interval = autoRefreshOn ? window.setInterval(refreshIssData, 15000) : null
    return () => {
      if (interval) window.clearInterval(interval)
    }
  }, [autoRefreshOn, refreshIssData])

  const refreshNewsCategory = useCallback(
    async (category) => {
      setNewsLoading(true)
      setNewsError(null)

      try {
        const updatedArticles = await fetchNewsByCategory(category)
        setNewsByCategory((current) => {
          const next = { ...current, [category]: updatedArticles }
          saveToStorageWithExpiry('news-cache', next, 900)
          return next
        })
        showToast('News refreshed', 'success')
      } catch (error) {
        setNewsError(error.message || 'News refresh failed')
        showToast('News update failed', 'error')
      } finally {
        setNewsLoading(false)
      }
    },
    [showToast],
  )

  const refreshAllNews = useCallback(async () => {
    setNewsLoading(true)
    setNewsError(null)

    try {
      const [general, science] = await Promise.all([
        fetchNewsByCategory('general'),
        fetchNewsByCategory('science'),
      ])
      const next = { general, science }
      setNewsByCategory(next)
      saveToStorageWithExpiry('news-cache', next, 900)
      showToast('News refreshed', 'success')
    } catch (error) {
      setNewsError(error.message || 'News refresh failed')
      showToast('News update failed', 'error')
    } finally {
      setNewsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    refreshPeople()
    refreshIssData()
    refreshAllNews()
  }, [refreshPeople, refreshIssData, refreshAllNews])

  const handleToggleTheme = () => {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light'
      showToast(`Switched to ${next} mode`, 'success')
      return next
    })
  }

  const issSummary = useMemo(() => {
    if (!currentPosition) return null
    return {
      lat: currentPosition.lat,
      lng: currentPosition.lng,
      speed,
      nearestPlace,
      trackedCount,
    }
  }, [currentPosition, speed, nearestPlace, trackedCount])

  return (
    <div className="app-root">
      <Header theme={theme} onToggleTheme={handleToggleTheme} />

      <div className="dashboard-grid top-grid">
        <ISSPanel
          currentPosition={currentPosition}
          positions={positions}
          speed={speed}
          nearestPlace={nearestPlace}
          trackedCount={trackedCount}
          loading={issLoading}
          error={issError}
          autoRefreshOn={autoRefreshOn}
          onRefresh={refreshIssData}
          onToggleAutoRefresh={() => setAutoRefreshOn((current) => !current)}
        />

        <div className="sidebar-grid">
          <SpeedChart measurements={speedHistory} />
          <PeopleInSpace
            people={peopleData.people}
            count={peopleData.count}
            loading={peopleData.people.length === 0}
            error={null}
          />
          <NewsDistributionChart
            articles={allArticles}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </div>

      <div className="content-row">
        <NewsDashboard
          articles={allArticles}
          loading={newsLoading}
          error={newsError}
          searchQuery={searchQuery}
          sortOption={sortOption}
          selectedCategory={selectedCategory}
          onSearch={setSearchQuery}
          onSort={setSortOption}
          onRefreshCategory={refreshNewsCategory}
        />
      </div>

      <Chatbot
        issSummary={issSummary}
        people={peopleData.people}
        newsArticles={allArticles}
        onToast={showToast}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

export default App
