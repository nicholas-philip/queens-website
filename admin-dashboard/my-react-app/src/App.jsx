import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth }               from "./context/AuthContext"
import { ToastProvider }                      from "./context/ToastContext"
import Spinner                                  from "./components/Spinner"

// Auth Pages
import LoginPage             from "./pages/auth/LoginPage"
import RegisterPage          from "./pages/auth/RegisterPage"
import ForgotPasswordPage    from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage     from "./pages/auth/ResetPasswordPage"
import VerifyEmailPage       from "./pages/auth/VerifyEmailPage"

// Dashboard Layout & Pages
import DashboardLayout       from "./components/layout/DashboardLayout"
import DashboardPage         from "./pages/dashboard/DashboardPage"
import AnalyticsPage         from "./pages/analytics/AnalyticsPage"
import ProductsPage          from "./pages/products/ProductsPage"
// import ProductFormPage       from "./pages/products/ProductFormPage"
import ProductDetailPage     from "./pages/products/ProductDetailPage"
import OrdersPage            from "./pages/orders/OrdersPage"
import OrderDetailPage       from "./pages/orders/OrderDetailPage"
import CustomersPage         from "./pages/customers/CustomersPage"
import CustomerDetailPage    from "./pages/customers/CustomerDetailPage"
import TransactionsPage      from "./pages/transactions/TransactionsPage"
import InvoicesPage          from "./pages/invoices/InvoicesPage"
import InvoiceDetailPage     from "./pages/invoices/InvoiceDetailPage"

// Route Protection Logic
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Spinner size="xl" /></div>
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />
  return children
}

const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Public Authentication Routes ── */}
      <Route path="/auth">
        <Route path="login"           element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="register"        element={<AuthRoute><RegisterPage /></AuthRoute>} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password"  element={<ResetPasswordPage />} />
        <Route path="verify"          element={<VerifyEmailPage />} />
      </Route>

      {/* ── Protected Admin Dashboard ── */}
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index                      element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"           element={<DashboardPage />} />
        <Route path="analytics"           element={<AnalyticsPage />} />
        
        {/* Inventory Management */}
        <Route path="products"            element={<ProductsPage />} />
        {/* <Route path="products/new"        element={<ProductFormPage />} /> */}
        <Route path="products/:id"        element={<ProductDetailPage />} />
        {/* <Route path="products/:id/edit"   element={<ProductFormPage />} /> */}
        
        {/* Sales & Orders */}
        <Route path="orders"              element={<OrdersPage />} />
        <Route path="orders/:id"          element={<OrderDetailPage />} />
        
        {/* CRM */}
        <Route path="customers"           element={<CustomersPage />} />
        <Route path="customers/:id"       element={<CustomerDetailPage />} />
        
        {/* Financials */}
        <Route path="transactions"        element={<TransactionsPage />} />
        <Route path="invoices"            element={<InvoicesPage />} />
        <Route path="invoices/:id"        element={<InvoiceDetailPage />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
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