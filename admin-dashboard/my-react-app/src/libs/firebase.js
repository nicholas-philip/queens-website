import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

// Queens Fashion Store Firebase Configuration
// Environment variables are loaded via Vite (VITE_ prefix required)
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase Only If Needed
const app      = initializeApp(firebaseConfig)
const auth     = getAuth(app)
const provider = new GoogleAuthProvider()

// Configure Google provider (optional scopes can be added here)
provider.setCustomParameters({ prompt: "select_account" })

export { auth, provider }
