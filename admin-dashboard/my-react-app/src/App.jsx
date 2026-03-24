import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom"
import { AuthProvider, useAuth }  from "./context/AuthContext"
import { ToastProvider }          from "./context/ToastContext"
// import DashboardLayout            from "./components/layout/DashboardLayout"   // ❌ not created yet
import Spinner                    from "./components/Spinner"

// Auth pages
import LoginPage            from "./pages/auth/LoginPage"
import ForgotPasswordPage   from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage    from "./pages/auth/ResetPasswordPage"
import VerifyEmailPage      from "./pages/auth/VerifyEmailPage"

// Dashboard pages  — ❌ not created yet
// import DashboardPage        from "./pages/dashboard/DashboardPage"
// import AnalyticsPage        from "./pages/analytics/AnalyticsPage"

// Products — ❌ not created yet
// import ProductsPage         from "./pages/products/ProductsPage"
// import ProductFormPage      from "./pages/products/ProductFormPage"
// import ProductDetailPage    from "./pages/products/ProductDetailPage"

// Orders — ❌ not created yet
// import OrdersPage           from "./pages/orders/OrdersPage"
// import OrderDetailPage      from "./pages/orders/OrderDetailPage"

// Customers — ❌ not created yet
// import CustomersPage        from "./pages/customers/CustomersPage"
// import CustomerDetailPage   from "./pages/customers/CustomerDetailPage"

// Transactions, Invoices — ❌ not created yet
// import TransactionsPage     from "./pages/transactions/TransactionsPage"
// import InvoicesPage         from "./pages/invoices/InvoicesPage"
// import InvoiceDetailPage    from "./pages/invoices/InvoiceDetailPage"

// Catalog — ❌ not created yet
// import CategoriesPage       from "./pages/categories/CategoriesPage"
// import CouponsPage          from "./pages/coupons/CouponsPage"
// import ReviewsPage          from "./pages/reviews/ReviewsPage"

// Admin — ❌ not created yet
// import NotificationsPage    from "./pages/notifications/NotificationsPage"
// import SettingsPage         from "./pages/settings/SettingsPage"
// import AccountsPage         from "./pages/accounts/AccountsPage"

// ── Protected route wrapper ─────────────────────────
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

// ── Auth route wrapper — redirect if already logged in ──
function AuthRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to login until dashboard is ready */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      {/* Auth pages — redirect to dashboard if logged in */}
      <Route element={<AuthRoute />}>
        <Route path="/auth/login"            element={<LoginPage />} />
        <Route path="/auth/forgot-password"  element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password"   element={<ResetPasswordPage />} />
        <Route path="/auth/verify-email"     element={<VerifyEmailPage />} />
      </Route>

      {/* Protected dashboard pages — ❌ commented out until pages are created */}
      {/* <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"              element={<DashboardPage />} />
          <Route path="/analytics"              element={<AnalyticsPage />} />
          <Route path="/products"               element={<ProductsPage />} />
          <Route path="/products/new"           element={<ProductFormPage />} />
          <Route path="/products/:id"           element={<ProductDetailPage />} />
          <Route path="/products/:id/edit"      element={<ProductFormPage />} />
          <Route path="/orders"                 element={<OrdersPage />} />
          <Route path="/orders/:id"             element={<OrderDetailPage />} />
          <Route path="/customers"              element={<CustomersPage />} />
          <Route path="/customers/:id"          element={<CustomerDetailPage />} />
          <Route path="/transactions"           element={<TransactionsPage />} />
          <Route path="/invoices"               element={<InvoicesPage />} />
          <Route path="/invoices/:id"           element={<InvoiceDetailPage />} />
          <Route path="/categories"             element={<CategoriesPage />} />
          <Route path="/coupons"                element={<CouponsPage />} />
          <Route path="/reviews"                element={<ReviewsPage />} />
          <Route path="/notifications"          element={<NotificationsPage />} />
          <Route path="/settings"               element={<SettingsPage />} />
          <Route path="/accounts"               element={<AccountsPage />} />
        </Route>
      </Route> */}

      {/* 404 */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}