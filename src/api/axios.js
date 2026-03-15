import axios from 'axios'

// En production (Vercel), VITE_API_URL doit pointer vers ton API Railway.
// En local, défaut localhost:5000.
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '')

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.error(
    '[Quincaillerie] VITE_API_URL est manquante. Définis-la dans Vercel (Settings → Environment Variables) avec l’URL de ton API Railway, ex: https://ton-app.railway.app/api'
  )
}

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('utilisateur')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
