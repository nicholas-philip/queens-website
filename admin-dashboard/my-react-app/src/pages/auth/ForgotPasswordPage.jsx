// ── ForgotPasswordPage ─────────────────────────
import { useState }                    from "react"
import { Link }                        from "react-router-dom"
import { useForm }                     from "react-hook-form"
import { ArrowLeft, Mail, Loader2 }    from "lucide-react"
import { authAPI }                     from "../../libs/api"

export function ForgotPasswordPage() {
  const [done,    setDone]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    setLoading(true); setError("")
    try {
      await authAPI.forgotPassword({ email })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.")
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>

          {!done ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Forgot password?</h2>
              <p className="text-sm text-slate-500 mb-6">Enter your email and we'll send a reset link.</p>

              {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Email address</label>
                  <input type="email" placeholder="admin@store.com" className={`input ${errors.email ? "border-red-400" : ""}`}
                    {...register("email", { required: "Email is required" })} />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : "Send reset link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <Mail className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-slate-500 mb-6">
                If this email is registered, a reset link has been sent. The link expires in 1 hour.
              </p>
              <Link to="/auth/login" className="btn-primary inline-flex">Back to login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default ForgotPasswordPage