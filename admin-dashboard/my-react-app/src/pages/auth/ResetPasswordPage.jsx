import { useState }                          from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { useForm }                            from "react-hook-form"
import { Eye, EyeOff, KeyRound, Loader2 }    from "lucide-react"
import { authAPI }                            from "../../libs/api"
import { useToast }                           from "../../context/ToastContext"

export default function ResetPasswordPage() {
  const [searchParams]  = useSearchParams()
  const navigate         = useNavigate()
  const toast            = useToast()
  const token            = searchParams.get("token")

  const [showPass,  setShowPass]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState("")

  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async ({ newPassword }) => {
    if (!token) { setError("Invalid reset link."); return }
    setLoading(true); setError("")
    try {
      await authAPI.resetPassword({ token, newPassword })
      toast.success("Password Reset!", "You can now log in with your new password.")
      navigate("/auth/login")
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Link may have expired.")
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Set new password</h2>
          <p className="text-sm text-slate-500 mb-6">Enter your new password below.</p>

          {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

          {!token
            ? <div className="text-center py-4">
                <p className="text-sm text-red-600 mb-4">Invalid or missing reset token.</p>
                <Link to="/auth/forgot-password" className="btn-primary inline-flex">Request new link</Link>
              </div>
            : <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                      className={`input pr-10 ${errors.newPassword ? "border-red-400" : ""}`}
                      {...register("newPassword", {
                        required: "Password is required",
                        minLength: { value: 6, message: "At least 6 characters" },
                      })} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>}
                </div>

                <div>
                  <label className="label">Confirm Password</label>
                  <input type="password" placeholder="Repeat password"
                    className={`input ${errors.confirm ? "border-red-400" : ""}`}
                    {...register("confirm", {
                      required: "Please confirm your password",
                      validate: (v) => v === watch("newPassword") || "Passwords do not match",
                    })} />
                  {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting...</> : "Reset password"}
                </button>
              </form>
          }
        </div>
      </div>
    </div>
  )
}