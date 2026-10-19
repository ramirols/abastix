import api from '../axios'

export const authService = {
  async getCsrf() {
    try {
      const { data } = await api.get('/api/auth/csrf')
      return data
    } catch {
      return null
    }
  },

  async login(email, password) {
    // Asegurar cookie CSRF previa si es posible
    await this.getCsrf()
    const { data } = await api.post('/api/auth/login', { email, password })
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
