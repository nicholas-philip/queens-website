import { useEffect, useState, useRef } from "react"
import {
  Store, DollarSign, Bell, Globe, Shield,
  Upload, ToggleLeft, ToggleRight, Loader2,
  ChevronRight, Pencil, Check, X,
} from "lucide-react"
import { settingsAPI } from "../../libs/api"
import { useToast } from "../../context/ToastContext"
import Spinner from "../../components/Spinner"

/* ─────────────────────────────────────────
   Section wrapper — no bg, no border
───────────────────────────────────────── */
function SettingsSection({ icon: Icon, title, description, children, danger }) {
  return (
    <div className="py-2">
      <div className="flex items-center gap-3 mb-6">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border
          ${danger
            ? "bg-red-950/40 border-red-800/40 text-red-400"
            : "bg-yellow-500/10 border-yellow-600/20 text-yellow-500"
          }`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
          {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="space-y-0">{children}</div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Inline editable field row
───────────────────────────────────────── */
function EditableField({ label, hint, name, value, type = "text", onSave, multiline, prefix, suffix, mono }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const commit = async () => {
    setSaving(true)
    await onSave(name, draft)
    setSaving(false)
    setEditing(false)
  }

  const cancel = () => { setDraft(value); setEditing(false) }

  const inputCls = `bg-transparent border-0 border-b-2 border-yellow-600/70 rounded-none px-0 py-1 text-sm text-white placeholder-neutral-600 outline-none focus:ring-0 w-full transition-all ${mono ? "font-mono" : ""} ${prefix ? "pl-5" : ""}`

  return (
    <div className="group flex items-start gap-4 py-3.5 border-b border-neutral-800/40 last:border-0">

      {/* Label */}
      <div className="w-44 shrink-0 pt-0.5">
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.12em]">{label}</p>
        {hint && <p className="text-[10px] text-neutral-700 mt-0.5 leading-relaxed">{hint}</p>}
      </div>

      {/* Value / Input */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="relative">
            {prefix && (
              <span className="absolute left-0 top-1 text-yellow-600 text-sm font-bold pointer-events-none">{prefix}</span>
            )}
            {multiline ? (
              <textarea
                ref={inputRef}
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className={`${inputCls} resize-none`}
              />
            ) : (
              <input
                ref={inputRef}
                type={type}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel() }}
                className={inputCls}
              />
            )}
            {suffix && (
              <span className="absolute right-0 top-1 text-neutral-500 text-xs font-bold pointer-events-none">{suffix}</span>
            )}
          </div>
        ) : (
          <p className={`text-sm truncate ${mono ? "font-mono" : ""} ${!value ? "text-neutral-600 italic" : "text-white"}`}>
            {prefix && value ? <span className="text-yellow-600 mr-0.5">{prefix}</span> : null}
            {value || "—"}
            {suffix && value ? <span className="text-neutral-500 ml-1 text-xs">{suffix}</span> : null}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1.5 pt-0.5 h-6">
        {editing ? (
          <>
            <button
              type="button"
              onClick={commit}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black text-[11px] font-bold transition-all shadow-[0_2px_10px_rgba(212,160,23,0.25)] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Save
            </button>
            <button
              type="button"
              onClick={cancel}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-[11px] transition-all"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800/70 hover:bg-neutral-800 border border-neutral-700/50 hover:border-yellow-600/30 text-neutral-500 hover:text-yellow-500 text-[11px] font-bold transition-all duration-150"
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Toggle row
───────────────────────────────────────── */
function ToggleRow({ label, hint, name, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-neutral-800/40 last:border-0">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        {hint && <p className="text-xs text-neutral-500 mt-0.5">{hint}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-6">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-10 h-5 bg-neutral-800 border border-neutral-700 rounded-full
          peer-checked:bg-gradient-to-r peer-checked:from-yellow-600 peer-checked:to-amber-500
          peer-checked:border-yellow-600/50
          after:content-[''] after:absolute after:top-[2px] after:left-[2px]
          after:bg-neutral-500 after:rounded-full after:h-4 after:w-4 after:transition-all
          peer-checked:after:translate-x-5 peer-checked:after:bg-black
          transition-all duration-200" />
      </label>
    </div>
  )
}

const Divider = () => (
  <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent my-2" />
)

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
export default function SettingsPage() {
  const toast = useToast()
  const fileRef = useRef(null)

  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingAll, setSavingAll] = useState(false)
  const [maintenance, setMaintenance] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  const [formData, setFormData] = useState({
    storeName: "", storeEmail: "", storePhone: "", storeAddress: "", storeTagline: "",
    currencySymbol: "GH₵", currencyCode: "GHS", defaultTaxRate: 0,
    freeShippingThreshold: 0, minimumOrderAmount: 0,
    orderAutoCancelDays: 3, lowStockThreshold: 10,
    maintenanceMode: false, maintenanceMessage: "",
    allowGuestCheckout: true, notifyAdminOnNewOrder: true,
    notifyCustomerOnStatusChange: true, invoiceFooterNote: "",
    "socialLinks.facebook": "", "socialLinks.instagram": "",
    "socialLinks.twitter": "", "socialLinks.whatsapp": "", "socialLinks.tiktok": "",
  })

  const load = async () => {
    try {
      const { data } = await settingsAPI.get()
      const s = data.settings
      setSettings(s)
      setLogoPreview(s.logoUrl)
      setFormData({
        storeName: s.storeName || "", storeEmail: s.storeEmail || "",
        storePhone: s.storePhone || "", storeAddress: s.storeAddress || "",
        storeTagline: s.storeTagline || "", currencySymbol: s.currencySymbol || "GH₵",
        currencyCode: s.currencyCode || "GHS", defaultTaxRate: s.defaultTaxRate || 0,
        freeShippingThreshold: s.freeShippingThreshold || 0,
        minimumOrderAmount: s.minimumOrderAmount || 0,
        orderAutoCancelDays: s.orderAutoCancelDays || 3,
        lowStockThreshold: s.lowStockThreshold || 10,
        maintenanceMode: s.maintenanceMode || false,
        maintenanceMessage: s.maintenanceMessage || "",
        allowGuestCheckout: s.allowGuestCheckout !== false,
        notifyAdminOnNewOrder: s.notifyAdminOnNewOrder !== false,
        notifyCustomerOnStatusChange: s.notifyCustomerOnStatusChange !== false,
        invoiceFooterNote: s.invoiceFooterNote || "",
        "socialLinks.facebook": s.socialLinks?.facebook || "",
        "socialLinks.instagram": s.socialLinks?.instagram || "",
        "socialLinks.twitter": s.socialLinks?.twitter || "",
        "socialLinks.whatsapp": s.socialLinks?.whatsapp || "",
        "socialLinks.tiktok": s.socialLinks?.tiktok || "",
      })
    } catch { toast.error("Error", "Failed to load settings.") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  /* Save a single field */
  const saveField = async (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    try {
      const form = new FormData()
      if (name.startsWith("socialLinks.")) {
        const key = name.replace("socialLinks.", "")
        const current = {}
        Object.keys(formData).forEach((k) => {
          if (k.startsWith("socialLinks.")) current[k.replace("socialLinks.", "")] = formData[k]
        })
        current[key] = value
        form.append("socialLinks", JSON.stringify(current))
      } else {
        form.append(name, value)
      }
      await settingsAPI.update(form)
      toast.success("Saved", `${label} updated.`)
    } catch { toast.error("Error", "Failed to save.") }
  }

  const handleLogoFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  /* Save everything */
  const saveAll = async () => {
    setSavingAll(true)
    try {
      const form = new FormData()
      const flat = { ...formData }
      const social = {}
      Object.keys(flat).forEach((k) => {
        if (k.startsWith("socialLinks.")) { social[k.replace("socialLinks.", "")] = flat[k]; delete flat[k] }
      })
      flat.socialLinks = JSON.stringify(social)
      Object.entries(flat).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, v) })
      if (logoFile) form.append("logo", logoFile)
      await settingsAPI.update(form)
      toast.success("All Saved", "All settings committed successfully.")
      load()
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Failed to save.")
    } finally { setSavingAll(false) }
  }

  const toggleMaintenance = async () => {
    setMaintenance(true)
    try {
      const { data } = await settingsAPI.toggleMaintenance({
        enabled: !settings?.maintenanceMode,
        message: formData.maintenanceMessage || settings?.maintenanceMessage,
      })
      setSettings((p) => ({ ...p, maintenanceMode: data.maintenanceMode }))
      setFormData((p) => ({ ...p, maintenanceMode: data.maintenanceMode }))
      toast.success(
        data.maintenanceMode ? "Maintenance ON" : "Maintenance OFF",
        data.maintenanceMode ? "Storefront is now offline." : "Storefront is live again."
      )
    } catch { toast.error("Error", "Failed to toggle maintenance.") }
    finally { setMaintenance(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  )

  return (
    <div className="max-w-3xl mx-auto pb-28 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-[10px] text-neutral-600 uppercase tracking-widest mb-3 font-bold">
          <span>Admin</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-yellow-600">Settings</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight leading-none">Store Settings</h1>
        <p className="text-sm text-neutral-500 mt-2">
          Hover any field and click <span className="text-yellow-600 font-semibold">Edit</span> to update it, or use <span className="text-yellow-600 font-semibold">Save All</span> at the bottom.
        </p>
      </div>

      <div className="space-y-10">

        {/* ── Store Identity ── */}
        <SettingsSection icon={Store} title="Store Identity" description="Basic information displayed on invoices, emails, and receipts.">
          {/* Logo row */}
          <div className="group flex items-center gap-4 py-3.5 border-b border-neutral-800/40">
            <div className="w-44 shrink-0">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.12em]">Store Logo</p>
              <p className="text-[10px] text-neutral-700 mt-0.5">Square PNG/JPG · max 2MB</p>
            </div>
            <div className="flex items-center gap-4 flex-1">
              <div className="h-12 w-12 rounded-xl border border-dashed border-neutral-700 overflow-hidden bg-black/30 flex items-center justify-center shrink-0">
                {logoPreview
                  ? <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                  : <Store className="h-5 w-5 text-neutral-600" />}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/70 hover:bg-neutral-800 border border-neutral-700/50 hover:border-yellow-600/30 text-neutral-500 hover:text-yellow-500 text-[11px] font-bold transition-all duration-150"
              >
                <Upload className="h-3 w-3" /> Upload
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
            </div>
          </div>

          <EditableField label="Store Name"     name="storeName"    value={formData.storeName}    onSave={saveField} />
          <EditableField label="Tagline"        name="storeTagline" value={formData.storeTagline} onSave={saveField} />
          <EditableField label="Support Email"  name="storeEmail"   value={formData.storeEmail}   onSave={saveField} type="email" mono />
          <EditableField label="Support Phone"  name="storePhone"   value={formData.storePhone}   onSave={saveField} mono />
          <EditableField label="Office Address" name="storeAddress" value={formData.storeAddress} onSave={saveField} multiline />
        </SettingsSection>

        <Divider />

        {/* ── Currency & Pricing ── */}
        <SettingsSection icon={DollarSign} title="Currency & Pricing" description="Pricing rules, thresholds, and display configuration.">
          <EditableField label="Currency Symbol"      name="currencySymbol"        value={String(formData.currencySymbol)}        onSave={saveField} mono />
          <EditableField label="Currency Code"        name="currencyCode"          value={String(formData.currencyCode)}          onSave={saveField} mono />
          <EditableField label="Default Tax Rate"     name="defaultTaxRate"        value={String(formData.defaultTaxRate)}        onSave={saveField} type="number" suffix="%" mono hint="Set 0 to disable." />
          <EditableField label="Free Shipping From"   name="freeShippingThreshold" value={String(formData.freeShippingThreshold)} onSave={saveField} type="number" prefix={formData.currencySymbol} mono hint="0 = disabled." />
          <EditableField label="Minimum Order"        name="minimumOrderAmount"    value={String(formData.minimumOrderAmount)}    onSave={saveField} type="number" prefix={formData.currencySymbol} mono />
          <EditableField label="Auto-Cancel After"    name="orderAutoCancelDays"   value={String(formData.orderAutoCancelDays)}   onSave={saveField} type="number" suffix="days" mono hint="Unpaid orders." />
          <EditableField label="Low Stock Threshold"  name="lowStockThreshold"     value={String(formData.lowStockThreshold)}     onSave={saveField} type="number" mono hint="Badge trigger count." />
        </SettingsSection>

        <Divider />

        {/* ── Notifications ── */}
        <SettingsSection icon={Bell} title="Notifications & Behaviour" description="Toggle automated emails and checkout behaviour.">
          <ToggleRow name="notifyAdminOnNewOrder"        label="Email admin on new order"         hint="Sends an alert to the store email when a new order is placed." checked={formData.notifyAdminOnNewOrder}        onChange={handleChange} />
          <ToggleRow name="notifyCustomerOnStatusChange" label="Email customer on status update"  hint="Notifies customers when their order status changes."           checked={formData.notifyCustomerOnStatusChange} onChange={handleChange} />
          <ToggleRow name="allowGuestCheckout"           label="Allow guest checkout"             hint="Lets customers purchase without creating an account."         checked={formData.allowGuestCheckout}           onChange={handleChange} />
          <EditableField label="Invoice Footer Note" name="invoiceFooterNote" value={formData.invoiceFooterNote} onSave={saveField} multiline hint="Appears on all customer invoices." />
        </SettingsSection>

        <Divider />

        {/* ── Social Links ── */}
        <SettingsSection icon={Globe} title="Social Media Links" description="Linked in dispatch emails and your store footer.">
          {[
            { key: "socialLinks.facebook",  label: "Facebook"    },
            { key: "socialLinks.instagram", label: "Instagram"   },
            { key: "socialLinks.twitter",   label: "Twitter / X" },
            { key: "socialLinks.whatsapp",  label: "WhatsApp"    },
            { key: "socialLinks.tiktok",    label: "TikTok"      },
          ].map(({ key, label }) => (
            <EditableField key={key} label={label} name={key} value={formData[key]} onSave={saveField} mono />
          ))}
        </SettingsSection>

        <Divider />

        {/* ── Maintenance ── */}
        <SettingsSection icon={Shield} title="Maintenance Mode" description="Emergency switch — puts the storefront offline while preserving dashboard access." danger>
          <div className="flex items-center justify-between py-3.5 border-b border-neutral-800/40">
            <div>
              <p className="text-sm font-bold text-white">Storefront Status</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${settings?.maintenanceMode ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
                <span className={`text-xs font-semibold uppercase tracking-widest ${settings?.maintenanceMode ? "text-red-400" : "text-green-400"}`}>
                  {settings?.maintenanceMode ? "Offline — Maintenance Active" : "Live — Accepting Orders"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleMaintenance}
              disabled={maintenance}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2
                ${settings?.maintenanceMode
                  ? "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                  : "bg-red-600/90 hover:bg-red-500 text-white shadow-[0_0_16px_rgba(239,68,68,0.2)]"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {maintenance
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : settings?.maintenanceMode
                  ? <><ToggleRight className="h-3.5 w-3.5 text-green-400" /> Bring Online</>
                  : <><ToggleLeft className="h-3.5 w-3.5" /> Enable</>
              }
            </button>
          </div>
          <EditableField label="Maintenance Message" name="maintenanceMessage" value={formData.maintenanceMessage} onSave={saveField} multiline hint="Shown to customers on the storefront." />
        </SettingsSection>
      </div>

      {/* ── Save All ── */}
      <div className="mt-14 flex items-center justify-between pt-6 border-t border-neutral-800/60">
        <div>
          <p className="text-sm font-bold text-white">Save all changes</p>
          <p className="text-xs text-neutral-500 mt-0.5">Commits every setting including logo and toggles in one request.</p>
        </div>
        <button
          type="button"
          onClick={saveAll}
          disabled={savingAll}
          className="px-7 py-2.5 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold text-black shadow-[0_4px_20px_rgba(212,160,23,0.3)] hover:shadow-[0_4px_28px_rgba(212,160,23,0.5)] transition-all duration-200 flex items-center gap-2"
        >
          {savingAll ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save All Settings"}
        </button>
      </div>
    </div>
  )
}