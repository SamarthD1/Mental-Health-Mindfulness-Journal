import { api } from './axios.js'

export const getMoodTrend = async (params = {}) => {
  const { data } = await api.get('/api/insights/mood-trend', { params })
  return data
}

export const getMoodDistribution = async (params = {}) => {
  const { data } = await api.get('/api/insights/mood-distribution', { params })
  return data
}

