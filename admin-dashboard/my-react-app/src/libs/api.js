import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "https://queens-website.onrender.com/api"

const api = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" } })

// Attach token automatically
api.interceptors.request.use((config) => {
  const token    = localStorage.getItem("admin_token")
  const provider = localStorage.getItem("auth_provider")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    if (provider === "firebase") config.headers["X-Auth-Provider"] = "firebase"
  }
  return config
})

// Redirect on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // ✅ Lazy import breaks the circular dependency
      import("../context/AuthContext").then(({ useAuthStore }) => {
        useAuthStore.getState().logout()
      })
      window.location.href = "/auth/login"
    }
    return Promise.reject(err)
  }
)

export default api

export const authAPI = {
  register:           (d) => api.post("/auth/register", d),
  login:              (d) => api.post("/auth/login", d),
  verifyEmail:        (d) => api.post("/auth/verify-email", d),
  resendVerification: (d) => api.post("/auth/resend-verification", d),
  forgotPassword:     (d) => api.post("/auth/forgot-password", d),
  resetPassword:      (d) => api.post("/auth/reset-password", d),
  changePassword:     (d) => api.post("/auth/change-password", d),
  me:                 ()  => api.get("/auth/me"),
  logout:             ()  => api.post("/auth/logout"),
  firebaseLogin:      (d) => api.post("/auth/firebase-login", d),
}

export const dashboardAPI    = { getStats: () => api.get("/admin/dashboard/stats") }

export const analyticsAPI = {
  getOverview:    ()      => api.get("/admin/analytics/overview"),
  getRevenue:     (days)  => api.get(`/admin/analytics/revenue?days=${days || 30}`),
  getOrderStatus: ()      => api.get("/admin/analytics/orders"),
  getTopProducts: (limit) => api.get(`/admin/analytics/top-products?limit=${limit || 10}`),
  getCategories:  ()      => api.get("/admin/analytics/categories"),
}

export const productsAPI = {
  getAll:        (p)       => api.get("/admin/products", { params: p }),
  getById:       (id)      => api.get(`/admin/products/${id}`),
  create:        (d)       => api.post("/admin/products", d, { headers: { "Content-Type": "multipart/form-data" } }),
  update:        (id, d)   => api.put(`/admin/products/${id}`, d, { headers: { "Content-Type": "multipart/form-data" } }),
  updateStatus:  (id, d)   => api.patch(`/admin/products/${id}/status`, d),
  adjustStock:   (id, d)   => api.patch(`/admin/products/${id}/stock`, d),
  delete:        (id)      => api.delete(`/admin/products/${id}`),
  getLowStock:   (t)       => api.get(`/admin/products/low-stock?threshold=${t || 10}`),
  addVariant:    (id, d)   => api.post(`/admin/products/${id}/variants`, d),
  updateVariant: (id,v,d)  => api.put(`/admin/products/${id}/variants/${v}`, d),
  deleteVariant: (id, v)   => api.delete(`/admin/products/${id}/variants/${v}`),
}

export const ordersAPI = {
  getAll:       (p)     => api.get("/admin/orders", { params: p }),
  getById:      (id)    => api.get(`/admin/orders/${id}`),
  updateStatus: (id, d) => api.patch(`/admin/orders/${id}/status`, d),
  addTracking:  (id, d) => api.patch(`/admin/orders/${id}/tracking`, d),
  updateNotes:  (id, d) => api.patch(`/admin/orders/${id}/notes`, d),
  delete:       (id)    => api.delete(`/admin/orders/${id}`),
}

export const customersAPI = {
  getAll:      (p)     => api.get("/admin/customers", { params: p }),
  getStats:    ()      => api.get("/admin/customers/stats"),
  getById:     (id)    => api.get(`/admin/customers/${id}`),
  updateTags:  (id, d) => api.patch(`/admin/customers/${id}/tags`, d),
  updateNotes: (id, d) => api.patch(`/admin/customers/${id}/notes`, d),
  toggleBlock: (id)    => api.patch(`/admin/customers/${id}/block`),
  delete:      (id)    => api.delete(`/admin/customers/${id}`),
}

export const transactionsAPI = {
  getAll:     (p)     => api.get("/admin/transactions", { params: p }),
  getSummary: ()      => api.get("/admin/transactions/summary"),
  getById:    (id)    => api.get(`/admin/transactions/${id}`),
  getByOrder: (id)    => api.get(`/admin/transactions/order/${id}`),
  refund:     (id, d) => api.patch(`/admin/transactions/${id}/refund`, d),
}

export const invoicesAPI = {
  getAll:       (p)     => api.get("/admin/invoices", { params: p }),
  getSummary:   ()      => api.get("/admin/invoices/summary"),
  getOverdue:   ()      => api.get("/admin/invoices/overdue"),
  getById:      (id)    => api.get(`/admin/invoices/${id}`),
  updateStatus: (id, d) => api.patch(`/admin/invoices/${id}/status`, d),
}

export const categoriesAPI = {
  getAll:  (p)     => api.get("/admin/categories", { params: p }),
  getById: (id)    => api.get(`/admin/categories/${id}`),
  create:  (d)     => api.post("/admin/categories", d, { headers: { "Content-Type": "multipart/form-data" } }),
  update:  (id, d) => api.put(`/admin/categories/${id}`, d, { headers: { "Content-Type": "multipart/form-data" } }),
  delete:  (id)    => api.delete(`/admin/categories/${id}`),
}

export const couponsAPI = {
  getAll:  (p)     => api.get("/admin/coupons", { params: p }),
  getById: (id)    => api.get(`/admin/coupons/${id}`),
  create:  (d)     => api.post("/admin/coupons", d),
  update:  (id, d) => api.put(`/admin/coupons/${id}`, d),
  toggle:  (id)    => api.patch(`/admin/coupons/${id}/toggle`),
  delete:  (id)    => api.delete(`/admin/coupons/${id}`),
}

export const reviewsAPI = {
  getAll:     (p)     => api.get("/admin/reviews", { params: p }),
  getPending: ()      => api.get("/admin/reviews/pending"),
  approve:    (id)    => api.patch(`/admin/reviews/${id}/approve`),
  reply:      (id, d) => api.patch(`/admin/reviews/${id}/reply`, d),
  delete:     (id)    => api.delete(`/admin/reviews/${id}`),
}

export const notificationsAPI = {
  getAll:         (p)  => api.get("/admin/notifications", { params: p }),
  getUnreadCount: ()   => api.get("/admin/notifications/unread-count"),
  markOneRead:    (id) => api.patch(`/admin/notifications/${id}/read`),
  markAllRead:    ()   => api.patch("/admin/notifications/read-all"),
  delete:         (id) => api.delete(`/admin/notifications/${id}`),
  clearRead:      ()   => api.delete("/admin/notifications/clear-read"),
}

export const settingsAPI = {
  get:               ()  => api.get("/admin/settings"),
  update:            (d) => api.patch("/admin/settings", d, { headers: { "Content-Type": "multipart/form-data" } }),
  toggleMaintenance: (d) => api.post("/admin/settings/maintenance", d),
}

export const adminAccountsAPI = {
  getAll:         ()        => api.get("/admin/accounts"),
  getById:        (id)      => api.get(`/admin/accounts/${id}`),
  create:         (d)       => api.post("/admin/accounts", d),
  update:         (id, d)   => api.patch(`/admin/accounts/${id}`, d),
  changePassword: (id, d)   => api.patch(`/admin/accounts/${id}/password`, d),
  deactivate:     (id)      => api.patch(`/admin/accounts/${id}/deactivate`),
  delete:         (id)      => api.delete(`/admin/accounts/${id}`),
  getLogs:        (id, p)   => api.get(`/admin/accounts/${id}/logs`, { params: p }),
}

export const bulkAPI = {
  updateOrderStatus:   (d) => api.patch("/admin/bulk/orders/status", d),
  updateProductStatus: (d) => api.patch("/admin/bulk/products/status", d),
  restockProducts:     (d) => api.patch("/admin/bulk/products/stock", d),
  deleteProducts:      (d) => api.delete("/admin/bulk/products", { data: d }),
  updateInvoiceStatus: (d) => api.patch("/admin/bulk/invoices/status", d),
}

export const exportAPI = {
  orders:       (p) => api.get("/admin/export/orders",       { params: p, responseType: "blob" }),
  transactions: (p) => api.get("/admin/export/transactions", { params: p, responseType: "blob" }),
  products:     (p) => api.get("/admin/export/products",     { params: p, responseType: "blob" }),
  invoices:     (p) => api.get("/admin/export/invoices",     { params: p, responseType: "blob" }),
  customers:    (p) => api.get("/admin/export/customers",    { params: p, responseType: "blob" }),
}

export const searchAPI = {
  global: (q, limit = 5) => api.get(`/admin/search?q=${q}&limit=${limit}`),
}