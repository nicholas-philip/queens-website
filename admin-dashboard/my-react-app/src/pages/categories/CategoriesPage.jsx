import { useEffect, useState, useCallback, useRef } from "react"
import { Plus, Search, LayoutGrid, Trash2, Loader2, Image as ImageIcon, Tag, Pencil } from "lucide-react"
import { categoriesAPI } from "../../libs/api"
import { useToast } from "../../context/ToastContext"
import Modal from "../../components/Modal"

export default function CategoriesPage() {
  const toast = useToast()
  
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  
  // Form State
  const [editing, setEditing] = useState(null) // null = create, object = edit
  const [formData, setFormData] = useState({ name: "", description: "", subcategories: "" })
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  
  const loadCategories = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await categoriesAPI.getAll()
      setCategories(data.categories || [])
    } catch (err) {
      toast.error("Error", "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditing(null)
    setFormData({ name: "", description: "", subcategories: "" })
    setPreview(null)
    setIsFormModalOpen(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setFormData({ name: cat.name, description: cat.description || "", subcategories: cat.subcategories?.join(", ") || "" })
    setPreview(cat.image || null)
    setIsFormModalOpen(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) return toast.error("Error", "Category name is required.")
    
    setSubmitting(true)
    try {
      const payload = new FormData()
      payload.append("name", formData.name)
      if (formData.description) payload.append("description", formData.description)
      if (formData.subcategories !== undefined) payload.append("subcategories", formData.subcategories)
      
      if (fileInputRef.current?.files?.[0]) {
        payload.append("image", fileInputRef.current.files[0])
      }

      if (editing) {
        await categoriesAPI.update(editing._id, payload)
        toast.success("Updated", "Category updated successfully!")
      } else {
        await categoriesAPI.create(payload)
        toast.success("Created", "Category added successfully!")
      }
      
      setIsFormModalOpen(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
      loadCategories()
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Failed to save category")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await categoriesAPI.delete(deleteId)
      toast.success("Deleted", "Category permanently removed.")
      setDeleteId(null)
      loadCategories()
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Failed to delete category")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Categories</h1>
          <p className="text-sm text-neutral-500 mt-1">{categories.length} total categories for your products</p>
        </div>
        <button 
          onClick={openCreate}
          className="px-5 py-2.5 bg-yellow-500 rounded-xl text-sm font-bold text-black hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/20"
        >
          <Plus className="h-4 w-4" /> New Category
        </button>
      </div>

      <div className="relative w-full max-w-sm mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full bg-neutral-900/40 border border-neutral-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all font-medium placeholder:text-neutral-600"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-500 mb-4 shadow-inner">
                <Tag className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No categories found</h3>
            <p className="text-sm text-neutral-500 mb-6 max-w-sm">Create your first category to start organizing your products efficiently.</p>
            <button onClick={openCreate} className="px-6 py-2.5 bg-neutral-800 text-white font-bold rounded-xl hover:bg-neutral-700 transition-all">
                Create Category
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((cat) => (
            <div key={cat._id} className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-5 flex flex-col gap-4 hover:border-yellow-500/30 transition-colors group">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/40 border border-neutral-800 relative">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-2">
                    <Tag className="h-8 w-8 opacity-50" />
                    <span className="text-xs uppercase font-bold tracking-widest">No Cover</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-widest shadow-lg ${
                        cat.isActive !== false ? 'bg-green-500 text-black' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                        {cat.isActive !== false ? "Active" : "Hidden"}
                    </span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-3 mb-1">
                    <h3 className="font-bold text-lg text-white truncate">{cat.name}</h3>
                    <div className="px-2 py-0.5 bg-neutral-800 rounded-lg border border-neutral-700 font-mono text-xs font-bold text-yellow-500 whitespace-nowrap">
                        {cat.productCount || 0} ITEMS
                    </div>
                </div>
                {cat.description && (
                  <p className="text-xs text-neutral-500 line-clamp-1 leading-relaxed">{cat.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-neutral-800 mt-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-800 rounded-xl text-xs font-bold text-white hover:bg-yellow-500 hover:text-black transition-all"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(cat._id)}
                  className="px-3 py-2 bg-neutral-800 rounded-xl text-neutral-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal open={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editing ? `Edit: ${editing.name}` : "New Category"}>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="flex flex-col items-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-32 h-32 rounded-3xl border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center bg-black/20 cursor-pointer overflow-hidden group hover:border-yellow-500/50 transition-colors"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 text-neutral-500 mx-auto mb-2 group-hover:text-yellow-500 transition-colors" />
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Upload</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <p className="text-xs text-neutral-500 uppercase tracking-widest mt-3">Cover Image Output</p>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Category Name *</label>
            <input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50" 
              placeholder="e.g. Footwear" 
              required
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              rows={3} 
              className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 resize-none" 
              placeholder="Optional short description..." 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Subcategories (Dropdowns)</label>
            <input 
              value={formData.subcategories || ""} 
              onChange={e => setFormData({...formData, subcategories: e.target.value})} 
              className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50" 
              placeholder="e.g. Mens, Ladies, Unisex" 
            />
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-2 ml-1">Comma-separated style filters for the storefront</p>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-neutral-800">
             <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-white transition-colors">Cancel</button>
             <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-yellow-500 rounded-xl text-xs font-bold text-black hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center gap-2">
               {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save Changes" : "Create Category"}
             </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Category">
        <div className="p-6">
          <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
            Are you sure you want to delete this category? Products currently assigned to this category will lose this association. This action is <b className="text-red-500">permanent</b>.
          </p>
          <div className="flex items-center justify-end gap-3">
             <button onClick={() => setDeleteId(null)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-white transition-colors">Cancel</button>
             <button onClick={handleDelete} disabled={submitting} className="px-6 py-2.5 bg-red-500 rounded-xl text-xs font-bold text-white hover:bg-red-400 transition-all disabled:opacity-50 flex items-center gap-2">
               {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Forever"}
             </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
