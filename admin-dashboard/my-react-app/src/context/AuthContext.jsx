import { create } from "zustand"
import { persist } from "zustand/middleware"
import { signInWithPopup } from "firebase/auth"
import { auth, provider } from "../libs/firebase"
import { authAPI } from "../libs/api"

export const useAuthStore = create(
  persist(
    (set, get) => ({
      admin: null,
      isAuthenticated: false,
      loading: true,

      /* ── Init (runs once) ── */
      init: () => {
        const token = localStorage.getItem("admin_token")
        const raw   = localStorage.getItem("admin_user")

        if (token && raw) {
          try {
            set({
              admin: JSON.parse(raw),
              isAuthenticated: true,
              loading: false,
            })
          } catch {
            get().logout()
          }
        } else {
          set({ loading: false })
        }
      },

      /* ── Email login ── */
      login: async (email, password) => {
        try {
          set({ loading: true })

          const { data } = await authAPI.login({ email, password })

          localStorage.setItem("admin_token", data.token)
          localStorage.setItem("admin_user", JSON.stringify(data.admin))
          localStorage.removeItem("auth_provider")

          set({
            admin: data.admin,
            isAuthenticated: true,
            loading: false,
          })
        } catch (err) {
          set({ loading: false })
          throw err
        }
      },

      /* ── Google login ── */
      loginWithGoogle: async () => {
        try {
          set({ loading: true })

          const result  = await signInWithPopup(auth, provider)
          const idToken = await result.user.getIdToken()

          const { data } = await authAPI.firebaseLogin({ idToken })

          localStorage.setItem("admin_token", idToken)
          localStorage.setItem("admin_user", JSON.stringify(data.admin))
          localStorage.setItem("auth_provider", "firebase")

          set({
            admin: data.admin,
            isAuthenticated: true,
            loading: false,
          })
        } catch (err) {
          set({ loading: false })
          throw err
        }
      },

      /* ── Logout ── */
      logout: () => {
        localStorage.removeItem("admin_token")
        localStorage.removeItem("admin_user")
        localStorage.removeItem("auth_provider")

        set({
          admin: null,
          isAuthenticated: false,
          loading: false,
        })
      },

      /* ── Refresh admin ── */
      refreshAdmin: async () => {
        try {
          const { data } = await authAPI.me()

          localStorage.setItem("admin_user", JSON.stringify(data.admin))

          set({ admin: data.admin })
        } catch (err) {
          console.error("Failed to refresh admin", err)
        }
      },
    }),
    {
      name: "auth-store",

      /* Only persist safe fields */
      partialize: (state) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)