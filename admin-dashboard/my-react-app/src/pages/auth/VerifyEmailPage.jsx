import { useEffect, useState }              from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { CheckCircle, XCircle, Loader2 }      from "lucide-react"
import { authAPI }                             from "@/lib/api"
import { useAuth }                             from "@/context/AuthContext"

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate        = useNavigate()
  const { refreshAdmin } = useAuth()
  const token           = searchParams.get("token")

  const [status,  setStatus]  = useState("verifying") // "verifying" | "success" | "error"
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("No verification token found in the link."); return }

    authAPI.verifyEmail({ token })
      .then(({ data }) => {
        // Save the token returned after verification
        if (data.token) {
          localStorage.setItem("admin_token", data.token)
          localStorage.setItem("admin_user",  JSON.stringify(data.admin))
        }
        setStatus("success")
        setTimeout(() => navigate("/dashboard"), 2500)
      })
      .catch((err) => {
        setStatus("error")
        setMessage(err.response?.data?.message || "Verification failed. Link may have expired.")
      })
  }, [token, navigate])

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center">

          {status === "verifying" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Verifying your email...</h2>
              <p className="text-sm text-slate-500">Just a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Email Verified! 🎉</h2>
              <p className="text-sm text-slate-500 mb-5">
                Your account is now active. Redirecting to dashboard...
              </p>
              <Link to="/dashboard" className="btn-primary inline-flex">Go to Dashboard</Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Verification Failed</h2>
              <p className="text-sm text-slate-500 mb-5">{message}</p>
              <Link to="/auth/login" className="btn-secondary inline-flex">Back to Login</Link>
            </>
          )}

        </div>
      </div>
    </div>
  )
}