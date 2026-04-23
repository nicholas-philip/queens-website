import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { 
  Plus as PlusIcon, 
  Trash2 as TrashIcon, 
  Save as SaveIcon, 
  ArrowLeft as BackIcon, 
  Loader2 as Spinner, 
  Package as BoxIcon, 
  X as CloseIcon,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  ChevronDown,
  LayoutGrid
} from "lucide-react"
import api from "../../libs/api"
import { useToast } from "../../context/ToastContext"
import { cn } from "../../libs/utils"

export default function BulkUploadPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const fileInputRef = useRef(null)
  
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [defaultCat, setDefaultCat] = useState("")
  const [products, setProducts] = useState([
    { title: "", description: "", price: "", stockQuantity: "10", category: "", subcategory: "", status: "Active", imageFiles: [], dragging: false }
  ])

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get("/admin/categories")
        setCategories(data.categories || [])
      } catch (err) {
        toast.error("Error", "Failed to load categories")
      }
    }
    fetchCats()
  }, [toast])

  const addRow = () => {
    setProducts([...products, { 
      title: "", 
      description: "",
      price: "", 
      stockQuantity: "10", 
      category: defaultCat, 
      subcategory: "", 
      status: "Active",
      imageFiles: [],
      dragging: false
    }])
  }

  const removeRow = (index) => {
    if (products.length === 1) {
      setProducts([{ title: "", description: "", price: "", stockQuantity: "10", category: defaultCat, subcategory: "", status: "Active", imageFiles: [], dragging: false }])
      return
    }
    setProducts(products.filter((_, i) => i !== index))
  }

  const handleChange = (index, field, value) => {
    const next = [...products]
    next[index][field] = value
    if (field === "category") next[index].subcategory = ""
    setProducts(next)
  }

  const handleImageChange = (index, files) => {
    if (!files || files.length === 0) return
    const next = [...products]
    const newFiles = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    next[index].imageFiles = [...next[index].imageFiles, ...newFiles]
    next[index].dragging = false
    setProducts(next)
  }

  const removeImage = (pIdx, iIdx) => {
    const next = [...products]
    next[pIdx].imageFiles = next[pIdx].imageFiles.filter((_, i) => i !== iIdx)
    setProducts(next)
  }

  const onDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
  }

  const onDragEnter = (e, index) => {
      e.preventDefault();
      e.stopPropagation();
      const next = [...products];
      next[index].dragging = true;
      setProducts(next);
  }

  const onDragLeave = (e, index) => {
      e.preventDefault();
      e.stopPropagation();
      const next = [...products];
      next[index].dragging = false;
      setProducts(next);
  }

  const onDrop = (e, index) => {
      e.preventDefault();
      e.stopPropagation();
      handleImageChange(index, e.dataTransfer.files)
  }

  const applyDefaultCat = (catId) => {
    setDefaultCat(catId)
    setProducts(p => p.map(item => ({ ...item, category: catId, subcategory: "" })))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const content = evt.target.result
      const lines = content.split(/\r?\n/).filter(line => line.trim())
      const imported = lines.slice(1).map(line => {
        const parts = line.split(",")
        return {
          title: parts[0]?.trim() || "",
          description: parts[1]?.trim() || "",
          price: parts[2]?.trim() || "",
          stockQuantity: parts[3]?.trim() || "10",
          category: defaultCat,
          subcategory: "",
          status: "Active",
          imageFiles: [],
          dragging: false
        }
      }).filter(p => p.title)
      if (imported.length > 0) {
        setProducts(imported)
        toast.success("Imported", `Loaded ${imported.length} products.`)
      }
    }
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    const validProducts = products.filter(p => p.title && p.price && p.category && p.description)
    if (validProducts.length === 0) {
      toast.error("Validation Error", "Please fill in names, prices, categories, and descriptions.")
      return
    }

    setLoading(true)
    try {
      const processedProducts = await Promise.all(validProducts.map(async (p) => {
        let imageUrls = []
        if (p.imageFiles.length > 0) {
            const formData = new FormData()
            p.imageFiles.forEach(f => formData.append("images", f.file))
            // ✅ CRITICAL BUG FIX: Added multipart/form-data header for image upload
            const { data } = await api.post("/admin/products/upload-temp", formData, {
              headers: { "Content-Type": "multipart/form-data" }
            })
            imageUrls = data.urls || []
        }
        // Helper to extract numeric value and suffix (e.g. "100 each" -> price: 100, suffix: "each")
        const parsePrice = (val) => {
            if (!val) return { price: 0, suffix: "" };
            const numericPart = String(val).match(/[0-9.]+/);
            const price = numericPart ? Number(numericPart[0]) : 0;
            const suffix = String(val).replace(/[0-9.]+|gh|ghs|₵/gi, "").trim();
            return { price, suffix };
        };

        const { price, suffix } = parsePrice(p.price);

        return {
            title: p.title,
            description: p.description,
            price: price,
            priceSuffix: suffix,
            stockQuantity: Number(p.stockQuantity) || 0,
            category: p.category,
            subcategory: p.subcategory || undefined,
            images: imageUrls,
            status: p.status
        }
      }))
      await api.post("/admin/bulk/products", { products: processedProducts })
      toast.success("Success", `Created ${processedProducts.length} items.`)
      navigate("/products")
    } catch (err) {
      console.error("Bulk Upload Error:", err)
      toast.error("Sync Failed", err.response?.data?.message || "Check fields.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-full">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div>
           <Link to="/products" className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 hover:text-white flex items-center gap-2 mb-2 transition-all">
             <BackIcon size={12} strokeWidth={3} /> Return to catalog
           </Link>
           <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">Inventory Factory</h1>
           <p className="text-xs text-neutral-500 mt-2 max-w-lg leading-relaxed">Mass produce your jewelry catalog. Define specs, set prices, and drag images directly into the production line. Use CSV import for industrial-scale uploads.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="flex-1 md:flex-none px-4 py-3 bg-neutral-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
          >
            <Upload size={14} /> Import
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="flex-1 md:flex-none px-6 py-3 bg-yellow-500 rounded-xl text-[10px] font-black text-black uppercase hover:bg-yellow-400 shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Spinner size={16} className="animate-spin" /> : <SaveIcon size={16} />}
            Sync Production ({products.length})
          </button>
        </div>
      </div>

      {/* ── Batch Configuration ── */}
      <div className="mx-4 bg-neutral-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                <BoxIcon size={18} className="text-yellow-500" />
            </div>
            <div>
                <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Global Assignment</p>
                <select 
                    value={defaultCat}
                    onChange={(e) => applyDefaultCat(e.target.value)}
                    className="bg-transparent border-none text-[10px] font-black text-white uppercase tracking-widest outline-none cursor-pointer focus:text-yellow-500 transition-colors"
                >
                    <option value="" className="bg-neutral-900">Choose Main Class...</option>
                    {categories.map(c => <option key={c._id} value={c._id} className="bg-neutral-900">{c.name}</option>)}
                </select>
            </div>
        </div>
        <button 
            onClick={() => setProducts([{ title: "", description: "", price: "", stockQuantity: "10", category: defaultCat, subcategory: "", status: "Active", imageFiles: [], dragging: false }])} 
            className="text-[9px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 px-4 transition-all md:ml-auto"
        >
            Reset Table
        </button>
      </div>

      {/* ── Responsive Factory Center ── */}
      <div className="px-4">
          
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden lg:block bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse min-w-[1400px]">
                    <thead>
                        <tr className="bg-neutral-900/80 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-white/10">
                            <th className="px-6 py-5 w-16 text-center">#</th>
                            <th className="px-3 py-5 w-64 text-center italic">Image Dropzone</th>
                            <th className="px-3 py-5">General Particulars</th>
                            <th className="px-3 py-5 w-32">Price (GHS)</th>
                            <th className="px-3 py-5 w-24">Stock</th>
                            <th className="px-3 py-5 w-44">Category / Level 1</th>
                            <th className="px-3 py-5 w-44">Subcategory / Level 2</th>
                            <th className="px-6 py-5 w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.map((p, idx) => {
                            const subcats = categories.find(c => c._id === p.category)?.subcategories || [];
                            return (
                                <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-8 text-xs font-black text-neutral-700 text-center bg-neutral-900/20">{idx + 1}</td>
                                    <td 
                                      className="px-3 py-4" 
                                      onDragOver={onDragOver} 
                                      onDragEnter={(e) => onDragEnter(e, idx)}
                                      onDragLeave={(e) => onDragLeave(e, idx)} 
                                      onDrop={(e) => onDrop(e, idx)}
                                    >
                                        <div className={cn(
                                          "min-h-[100px] flex items-center justify-center p-3 transition-all rounded-xl border-2 border-dashed",
                                          p.dragging ? "border-yellow-500 bg-yellow-500/10 scale-[1.02]" : "border-white/5 bg-black/40 group-hover:border-white/20"
                                        )}>
                                            {p.imageFiles.length === 0 ? (
                                                <label className="text-center text-[9px] font-black text-neutral-700 uppercase tracking-widest cursor-pointer py-4 w-full">
                                                  Drag & Drop Files
                                                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageChange(idx, e.target.files)} />
                                                </label>
                                            ) : (
                                                <div className="flex gap-2 p-1 flex-wrap justify-center">
                                                    {p.imageFiles.map((img, iIdx) => (
                                                        <div key={iIdx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20 ring-1 ring-white/5 shadow-lg group/img transition-transform hover:scale-110"><img src={img.preview} className="w-full h-full object-cover" /><button onClick={() => removeImage(idx, iIdx)} className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all"><TrashIcon size={12} /></button></div>
                                                    ))}
                                                    <label className="w-12 h-12 rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-neutral-500 hover:text-white cursor-pointer hover:bg-white/10 transition-colors"><PlusIcon size={14} /><input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageChange(idx, e.target.files)} /></label>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 space-y-2">
                                        <input value={p.title} onChange={(e) => handleChange(idx, "title", e.target.value)} placeholder="PRODUCT TITLE" className="w-full bg-transparent outline-none text-base font-black text-white placeholder:text-white/20 uppercase tracking-tight" />
                                        <textarea 
                                          value={p.description} 
                                          onChange={(e) => handleChange(idx, "description", e.target.value)} 
                                          placeholder="SPECIFICATIONS & DESCRIPTION..." 
                                          rows={2} 
                                          className="w-full bg-neutral-900/50 border border-white/5 rounded-lg p-2 outline-none text-[10px] font-bold text-neutral-400 placeholder:text-white/10 resize-none focus:border-yellow-500/50 transition-all min-h-[60px]" 
                                        />
                                    </td>
                                    <td className="px-3 py-4"><div className="flex items-center gap-1"><span className="text-[10px] font-black text-neutral-600">₵</span><input type="text" value={p.price} onChange={(e) => handleChange(idx, "price", e.target.value)} placeholder="0.00" className="w-full bg-transparent outline-none text-lg font-black text-yellow-500" /></div></td>
                                    <td className="px-3 py-4"><input type="number" value={p.stockQuantity} onChange={(e) => handleChange(idx, "stockQuantity", e.target.value)} className="w-full bg-transparent outline-none text-sm font-black text-neutral-400" /></td>
                                    <td className="px-3 py-4"><div className="relative"><select value={p.category} onChange={(e) => handleChange(idx, "category", e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-neutral-300 appearance-none"><option value="" disabled className="bg-neutral-900">Select Cat</option>{categories.map(c => <option key={c._id} value={c._id} className="bg-neutral-900">{c.name}</option>)}</select><ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600" /></div></td>
                                    <td className="px-3 py-4"><div className="relative"><select value={p.subcategory} onChange={(e) => handleChange(idx, "subcategory", e.target.value)} disabled={!p.category || subcats.length === 0} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-neutral-500 appearance-none"><option value="" className="bg-neutral-900">{subcats.length > 0 ? "Select Sub" : "No Subs"}</option>{subcats.map(s => <option key={s} value={s} className="bg-neutral-900">{s}</option>)}</select><ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600" /></div></td>
                                    <td className="px-6 py-4 text-center"><button onClick={() => removeRow(idx)} className="text-neutral-800 hover:text-red-500 transition-all hover:scale-125"><TrashIcon size={16} /></button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="lg:hidden space-y-6">
              {products.map((p, idx) => {
                  const subcats = categories.find(c => c._id === p.category)?.subcategories || [];
                  return (
                      <div key={idx} className="bg-neutral-900 border border-white/10 rounded-2xl p-5 space-y-6 relative overflow-hidden shadow-xl">
                          <div className="absolute top-0 right-0 py-1 px-3 bg-neutral-800 text-[9px] font-black text-neutral-500 rounded-bl-xl border-l border-b border-white/5">#{idx + 1}</div>
                          
                          {/* Image Handler Mobile */}
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Product Images</label>
                             <div className="flex flex-wrap gap-2 p-3 bg-black/40 rounded-xl border border-white/5 min-h-[60px]">
                                 {p.imageFiles.map((img, iIdx) => (
                                     <div key={iIdx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/10">
                                         <img src={img.preview} className="w-full h-full object-cover" />
                                         <button onClick={() => removeImage(idx, iIdx)} className="absolute inset-0 bg-red-600/80 flex items-center justify-center"><TrashIcon size={14} className="text-white" /></button>
                                     </div>
                                 ))}
                                 <label className="w-14 h-14 rounded-lg bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-neutral-500"><PlusIcon size={16} /><input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageChange(idx, e.target.files)} /></label>
                             </div>
                          </div>

                          {/* Identity Mobile */}
                          <div className="space-y-4">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Product Title</label>
                                <input value={p.title} onChange={(e) => handleChange(idx, "title", e.target.value)} placeholder="Jewelry Title" className="w-full bg-transparent border-b border-white/10 py-1 text-lg font-black text-white placeholder:text-white/10 outline-none focus:border-yellow-500 transition-colors" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Short Description</label>
                                <textarea value={p.description} onChange={(e) => handleChange(idx, "description", e.target.value)} placeholder="Add materials, etc..." rows={2} className="w-full bg-transparent outline-none text-xs text-neutral-400 placeholder:text-white/5 resize-none" />
                             </div>
                          </div>

                          {/* Logistics Mobile */}
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Price (GHS)</label>
                                <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                                    <span className="text-yellow-500 font-black">₵</span>
                                    <input type="text" value={p.price} onChange={(e) => handleChange(idx, "price", e.target.value)} placeholder="0.00" className="w-full bg-transparent outline-none font-black text-yellow-500" />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Stock</label>
                                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                    <input type="number" value={p.stockQuantity} onChange={(e) => handleChange(idx, "stockQuantity", e.target.value)} className="w-full bg-transparent outline-none font-black text-neutral-300" />
                                </div>
                             </div>
                          </div>

                          {/* Categorization Mobile */}
                          <div className="grid grid-cols-1 gap-4">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Main Classification</label>
                                <div className="relative">
                                    <select value={p.category} onChange={(e) => handleChange(idx, "category", e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-[10px] font-black uppercase text-neutral-300 appearance-none">
                                        <option value="" disabled className="bg-neutral-900">Select...</option>
                                        {categories.map(c => <option key={c._id} value={c._id} className="bg-neutral-900">{c.name}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Sub-Level</label>
                                <div className="relative">
                                    <select value={p.subcategory} onChange={(e) => handleChange(idx, "subcategory", e.target.value)} disabled={!p.category || subcats.length === 0} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-[10px] font-black uppercase text-neutral-500 appearance-none disabled:opacity-20">
                                        <option value="">{subcats.length > 0 ? "Select Sub" : "No Subs"}</option>
                                        {subcats.map(s => <option key={s} value={s} className="bg-neutral-900">{s}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                </div>
                             </div>
                          </div>

                          <button onClick={() => removeRow(idx)} className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Remove This Entry</button>
                      </div>
                  )
              })}
          </div>

          {/* Add Row Button */}
          <div className="pt-8 pb-12 flex justify-center">
              <button 
                onClick={addRow} 
                className="group px-12 py-5 bg-neutral-900 border border-white/10 rounded-full flex items-center gap-4 text-xs font-black uppercase tracking-[0.4em] text-neutral-500 hover:text-white transition-all shadow-2xl active:scale-95"
              >
                <PlusIcon size={16} className="text-yellow-500 group-hover:rotate-180 transition-all duration-500" />
                Add New Production Item
              </button>
          </div>
      </div>

    </div>
  )
}
