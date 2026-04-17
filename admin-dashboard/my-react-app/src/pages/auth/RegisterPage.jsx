import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Mail, Lock, User, Loader2, AlertCircle } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { useAuthStore } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { authAPI } from "../../libs/api"
import logo from "../../assets/logo.png"

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
      
      // Save credentials to localStorage for auto-login
      localStorage.setItem("admin_token", res.token)
      localStorage.setItem("admin_user",  JSON.stringify(res.admin))
      localStorage.removeItem("auth_provider")

      // Update Zustand store so the entire app knows we are authenticated
      useAuthStore.setState({ 
        admin:           res.admin, 
        isAuthenticated: true, 
        loading:         false 
      })

      toast.success(res.message || "Account created!")
      navigate("/dashboard")
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
    <div className="min-h-[100dvh] bg-base-100 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient glows (Hidden on mobile to protect Safari) */}
      <div className="pointer-events-none fixed inset-0 z-0 hidden lg:block">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl opacity-50" />
      </div>

      {/* Dot grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(var(--color-primary) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="w-full max-w-md z-10 animate-fade-in">

        {/* Card */}
        <div className="relative bg-base-200 border border-base-300 rounded-2xl p-8 overflow-hidden shadow-2xl">
          {/* Gold shimmer top edge */}
          <div className="absolute top-0 left-[10%] right-[10%] h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-block mb-3">
              <img
                src={logo}
                alt="Queens Fashion Store Admin"
                className="h-14 w-14 object-contain"
                style={{ filter: "drop-shadow(0 0 12px rgba(212,160,23,0.4))" }}
                loading="lazy"
              />
            </div>
            <h1 className="text-2xl font-bold text-base-content tracking-tight">Create Account</h1>
            <p className="text-sm text-base-content/60 mt-0.5">Join the Queens Fashion Store management team</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-base-content/60 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Nicholas Philip"
                  className={`w-full bg-base-100 border ${errors.name ? "border-red-500" : "border-base-300"} rounded-xl pl-10 pr-4 py-2.5 text-sm text-base-content placeholder-base-content/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                  {...register("name", { required: "Name is required" })}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3 w-3" /> {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-base-content/60 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50 pointer-events-none" />
                <input
                  type="email"
                  placeholder="admin@queens.com"
                  className={`w-full bg-base-100 border ${errors.email ? "border-red-500" : "border-base-300"} rounded-xl pl-10 pr-4 py-2.5 text-sm text-base-content placeholder-base-content/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                  {...register("email", { required: "Email is required" })}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3 w-3" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-base-content/60 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50 pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full bg-base-100 border ${errors.password ? "border-red-500" : "border-base-300"} rounded-xl pl-10 pr-11 py-2.5 text-sm text-base-content placeholder-base-content/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Min. 6 characters" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
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
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : "Create Account"}
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
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-2.5 rounded-xl bg-base-100 hover:bg-base-300 border border-base-300 text-base-content text-sm font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm group"
          >
            {googleLoading
              ? <Loader2 className="h-5 w-5 animate-spin text-primary" />
              : <FcGoogle className="h-5 w-5 group-hover:scale-110 transition-transform" />
            }
            <span>Sign up with Google</span>
          </button>

          <p className="text-center mt-5 text-xs text-base-content/60">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
