import { useEffect, useState, useCallback } from "react"
import {
  Plus, Ticket, ToggleLeft, ToggleRight,
  Trash2, Pencil, Copy, Check, Search, Loader2
} from "lucide-react"
import { couponsAPI } from "../../libs/api"
import { formatCurrency } from "../../libs/utils"
import { useToast } from "../../context/ToastContext"
import Modal from "../../components/Modal"

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric'})
}

function CouponCard({ coupon, onEdit, onToggle, onDelete }) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const expired = new Date() > new Date(coupon.expiryDate)

  const copy = () => {
    navigator.clipboard.writeText(coupon.code)
    setCopied(true)
    toast.success("Copied!", `Code "${coupon.code}" copied.`)
    setTimeout(() => setCopied(false), 2000)
  }

  const discountLabel =
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}% off`
      : `${formatCurrency(coupon.discountValue)} off`

  return (
    <div className={`bg-neutral-900 border border-neutral-800 p-6 rounded-3xl flex flex-col gap-5 transition-all group hover:border-yellow-500/30 ${!coupon.isActive ? "opacity-60" : ""}`}>
      {/* Code + Copy */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xl font-bold text-white tracking-widest bg-black px-3 py-1 rounded-lg border border-neutral-800">
            {coupon.code}
          </span>
          <button onClick={copy} className="p-2 bg-neutral-800 rounded-xl text-neutral-400 hover:text-yellow-500 transition-colors">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {expired && <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs uppercase font-bold tracking-widest rounded-lg">Expired</span>}
          <span className={`px-2.5 py-1 text-xs uppercase font-bold tracking-widest rounded-lg border ${coupon.isActive ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-neutral-800 border-neutral-700 text-neutral-400"}`}>
            {coupon.isActive ? "Active" : "Off"}
          </span>
        </div>
      </div>

      {/* Discount Badge */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 text-sm font-bold shadow-inner">
          <Ticket className="h-4 w-4" />
          {discountLabel}
        </span>
        {coupon.minOrderAmount > 0 && (
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            Min {formatCurrency(coupon.minOrderAmount)}
          </span>
        )}
      </div>

      {/* Description */}
      {coupon.description && (
        <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">{coupon.description}</p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-black border border-neutral-800 p-3">
          <p className="text-lg font-bold text-white">{coupon.usedCount || 0}</p>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Used</p>
        </div>
        <div className="rounded-2xl bg-black border border-neutral-800 p-3">
          <p className="text-lg font-bold text-white">
            {coupon.maxUses ? coupon.maxUses - (coupon.usedCount || 0) : "∞"}
          </p>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Remaining</p>
        </div>
        <div className="rounded-2xl bg-black border border-neutral-800 p-3 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-white leading-tight">{formatDate(coupon.expiryDate)}</p>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Expires</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-neutral-800 mt-2">
        <button onClick={() => onEdit(coupon)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-800 rounded-xl text-xs font-bold text-white hover:bg-yellow-500 hover:text-black transition-all">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
        <button
          onClick={() => onToggle(coupon)}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${coupon.isActive ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white" : "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"}`}
        >
          {coupon.isActive
            ? <><ToggleLeft className="h-4 w-4" /> Disable</>
            : <><ToggleRight className="h-4 w-4" /> Enable</>
          }
        </button>
        <button onClick={() => onDelete(coupon)} className="px-3 py-2 bg-neutral-800 rounded-xl text-neutral-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function CouponsPage() {
  const toast = useToast()

  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modals
  const [formOpen, setFormOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  
  // State
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  const [formData, setFormData] = useState({
    code: "", description: "", discountType: "percentage",
    discountValue: "", minOrderAmount: 0, maxUses: "",
    expiryDate: "", maxDiscountAmount: "",
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await couponsAPI.getAll()
      setCoupons(data.coupons)
    } catch { toast.error("Error", "Failed to load coupons.") }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setFormData({
      code: "", description: "", discountType: "percentage",
      discountValue: "", minOrderAmount: 0, maxUses: "",
      expiryDate: "", maxDiscountAmount: "",
    })
    setFormOpen(true)
  }

  const openEdit = (coupon) => {
    setEditing(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxUses: coupon.maxUses || "",
      expiryDate: coupon.expiryDate?.slice(0, 10) || "",
      maxDiscountAmount: coupon.maxDiscountAmount || "",
    })
    setFormOpen(true)
  }

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!editing && !formData.code) return toast.error("Error", "Coupon Code is required")
    if (!formData.discountValue || !formData.expiryDate) return toast.error("Error", "Discount value and expiry date required")

    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
      }

      if (editing) {
        delete payload.code // Don't allow changing code
        await couponsAPI.update(editing._id, payload)
        toast.success("Updated", "Coupon updated successfully.")
      } else {
        await couponsAPI.create(payload)
        toast.success("Created", `Coupon "${payload.code}" created successfully.`)
      }
      setFormOpen(false)
      load()
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Failed to save coupon.")
    } finally { setSubmitting(false) }
  }

  const handleToggle = async (coupon) => {
    try {
      const { data } = await couponsAPI.toggle(coupon._id)
      setCoupons((p) => p.map((c) => c._id === coupon._id ? { ...c, isActive: data.isActive } : c))
      toast.success("Success", data.message)
    } catch { toast.error("Error", "Failed to toggle coupon status.") }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await couponsAPI.delete(deleteItem._id)
      toast.success("Deleted", `"${deleteItem.code}" permanently removed.`)
      setDeleteItem(null)
      load()
    } catch { toast.error("Error", "Failed to delete coupon.") }
    finally { setDeleting(false) }
  }

  const now = new Date()
  const filtered = coupons.filter((c) => {
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase()) ||
                        (c.description || "").toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (filter === "active")  return c.isActive && new Date(c.expiryDate) >= now
    if (filter === "inactive") return !c.isActive
    if (filter === "expired") return new Date(c.expiryDate) < now
    return true
  })

  // Stats
  const activeCount  = coupons.filter((c) => c.isActive && new Date(c.expiryDate) >= now).length
  const expiredCount = coupons.filter((c) => new Date(c.expiryDate) < now).length
  const totalUsed    = coupons.reduce((s, c) => s + (c.usedCount || 0), 0)

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Coupons</h1>
          <p className="text-sm text-neutral-500 mt-1">{coupons.length} total discount codes</p>
        </div>
        <button onClick={openCreate} className="px-5 py-2.5 bg-yellow-500 rounded-xl text-sm font-bold text-black hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/20">
          <Plus className="h-4 w-4" /> New Coupon
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Coupons", value: coupons.length, iconColor: "text-white" },
          { label: "Active", value: activeCount, iconColor: "text-green-500" },
          { label: "Expired", value: expiredCount, iconColor: "text-red-500" },
          { label: "Total Uses", value: totalUsed, iconColor: "text-blue-500" },
        ].map((s) => (
          <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.iconColor}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-neutral-900 border border-neutral-800 p-3 rounded-2xl">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-black rounded-xl w-full md:w-auto">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "inactive", label: "Inactive" },
            { key: "expired", label: "Expired" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === key ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full max-w-sm ml-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code or name..." 
            className="w-full bg-black border border-neutral-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all font-medium placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-500 mb-4 shadow-inner">
            <Ticket className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No coupons found</h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-sm">Create discount codes to boost your sales and run promotions.</p>
          <button onClick={openCreate} className="px-6 py-2.5 bg-neutral-800 text-white font-bold rounded-xl hover:bg-neutral-700 transition-all">
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <CouponCard
              key={c._id}
              coupon={c}
              onEdit={openEdit}
              onToggle={handleToggle}
              onDelete={setDeleteItem}
            />
          ))}
        </div>
      )}

      {/* ── Form Modal ── */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Coupon" : "Create Coupon"}>
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {!editing && (
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Coupon Code *</label>
              <input
                name="code" value={formData.code} onChange={handleFormChange}
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 uppercase tracking-widest font-mono"
                placeholder="e.g. FLASH20"
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Description <span className="text-neutral-600 normal-case tracking-normal">(optional)</span></label>
            <input 
              name="description" value={formData.description} onChange={handleFormChange}
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50" 
              placeholder="e.g. 20% off all orders" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Discount Type *</label>
              <select name="discountType" value={formData.discountType} onChange={handleFormChange} className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 appearance-none">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">
                {formData.discountType === "percentage" ? "Percentage % *" : "Amount *"}
              </label>
              <input
                type="number" step="0.01" name="discountValue" value={formData.discountValue} onChange={handleFormChange} required min="0.01"
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 font-mono"
                placeholder={formData.discountType === "percentage" ? "20" : "5000"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Min. Order</label>
              <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleFormChange} className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 font-mono" placeholder="0" />
            </div>
            {formData.discountType === "percentage" && (
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Max Discount <span className="text-neutral-600 normal-case tracking-normal">(cap)</span></label>
                <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleFormChange} className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 font-mono" placeholder="No cap" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Max Uses <span className="text-neutral-600 normal-case tracking-normal">(blank = ∞)</span></label>
              <input type="number" name="maxUses" value={formData.maxUses} onChange={handleFormChange} className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 font-mono" placeholder="e.g. 100" />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Expiry Date *</label>
              <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleFormChange} required className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 appearance-none" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-neutral-800">
             <button type="button" onClick={() => setFormOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-white transition-colors">Cancel</button>
             <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-yellow-500 rounded-xl text-xs font-bold text-black hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center gap-2">
               {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save Changes" : "Create Coupon"}
             </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm ── */}
      <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Coupon">
        <div className="p-6">
          <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
            Are you sure you want to permanently delete the coupon code <b className="text-white bg-neutral-800 px-2 py-0.5 rounded uppercase tracking-widest">{deleteItem?.code}</b>? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
             <button onClick={() => setDeleteItem(null)} disabled={deleting} className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-white transition-colors">Cancel</button>
             <button onClick={handleDelete} disabled={deleting} className="px-6 py-2.5 bg-red-500 rounded-xl text-xs font-bold text-white hover:bg-red-400 transition-all disabled:opacity-50 flex items-center gap-2">
               {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Forever"}
             </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
