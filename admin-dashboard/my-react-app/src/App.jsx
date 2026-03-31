import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import { useAuthStore } from "./context/AuthContext"
import { ToastProvider } from "./context/ToastContext"
import Spinner from "./components/Spinner"

/* ── Auth Pages ── */
import LoginPage          from "./pages/auth/LoginPage"
import RegisterPage       from "./pages/auth/RegisterPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage  from "./pages/auth/ResetPasswordPage"
import VerifyEmailPage    from "./pages/auth/VerifyEmailPage"

/* ── Dashboard Layout & Pages ── */
import DashboardLayout    from "./components/layout/DashboardLayout"
import DashboardPage      from "./pages/dashboard/DashboardPage"
import AnalyticsPage      from "./pages/analytics/AnalyticsPage"
import ProductsPage       from "./pages/products/ProductsPage"
import ProductFormPage    from "./pages/products/ProductFormPage"
import ProductDetailPage  from "./pages/products/ProductDetailPage"
import CategoriesPage     from "./pages/categories/CategoriesPage"
import CouponsPage        from "./pages/coupons/CouponsPage"
import OrdersPage         from "./pages/orders/OrdersPage"
import OrderDetailPage    from "./pages/orders/OrderDetailPage"
import CustomersPage      from "./pages/customers/CustomersPage"
import CustomerDetailPage from "./pages/customers/CustomerDetailPage"
import TransactionsPage   from "./pages/transactions/TransactionsPage"
import InvoicesPage       from "./pages/invoices/InvoicesPage"
import InvoiceDetailPage  from "./pages/invoices/InvoiceDetailPage"
import AccountsPage       from "./pages/accounts/AccountsPage"
import SettingsPage       from "./pages/settings/SettingsPage"
import ReviewsPage        from "./pages/reviews/ReviewsPage"
import NotificationsPage  from "./pages/notifications/NotificationsPage"

/* ─────────────────────────────────────────────
   Guards
───────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const loading         = useAuthStore((s) => s.loading)

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  return children
}

const AuthRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const loading         = useAuthStore((s) => s.loading)

  // While init() runs, show nothing — prevents flash-of-wrong-page
  if (loading) return null

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

import AccessDenied from "./components/AccessDenied"

const PermissionRoute = ({ permission, requiredRole, children }) => {
  const admin = useAuthStore((s) => s.admin)
  const loading = useAuthStore((s) => s.loading)

  if (loading) return null
  
  // SuperAdmin always gets access unless specifically restricted (rare)
  if (admin?.role === "SuperAdmin") return children
  
  // Check required role first
  if (requiredRole && admin?.role !== requiredRole) {
    return <AccessDenied />
  }

  // Check specific permission
  if (permission && !admin?.permissions?.includes(permission)) {
    return <AccessDenied />
  }

  return children
}

/* ─────────────────────────────────────────────
   Routes
───────────────────────────────────────────── */
function AppRoutes() {
  // ✅ Bootstrap auth state exactly once when the app loads.
  // Handles: local JWT restore, Firebase redirect result, token refresh.
  const init = useAuthStore((s) => s.init)
  useEffect(() => { init() }, [init])

  return (
    <Routes>
      {/* ── Auth (unauthenticated) Routes ── */}
      <Route path="/auth">
        <Route path="login"           element={<AuthRoute><LoginPage /></AuthRoute>} />
        {/* <Route path="register"        element={<AuthRoute><RegisterPage /></AuthRoute>} /> */}
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password"  element={<ResetPasswordPage />} />
        {/* Both /auth/verify and /auth/verify-email work (email links use verify-email) */}
        <Route path="verify"          element={<VerifyEmailPage />} />
        <Route path="verify-email"    element={<VerifyEmailPage />} />
      </Route>

      {/* ── Protected Dashboard Routes ── */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard"     element={<PermissionRoute permission="Dashboard"><DashboardPage /></PermissionRoute>} />
        <Route path="analytics"     element={<PermissionRoute permission="Analytics"><AnalyticsPage /></PermissionRoute>} />

        {/* Inventory */}
        <Route path="products"          element={<PermissionRoute permission="Products"><ProductsPage /></PermissionRoute>} />
        <Route path="products/new"      element={<PermissionRoute permission="Products"><ProductFormPage /></PermissionRoute>} />
        <Route path="products/:id"      element={<PermissionRoute permission="Products"><ProductDetailPage /></PermissionRoute>} />
        <Route path="products/:id/edit" element={<PermissionRoute permission="Products"><ProductFormPage /></PermissionRoute>} />
        <Route path="categories"        element={<PermissionRoute permission="Categories"><CategoriesPage /></PermissionRoute>} />
        <Route path="coupons"           element={<PermissionRoute permission="Coupons"><CouponsPage /></PermissionRoute>} />

        {/* Orders */}
        <Route path="orders"     element={<PermissionRoute permission="Orders"><OrdersPage /></PermissionRoute>} />
        <Route path="orders/:id" element={<PermissionRoute permission="Orders"><OrderDetailPage /></PermissionRoute>} />

        {/* Customers */}
        <Route path="customers"     element={<PermissionRoute permission="Customers"><CustomersPage /></PermissionRoute>} />
        <Route path="customers/:id" element={<PermissionRoute permission="Customers"><CustomerDetailPage /></PermissionRoute>} />

        {/* Financial */}
        <Route path="transactions"   element={<PermissionRoute permission="Transactions"><TransactionsPage /></PermissionRoute>} />
        <Route path="invoices"       element={<PermissionRoute permission="Invoices"><InvoicesPage /></PermissionRoute>} />
        <Route path="invoices/:id"   element={<PermissionRoute permission="Invoices"><InvoiceDetailPage /></PermissionRoute>} />

        {/* Community */}
        <Route path="reviews"       element={<PermissionRoute permission="Reviews"><ReviewsPage /></PermissionRoute>} />
        <Route path="notifications" element={<PermissionRoute permission="Notifications"><NotificationsPage /></PermissionRoute>} />

        {/* System */}
        <Route path="accounts" element={<PermissionRoute permission="Accounts" requiredRole="SuperAdmin"><AccountsPage /></PermissionRoute>} />
        <Route path="settings" element={<PermissionRoute permission="Settings" requiredRole="SuperAdmin"><SettingsPage /></PermissionRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

/* ─────────────────────────────────────────────
   App
───────────────────────────────────────────── */
export default function App() {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={true}>
      <BrowserRouter>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}