import { X } from "lucide-react"
import { useEffect } from "react"
import { cn } from "../libs/utils"

export default function Modal({ open, onClose, title, children, size = "md", footer }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={cn(
        "w-full bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.7)] flex flex-col max-h-[90vh] relative overflow-hidden",
        sizes[size]
      )}>
        {/* Gold top edge */}
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-yellow-500/70 to-transparent" />

        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-200 transition-colors rounded-lg p-1 hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-all disabled:opacity-50"
        >
          {loading ? "Please wait…" : confirmLabel}
        </button>
      </>}
    >
      <p className="text-sm text-neutral-400">{message}</p>
    </Modal>
  )
}