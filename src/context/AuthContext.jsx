import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const VALID_USERNAME = 'Admin'
const VALID_PASSWORD = 'Atoz123@'
const AUTH_KEY = 'blacklist_auth'

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = sessionStorage.getItem(AUTH_KEY)
    return stored === 'true'
  })

  const login = (username, password) => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem(AUTH_KEY, 'true')
      return { success: true }
    }
    return { success: false, error: 'Invalid username or password' }
  }

  const logout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem(AUTH_KEY)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
