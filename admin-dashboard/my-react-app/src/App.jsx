import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import { useAuthStore } from "./context/AuthContext"
import { ToastProvider } from "./context/ToastContext"
import Spinner from "./components/Spinner"

/* ── Auth Pages ── */
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"
import VerifyEmailPage from "./pages/auth/VerifyEmailPage"

/* ── Dashboard Layout & Pages ── */
import DashboardLayout from "./components/layout/DashboardLayout"
import DashboardPage from "./pages/dashboard/DashboardPage"
import AnalyticsPage from "./pages/analytics/AnalyticsPage"
import ProductsPage from "./pages/products/ProductsPage"
import ProductFormPage from "./pages/products/ProductFormPage"
import ProductDetailPage from "./pages/products/ProductDetailPage"
import CategoriesPage from "./pages/categories/CategoriesPage"
import CouponsPage from "./pages/coupons/CouponsPage"
import OrdersPage from "./pages/orders/OrdersPage"
import OrderDetailPage from "./pages/orders/OrderDetailPage"
import CustomersPage from "./pages/customers/CustomersPage"
import CustomerDetailPage from "./pages/customers/CustomerDetailPage"
import TransactionsPage from "./pages/transactions/TransactionsPage"
import InvoicesPage from "./pages/invoices/InvoicesPage"
import InvoiceDetailPage from "./pages/invoices/InvoiceDetailPage"
import AccountsPage from "./pages/accounts/AccountsPage"
import SettingsPage from "./pages/settings/SettingsPage"
import ReviewsPage from "./pages/reviews/ReviewsPage"
import NotificationsPage from "./pages/notifications/NotificationsPage"

/* ─────────────────────────────────────────────
   Protected Route
───────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const loading = useAuthStore((s) => s.loading)

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  return children
}

/* ─────────────────────────────────────────────
   Auth Route
───────────────────────────────────────────── */
const AuthRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const loading = useAuthStore((s) => s.loading)

  if (loading) return null

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

/* ─────────────────────────────────────────────
   Routes
───────────────────────────────────────────── */
function AppRoutes() {
  return (
    <Routes>
      {/* ── Auth Routes ── */}
      <Route path="/auth">
        <Route path="login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="verify" element={<VerifyEmailPage />} />
      </Route>

      {/* ── Protected Dashboard ── */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />

        {/* Inventory */}
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="coupons" element={<CouponsPage />} />

        {/* Orders */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />

        {/* Customers */}
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />

        {/* Financial */}
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />

        {/* Community */}
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />

        {/* System */}
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="settings" element={<SettingsPage />} />
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