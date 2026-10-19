import api from '../axios'

export const dashboardService = {
  async getStats() {
    const { data } = await api.get('/api/dashboard/stats')
    return data
  },
}
