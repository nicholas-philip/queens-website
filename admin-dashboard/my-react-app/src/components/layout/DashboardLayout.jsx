import { useState, useEffect, useCallback, useRef } from "react"
import { Outlet, Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../context/AuthContext"
import { Bell, Search, Menu, Moon, Sun, X, Package, ShoppingCart, User as UserIcon, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import Sidebar from "../Sidebar"
import api from "../../libs/api"
import { useDebounce } from "../../libs/useDebounce"

export default function DashboardLayout() {
  const admin  = useAuthStore((s) => s.admin)
  const logout = useAuthStore((s) => s.logout)
  const token  = useAuthStore((s) => s.token)
  const { theme, setTheme } = useTheme()

  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // ── Global Search State ──
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 400)
  const searchRef = useRef(null)

  const fetchUnread = useCallback(async () => {
    if (!token) return
    try {
      const { data } = await api.get("/admin/notifications/unread-count")
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      console.warn("Notification poll failed", err.message)
    }
  }, [token])

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [fetchUnread])

  // ── Global Search Fetch ──
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults(null)
      setShowResults(false)
      return
    }

    const performSearch = async () => {
      setIsSearching(true)
      setShowResults(true)
      try {
        const { data } = await api.get(`/admin/search?q=${encodeURIComponent(debouncedSearch)}`)
        setSearchResults(data.results)
      } catch (err) {
        console.error("Search failed", err)
      } finally {
        setIsSearching(false)
      }
    }
    performSearch()
  }, [debouncedSearch])

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/auth/login")
  }

  const navigateToResult = (type, id) => {
    setShowResults(false)
    setSearchQuery("")
    if (type === "product") navigate(`/products/${id}`)
    if (type === "order") navigate(`/orders/${id}`)
    if (type === "customer") navigate(`/customers/${id}`)
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
                <div className="relative w-full max-w-md hidden md:block group" ref={searchRef}>
                    <div className="relative">
                      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearching ? 'text-primary' : 'text-base-content/50 group-focus-within:text-primary'}`} />
                      <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => searchQuery && setShowResults(true)}
                          placeholder="Search for orders, products..."
                          className="w-full bg-base-200/60 border border-base-300 rounded-2xl pl-12 pr-10 py-3 text-sm text-base-content font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 hover:bg-base-300 rounded-full text-base-content/30 hover:text-base-content transition-all"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                      {showResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 border border-base-300 rounded-2xl shadow-2xl overflow-hidden z-50 py-2">
                           {isSearching ? (
                             <div className="p-10 flex flex-col items-center justify-center gap-3">
                               <Loader2 className="h-6 w-6 text-primary animate-spin" />
                               <span className="text-xs font-bold text-base-content/40 uppercase tracking-widest">Searching...</span>
                             </div>
                           ) : searchResults ? (
                             <div className="max-h-[400px] overflow-auto">
                               {searchResults.products?.length > 0 && (
                                 <div>
                                   <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary/60 border-b border-base-300/50">Products</div>
                                   {searchResults.products.map(p => (
                                     <button key={p._id} onClick={() => navigateToResult('product', p._id)} className="w-full text-left px-4 py-3 hover:bg-base-200 flex items-center gap-3 transition-colors">
                                       <div className="h-8 w-8 rounded-lg bg-base-200 border border-base-300 flex items-center justify-center overflow-hidden">
                                          {p.images?.[0] ? <img src={p.images[0]} className="h-full w-full object-cover" /> : <Package className="h-4 w-4 text-base-content/30" />}
                                       </div>
                                       <div>
                                          <div className="text-xs font-bold text-base-content">{p.title}</div>
                                          <div className="text-[10px] text-base-content/40 font-mono uppercase">{p.SKU}</div>
                                       </div>
                                     </button>
                                   ))}
                                 </div>
                               )}

                               {searchResults.orders?.length > 0 && (
                                 <div className="border-t border-base-300/50">
                                   <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary/60 border-b border-base-300/50">Orders</div>
                                   {searchResults.orders.map(o => (
                                     <button key={o._id} onClick={() => navigateToResult('order', o._id)} className="w-full text-left px-4 py-3 hover:bg-base-200 flex items-center gap-3 transition-colors">
                                       <div className="h-8 w-8 rounded-lg bg-base-200 border border-base-300 flex items-center justify-center">
                                          <ShoppingCart className="h-4 w-4 text-base-content/40" />
                                       </div>
                                       <div>
                                          <div className="text-xs font-bold text-base-content">{o.orderNumber}</div>
                                          <div className="text-[10px] text-base-content/40 uppercase font-bold">{o.customerDetails?.name} · {o.currentStatus}</div>
                                       </div>
                                     </button>
                                   ))}
                                 </div>
                               )}

                               {searchResults.customers?.length > 0 && (
                                 <div className="border-t border-base-300/50">
                                   <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary/60 border-b border-base-300/50">Customers</div>
                                   {searchResults.customers.map(c => (
                                     <button key={c._id} onClick={() => navigateToResult('customer', c._id)} className="w-full text-left px-4 py-3 hover:bg-base-200 flex items-center gap-3 transition-colors">
                                       <div className="h-8 w-8 rounded-lg bg-base-200 border border-base-300 flex items-center justify-center">
                                          <UserIcon className="h-4 w-4 text-base-content/40" />
                                       </div>
                                       <div>
                                          <div className="text-xs font-bold text-base-content">{c.name}</div>
                                          <div className="text-[10px] text-base-content/40 uppercase font-bold">{c.email || c.phone}</div>
                                       </div>
                                     </button>
                                   ))}
                                 </div>
                               )}
                               
                               {!searchResults.products?.length && !searchResults.orders?.length && !searchResults.customers?.length && (
                                 <div className="p-8 text-center">
                                   <p className="text-xs font-bold text-base-content/30 uppercase tracking-widest italic">No matches found</p>
                                 </div>
                               )}
                             </div>
                           ) : null}
                        </div>
                      )}
                    </AnimatePresence>
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
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-[2px] w-2.5 h-2.5 rounded-full bg-primary border-2 border-base-100 shadow-[0_0_10px_rgba(212,175,55,1)] animate-pulse" />
                    )}
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