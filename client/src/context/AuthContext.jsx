import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../api/client.js'
import { setAuthHeader } from '../api/axios.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'mhj_auth'

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { token: null, user: null }
    return JSON.parse(raw)
  } catch {
    return { token: null, user: null }
  }
}

const writeStoredAuth = (token, user) => {
  if (!token) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
}

export const AuthProvider = ({ children }) => {
  const [{ token, user }, setAuth] = useState(() => readStoredAuth())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    writeStoredAuth(token, user)
    setAuthHeader(token)
  }, [token, user])

  const clearAuth = useCallback(() => {
    setAuth({ token: null, user: null })
    writeStoredAuth(null, null)
    setAuthHeader(null)
  }, [])

  const handleAuthResponse = useCallback(async (url, payload) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiRequest(url, { method: 'POST', payload })
      const nextToken = data?.token || null
      const nextUser = data?.user || null
      setAuth({ token: nextToken, user: nextUser })
      return { token: nextToken, user: nextUser }
    } catch (err) {
      const message = err?.message || 'Authentication failed'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(
    (payload) => handleAuthResponse('/api/auth/login', payload),
    [handleAuthResponse],
  )

  const register = useCallback(
    (payload) => handleAuthResponse('/api/auth/register', payload),
    [handleAuthResponse],
  )

  const logout = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      loading,
      error,
      login,
      register,
      logout,
    }),
    [user, token, loading, error, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

