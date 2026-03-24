import { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      removeToast(id)
    }, 3000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((message) => addToast(message, "success"), [addToast])
  const error   = useCallback((message) => addToast(message, "error"),   [addToast])
  const warning = useCallback((message) => addToast(message, "warning"), [addToast])
  const info    = useCallback((message) => addToast(message, "info"),    [addToast])

  return (
    <ToastContext.Provider
      value={{ toasts, success, error, warning, info, removeToast }}
    >
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
