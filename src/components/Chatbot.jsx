import { useEffect, useMemo, useState } from 'react'
import { askDashboardAssistant } from '../services/huggingFaceApi.js'
import { loadFromStorage, saveToStorage, removeFromStorage } from '../utils/storage.js'

const CHAT_STORAGE_KEY = 'dashboard-chat-history'

const systemInstruction = `You are a dashboard-only assistant. Answer only from the provided ISS and news dashboard data. If the answer is not present in the data, say exactly: I only know dashboard data.`

export default function Chatbot({ issSummary, people, newsArticles, onToast }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)
  const hasAiToken = Boolean(import.meta.env.VITE_AI_TOKEN)

  useEffect(() => {
    const savedMessages = loadFromStorage(CHAT_STORAGE_KEY, [])
    if (Array.isArray(savedMessages)) {
      setMessages(savedMessages)
    }
  }, [])

  useEffect(() => {
    saveToStorage(CHAT_STORAGE_KEY, messages.slice(-30))
  }, [messages])

  const dashboardContext = useMemo(
    () => ({
      iss: issSummary,
      people,
      news: newsArticles.map((article) => ({
        title: article.title,
        description: article.description,
        source: article.source.name,
        author: article.author,
        publishedAt: article.publishedAt,
        category: article.category,
      })),
      counts: {
        totalArticles: newsArticles.length,
        categories: newsArticles.reduce((acc, article) => {
          acc[article.category] = (acc[article.category] || 0) + 1
          return acc
        }, {}),
      },
    }),
    [issSummary, people, newsArticles],
  )

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const updatedMessages = [...messages, { role: 'user', text: trimmed }]
    setMessages(updatedMessages)
    setInput('')
    setIsTyping(true)
    setError(null)

    if (!issSummary || newsArticles.length === 0) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Dashboard data is still loading.' }])
      setIsTyping(false)
      return
    }

    try {
      const reply = await askDashboardAssistant({
        systemInstruction,
        userMessage: trimmed,
        dashboardContext,
      })
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
      onToast?.(hasAiToken ? 'Chat response received' : 'Chat running in local fallback mode', 'success')
    } catch (chatError) {
      const errorMessage = chatError?.message || 'AI assistant error. Please check your Hugging Face token and network.'
      console.error('Chatbot error:', chatError)
      setError(errorMessage)
      setMessages((prev) => [...prev, { role: 'assistant', text: errorMessage }])
      onToast?.('AI assistant error', 'error')
    } finally {
      setIsTyping(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    removeFromStorage(CHAT_STORAGE_KEY)
    onToast?.('Chat cleared', 'success')
  }

  return (
    <>
      <button className="chat-button" onClick={() => setIsOpen((value) => !value)} type="button">
        {isOpen ? '×' : 'AI'}
      </button>

      {isOpen && (
        <div className="chat-window card">
          <div className="chat-header">
            <div>
              <p className="panel-label">AI Assistant</p>
              <h3>Ask from dashboard data only</h3>
            </div>
            <div className="chat-actions">
              <button className="pill-button secondary" onClick={clearChat} type="button">
                Clear
              </button>
              <button className="pill-button secondary" onClick={() => setIsOpen(false)} type="button">
                Close
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && <p className="muted-text">Ask a question about the ISS or loaded news.</p>}
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
                <p>{message.text}</p>
              </div>
            ))}
            {isTyping && <div className="chat-bubble typing">Assistant is typing...</div>}
          </div>

          <div className="chat-input-row">
            <input
              type="text"
              aria-label="Ask dashboard question"
              placeholder="Ask from dashboard data only"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleSend()
                }
              }}
            />
            <button className="pill-button primary" onClick={handleSend} type="button" disabled={isTyping}>
              Send
            </button>
          </div>
          {!hasAiToken && (
            <p className="error-text">No `VITE_AI_TOKEN` found. Using dashboard-only local assistant mode.</p>
          )}
          {error && <p className="error-text">{error}</p>}
        </div>
      )}
    </>
  )
}
