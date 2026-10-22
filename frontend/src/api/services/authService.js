import api, { initCsrf } from '../axios'

export const authService = {
  async getCsrf() {
    try {
      const { data } = await initCsrf()
      return data
    } catch {
      return null
    }
  },

  async login(email, password) {
    // Asegurar cookie CSRF previa
    await this.getCsrf()
    const { data } = await api.post('/api/auth/login', { email, password })
    // Refrescar cookie CSRF tras autenticación
    await this.getCsrf()
    return data.user
  },

  async logout() {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // Ignorar error si la sesión ya no era válida en servidor
    }
  },

  async getMe() {
    const { data } = await api.get('/api/auth/me')
    return data
  },
}
