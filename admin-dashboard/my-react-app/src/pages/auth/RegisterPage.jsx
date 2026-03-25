import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Mail, Lock, User, Loader2, Globe, AlertCircle } from "lucide-react"
import { useAuthStore } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { authAPI } from "../../libs/api"

export default function RegisterPage() {
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)

  const toast    = useToast()
  const navigate = useNavigate()

  const [showPass,      setShowPass]      = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { data: res } = await authAPI.register(data)
      toast.success(res.message || "Account created! Please verify your email.")
      navigate("/auth/login")
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate("/dashboard")
    } catch (err) {
      toast.error("Google login failed")
    } finally {
      setGoogleLoading(false)
    }
  }

  const inputCls = (err) =>
    `w-full bg-neutral-800/70 border ${err ? "border-neutral-600" : "border-neutral-700"} rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-yellow-600/60 focus:ring-2 focus:ring-yellow-600/10 transition-all`

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

      <div className="w-full max-w-md z-10 animate-fade-in">

        {/* Card */}
        <div className="relative bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-8 overflow-hidden">
          {/* Gold shimmer top edge */}
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />

          {/* Header */}
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
            <p className="text-sm text-neutral-500 mt-1">Join the Queens management team</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Nicholas Philip"
                  className={inputCls(errors.name)}
                  {...register("name", { required: "Name is required" })}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-neutral-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 pointer-events-none" />
                <input
                  type="email"
                  placeholder="admin@queens.com"
                  className={inputCls(errors.email)}
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
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className={`${inputCls(errors.password)} pr-11`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Min. 6 characters" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : "Create Account"}
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
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-white text-sm font-medium flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading
              ? <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
              : <Globe className="h-4 w-4 text-neutral-400" />
            }
            Sign up with Google
          </button>

          <p className="text-center mt-5 text-xs text-neutral-600">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}