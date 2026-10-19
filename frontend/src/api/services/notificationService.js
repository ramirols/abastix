import api from '../axios'

export const notificationService = {
  async listar() {
    const { data } = await api.get('/api/notifications')
    return data
  },

  async marcarLeida(id) {
    const { data } = await api.put(`/api/notifications/${id}/read`)
    return data
  },

  async contarNoLeidas() {
    const { data } = await api.get('/api/notifications/unread-count')
    return data.unreadCount
  },
}
