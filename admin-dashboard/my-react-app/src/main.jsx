import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useAuthStore } from "./context/AuthContext"

import ErrorBoundary from './components/ErrorBoundary'

/* 🔥 Initialize auth state (restore session) */
useAuthStore.getState().init()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
