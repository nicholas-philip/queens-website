import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { 
  LayoutDashboard, Package, ShoppingCart, Users, CreditCard, 
  FileText, Settings, Bell, Search, LogOut, Menu, X, ChevronRight,
  TrendingUp, Activity, LayoutGrid, Tag
} from "lucide-react"
import { cn } from "../../libs/utils"

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Analytics', icon: TrendingUp, path: '/analytics' },
  { type: 'header', name: 'Catalog' },
  { name: 'Products', icon: Package, path: '/products' },
  { name: 'Categories', icon: LayoutGrid, path: '/categories' }, // Changed icon to LayoutGrid
  { name: 'Coupons', icon: Tag, path: '/coupons' }, // Changed icon to Tag
  { type: 'header', name: 'Sales' },
  { name: 'Orders', icon: ShoppingCart, path: '/orders' },
  { name: 'Customers', icon: Users, path: '/customers' },
  { name: 'Transactions', icon: CreditCard, path: '/transactions' },
  { name: 'Invoices', icon: FileText, path: '/invoices' },
  { type: 'header', name: 'Admin' },
  { name: 'Accounts', icon: Activity, path: '/accounts' },
  { name: 'Settings', icon: Settings, path: '/settings' },
]

export default function DashboardLayout() {
  const { admin, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/auth/login")
  }

  return (
    <div className="min-h-screen bg-black text-neutral-300 font-sans flex overflow-hidden">
      
      {/* ── Mobile Sidebar Header ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-neutral-900 border-b border-neutral-800 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center font-bold text-black border border-yellow-400">Q</div>
            <span className="font-bold text-white tracking-tight">Queens Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-neutral-400">
           <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* ── Sidebar Overlay ── */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-neutral-950 border-r border-neutral-900 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-neutral-900">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold text-black shadow-[0_0_15px_rgba(234,179,8,0.2)]">Q</div>
                <div className="flex flex-col">
                    <span className="font-bold text-white tracking-tight leading-none text-lg">Queens</span>
                    <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.2em] mt-1">E-Commerce</span>
                </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-neutral-500">
                <X className="h-5 w-5" />
            </button>
        </div>

        {/* User Card Mini */}
        <div className="px-6 py-6 pb-2">
            <div className="bg-neutral-900/40 rounded-2xl p-4 border border-neutral-900">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-yellow-500">
                        {admin?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{admin?.name}</p>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{admin?.role}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide space-y-1">
          {navigation.map((item, i) => {
            if (item.type === 'header') {
                return (
                    <div key={i} className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mt-8 mb-3 ml-4">
                        {item.name}
                    </div>
                )
            }

            const active = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-200",
                  active 
                    ? "bg-yellow-500/10 text-yellow-500 font-semibold border border-yellow-500/20 shadow-[inset_0_0_10px_rgba(234,179,8,0.05)]" 
                    : "text-neutral-500 hover:text-white hover:bg-neutral-900 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                    <item.icon className={cn("h-[18px] w-[18px]", active ? "text-yellow-500" : "group-hover:text-yellow-500 transition-colors")} />
                    <span className="text-sm">{item.name}</span>
                </div>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-6 pt-0 border-t border-neutral-900">
            <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-semibold text-sm group"
            >
                <LogOut className="h-[18px] w-[18px] group-hover:translate-x-1 transition-transform" />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>

      {/* ── Main Canvas ── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        
        {/* Header (Top bar) */}
        <header className="h-20 border-b border-neutral-900 bg-black/60 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
                    <input 
                        type="text" 
                        placeholder="Search for orders, products..."
                        className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm text-neutral-300 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-5">
                <button className="relative p-2 text-neutral-400 hover:text-white transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-500 border-2 border-black" />
                </button>
                <div className="h-8 w-px bg-neutral-800 mx-2" />
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-white leading-tight">{admin?.name}</div>
                        <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{admin?.role}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-yellow-500 shadow-lg">
                        {admin?.name?.charAt(0)}
                    </div>
                </div>
            </div>
        </header>

        {/* Views (Dynamic Content) */}
        <section className="flex-1 overflow-y-auto bg-black p-8 pb-20 scrollbar-custom">
            <div className="max-w-[1440px] mx-auto">
                <Outlet />
            </div>
        </section>
      </main>

      {/* Global CSS for scrollbars and effects */}
      <style>{`
        .scrollbar-custom::-webkit-scrollbar { width: 5px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: #000; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: #333; }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  )
}
