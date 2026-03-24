import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Store, Loader2 } from "lucide-react"

import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { authAPI } from "../../libs/api"

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [serverError, setServerError] = useState("")
  const [needsVerify, setNeedsVerify] = useState(false)

  const { register, handleSubmit, formState: { errors }, getValues } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError("")
    setNeedsVerify(false)

    try {
      await login(data.email, data.password)
      navigate("/dashboard") // Redirect after successful login
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed."
      const action = err.response?.data?.action
      setServerError(msg)
      if (action === "VERIFY_EMAIL") setNeedsVerify(true)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate("/dashboard")
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

  // Reusable Input Field
  const InputField = ({ label, type, placeholder, name, error, showToggle }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="label mb-0">{label}</label>
        {name === "password" && (
          <Link to="/auth/forgot-password" className="text-xs text-blue-600 hover:text-blue-700">
            Forgot password?
          </Link>
        )}
      </div>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          className={`input w-full ${error ? "border-red-400 focus:ring-red-400" : ""} ${showToggle ? "pr-10" : ""}`}
          {...register(name, { required: `${label} is required` })}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
    </div>
  )

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

          {/* Error Alert */}
          {serverError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-700">{serverError}</p>
              {needsVerify && (
                <button
                  onClick={resendVerification}
                  className="mt-1 text-xs font-semibold text-red-700 underline underline-offset-2"
                >
                  Resend verification email
                </button>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              label="Email address"
              type="email"
              placeholder="admin@store.com"
              name="email"
              error={errors.email}
            />
            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              name="password"
              error={errors.password}
              showToggle
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in...</> : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-slate-400">or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="btn-secondary w-full py-2.5 gap-3 flex items-center justify-center"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <img src="/icons/google.svg" alt="Google Logo" className="h-4 w-4" />
            )}
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