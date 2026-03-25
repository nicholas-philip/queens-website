import { useEffect, useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import {  useAuthStore } from "../../context/AuthContext"
import { authAPI } from "../../libs/api"

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const admin = useAuthStore((s) => s.admin)
  const token = searchParams.get("token")

  const [status, setStatus] = useState("verifying") // "verifying" | "success" | "error"
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No verification token found in the link.")
      return
    }

    authAPI.verifyEmail({ token })
      .then(({ data }) => {
        if (data.token) {
          localStorage.setItem("admin_token", data.token)
          localStorage.setItem("admin_user", JSON.stringify(data.admin))
        }
        setStatus("success")
        setTimeout(() => navigate("/dashboard"), 2500)
      })
      .catch((err) => {
        setStatus("error")
        setMessage(err.response?.data?.message || "Verification failed. Link may have expired.")
      })
  }, [token, navigate])

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-yellow-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-amber-600/10 blur-[100px]" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{ backgroundImage: "radial-gradient(rgba(212,160,23,1) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      <div className="w-full max-w-md z-10">
        <div className="relative bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.7)] p-10 text-center overflow-hidden">
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />

          {/* Verifying */}
          {status === "verifying" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-600/10 border border-yellow-600/25 mx-auto mb-5">
                <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Verifying your email…</h2>
              <p className="text-sm text-neutral-500">Just a moment while we confirm your account.</p>
            </>
          )}

          {/* Success */}
          {status === "success" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-900/30 border border-green-700/40 mx-auto mb-5">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Email Verified! 🎉</h2>
              <p className="text-sm text-neutral-500 mb-6">
                Your account is now active. Redirecting you to the dashboard…
              </p>
              {/* Progress bar */}
              <div className="w-full bg-neutral-800 rounded-full h-1 mb-7 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-600 to-amber-400 rounded-full"
                  style={{ animation: "progress 2.5s linear forwards" }}
                />
              </div>
              <style>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-semibold text-sm shadow-[0_4px_20px_rgba(212,160,23,0.3)] transition-all duration-200"
              >
                Go to Dashboard
              </Link>
            </>
          )}

          {/* Error */}
          {status === "error" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/50 border border-red-800/40 mx-auto mb-5">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Verification Failed</h2>
              <p className="text-sm text-neutral-500 mb-7 max-w-xs mx-auto">{message}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/auth/forgot-password"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-semibold text-sm transition-all duration-200"
                >
                  Request new link
                </Link>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-semibold text-sm transition-all duration-200"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}