import { create } from "zustand"
import { persist } from "zustand/middleware"
import { signInWithPopup } from "firebase/auth"
import { auth, provider } from "../libs/firebase"
import { authAPI } from "../libs/api"

export const useAuthStore = create(
  persist(
    (set, get) => ({
      admin:           null,
      isAuthenticated: false,
      loading:         true,     // true until init() completes

      /* ── Init — call once at app startup ── */
      init: async () => {
        try {
          // 1. Check if this is a post-redirect Google login (mobile fallback)
          const { getRedirectResult } = await import("firebase/auth")
          const result = await getRedirectResult(auth).catch(() => null)

          if (result?.user) {
            // Force-fresh token after redirect
            const idToken = await result.user.getIdToken(true)
            const { data } = await authAPI.firebaseLogin({ idToken })

            localStorage.setItem("admin_token",  idToken)
            localStorage.setItem("admin_user",   JSON.stringify(data.admin))
            localStorage.setItem("auth_provider","firebase")

            set({ admin: data.admin, isAuthenticated: true, loading: false })
            return
          }
        } catch (err) {
          console.warn("Redirect result error:", err.message)
        }

        // 2. Restore session from localStorage
        const token    = localStorage.getItem("admin_token")
        const raw      = localStorage.getItem("admin_user")
        const provider = localStorage.getItem("auth_provider")

        if (token && raw) {
          try {
            const saved = JSON.parse(raw)

            if (provider === "firebase") {
              try {
                const freshToken = await auth.currentUser?.getIdToken(true)
                if (freshToken) localStorage.setItem("admin_token", freshToken)
              } catch {}
            }

            // Optimistic auth state
            set({ admin: saved, isAuthenticated: true })

            // Fetch fresh profile from DB to synchronize RBAC permissions
            try {
              const { data } = await authAPI.me()
              localStorage.setItem("admin_user", JSON.stringify(data.admin))
              set({ admin: data.admin, loading: false })
            } catch (err) {
              set({ loading: false })
            }
          } catch {
            // Corrupt state — clear it
            get().logout()
          }
        } else {
          set({ loading: false })
        }
      },

      /* ── Email / password login ── */
      login: async (email, password) => {
        set({ loading: true })
        try {
          const { data } = await authAPI.login({ email, password })

          localStorage.setItem("admin_token", data.token)
          localStorage.setItem("admin_user",  JSON.stringify(data.admin))
          localStorage.removeItem("auth_provider")

          set({ admin: data.admin, isAuthenticated: true, loading: false })
        } catch (err) {
          set({ loading: false })
          throw err
        }
      },

      /* ── Google / Firebase login ── */
      loginWithGoogle: async () => {
        set({ loading: true })
        try {
          const result  = await signInWithPopup(auth, provider)
          const idToken = await result.user.getIdToken()

          const { data } = await authAPI.firebaseLogin({ idToken })

          localStorage.setItem("admin_token",  idToken)
          localStorage.setItem("admin_user",   JSON.stringify(data.admin))
          localStorage.setItem("auth_provider","firebase")

          set({ admin: data.admin, isAuthenticated: true, loading: false })
        } catch (err) {
          // Popup blocked or closed — fall back to redirect (works in all mobile browsers)
          if (
            err.code === "auth/popup-blocked" ||
            err.code === "auth/popup-closed-by-user" ||
            err.message?.includes("Cross-Origin-Opener-Policy")
          ) {
            const { signInWithRedirect } = await import("firebase/auth")
            await signInWithRedirect(auth, provider)
            // Page will redirect — no need to update loading state
            return
          }
          set({ loading: false })
          throw err
        }
      },

      /* ── Logout ── */
      logout: () => {
        localStorage.removeItem("admin_token")
        localStorage.removeItem("admin_user")
        localStorage.removeItem("auth_provider")

        // Sign out of Firebase if applicable
        auth.signOut?.().catch(() => {})

        set({ admin: null, isAuthenticated: false, loading: false })
      },

      /* ── Refresh admin profile from server ── */
      refreshAdmin: async () => {
        try {
          const { data } = await authAPI.me()
          localStorage.setItem("admin_user", JSON.stringify(data.admin))
          set({ admin: data.admin })
        } catch (err) {
          console.warn("Could not refresh admin profile:", err.message)
        }
      },

      /* ── Update admin locally (e.g. after settings save) ── */
      updateAdmin: (patch) => {
        const current = get().admin
        if (!current) return
        const updated = { ...current, ...patch }
        localStorage.setItem("admin_user", JSON.stringify(updated))
        set({ admin: updated })
      },
    }),
    {
      name: "queens-auth",

      // Only persist safe, non-sensitive fields
      partialize: (state) => ({
        admin:           state.admin,
        isAuthenticated: state.isAuthenticated,
        // Do NOT persist `loading` — always starts from `true` to prevent flash
      }),

      // After rehydration ensure loading is reset correctly
      onRehydrateStorage: () => (state) => {
        if (state) state.loading = true
      },
    }
  )
)