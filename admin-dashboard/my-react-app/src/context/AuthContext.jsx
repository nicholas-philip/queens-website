import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../libs/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load admin from localStorage on mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin_user")
    const storedToken = localStorage.getItem("admin_token")

    if (storedAdmin && storedToken) {
      try {
        setAdmin(JSON.parse(storedAdmin))
        setIsAuthenticated(true)
      } catch (err) {
        console.error("Failed to parse admin user", err)
        localStorage.removeItem("admin_user")
        localStorage.removeItem("admin_token")
      }
    }
    setLoading(false)
  }, [])

  // Login
  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem("admin_token", data.token)
    localStorage.setItem("admin_user",  JSON.stringify(data.admin))
    setAdmin(data.admin)
    setIsAuthenticated(true)
  }

  // Logout
  const logout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    setAdmin(null)
    setIsAuthenticated(false)
  }

  // Refresh admin data (e.g., after email verification)
  const refreshAdmin = async () => {
    try {
      const { data } = await authAPI.getAdminProfile()
      localStorage.setItem("admin_user", JSON.stringify(data.admin))
      setAdmin(data.admin)
    } catch (err) {
      console.error("Failed to refresh admin", err)
    }
  }

  return (
    <AuthContext.Provider
      value={{ admin, isAuthenticated, loading, login, logout, refreshAdmin }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}