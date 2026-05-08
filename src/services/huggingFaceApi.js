const MODEL_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2'
const HF_TOKEN = import.meta.env.VITE_AI_TOKEN

export async function askDashboardAssistant({ systemInstruction, userMessage, dashboardContext }) {
  if (!HF_TOKEN) {
    throw new Error('Missing Hugging Face token')
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
    }),
  })

  if (!response.ok) {
    throw new Error('AI service failed')
  }

  const data = await response.json()
  const text = Array.isArray(data) ? data[0]?.generated_text : data.generated_text
  if (!text) {
    throw new Error('AI response missing')
  }

  return text.trim()
}
