import { createContext, useContext, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

const AUTH_KEY = 'blacklist_auth'
const API_KEY_STORAGE = 'api_key'

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if we have a stored API key and auth state
    const hasApiKey = !!localStorage.getItem(API_KEY_STORAGE)
    const authState = sessionStorage.getItem(AUTH_KEY)
    return hasApiKey && authState === 'true'
  })

  const login = async (apiKey) => {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return { success: false, error: 'API key is required' }
    }

    const trimmedKey = apiKey.trim()

    // Store API key temporarily to test it
    localStorage.setItem(API_KEY_STORAGE, trimmedKey)

    try {
      // Validate API key by making a test request to the backend
      await api.getHealth()

      // If successful, mark as authenticated
      setIsAuthenticated(true)
      sessionStorage.setItem(AUTH_KEY, 'true')
      return { success: true }
    } catch (error) {
      // Remove invalid API key
      localStorage.removeItem(API_KEY_STORAGE)

      if (error.response?.status === 401) {
        return { success: false, error: 'Invalid API key' }
      }
      if (error.response?.status === 403) {
        return { success: false, error: 'API key does not have required permissions' }
      }
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return { success: false, error: 'Connection timeout. Please check if the API server is running.' }
      }
      if (!error.response) {
        return { success: false, error: 'Unable to connect to API server. Please check your network connection.' }
      }
      return { success: false, error: 'Authentication failed. Please try again.' }
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(API_KEY_STORAGE)
  }

  // Validate session on mount - check if stored API key is still valid
  const validateSession = async () => {
    const apiKey = localStorage.getItem(API_KEY_STORAGE)
    if (!apiKey) {
      setIsAuthenticated(false)
      sessionStorage.removeItem(AUTH_KEY)
      return false
    }

    try {
      await api.getHealth()
      return true
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // API key is invalid, clear auth state
        setIsAuthenticated(false)
        sessionStorage.removeItem(AUTH_KEY)
        localStorage.removeItem(API_KEY_STORAGE)
        return false
      }
      // For other errors (network issues), keep the session
      return true
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, validateSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
