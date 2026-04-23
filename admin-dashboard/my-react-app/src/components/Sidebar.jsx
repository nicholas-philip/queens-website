import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { useAuthStore } from "../context/AuthContext"
import logo from "../assets/logo.png"
import { motion, AnimatePresence } from "framer-motion"

import {
  LayoutDashboard, Package, ShoppingCart, Users, CreditCard,
  FileText, Tag, Ticket, Star, Bell, Settings, UserCog,
  BarChart3, LogOut, ChevronLeft, ChevronRight, X, PenTool,
  Sun, Moon
} from "lucide-react"
import { useTheme } from "next-themes"


const navGroups = [
  {
    group: "Main",
    items: [
      { to: "/dashboard",     label: "Dashboard",    icon: LayoutDashboard, requiredPermission: "Dashboard" },
      { to: "/analytics",     label: "Analytics",    icon: BarChart3,       requiredPermission: "Analytics" },
    ],
  },
  {
    group: "Catalog",
    items: [
      { to: "/products",      label: "Products",     icon: Package,         requiredPermission: "Products" },
      { to: "/categories",    label: "Categories",   icon: Tag,             requiredPermission: "Categories" },
      { to: "/coupons",       label: "Coupons",      icon: Ticket,          requiredPermission: "Coupons" },
    ],
  },
  {
    group: "Sales",
    items: [
      { to: "/orders",        label: "Orders",       icon: ShoppingCart,    requiredPermission: "Orders" },
      { to: "/customers",     label: "Customers",    icon: Users,           requiredPermission: "Customers" },
      { to: "/transactions",  label: "Transactions", icon: CreditCard,      requiredPermission: "Transactions" },
      { to: "/invoices",      label: "Invoices",     icon: FileText,        requiredPermission: "Invoices" },
    ],
  },
  {
    group: "Community",
    items: [
      { to: "/reviews",       label: "Reviews",      icon: Star,            requiredPermission: "Reviews" },
      { to: "/blog",          label: "Blog Posts",   icon: PenTool },
      { to: "/notifications", label: "Notifications",icon: Bell,            requiredPermission: "Notifications" },
    ],
  },
  {
    group: "Admin",
    items: [
      { to: "/accounts",      label: "Accounts",     icon: UserCog,         requiredRole: "SuperAdmin" },
      { to: "/settings",      label: "Settings",     icon: Settings,        requiredRole: "SuperAdmin" },
    ],
  },
]

export default function Sidebar({ notificationCount = 0, mobileOpen = false, setMobileOpen = () => {} }) {
  const logout  = useAuthStore((s) => s.logout)
  const admin   = useAuthStore((s) => s.admin)
  const [collapsed, setCollapsed] = useState(false)

  const safeAdmin    = admin || {}
  const permissions  = safeAdmin.permissions || []

  const getInitials = (name) => {
    if (!name) return "?"
    const parts = name.trim().split(" ")
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const filteredNavGroups = safeAdmin.role === "SuperAdmin"
    ? navGroups
    : navGroups
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => {
            if (item.requiredRole && safeAdmin.role !== item.requiredRole) return false
            if (item.requiredPermission && !permissions.includes(item.requiredPermission)) return false
            return true
          }),
        }))
        .filter((g) => g.items.length > 0)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)
  const { theme, setTheme } = useTheme()

  /* ─── Shared nav list used in both mobile & desktop ─── */

  const NavList = ({ mini = false }) => (
    <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
      {filteredNavGroups.map(({ group, items }) => (
        <div key={group}>
          {!mini && (
            <p className="px-3 mb-2 text-xs font-black uppercase tracking-widest text-base-content/40">
              {group}
            </p>
          )}
          <ul className="space-y-0.5">
            {items.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={mobileOpen ? closeMobile : undefined}
                  title={mini ? label : undefined}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all group
                    ${isActive ? "bg-primary text-primary-content shadow-lg shadow-primary/20" : "text-base-content/60 hover:bg-base-200 hover:text-base-content"}
                    ${mini ? "justify-center px-0" : ""}
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="h-4 w-4 shrink-0" />
                      {!mini && <span className="truncate text-sm">{label}</span>}
                      {label === "Notifications" && notificationCount > 0 && (
                        <span className={`absolute flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white text-black text-xs font-black px-1
                          ${mini ? "right-1 top-1" : "right-3"}
                          ${isActive ? "bg-black text-yellow-500" : ""}
                        `}>
                          {notificationCount > 99 ? "99+" : notificationCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )

  /* ─── Shared footer ─── */
  const Footer = ({ mini = false }) => (
    <div className="shrink-0 border-t border-base-300 p-3 bg-base-100">
      {!mini ? (
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 text-primary text-xs font-black">
            {getInitials(safeAdmin.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-base-content truncate">{safeAdmin.name || "Loading..."}</p>
            <p className="text-xs text-primary font-bold uppercase tracking-widest truncate mt-0.5">{safeAdmin.role || "Admin"}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 transition-all border border-red-500/20"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={logout}
          title="Logout"
          className="flex w-full h-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:text-white hover:bg-red-500 transition-all group"
        >
          <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* ══════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Blurred backdrop */}
            <motion.div
              key="mob-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={closeMobile}
              className="fixed inset-0 z-40 bg-black backdrop-blur-sm lg:hidden"
            />

            {/* Slide-in drawer */}
            <motion.aside
              key="mob-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-[100dvh] w-[300px] z-[90] flex flex-col bg-base-100/80 backdrop-blur-2xl lg:hidden overflow-hidden border-r border-white/10 shadow-[20px_0px_80px_rgba(0,0,0,0.4)]"
            >
              {/* ── Drawer header ── */}
              <div className="relative flex h-20 shrink-0 items-center px-6 border-b border-base-300 bg-base-200/30">
                {/* Gold shimmer accent */}
                <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent" />

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-base-100 border border-base-300 flex items-center justify-center p-2 shadow-sm">
                    <img src={logo} alt="Queens Fashion Store Logo" className="h-full w-full object-contain drop-shadow-[0_0_6px_rgba(212,175,55,0.35)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-base-content tracking-tight leading-none uppercase">Queens Dashboard</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1 opacity-80">Store Operation</p>
                  </div>
                </div>
              </div>


              <NavList mini={false} />
              
              <div className="p-4 border-t border-base-300">
                <div className="flex items-center justify-between px-2">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">Interface Theme</span>
                   <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="w-10 h-10 rounded-xl bg-base-200 border border-base-300 flex items-center justify-center text-base-content/60 hover:text-primary transition-all active:scale-95 shadow-sm"
                    >
                        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>
              </div>

              <Footer mini={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          DESKTOP SIDEBAR
      ══════════════════════════════════════════ */}
      <aside
        className={`hidden lg:flex flex-col bg-base-100 border-r border-base-300 h-[100dvh] shrink-0 relative transition-all duration-300
          ${collapsed ? "w-[72px]" : "w-60"}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-base-300 shrink-0 overflow-hidden">
          <div className={`flex items-center justify-center transition-all duration-300 ${collapsed ? "w-8 h-8" : "w-32 h-14"}`}>
            <img src={logo} alt="Queens Fashion Store Logo" className="h-full w-full object-contain" />
          </div>
        </div>

        <NavList mini={collapsed} />
        <Footer mini={collapsed} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3.5 top-20 h-7 w-7 flex items-center justify-center rounded-full bg-base-100 border border-base-300 text-base-content/40 hover:border-primary hover:text-primary transition-all z-50 shadow-sm"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>
    </>
  )
}
