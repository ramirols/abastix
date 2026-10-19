import api from '../axios'

export const customerService = {
  async listar(active = null) {
    const params = active !== null && active !== undefined ? { active } : {}
    const { data } = await api.get('/api/customers', { params })
    return data
  },

  async obtener(id) {
    const { data } = await api.get(`/api/customers/${id}`)
    return data
  },

  async crear(payload) {
    const { data } = await api.post('/api/customers', payload)
    return data
  },

  async actualizar(id, payload) {
    const { data } = await api.put(`/api/customers/${id}`, payload)
    return data
  },

  async desactivar(id) {
    const { data } = await api.patch(`/api/customers/${id}/deactivate`)
    return data
  },

  async activar(id) {
    const { data } = await api.patch(`/api/customers/${id}/activate`)
    return data
  },

  async eliminar(id) {
    await api.delete(`/api/customers/${id}`)
  },
}
