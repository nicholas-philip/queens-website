import { useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, KeyRound, Lock, Loader2, ArrowLeft } from "lucide-react"
import { authAPI } from "../../libs/api"
import { useToast } from "../../context/ToastContext"

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const token = searchParams.get("token")

  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async ({ newPassword }) => {
    if (!token) { setError("Invalid reset link."); return }
    setLoading(true)
    setError("")
    try {
      await authAPI.resetPassword({ token, newPassword })
      toast.success("Password reset! You can now log in with your new password.")
      navigate("/auth/login")
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Link may have expired.")
    } finally {
      setLoading(false)
    }
  }

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
        <div className="relative bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.7)] p-8 overflow-hidden">
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />

          <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-yellow-500 transition-colors mb-7">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>

          {/* Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-600/10 border border-yellow-600/25 mb-5">
            <KeyRound className="h-5 w-5 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Set new password</h2>
          <p className="text-sm text-neutral-500 mb-6">Choose a strong password for your account.</p>

          {error && (
            <div className="mb-5 rounded-xl bg-red-950/60 border border-red-800/50 px-4 py-3 text-sm text-red-400">
              ⚠ {error}
            </div>
          )}

          {!token ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-400 mb-5">Invalid or missing reset token.</p>
              <Link
                to="/auth/forgot-password"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-500 text-black font-semibold text-sm shadow-[0_4px_20px_rgba(212,160,23,0.3)] transition-all duration-200"
              >
                Request new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    className={`w-full bg-neutral-800/70 border ${errors.newPassword ? "border-red-500/60" : "border-neutral-700 focus:border-yellow-600/70"} rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:ring-2 focus:ring-yellow-600/10 transition-all`}
                    {...register("newPassword", {
                      required: "Password is required",
                      minLength: { value: 6, message: "At least 6 characters" },
                    })}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && <p className="mt-1.5 text-xs text-red-400">⚠ {errors.newPassword.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat password"
                    className={`w-full bg-neutral-800/70 border ${errors.confirm ? "border-red-500/60" : "border-neutral-700 focus:border-yellow-600/70"} rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:ring-2 focus:ring-yellow-600/10 transition-all`}
                    {...register("confirm", {
                      required: "Please confirm your password",
                      validate: (v) => v === watch("newPassword") || "Passwords do not match",
                    })}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirm && <p className="mt-1.5 text-xs text-red-400">⚠ {errors.confirm.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm shadow-[0_4px_20px_rgba(212,160,23,0.3)] hover:shadow-[0_4px_28px_rgba(212,160,23,0.5)] transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting…</> : "Reset password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
