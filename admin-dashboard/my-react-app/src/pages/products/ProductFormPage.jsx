import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Upload, X, Box, DollarSign, Tag, Image as ImageIcon, Loader2 } from "lucide-react"
import { productsAPI, categoriesAPI } from "../../libs/api"
import { useToast } from "../../context/ToastContext"
import { cn } from "../../libs/utils"

export default function ProductFormPage() {
  const { id } = useParams()
  const isEdit = id && id !== "new"
  const navigate = useNavigate()
  const toast = useToast()
  
  // State
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [categories, setCategories] = useState([])
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    discountPrice: "",
    stockQuantity: "",
    description: "",
    SKU: "",
    status: "Active",
    tags: "", // Command separated string
    category: ""
  })

  // Images state
  const [existingImages, setExistingImages] = useState([]) // URLs from backend
  const [newImages, setNewImages] = useState([]) // File objects
  const [previewImages, setPreviewImages] = useState([]) // Object URLs for preview

  useEffect(() => {
    // Fetch Categories
    categoriesAPI.getAll().then(({ data }) => {
      setCategories(data.categories || [])
    }).catch(() => toast.error("Warning", "Could not load categories."))

    // Fetch Product if Edit Mode
    if (isEdit) {
      productsAPI.getById(id)
        .then(({ data }) => {
          const p = data.product
          setFormData({
            title: p.title || "",
            price: p.price || "",
            discountPrice: p.discountPrice || "",
            stockQuantity: p.stockQuantity || "",
            description: p.description || "",
            SKU: p.SKU || "",
            status: p.status || "Active",
            tags: p.tags ? p.tags.join(", ") : "",
            category: p.category?._id || p.category || ""
          })
          setExistingImages(p.images || [])
        })
        .catch((err) => {
          toast.error("Error", "Product not found")
          navigate("/products")
        })
        .finally(() => setFetching(false))
    }
  }, [id, isEdit, navigate, toast])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  // ── Image Handling ──
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setNewImages((prev) => [...prev, ...files])
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPreviewImages((prev) => [...prev, ...newPreviews])
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setPreviewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index) => {
    // In a real app, you might want to call a specific endpoint to delete a Cloudinary image,
    // or just pass the remaining URLs back to the update payload.
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Form Submission ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.price || !formData.category) {
      return toast.error("Validation Error", "Title, Price, and Category are required.")
    }

    setLoading(true)
    try {
      const payload = new FormData()
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== "" && formData[key] !== null && formData[key] !== undefined) {
          payload.append(key, formData[key])
        }
      })

      // Append new files
      newImages.forEach(file => {
        payload.append("images", file) // multer expects exactly "images"
      })

      // If editing, you usually need to tell the backend which existing images to keep.
      // Depending on backend logic, we either send existingImages as a JSON string or array
      if (isEdit && existingImages.length > 0) {
        existingImages.forEach(url => payload.append("existingImages", url))
      }

      if (isEdit) {
        await productsAPI.update(id, payload)
        toast.success("Success", "Product updated successfully!")
      } else {
        await productsAPI.create(payload)
        toast.success("Success", "Product created successfully!")
      }
      
      navigate("/products")
    } catch (err) {
      console.error(err)
      toast.error("Submission Failed", err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <Link to="/products" className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{isEdit ? "Edit Product" : "Create New Product"}</h1>
            <p className="text-sm text-neutral-500 mt-1">{isEdit ? "Modify existing inventory details" : "Add a new item to your store catalog"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEdit && (
            <button
               type="button"
               onClick={async () => {
                 if(window.confirm("Are you sure you want to permanently delete this product?")) {
                   try {
                     setLoading(true);
                     await productsAPI.delete(id);
                     toast.success("Deleted", "Product removed successfully");
                     navigate("/products");
                   } catch(err) {
                     toast.error("Error", "Failed to delete product");
                     setLoading(false);
                   }
                 }
               }}
               disabled={loading}
               className="px-6 py-2.5 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
            >
              Delete Product
            </button>
          )}
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-6 py-2.5 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-500/20 flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} 
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Left Column: Main Details & Media ── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* General Information */}
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2"><Box className="h-4 w-4 text-yellow-500" /> General Information</h3>
            
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Product Title *</label>
              <input 
                name="title" value={formData.title} onChange={handleChange}
                className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-yellow-500/50 transition-colors" 
                placeholder="e.g. Premium Silk Scarf" 
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Description</label>
              <textarea 
                name="description" value={formData.description} onChange={handleChange} rows={6}
                className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-yellow-500/50 transition-colors resize-none leading-relaxed" 
                placeholder="Write a compelling product description..." 
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2 mt-2 flex items-center gap-1">Category *</label>
              <select 
                name="category" value={formData.category} onChange={handleChange}
                className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-yellow-500/50 transition-colors appearance-none"
              >
                <option value="" disabled>Select a category...</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Media / Images */}
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-6"><ImageIcon className="h-4 w-4 text-yellow-500" /> Product Media</h3>
            
            {/* Image Gallery */}
            {(existingImages.length > 0 || previewImages.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                
                {/* Existing Images */}
                {existingImages.map((url, i) => (
                  <div key={`exist-${i}`} className="relative aspect-square rounded-2xl border border-neutral-800 overflow-hidden group">
                    <img src={url} alt="product" className="w-full h-full object-cover" />
                    <button 
                      type="button" onClick={() => removeExistingImage(i)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* New Image Previews */}
                {previewImages.map((url, i) => (
                  <div key={`new-${i}`} className="relative aspect-square rounded-2xl border-2 border-yellow-500/50 overflow-hidden group">
                    <img src={url} alt="preview" className="w-full h-full object-cover opacity-80" />
                    <button 
                      type="button" onClick={() => removeNewImage(i)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-yellow-500/90 text-black text-[9px] font-bold text-center py-1 uppercase tracking-widest">New</div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all cursor-pointer bg-black/20"
            >
              <div className="w-14 h-14 bg-neutral-900 rounded-full flex items-center justify-center mb-4 text-neutral-400 shadow-inner">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-white mb-1">Click to browse images</p>
              <p className="text-[11px] font-medium text-neutral-500 tracking-wide uppercase mt-1">PNG, JPG, JPEG up to 5MB</p>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImageSelect} 
                className="hidden" 
              />
            </div>
          </div>
        </div>

        {/* ── Right Column: Pricing, Inventory, Organization ── */}
        <div className="space-y-8">
          
          {/* Pricing */}
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2"><DollarSign className="h-4 w-4 text-yellow-500" /> Pricing</h3>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Base Price ($) *</label>
              <input 
                type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} 
                className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors font-mono" 
                placeholder="0.00" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Discount Price ($)</label>
              <input 
                type="number" step="0.01" name="discountPrice" value={formData.discountPrice} onChange={handleChange} 
                className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors font-mono" 
                placeholder="Optional" 
              />
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2"><Box className="h-4 w-4 text-yellow-500" /> Inventory</h3>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Stock Quantity</label>
              <input 
                type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} 
                className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors font-mono" 
                placeholder="e.g. 50" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">SKU (Stock Keeping Unit)</label>
              <input 
                type="text" name="SKU" value={formData.SKU} onChange={handleChange} 
                className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors font-mono uppercase" 
                placeholder="e.g. SCARF-001" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Status</label>
              <select 
                name="status" value={formData.status} onChange={handleChange}
                className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors appearance-none"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Organization */}
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2"><Tag className="h-4 w-4 text-yellow-500" /> Organization</h3>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Tags / Keywords</label>
              <input 
                type="text" name="tags" value={formData.tags} onChange={handleChange} 
                className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors" 
                placeholder="summer, fashion, accessories" 
              />
              <p className="text-[10px] text-neutral-600 mt-2 ml-1">Separate tags with commas.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
