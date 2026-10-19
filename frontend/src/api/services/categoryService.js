import api from '../axios'

export const categoryService = {
  async listar(active = null) {
    const params = active !== null && active !== undefined ? { active } : {}
    const { data } = await api.get('/api/categories', { params })
    return data
  },

  async crear(payload) {
    const { data } = await api.post('/api/categories', payload)
    return data
  },

  async actualizar(id, payload) {
    const { data } = await api.put(`/api/categories/${id}`, payload)
    return data
  },

  async desactivar(id) {
    const { data } = await api.patch(`/api/categories/${id}/deactivate`)
    return data
  },

  async activar(id) {
    const { data } = await api.patch(`/api/categories/${id}/activate`)
    return data
  },

  async eliminar(id) {
    await api.delete(`/api/categories/${id}`)
  },
}
