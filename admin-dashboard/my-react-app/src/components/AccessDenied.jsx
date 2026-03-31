import { Link } from "react-router-dom"
import { ShieldAlert, ArrowLeft, Home } from "lucide-react"

const AccessDenied = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-fade-in translate-y-[-5%] overflow-hidden">
      {/* Visual Element */}
      <div className="relative mb-10 group">
        <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full group-hover:bg-primary/40 transition-all duration-500 scale-125"></div>
        <div className="relative w-32 h-32 bg-neutral-900 border border-neutral-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl overflow-hidden group-hover:border-primary/30 transition-all">
          <ShieldAlert className="w-14 h-14 text-primary animate-pulse" />
          
          {/* Decorative lines */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
        </div>
      </div>

      {/* Text Content */}
      <div className="max-w-md">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">Oops! Access Denied</h2>
        <p className="text-neutral-500 text-base leading-relaxed mb-10 font-medium">
          It looks like you've reached a restricted area. This section is reserved for SuperAdmins or specific leadership roles.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 bg-neutral-900 border border-neutral-800 rounded-2xl text-sm font-black uppercase tracking-widest text-white hover:bg-neutral-800 hover:border-neutral-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <Link 
            to="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 bg-primary rounded-2xl text-sm font-black uppercase tracking-widest text-black hover:opacity-90 transition-all shadow-xl shadow-primary/20"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none opacity-[0.03]">
        <div className="text-[15rem] font-black tracking-tighter select-none">RESTRICTED</div>
      </div>
    </div>
  )
}

export default AccessDenied
