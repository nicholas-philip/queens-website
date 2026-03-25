import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Loader2, Mail, Lock, Globe, AlertCircle } from "lucide-react"
import { useAuthStore } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { authAPI } from "../../libs/api"
import logo from "../../assets/logo.png"

export default function LoginPage() {
  // Pull actions directly from Zustand — no Provider needed
  const login          = useAuthStore((s) => s.login)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)

  const toast    = useToast()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [serverError,  setServerError]  = useState("")
  const [needsVerify,  setNeedsVerify]  = useState(false)

  const { register, handleSubmit, formState: { errors }, getValues } = useForm()

  /* ── Email / password submit ── */
  const onSubmit = async (data) => {
    setLoading(true)
    setServerError("")
    setNeedsVerify(false)
    try {
      await login(data.email, data.password)
      navigate("/dashboard")
    } catch (err) {
      const msg    = err.response?.data?.message || "Login failed."
      const action = err.response?.data?.action
      setServerError(msg)
      if (action === "VERIFY_EMAIL") setNeedsVerify(true)
    } finally {
      setLoading(false)
    }
  }

  /* ── Google login ── */
  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate("/dashboard")
    } catch (err) {
      toast.error("Google Login Failed: " + err.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  /* ── Resend verification ── */
  const resendVerification = async () => {
    const email = getValues("email")
    if (!email) return
    try {
      await authAPI.resendVerification({ email })
      toast.success("Verification email resent.")
    } catch {
      toast.error("Could not resend. Try again.")
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-yellow-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-amber-600/10 blur-[100px]" />
      </div>

      {/* Dot grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(rgba(212,160,23,1) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="w-full max-w-md z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <img
              src={logo}
              alt="Queens Admin"
              className="h-20 w-20 object-contain"
              style={{ filter: "drop-shadow(0 0 16px rgba(212,160,23,0.45))" }}
              loading="lazy"
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-1">Sign in to manage your store</p>
        </div>

        {/* Card */}
        <div className="relative bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-8 overflow-hidden">
          {/* Gold shimmer top edge */}
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />

          {/* Server error */}
          {serverError && (
            <div className="mb-5 rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-neutral-300">{serverError}</p>
                {needsVerify && (
                  <button
                    onClick={resendVerification}
                    className="mt-1 text-xs font-semibold text-yellow-500 hover:text-yellow-400 transition-colors underline-offset-2 underline"
                  >
                    Resend verification email
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 pointer-events-none" />
                <input
                  type="email"
                  placeholder="admin@store.com"
                  className={`w-full bg-neutral-800/70 border ${
                    errors.email ? "border-neutral-600" : "border-neutral-700"
                  } rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-yellow-600/60 focus:ring-2 focus:ring-yellow-600/10 transition-all`}
                  {...register("email", { required: "Email is required" })}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-neutral-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Password</label>
                <Link to="/auth/forgot-password" className="text-xs text-yellow-500 hover:text-yellow-400 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full bg-neutral-800/70 border ${
                    errors.password ? "border-neutral-600" : "border-neutral-700"
                  } rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-yellow-600/60 focus:ring-2 focus:ring-yellow-600/10 transition-all`}
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-neutral-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-neutral-900 px-3 text-xs text-neutral-600">or continue with</span>
            </div>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-white text-sm font-medium flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading
              ? <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
              : <Globe className="h-4 w-4 text-neutral-400" />
            }
            Sign in with Google
          </button>

          <p className="mt-5 text-center text-xs text-neutral-600">
            Don't have an account?{" "}
            <Link to="/auth/register" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors">
              Contact your SuperAdmin
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}