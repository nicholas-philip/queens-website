import { createContext, useContext, useState, useCallback, useRef, useMemo } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

const ToastContext = createContext(null)

const icons = {
  success: <CheckCircle  className="h-4 w-4 text-green-400 shrink-0" />,
  error:   <AlertCircle  className="h-4 w-4 text-red-400   shrink-0" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />,
  info:    <Info         className="h-4 w-4 text-gold shrink-0" />,
}

const bars = {
  success: "bg-green-400",
  error:   "bg-red-400",
  warning: "bg-yellow-400",
  info:    "bg-gold",
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    timers.current[id] = setTimeout(() => removeToast(id), duration)
    return id
  }, [removeToast])

  const success = useCallback((titleOrMsg, msg) => addToast(msg || titleOrMsg, "success"), [addToast])
  const error   = useCallback((titleOrMsg, msg) => addToast(msg || titleOrMsg, "error"),   [addToast])
  const warning = useCallback((titleOrMsg, msg) => addToast(msg || titleOrMsg, "warning"), [addToast])
  const info    = useCallback((titleOrMsg, msg) => addToast(msg || titleOrMsg, "info"),    [addToast])

  const contextValue = useMemo(() => ({
    success, error, warning, info, addToast, removeToast
  }), [success, error, warning, info, addToast, removeToast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-[#0f0e0c] border border-white/10 rounded-xl shadow-2xl shadow-black px-4 py-3 relative overflow-hidden"
            style={{ animation: "slideInRight 0.25s ease" }}
          >
            {icons[toast.type]}
            <p className="text-sm font-bold text-white leading-snug flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/40 hover:text-white transition-colors shrink-0 mt-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {/* Progress bar */}
            <div className={`absolute bottom-0 left-0 h-0.5 ${bars[toast.type]} animate-progress-bar`} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes progress-bar {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .animate-progress-bar {
          animation: progress-bar 4s linear forwards;
        }
      `}</style>
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
