import { apiRequest } from './client.js'

const baseUrl = '/api/journal'

export const getJournalEntries = () => apiRequest(baseUrl)

export const getJournalEntry = (id) => apiRequest(`${baseUrl}/${id}`)

export const createJournalEntry = (entry) =>
  apiRequest(baseUrl, { method: 'POST', payload: entry })

export const updateJournalEntry = (id, entry) =>
  apiRequest(`${baseUrl}/${id}`, { method: 'PUT', payload: entry })

export const deleteJournalEntry = (id) =>
  apiRequest(`${baseUrl}/${id}`, { method: 'DELETE' })

