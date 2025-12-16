import { api } from './axios.js'

const getErrorMessage = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Request failed'
  return message
}

export const apiRequest = async (url, { method = 'GET', payload, token } = {}) => {
  try {
    const response = await api.request({
      url,
      method,
      data: payload,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

