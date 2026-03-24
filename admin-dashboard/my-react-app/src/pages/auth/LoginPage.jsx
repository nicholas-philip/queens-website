import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Store, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { authAPI } from "@/lib/api"

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const toast   = useToast()
  const navigate = useNavigate()

  const [showPass,      setShowPass]      = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [serverError,   setServerError]   = useState("")
  const [needsVerify,   setNeedsVerify]   = useState(false)

  const { register, handleSubmit, formState: { errors }, getValues } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError("")
    setNeedsVerify(false)
    try {
      await login(data.email, data.password)
    } catch (err) {
      const msg    = err.response?.data?.message || "Login failed."
      const action = err.response?.data?.action
      setServerError(msg)
      if (action === "VERIFY_EMAIL") setNeedsVerify(true)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch (err) {
      toast.error("Google Login Failed", err.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  const resendVerification = async () => {
    const email = getValues("email")
    if (!email) return
    try {
      await authAPI.resendVerification({ email })
      toast.success("Email Sent", "Verification email resent. Check your inbox.")
    } catch {
      toast.error("Failed", "Could not resend. Try again.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 mb-4">
            <Store className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Error alert */}
          {serverError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-700">{serverError}</p>
              {needsVerify && (
                <button onClick={resendVerification}
                  className="mt-1 text-xs font-semibold text-red-700 underline underline-offset-2">
                  Resend verification email
                </button>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                placeholder="admin@store.com"
                className={`input ${errors.email ? "border-red-400 focus:ring-red-400" : ""}`}
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Password</label>
                <Link to="/auth/forgot-password" className="text-xs text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input pr-10 ${errors.password ? "border-red-400 focus:ring-red-400" : ""}`}
                  {...register("password", { required: "Password is required" })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">or continue with</span></div>
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading}
            className="btn-secondary w-full py-2.5 gap-3">
            {googleLoading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
            }
            Sign in with Google
          </button>

          <p className="mt-5 text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link to="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact your SuperAdmin
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}