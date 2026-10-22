import axios from 'axios'

export function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))
  return match ? decodeURIComponent(match[3]) : null
}

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL
// Si se especifica VITE_API_BASE_URL (incluso vacio "" para Docker/Nginx same-origin), se respeta.
// Si no: en produccion usa el mismo origen (proxy /api de Vercel) y en desarrollo http://localhost:8088
const apiBaseUrl =
  typeof rawBaseUrl === 'string' ? rawBaseUrl : import.meta.env.PROD ? '' : 'http://localhost:8088'

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
  },
})

let csrfPromise = null

export async function initCsrf() {
  if (!csrfPromise) {
    csrfPromise = axios
      .get(`${apiBaseUrl}/api/auth/csrf`, { withCredentials: true })
      .finally(() => {
        csrfPromise = null
      })
  }
  return csrfPromise
}

// Adjuntar token CSRF en operaciones que modifican datos
api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toUpperCase()
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const isPublicAuth =
      config.url?.includes('/api/auth/login') || config.url?.includes('/api/auth/refresh')
    if (!isPublicAuth && !getCookie('XSRF-TOKEN')) {
      try {
        await initCsrf()
      } catch {
        // Continuar si falla la peticion de inicializacion
      }
    }

    const xsrfToken = getCookie('XSRF-TOKEN')
    if (xsrfToken && !config.headers['X-XSRF-TOKEN']) {
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
