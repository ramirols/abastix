import axios from 'axios'

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))
  return match ? decodeURIComponent(match[3]) : null
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Adjuntar token CSRF en operaciones que modifican datos
api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toUpperCase()
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const xsrfToken = getCookie('XSRF-TOKEN')
    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = xsrfToken
    }
  }
  return config
})

// Manejo centralizado de respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si la sesión expira (401) y no estamos en rutas públicas, emitir evento o manejar redirección
    if (error.response?.status === 401) {
      const path = window.location.pathname
      if (path !== '/' && path !== '/login') {
        window.dispatchEvent(new CustomEvent('abastix:unauthorized'))
      }
    }
    return Promise.reject(error)
  }
)

export default api
