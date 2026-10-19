import api from '../axios'

export const productService = {
  async listar(active = null) {
    const params = active !== null && active !== undefined ? { active } : {}
    const { data } = await api.get('/api/products', { params })
    return data
  },

  async obtener(id) {
    const { data } = await api.get(`/api/products/${id}`)
    return data
  },

  async crear(payload) {
    const { data } = await api.post('/api/products', payload)
    return data
  },

  async actualizar(id, payload) {
    const { data } = await api.put(`/api/products/${id}`, payload)
    return data
  },

  async desactivar(id) {
    const { data } = await api.patch(`/api/products/${id}/deactivate`)
    return data
  },

  async activar(id) {
    const { data } = await api.patch(`/api/products/${id}/activate`)
    return data
  },

  async eliminar(id) {
    await api.delete(`/api/products/${id}`)
  },
}
