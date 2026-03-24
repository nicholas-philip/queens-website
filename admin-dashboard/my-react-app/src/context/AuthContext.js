import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { signInWithGoogle, signOutFirebase } from "@/lib/firebase"
import { authAPI } from "../libs/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [admin,   setAdmin]   = useState(null)
  const [loading, setLoading] = useState(true)

  // Load from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem("admin_user")
    if (stored) {
      try { setAdmin(JSON.parse(stored)) }
      catch { localStorage.removeItem("admin_user") }
    }
    setLoading(false)
  }, [])

  const saveAdmin = (adminData, token, provider = null) => {
    localStorage.setItem("admin_token", token)
    localStorage.setItem("admin_user",  JSON.stringify(adminData))
    if (provider) localStorage.setItem("auth_provider", provider)
    else          localStorage.removeItem("auth_provider")
    setAdmin(adminData)
  }

  // Email + password login
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    saveAdmin(data.admin, data.token)
    navigate("/dashboard")
  }, [navigate])

  // Google login
  const loginWithGoogle = useCallback(async () => {
    const idToken = await signInWithGoogle()
    if (!idToken) throw new Error("Google sign-in cancelled.")
    const { data } = await authAPI.firebaseLogin({ idToken })
    saveAdmin(data.admin, idToken, "firebase")
    navigate("/dashboard")
  }, [navigate])

  // Logout
  const logout = useCallback(async () => {
    try { await authAPI.logout() } catch {}
    if (localStorage.getItem("auth_provider") === "firebase") await signOutFirebase()
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    localStorage.removeItem("auth_provider")
    setAdmin(null)
    navigate("/auth/login")
  }, [navigate])

  // Refresh profile
  const refreshAdmin = useCallback(async () => {
    try {
      const { data } = await authAPI.me()
      setAdmin(data.admin)
      localStorage.setItem("admin_user", JSON.stringify(data.admin))
    } catch {}
  }, [])

  return (
    <AuthContext.Provider value={{
      admin, loading,
      isAuthenticated: !!admin,
      isSuperAdmin:    admin?.role === "SuperAdmin",
      login, loginWithGoogle, logout, refreshAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)