import { createContext, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

// ─── Context ────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ─── Style maps ─────────────────────────────────────────────────────────────
const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  default: Info,
};

const borderColors = {
  success: "#22c55e",   // green-500
  error:   "#ef4444",   // red-500
  info:    "#3b82f6",   // blue-500
  default: "#cbd5e1",   // slate-300
};

const iconColors = {
  success: "#16a34a",   // green-600
  error:   "#dc2626",   // red-600
  info:    "#2563eb",   // blue-600
  default: "#94a3b8",   // slate-400
};

// ─── Custom Toast UI ─────────────────────────────────────────────────────────
function CustomToast({ t, title, message, type = "default" }) {
  const Icon = icons[type] || icons.default;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        borderLeft: `4px solid ${borderColors[type]}`,
        padding: "14px 16px",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        minWidth: "300px",
        maxWidth: "380px",
        opacity: t.visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <Icon
        size={20}
        style={{ color: iconColors[type], flexShrink: 0, marginTop: "2px" }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
            {title}
          </p>
        )}
        {message && (
          <p style={{ margin: title ? "2px 0 0" : 0, fontSize: "13px", color: "#64748b" }}>
            {message}
          </p>
        )}
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          flexShrink: 0,
          color: "#94a3b8",
          lineHeight: 1,
        }}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Push helper ─────────────────────────────────────────────────────────────
function push(title, message, type = "default") {
  toast.custom(
    (t) => <CustomToast t={t} title={title} message={message} type={type} />,
    { duration: 4500 }
  );
}

// ─── Public API ──────────────────────────────────────────────────────────────
const toastAPI = {
  success: (title, message) => push(title, message, "success"),
  error:   (title, message) => push(title, message, "error"),
  info:    (title, message) => push(title, message, "info"),
  show:    (title, message) => push(title, message, "default"),
};

// ─── Provider ────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  return (
    <ToastContext.Provider value={toastAPI}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{ style: { background: "transparent", boxShadow: "none", padding: 0 } }}
      />
    </ToastContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};
