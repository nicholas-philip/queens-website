import { useState } from "react"
import { Outlet, Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../context/AuthContext"
import { Bell, Search, Menu } from "lucide-react"
import Sidebar from "../Sidebar"

export default function DashboardLayout() {
const admin  = useAuthStore((s) => s.admin)
const logout = useAuthStore((s) => s.logout)

  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/auth/login")
  }

  return (
    <div className="min-h-[100dvh] bg-black text-neutral-300 font-sans flex overflow-hidden">
      
      {/* ── Mobile Sidebar Header ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black border-b border-neutral-800 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center font-black text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]">Q</div>
            <span className="font-bold text-white tracking-tight">Queens Admin</span>
        </div>

        {/* Hide hamburger when sidebar is open */}
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-neutral-400 hover:text-white transition-colors bg-neutral-900 rounded-lg border border-neutral-800">
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ── Sidebar Overlay ── */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar Component ── */}
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      {/* ── Main Canvas ── */}
      <main className="flex-1 flex flex-col min-w-0 h-[100dvh] pt-16 lg:pt-0">
        
        {/* Header (Top bar) */}
        <header className="h-20 border-b border-neutral-900 bg-black/60 backdrop-blur-md sticky top-0 z-30 px-8 hidden lg:flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md hidden md:block group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search for orders, products..."
                        className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white font-medium focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <Link to="/notifications" className="relative p-2 text-neutral-400 hover:text-white transition-colors group">
                    <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="absolute top-2 right-[2px] w-2.5 h-2.5 rounded-full bg-yellow-500 border-2 border-black shadow-[0_0_10px_rgba(234,179,8,1)]" />
                </Link>
                <div className="h-8 w-px bg-neutral-800" />
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-white leading-tight">{admin?.name || "Admin"}</div>
                        <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest leading-none mt-1">{admin?.role || "Manager"}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-800 flex items-center justify-center font-black text-white shadow-inner">
                        {admin?.name?.charAt(0) || "Q"}
                    </div>
                </div>
            </div>
        </header>

        {/* Views (Dynamic Content) */}
        <section className="flex-1 overflow-y-auto bg-black p-4 lg:p-8 pb-32 scrollbar-custom">
            <div className="max-w-[1440px] mx-auto">
                <Outlet />
            </div>
        </section>
      </main>

      {/* Global CSS for scrollbars and effects */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-custom::-webkit-scrollbar { width: 4px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: #eab308; box-shadow: 0 0 10px rgba(234,179,8,0.5); }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  )
}