import { apiRequest } from './client.js'

const baseUrl = '/api/goals'

export const getGoals = () => apiRequest(baseUrl)

export const createGoal = (goal) => apiRequest(baseUrl, { method: 'POST', payload: goal })

export const updateGoal = (id, goal) =>
  apiRequest(`${baseUrl}/${id}`, { method: 'PUT', payload: goal })

export const deleteGoal = (id) => apiRequest(`${baseUrl}/${id}`, { method: 'DELETE' })

