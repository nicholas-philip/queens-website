import { useState } from "react"
import { Outlet, Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../context/AuthContext"
import { Bell, Search, Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Sidebar from "../Sidebar"

export default function DashboardLayout() {
  const admin  = useAuthStore((s) => s.admin)
  const logout = useAuthStore((s) => s.logout)
  const { theme, setTheme } = useTheme()

  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/auth/login")
  }

  return (
    <div className="min-h-[100dvh] bg-base-100 text-base-content font-sans flex overflow-hidden">
      
      {/* ── Mobile Sidebar Header ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-base-100 border-b border-base-300 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-primary-content shadow-[0_0_15px_rgba(212,175,55,0.4)]">Q</div>
            <span className="font-bold text-base-content tracking-tight">Queens Admin</span>
        </div>

        {/* Hide hamburger when sidebar is open */}
        {!sidebarOpen && (
          <div className="flex items-center gap-2">
            {/* Mobile Theme Toggle */}
            <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg bg-base-200 border border-base-300 text-base-content/70 hover:text-primary transition-all"
            >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-base-content/70 hover:text-base-content transition-colors bg-base-200 rounded-lg border border-base-300">
              <Menu className="h-5 w-5" />
            </button>
          </div>
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
        <header className="h-20 border-b border-base-300 bg-base-100/80 backdrop-blur-md sticky top-0 z-30 px-8 hidden lg:flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md hidden md:block group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50 group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search for orders, products..."
                        className="w-full bg-base-200/60 border border-base-300 rounded-2xl pl-12 pr-4 py-3 text-sm text-base-content font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Desktop Theme Toggle */}
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-xl bg-base-200 border border-base-300 text-base-content/70 hover:text-primary transition-all shadow-sm"
                >
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <Link to="/notifications" className="relative p-2 text-base-content/70 hover:text-base-content transition-colors group">
                    <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="absolute top-2 right-[2px] w-2.5 h-2.5 rounded-full bg-primary border-2 border-base-100 shadow-[0_0_10px_rgba(212,175,55,1)]" />
                </Link>
                <div className="h-8 w-px bg-base-300" />
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-base-content leading-tight">{admin?.name || "Admin"}</div>
                        <div className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none mt-1">{admin?.role || "Manager"}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-base-300 border border-base-300 flex items-center justify-center font-black text-base-content shadow-inner">
                        {admin?.name?.charAt(0) || "Q"}
                    </div>
                </div>
            </div>
        </header>

        {/* Views (Dynamic Content) */}
        <section className="flex-1 overflow-y-auto bg-base-200 p-4 lg:p-8 pb-32">
            <div className="max-w-[1440px] mx-auto animate-fade-in">
                <Outlet />
            </div>
        </section>
      </main>
    </div>
  )
}