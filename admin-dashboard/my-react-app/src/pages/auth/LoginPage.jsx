import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
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
    <div className="min-h-[100dvh] bg-base-100 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient glows (Hidden on mobile to protect Safari performance) */}
      <div className="pointer-events-none fixed inset-0 z-0 hidden lg:block">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl opacity-50" />
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
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Admin Dashboard</h1>
          <p className="text-base-content/60 text-sm mt-1">Sign in to manage your store</p>
        </div>

        {/* Card */}
        <div className="relative bg-base-200 border border-base-300 rounded-2xl p-8 overflow-hidden shadow-2xl">
          {/* Gold shimmer top edge */}
          <div className="absolute top-0 left-[10%] right-[10%] h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent" />

          {/* Server error */}
          {serverError && (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-500 font-medium">{serverError}</p>
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
              <label className="block text-[10px] font-bold text-base-content/60 uppercase tracking-widest mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50 pointer-events-none" />
                <input
                  type="email"
                  placeholder="admin@store.com"
                  className={`w-full bg-base-100 border ${
                    errors.email ? "border-red-500" : "border-base-300"
                  } rounded-xl pl-10 pr-4 py-2.5 text-sm text-base-content placeholder-base-content/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
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
                <label className="text-[10px] font-bold text-base-content/60 uppercase tracking-widest">Password</label>
                <Link to="/auth/forgot-password" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full bg-base-100 border ${
                    errors.password ? "border-red-500" : "border-base-300"
                  } rounded-xl pl-10 pr-11 py-2.5 text-sm text-base-content placeholder-base-content/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
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
              className="w-full mt-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-content font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-base-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-base-200 px-3 text-xs text-base-content/60">or continue with</span>
            </div>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-2.5 rounded-xl bg-base-100 hover:bg-base-300 border border-base-300 text-base-content text-sm font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm group"
          >
            {googleLoading
              ? <Loader2 className="h-5 w-5 animate-spin text-primary" />
              : <FcGoogle className="h-5 w-5 group-hover:scale-110 transition-transform" />
            }
            <span>Sign in with Google</span>
          </button>

          <p className="mt-5 text-center text-xs text-base-content/60 leading-relaxed">
            Don't have an account or lost your credentials? <br />
            <span className="text-primary/70 font-semibold italic">Contact your SuperAdmin for an invitation.</span>
          </p>
        </div>
      </div>
    </div>
  )
}