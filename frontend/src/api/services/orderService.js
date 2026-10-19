import api from '../axios'

export const orderService = {
  async listar(status = null, customerId = null) {
    const params = {}
    if (status) params.status = status
    if (customerId) params.customerId = customerId
    const { data } = await api.get('/api/orders', { params })
    return data
  },

  async obtener(id) {
    const { data } = await api.get(`/api/orders/${id}`)
    return data
  },

  async crear(payload) {
    const { data } = await api.post('/api/orders', payload)
    return data
  },

  async cambiarEstado(id, status) {
    const { data } = await api.put(`/api/orders/${id}/status`, { status })
    return data
  },
}
