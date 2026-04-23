import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Upload, X, Box, DollarSign, Tag, Image as ImageIcon, Loader2, Sparkles } from "lucide-react"
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
    sizes: "",
    colors: "",
    category: "",
    subcategory: ""
  })

  // Images state
  const [existingImages, setExistingImages] = useState([]) // URLs from backend
  const [newImages, setNewImages] = useState([]) // File objects
  const [previewImages, setPreviewImages] = useState([]) // Object URLs for preview
  const [groupCount, setGroupCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // ── Grouping Preview Logic ──
  useEffect(() => {
    if (formData.price && formData.category) {
      const currentPrice = formData.discountPrice || formData.price;
      
      // Fetch matching products to show count
      productsAPI.getAll({ 
        category: formData.category, 
        price: currentPrice,
        limit: 1 // Only need the total from metadata
      }).then(({ data }) => {
         const count = data.pagination?.total || 0;
         setGroupCount(count);
      }).catch((err) => {
         console.warn("Could not fetch similar styles preview", err);
         setGroupCount(0);
      });
    } else {
      setGroupCount(0);
    }
  }, [formData.price, formData.discountPrice, formData.category])

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
            sizes: p.sizes ? p.sizes.join(", ") : "",
            colors: p.colors ? p.colors.join(", ") : "",
            category: p.category?._id || p.category || "",
            subcategory: p.subcategory || ""
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
  
  const generateSKU = () => {
    if (!formData.title) return toast.error("Error", "Please enter a product title first.")
    
    // Prefix + First 4 letters of title + 4 random chars
    const prefix = "QNS"
    const titlePart = formData.title.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase()
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
    
    const newSKU = `${prefix}-${titlePart || "PROD"}-${randomPart}`
    setFormData({ ...formData, SKU: newSKU })
    toast.info("ID Generated", `Product SKU set to: ${newSKU}`)
  }

  // ── Image Handling ──
  const processFiles = (files) => {
    if (!files || files.length === 0) return

    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      return toast.warning("Invalid Files", "Please upload image files only.")
    }

    setNewImages((prev) => [...prev, ...imageFiles])
    
    // Create preview URLs
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file))
    setPreviewImages((prev) => [...prev, ...newPreviews])
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    processFiles(files)
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
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
      
      // Append text fields with number cleanup for price/stock
      Object.keys(formData).forEach(key => {
        let val = formData[key]
        if (val !== "" && val !== null && val !== undefined) {
          // If the field is a price or stock, strip out any text (like 'gh', etc) and keep numbers/decimals
          if (["price", "discountPrice", "stockQuantity"].includes(key)) {
            const cleanedNum = parseFloat(String(val).replace(/[^0-9.]/g, ""))
            if (!isNaN(cleanedNum)) {
              payload.append(key, cleanedNum)
            }
          } else {
            payload.append(key, val)
          }
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
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Left Column: Main Details & Media ── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* General Information */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2"><Box className="h-4 w-4 text-yellow-500" /> General Information</h3>
            
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Product Title *</label>
              <input 
                name="title" value={formData.title} onChange={handleChange}
                className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-yellow-500/50 transition-colors" 
                placeholder="e.g. Premium Silk Scarf" 
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Description</label>
              <textarea 
                name="description" value={formData.description} onChange={handleChange} rows={6}
                className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-yellow-500/50 transition-colors resize-none leading-relaxed" 
                placeholder="Write a compelling product description..." 
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2 mt-2 flex items-center gap-1">Category *</label>
              <select 
                name="category" value={formData.category} onChange={handleChange}
                className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-yellow-500/50 transition-colors appearance-none"
              >
                <option value="" disabled>Select a category...</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {formData.category && categories.find(c => c._id === formData.category)?.subcategories?.length > 0 && (
              <div className="animate-fade-in">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2 mt-2 flex items-center gap-1">Subcategory (Optional)</label>
                <select 
                  name="subcategory" value={formData.subcategory} onChange={handleChange}
                  className="w-full bg-black border border-yellow-500/50 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-yellow-500 transition-colors appearance-none shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                >
                  <option value="">No subcategory</option>
                  {categories.find(c => c._id === formData.category)?.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Media / Images */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
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
                    <div className="absolute bottom-0 inset-x-0 bg-yellow-500/90 text-black text-xs font-bold text-center py-1 uppercase tracking-widest">New</div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-black/20",
                isDragging 
                  ? "border-yellow-500 bg-yellow-500/10 scale-[0.99] shadow-inner" 
                  : "border-neutral-800 hover:border-yellow-500/50 hover:bg-yellow-500/5"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all shadow-inner",
                isDragging ? "bg-yellow-500 text-black scale-110" : "bg-neutral-900 text-neutral-400"
              )}>
                <Upload className={cn("h-6 w-6", isDragging && "animate-bounce")} />
              </div>
              <p className={cn("text-sm font-bold mb-1 transition-colors", isDragging ? "text-yellow-500" : "text-white")}>
                {isDragging ? "Drop images here" : "Click or drag images to upload"}
              </p>
              <p className="text-xs font-medium text-neutral-500 tracking-wide uppercase mt-1">PNG, JPG, JPEG up to 5MB</p>
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
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2"><DollarSign className="h-4 w-4 text-yellow-500" /> Pricing</h3>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Base Price ($) *</label>
              <input 
                type="text"  name="price" value={formData.price} onChange={handleChange} 
                className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors font-mono" 
                placeholder="0.00" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Discount Price ($)</label>
              <input 
                type="text"  name="discountPrice" value={formData.discountPrice} onChange={handleChange} 
                className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors font-mono" 
                placeholder="Optional" 
              />
            </div>
            
            {(formData.price && formData.category) && (
              <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex items-center gap-2.5 mt-4">
                <Sparkles className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                <p className="text-[10px] text-neutral-500 leading-tight">
                  Linked with <b>{groupCount} styles</b> in <b>{categories.find(c => c._id === formData.category)?.name}</b> at <b>${formData.discountPrice || formData.price}</b>
                </p>
              </div>
            )}
          </div>

          {/* Inventory */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2"><Box className="h-4 w-4 text-yellow-500" /> Inventory</h3>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Stock Quantity</label>
              <input 
                type="text" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} 
                className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors font-mono" 
                placeholder="e.g. 50" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Status</label>
              <select 
                name="status" value={formData.status} onChange={handleChange}
                className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors appearance-none"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Organization */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2"><Tag className="h-4 w-4 text-yellow-500" /> Organization</h3>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Tags / Keywords</label>
              <input 
                type="text" name="tags" value={formData.tags} onChange={handleChange} 
                className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors" 
                placeholder="summer, fashion, accessories" 
              />
              <p className="text-xs text-neutral-600 mt-2 ml-1">Separate tags with commas.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Available Sizes</label>
              <input 
                type="text" name="sizes" value={formData.sizes} onChange={handleChange} 
                className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors" 
                placeholder="S, M, L, XL" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block mb-2">Available Colors</label>
              <input 
                type="text" name="colors" value={formData.colors} onChange={handleChange} 
                className="w-full bg-black border border-neutral-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors" 
                placeholder="Red, Blue, Black" 
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
