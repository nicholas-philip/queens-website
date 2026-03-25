import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useAuthStore } from "./context/AuthContext"

/* 🔥 Initialize auth state (restore session) */
useAuthStore.getState().init()
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
