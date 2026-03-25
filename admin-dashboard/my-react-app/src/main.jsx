import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useAuthStore } from "./context/AuthContext"

// 🔥 Atatus setup
import * as atatus from 'atatus-spa'

// Initialize Atatus as early as possible
atatus.config('67a24f0df2d74868ad052169e73eaa20', {
  environment: 'development', // change to 'production' in production
  enableSessionTracking: true,
  enableSPA: true
}).install()

/* 🔥 Initialize auth state (restore session) */
useAuthStore.getState().init()

// Render the React app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)