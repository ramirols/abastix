import api from '../axios'

export const userService = {
  async listar() {
    const { data } = await api.get('/api/users')
    return data
  },

  async obtener(id) {
    const { data } = await api.get(`/api/users/${id}`)
    return data
  },

  async crear(payload) {
    const { data } = await api.post('/api/users', payload)
    return data
  },

  async actualizar(id, payload) {
    const { data } = await api.put(`/api/users/${id}`, payload)
    return data
  },

  async desactivar(id) {
    const { data } = await api.patch(`/api/users/${id}/deactivate`)
    return data
  },

  async activar(id) {
    const { data } = await api.patch(`/api/users/${id}/activate`)
    return data
  },
}
