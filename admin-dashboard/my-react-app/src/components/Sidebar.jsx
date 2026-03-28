import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { useAuthStore } from "../context/AuthContext"
import logo from "../assets/logo.png"

import {
  LayoutDashboard, Package, ShoppingCart, Users, CreditCard,
  FileText, Tag, Ticket, Star, Bell, Settings, UserCog,
  BarChart3, LogOut, ChevronLeft, ChevronRight
} from "lucide-react"

const navGroups = [
  {
    group: "Main",
    items: [
      { to: "/dashboard",    label: "Dashboard",     icon: LayoutDashboard },
      { to: "/analytics",    label: "Analytics",      icon: BarChart3 },
    ],
  },
  {
    group: "Catalog",
    items: [
      { to: "/products",     label: "Products",       icon: Package },
      { to: "/categories",   label: "Categories",     icon: Tag },
      { to: "/coupons",      label: "Coupons",        icon: Ticket },
    ],
  },
  {
    group: "Sales",
    items: [
      { to: "/orders",       label: "Orders",         icon: ShoppingCart },
      { to: "/customers",    label: "Customers",      icon: Users },
      { to: "/transactions", label: "Transactions",   icon: CreditCard },
      { to: "/invoices",     label: "Invoices",       icon: FileText },
    ],
  },
  {
    group: "Community",
    items: [
      { to: "/reviews",      label: "Reviews",        icon: Star },
      { to: "/notifications",label: "Notifications",  icon: Bell },
    ],
  },
  {
    group: "Admin",
    items: [
      { to: "/accounts",     label: "Accounts",       icon: UserCog },
      { to: "/settings",     label: "Settings",       icon: Settings },
    ],
  },
]

const getInitials = (name) => {
  if (!name) return "?"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/* ── Animated Hamburger Button ── */
function HamburgerButton({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className={`lg:hidden relative flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-xl border border-base-300 bg-base-200 transition-all duration-200 hover:border-primary/50 hover:bg-base-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
    >
      <span
        className={`block h-[1.5px] w-5 origin-center rounded-full bg-base-content transition-all duration-300 ease-in-out
          ${open ? "translate-y-[6.5px] rotate-45" : ""}`}
      />
      <span
        className={`block h-[1.5px] rounded-full bg-base-content transition-all duration-300 ease-in-out
          ${open ? "w-0 opacity-0" : "w-3.5 opacity-100"}`}
      />
      <span
        className={`block h-[1.5px] w-5 origin-center rounded-full bg-base-content transition-all duration-300 ease-in-out
          ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`}
      />
    </button>
  )
}

export default function Sidebar({
  notificationCount = 0,
  mobileOpen = false,
  setMobileOpen = () => {},
}) {
  const logout  = useAuthStore((s) => s.logout)
  const admin   = useAuthStore((s) => s.admin)
  const [collapsed, setCollapsed] = useState(false)

  const safeAdmin = admin || {}
  const filteredNavGroups = admin?.role === "SuperAdmin" ? navGroups : navGroups.filter(g => g.group !== "Admin")

  /* Lock body scroll when mobile drawer is open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      {/* ── Mobile Backdrop ── */}
      <div
        onClick={closeMobile}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity duration-300
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* ── Sidebar Drawer ── */}
      <aside
        className={`fixed lg:relative flex flex-col bg-base-100 border-r border-base-300 h-[100dvh] transition-all duration-300 shrink-0 z-50
          ${collapsed ? "lg:w-[72px]" : "lg:w-60"}
          ${mobileOpen ? "translate-x-0 w-72 shadow-2xl shadow-black/60" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-base-300 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden shrink-0">
              <img src={logo} alt="Queens Logo" className="h-full w-full object-contain" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div>
                <span className="text-base-content font-black text-sm tracking-widest uppercase">Queens</span>
                <p className="text-primary font-bold text-[9px] tracking-widest uppercase leading-none mt-0.5">Admin Panel</p>
              </div>
            )}
          </div>

          {/* Close button — mobile only, inside drawer */}
          {mobileOpen && (
            <button
              onClick={closeMobile}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-300 text-base-content/50 hover:text-base-content hover:border-base-300 transition-all lg:hidden bg-base-200"
              aria-label="Close sidebar"
            >
              {/* X icon drawn inline to avoid an extra import */}
              <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {filteredNavGroups.map(({ group, items }) => (
            <div key={group}>
              {(!collapsed || mobileOpen) && (
                <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-widest text-base-content/40">{group}</p>
              )}
              <ul className="space-y-0.5">
                {items.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={closeMobile}
                      title={collapsed && !mobileOpen ? label : undefined}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all group
                        ${isActive ? "bg-primary text-primary-content shadow-lg shadow-primary/20" : "text-base-content/60 hover:bg-base-200 hover:text-base-content"}
                        ${collapsed && !mobileOpen ? "justify-center px-0" : ""}
                        `
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className="h-4 w-4 shrink-0" />
                          {(!collapsed || mobileOpen) && (
                            <span className="truncate text-[13px]">{label}</span>
                          )}
                          {label === "Notifications" && notificationCount > 0 && (
                            <span className={`absolute flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white text-black text-[9px] font-black px-1
                              ${collapsed && !mobileOpen ? "right-1 top-1" : "right-3"}
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

        {/* Admin Footer */}
        <div className="shrink-0 border-t border-base-300 p-3 bg-base-100/50">
          {(!collapsed || mobileOpen) ? (
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-base-200 border border-base-300 text-base-content text-xs font-black">
                {admin ? getInitials(safeAdmin.name) : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-base-content truncate">{safeAdmin.name || "Loading..."}</p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest truncate mt-0.5">{safeAdmin.role || "Admin"}</p>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="flex items-center justify-center h-9 px-3 gap-2 ml-auto rounded-lg bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 transition-all border border-red-500/20 shadow-md"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-xs font-bold leading-none hidden sm:block">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              title="Logout"
              className="flex w-full h-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:text-white hover:bg-red-500 transition-all shadow-md group"
            >
              <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3.5 top-20 h-7 w-7 items-center justify-center rounded-full bg-base-100 text-base-content/40 border border-base-300 hover:border-primary hover:text-primary transition-all z-50 shadow-sm"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>
    </>
  )
}