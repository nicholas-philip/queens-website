import { useEffect, useState, useCallback } from "react"
import {
  UserCog, Plus, Pencil, ShieldOff, Trash2,
  Eye, EyeOff, Crown, Shield, Clock, Key, Loader2
} from "lucide-react"
import { adminAccountsAPI } from "../../libs/api"
import { useAuthStore } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import Modal from "../../components/Modal"

const getInitials = (name) => {
  if (!name) return "A"
  return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
}

const formatRelativeTime = (dateString) => {
  if (!dateString) return "Never"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

function RoleBadge({ role }) {
  if (role === "SuperAdmin") {
    return (
      <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] uppercase font-bold tracking-widest rounded-lg flex items-center gap-1.5 w-fit">
        <Crown className="h-3 w-3" /> SuperAdmin
      </span>
    )
  }
  return (
    <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] uppercase font-bold tracking-widest rounded-lg flex items-center gap-1.5 w-fit">
      <Shield className="h-3 w-3" /> Manager
    </span>
  )
}

export default function AccountsPage() {
  const toast = useToast()
  const admin = useAuthStore((s) => s.admin)
  const isSuperAdmin = admin?.role === "SuperAdmin"

  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [deactItem, setDeactItem] = useState(null)
  const [passModal, setPassModal] = useState(null)
  const [logsModal, setLogsModal] = useState(null)

  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deacting, setDeacting] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "Manager", phone: "" })
  const [passData, setPassData] = useState({ currentPassword: "", newPassword: "", confirm: "" })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminAccountsAPI.getAll()
      setAccounts(data.admins || [])
    } catch { toast.error("Error", "Failed to load accounts.") }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { load() }, [load])

  // ✅ Fixed: use `admin` instead of `self`
  const isSelf = (id) => admin?._id === id

  const openCreate = () => {
    setEditing(null)
    setFormData({ name: "", email: "", password: "", role: "Manager", phone: "" })
    setFormOpen(true)
  }

  const openEdit = (account) => {
    setEditing(account)
    setFormData({ name: account.name, email: account.email || "", password: "", role: account.role || "Manager", phone: account.phone || "" })
    setFormOpen(true)
  }

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
  const handlePassChange = (e) => setPassData({ ...passData, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) return toast.error("Error", "Name is required.")
    if (!editing && (!formData.email || !formData.password || formData.password.length < 6)) {
      return toast.error("Error", "Valid email and minimum 6 character password required.")
    }

    setSubmitting(true)
    try {
      if (editing) {
        await adminAccountsAPI.update(editing._id, { name: formData.name, phone: formData.phone, role: formData.role })
        toast.success("Updated", `${formData.name}'s account updated.`)
      } else {
        await adminAccountsAPI.create(formData)
        toast.success("Created", `Admin account for ${formData.name} created.`)
      }
      setFormOpen(false)
      load()
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Failed to save account.")
    } finally { setSubmitting(false) }
  }

  const handleDeactivate = async () => {
    setDeacting(true)
    try {
      await adminAccountsAPI.deactivate(deactItem._id)
      toast.success("Deactivated", `${deactItem.name} status updated.`)
      setDeactItem(null)
      load()
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Failed to alter status.")
    } finally { setDeacting(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await adminAccountsAPI.delete(deleteItem._id)
      toast.success("Deleted", `${deleteItem.name}'s account removed permanently.`)
      setDeleteItem(null)
      load()
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Failed to delete account.")
    } finally { setDeleting(false) }
  }

  const openPassModal = (account) => {
    setPassModal(account)
    setPassData({ currentPassword: "", newPassword: "", confirm: "" })
    setShowPass(false)
  }

  const submitPassword = async (e) => {
    e.preventDefault()
    if (!passData.currentPassword || !passData.newPassword) return toast.error("Error", "Both current and new passwords are required.")
    if (passData.newPassword !== passData.confirm) return toast.error("Error", "Passwords do not match.")
    if (passData.newPassword.length < 6) return toast.error("Error", "New password must be at least 6 characters.")

    setSubmitting(true)
    try {
      await adminAccountsAPI.changePassword(passModal._id, {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      })
      toast.success("Success", "Password updated successfully.")
      setPassModal(null)
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Failed to change password.")
    } finally { setSubmitting(false) }
  }

  const openLogs = async (account) => {
    setLogsModal(account)
    setLogsLoading(true)
    try {
      const { data } = await adminAccountsAPI.getLogs(account._id, { limit: 20 })
      setLogs(data.logs || [])
    } catch { toast.error("Error", "Failed to load activity.") }
    finally { setLogsLoading(false) }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Accounts</h1>
          <p className="text-sm text-neutral-500 mt-1">{accounts.length} active administrators</p>
        </div>
        {isSuperAdmin && (
          <button onClick={openCreate} className="px-5 py-2.5 bg-yellow-500 rounded-xl text-sm font-bold text-black hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/20">
            <Plus className="h-4 w-4" /> Add Admin
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-500 mb-4 shadow-inner">
            <UserCog className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No admin accounts found</h3>
          {isSuperAdmin && (
            <button onClick={openCreate} className="px-6 py-2.5 bg-neutral-800 text-white font-bold rounded-xl hover:bg-neutral-700 transition-all mt-4">Add the first admin</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div key={acc._id}
              className={`bg-neutral-900/40 border p-6 rounded-3xl flex flex-col gap-5 transition-all group hover:border-yellow-500/30
                ${!acc.isActive ? "opacity-60 border-neutral-800" : "border-neutral-800"}
                ${isSelf(acc._id) ? "ring-1 ring-yellow-500/50" : ""}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white font-bold text-lg shadow-inner
                  ${acc.role === "SuperAdmin" ? "bg-purple-500" : "bg-blue-500"}`}>
                  {getInitials(acc.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white truncate text-lg">{acc.name}</p>
                    {isSelf(acc._id) && <span className="px-2 py-0.5 bg-yellow-500 text-black text-[9px] font-bold uppercase tracking-widest rounded">You</span>}
                  </div>
                  <p className="text-xs text-neutral-500 truncate mt-0.5">{acc.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <RoleBadge role={acc.role} />
                <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest rounded-lg border ${acc.isActive ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}>
                  {acc.isActive ? "Active" : "Deactivated"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest bg-black/40 p-3 rounded-xl border border-neutral-800">
                <Clock className="h-4 w-4 text-neutral-600" />
                {acc.lastLogin ? formatRelativeTime(acc.lastLogin) : "Never Logged In"}
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-800 mt-2">
                <button onClick={() => openEdit(acc)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-800 rounded-xl text-xs font-bold text-white hover:bg-yellow-500 hover:text-black transition-all">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>

                {isSelf(acc._id) && (
                  <button onClick={() => openPassModal(acc)} className="px-3 py-2 bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-all flex items-center justify-center">
                    <Key className="h-4 w-4" />
                  </button>
                )}

                <button onClick={() => openLogs(acc)} className="px-3 py-2 bg-neutral-800 rounded-xl text-neutral-400 hover:text-blue-400 transition-all flex items-center justify-center" title="Activity Log">
                  <Eye className="h-4 w-4" />
                </button>

                {isSuperAdmin && !isSelf(acc._id) && (
                  <>
                    {acc.isActive && (
                      <button onClick={() => setDeactItem(acc)} className="px-3 py-2 bg-neutral-800 rounded-xl text-neutral-400 hover:text-orange-500 transition-all flex items-center justify-center" title="Deactivate">
                        <ShieldOff className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => setDeleteItem(acc)} className="px-3 py-2 bg-neutral-800 rounded-xl text-neutral-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? `Edit: ${editing.name}` : "New Admin Account"}>
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Full Name *</label>
            <input name="name" value={formData.name} onChange={handleFormChange} required placeholder="John Doe" className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50" />
          </div>

          {!editing && (
            <>
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleFormChange} required placeholder="admin@store.com" className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Temporary Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleFormChange} required minLength={6} placeholder="Min. 6 characters" className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50" />
              </div>
            </>
          )}

          {editing && (
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Phone</label>
              <input name="phone" value={formData.phone} onChange={handleFormChange} placeholder="+123 456 7890" className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 font-mono" />
            </div>
          )}

          {isSuperAdmin && (
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Role</label>
              <select name="role" value={formData.role} onChange={handleFormChange} className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 appearance-none">
                <option value="Manager">Manager</option>
                <option value="SuperAdmin">SuperAdmin</option>
              </select>
              <p className="mt-2 text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-1">Managers cannot access Admin Accounts or change settings.</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-neutral-800">
            <button type="button" onClick={() => setFormOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-yellow-500 rounded-xl text-xs font-bold text-black hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save Changes" : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Password Modal */}
      <Modal open={!!passModal} onClose={() => setPassModal(null)} title="Change Password">
        <form onSubmit={submitPassword} className="p-6 space-y-6">
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Current Password</label>
            <input type="password" name="currentPassword" value={passData.currentPassword} onChange={handlePassChange} required placeholder="Your current password" className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50" />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">New Password</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} name="newPassword" value={passData.newPassword} onChange={handlePassChange} required minLength={6} placeholder="Min. 6 characters" className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 pr-12" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-yellow-500 transition-colors">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Confirm New Password</label>
            <input type="password" name="confirm" value={passData.confirm} onChange={handlePassChange} required placeholder="Repeat new password" className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50" />
          </div>

          <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-neutral-800">
            <button type="button" onClick={() => setPassModal(null)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-yellow-500 rounded-xl text-xs font-bold text-black hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Password"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Activity Logs Modal */}
      <Modal open={!!logsModal} onClose={() => setLogsModal(null)} title={`Activity Log: ${logsModal?.name}`}>
        <div className="p-6 pt-0">
          {logsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-yellow-500" /></div>
          ) : logs.length === 0 ? (
            <p className="text-center text-sm font-bold text-neutral-500 uppercase tracking-widest py-12 bg-neutral-900/40 rounded-2xl border border-neutral-800">No activity recorded yet.</p>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {logs.map((log) => (
                <div key={log._id} className="flex flex-col gap-2 p-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <span className="font-bold font-mono text-xs bg-black/40 px-2.5 py-1 rounded-lg border border-neutral-700 text-yellow-500">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </div>
                  {log.target && <p className="text-sm font-bold text-white mt-1">{log.target}</p>}
                  {log.details && <p className="text-xs text-neutral-400">{log.details}</p>}
                  <p className="text-[10px] text-neutral-600 font-mono flex items-center gap-1 mt-2">
                    IP: <span className="text-neutral-500">{log.ipAddress || "Unknown"}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Deactivate Confirm */}
      <Modal open={!!deactItem} onClose={() => setDeactItem(null)} title="Deactivate Admin">
        <div className="p-6">
          <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
            Deactivate <b className="text-white">{deactItem?.name}</b>? They will not be able to log in to the dashboard anymore, but their activity history is preserved.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setDeactItem(null)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleDeactivate} disabled={deacting} className="px-6 py-2.5 bg-orange-500 rounded-xl text-xs font-bold text-white hover:bg-orange-400 transition-all disabled:opacity-50 flex items-center gap-2">
              {deacting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deactivate"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Admin">
        <div className="p-6">
          <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
            Permanently delete <b className="text-white">{deleteItem?.name}</b>'s account? This action is <b className="text-red-500">irreversible</b> and deletes all personal account state.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setDeleteItem(null)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="px-6 py-2.5 bg-red-500 rounded-xl text-xs font-bold text-white hover:bg-red-400 transition-all disabled:opacity-50 flex items-center gap-2">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Forever"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}