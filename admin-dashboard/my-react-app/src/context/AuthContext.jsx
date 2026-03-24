import { createContext, useContext, useState, useEffect } from "react"
import { signInWithPopup } from "firebase/auth"
import { auth, provider } from "../libs/firebase"
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
        logout()
      }
    }
    setLoading(false)
  }, [])

  // 1. Password Login (Express JWT)
  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem("admin_token",   data.token)
    localStorage.setItem("admin_user",    JSON.stringify(data.admin))
    localStorage.removeItem("auth_provider") // Default local provider
    setAdmin(data.admin)
    setIsAuthenticated(true)
  }

  // 2. Google Login (Firebase)
  const loginWithGoogle = async () => {
    // 1. Sign in via Firebase Popup
    const result  = await signInWithPopup(auth, provider)
    const idToken = await result.user.getIdToken()

    // 2. Send token to backend to get/create admin profile
    const { data } = await authAPI.firebaseLogin({ idToken })

    // 3. Store credentials
    // Note: Backend doesn't return its own JWT for Firebase users;
    // we use the Firebase ID token for subsequent requests.
    localStorage.setItem("admin_token",   idToken)
    localStorage.setItem("admin_user",    JSON.stringify(data.admin))
    localStorage.setItem("auth_provider", "firebase")
    
    setAdmin(data.admin)
    setIsAuthenticated(true)
  }

  // 3. Logout
  const logout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    localStorage.removeItem("auth_provider")
    setAdmin(null)
    setIsAuthenticated(false)
  }

  // 4. Refresh admin data
  const refreshAdmin = async () => {
    try {
      const { data } = await authAPI.me() // Using 'me' endpoint
      localStorage.setItem("admin_user", JSON.stringify(data.admin))
      setAdmin(data.admin)
    } catch (err) {
      console.error("Failed to refresh admin", err)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        loading,
        login,
        loginWithGoogle,
        logout,
        refreshAdmin
      }}
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