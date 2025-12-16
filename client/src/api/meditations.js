import { apiRequest } from './client.js'

const baseUrl = '/api/meditations'

export const getMeditations = () => apiRequest(baseUrl)

export const getMeditation = (id) => apiRequest(`${baseUrl}/${id}`)

