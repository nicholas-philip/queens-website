import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Mail, Lock, User, Loader2, Globe } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"

export default function RegisterPage() {
  const { loginWithGoogle } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
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
      toast.success("Welcome to Queens!")
      navigate("/dashboard")
    } catch (err) {
      toast.error("Google login failed")
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Backdrops */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-yellow-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-amber-600/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md z-10 scale-in-center">
        {/* Card */}
        <div className="relative bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl shadow-[0_8px_48px_rgba(0,0,0,0.5)] p-8 overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Create Admin Account</h1>
            <p className="text-sm text-neutral-500">Join the Queens management team</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within:text-yellow-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Nicholas Philip"
                  className={`w-full bg-neutral-800/50 border ${errors.name ? "border-red-500/50" : "border-neutral-700 focus:border-yellow-600/50"} rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all focus:ring-4 focus:ring-yellow-600/5`}
                  {...register("name", { required: "Name is required" })}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within:text-yellow-500 transition-colors" />
                <input
                  type="email"
                  placeholder="admin@queens.com"
                  className={`w-full bg-neutral-800/50 border ${errors.email ? "border-red-500/50" : "border-neutral-700 focus:border-yellow-600/50"} rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all focus:ring-4 focus:ring-yellow-600/5`}
                  {...register("email", { required: "Email is required" })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within:text-yellow-500 transition-colors" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full bg-neutral-800/50 border ${errors.password ? "border-red-500/50" : "border-neutral-700 focus:border-yellow-600/50"} rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all focus:ring-4 focus:ring-yellow-600/5`}
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min. 6 characters" } })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-bold text-sm shadow-[0_0_20px_rgba(212,160,23,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-800"></div></div>
            <span className="relative bg-[#171717] px-3 text-[10px] uppercase font-bold text-neutral-600 tracking-widest">or continue with</span>
          </div>

          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
          >
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4 text-neutral-400" />}
            Sign up with Google
          </button>

          <p className="text-center mt-8 text-sm text-neutral-500">
            Already have an account? <Link to="/auth/login" className="text-yellow-500 hover:text-yellow-400 font-semibold underline-offset-4 hover:underline transition-all">Sign In</Link>
          </p>
        </div>
      </div>

      <style>{`
        .scale-in-center { animation: scale-in-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
        @keyframes scale-in-center { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}
