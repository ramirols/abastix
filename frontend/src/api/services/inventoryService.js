import api from '../axios'

export const inventoryService = {
  async listarMovimientos(productId = null) {
    const params = productId ? { productId } : {}
    const { data } = await api.get('/api/inventory/movements', { params })
    return data
  },

  async registrarMovimiento(payload) {
    const { data } = await api.post('/api/inventory/movements', payload)
    return data
  },
}
