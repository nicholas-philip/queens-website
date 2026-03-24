import { useEffect, useState }              from "react"
import { useParams, Link, useNavigate }     from "react-router-dom"
import { ArrowLeft, Pencil, Plus, Minus, Trash2, Package, Tag, Star, Calendar, ShoppingCart, Box, Activity, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import { productsAPI }                      from "../../libs/api"
import { formatCurrency, getStatusBadge, formatDate, cn } from "../../libs/utils"
import { useToast }                         from "../../context/ToastContext"
import Spinner                              from "../../components/Spinner"
import Modal                                from "../../components/Modal"

export default function ProductDetailPage() {
  const { id }  = useParams()
  const toast   = useToast()
  const navigate = useNavigate()

  const [product,    setProduct]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [adjModal,   setAdjModal]   = useState(false)
  const [adjValue,   setAdjValue]   = useState("")
  const [adjReason,  setAdjReason]  = useState("")
  const [adjLoading, setAdjLoading] = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [imgIndex,   setImgIndex]   = useState(0)

  useEffect(() => {
    if (id === "new") {
      navigate("/products", { replace: true });
      return;
    }

    productsAPI.getById(id)
      .then(({ data }) => setProduct(data.product))
      .catch(() => toast.error("Error", "Product not found."))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const adjustStock = async () => {
    const n = parseInt(adjValue)
    if (isNaN(n) || n === 0) return
    setAdjLoading(true)
    try {
      const { data } = await productsAPI.adjustStock(id, { adjustment: n, reason: adjReason })
      setProduct((p) => ({ ...p, stockQuantity: data.stockQuantity, status: data.status }))
      toast.success("Stock Updated", `New inventory count: ${data.stockQuantity}`)
      setAdjModal(false); setAdjValue(""); setAdjReason("")
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Failed to update stock.")
    } finally { setAdjLoading(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await productsAPI.delete(id)
      toast.success("Deleted", "Product permanently removed.")
      navigate("/products")
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Failed to delete product.")
    } finally { setDeleting(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-screen bg-black"><Spinner size="xl" /></div>
  if (!product) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-500">
        <Package className="h-16 w-16 mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <p className="mt-2 mb-6">The requested item doesn't exist or has been removed.</p>
        <Link to="/products" className="px-6 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-white">Return to Catalog</Link>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
            <Link to="/products" className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-white transition-all group">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white tracking-tight">{product.title}</h1>
                    <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                        product.status === 'Active' ? "bg-green-500/10 border-green-500/20 text-green-500" : 
                        product.status === 'Out of Stock' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                        "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                    )}>
                        {product.status}
                    </span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{product.category?.name || 'Catalog'}</span>
                    <span className="text-neutral-800">•</span>
                    <span className="text-xs font-mono text-neutral-600">{product.SKU}</span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={() => setAdjModal(true)}
                className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:border-neutral-700 transition-all flex items-center gap-2"
            >
                <Box className="h-4 w-4" /> Adjust Stock
            </button>
            <Link 
                to={`/products/${id}/edit`}
                className="px-5 py-2.5 bg-yellow-500 rounded-xl text-xs font-bold text-black hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/20"
            >
                <Pencil className="h-4 w-4" /> Edit Details
            </Link>
            <button 
                onClick={() => setDeleteOpen(true)}
                className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* ── Left Side: Gallery & Visuals ── */}
        <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-square bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl group">
                {product.images?.[imgIndex] ? (
                    <img src={product.images[imgIndex]} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-800 font-bold text-9xl uppercase">{product.title?.[0]}</div>
                )}
                
                {product.images?.length > 1 && (
                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                        <button 
                            onClick={(e) => { e.preventDefault(); setImgIndex(p => p > 0 ? p - 1 : product.images.length - 1) }}
                            className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white pointer-events-auto hover:bg-yellow-500 hover:text-black transition-all"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button 
                            onClick={(e) => { e.preventDefault(); setImgIndex(p => p < product.images.length - 1 ? p + 1 : 0) }}
                            className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white pointer-events-auto hover:bg-yellow-500 hover:text-black transition-all"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {product.images?.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {product.images.map((url, i) => (
                        <button 
                            key={i} 
                            onClick={() => setImgIndex(i)}
                            className={cn(
                                "h-20 w-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all",
                                i === imgIndex ? "border-yellow-500 scale-105 shadow-lg shadow-yellow-500/20" : "border-neutral-800 opacity-60 hover:opacity-100"
                            )}
                        >
                            <img src={url} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Pricing Strategy</span>
                    <Tag className="h-4 w-4 text-yellow-500/50" />
                 </div>
                 <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-white tracking-tighter">{formatCurrency(product.discountPrice || product.price)}</span>
                    {product.discountPrice && (
                        <span className="text-lg text-neutral-600 line-through mb-1.5 font-medium">{formatCurrency(product.price)}</span>
                    )}
                 </div>
                 {product.discountPrice && (
                    <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg inline-flex items-center gap-2">
                        <Activity className="h-3 w-3 text-yellow-500" />
                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">
                            Save {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% Today
                        </span>
                    </div>
                 )}
            </div>
        </div>

        {/* ── Right Side: Specs & Performance ── */}
        <div className="lg:col-span-7 space-y-8">
            
            {/* Essential Metrics */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 shadow-sm">
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl w-fit mb-4">
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Total Sold</p>
                    <p className="text-2xl font-bold text-white tracking-tight">{product.totalSold || 0}</p>
                </div>
                <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 shadow-sm">
                    <div className={cn(
                        "p-2 border rounded-xl w-fit mb-4",
                        product.stockQuantity <= 5 ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20"
                    )}>
                        <Box className={cn("h-4 w-4", product.stockQuantity <= 5 ? "text-red-500" : "text-green-500")} />
                    </div>
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Current Stock</p>
                    <p className={cn("text-2xl font-bold tracking-tight", product.stockQuantity <= 5 ? "text-red-500" : "text-white")}>
                        {product.stockQuantity}
                    </p>
                </div>
                <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 shadow-sm">
                    <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl w-fit mb-4">
                        <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Avg Rating</p>
                    <p className="text-2xl font-bold text-white tracking-tight">{product.averageRating || '—'}</p>
                </div>
            </div>

            {/* Description */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 shadow-sm">
                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4">Product Narrative</h3>
                <p className="text-neutral-300 leading-relaxed font-normal text-lg">
                    {product.description}
                </p>
                
                {product.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-8">
                        {product.tags.map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-black/40 border border-neutral-800 rounded-xl text-[10px] font-bold text-neutral-500 uppercase tracking-wider hover:border-yellow-500/30 hover:text-yellow-500 transition-all cursor-default">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Technical Footer */}
            <div className="flex items-center justify-between px-4">
                <div className="flex gap-10">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-widest mb-1">First Listed</span>
                        <span className="text-xs font-bold text-neutral-500 flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(product.createdAt)}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Merchant Category</span>
                        <span className="text-xs font-bold text-neutral-500 flex items-center gap-2 lowercase">
                            <Package className="h-3.5 w-3.5" />
                            {product.category?.name || 'Standard'}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-widest mb-1">Global Identifier (SKU)</span>
                    <span className="text-xs font-mono font-bold text-neutral-500 uppercase decoration-yellow-500/30 underline decoration-2 underline-offset-4">{product.SKU}</span>
                </div>
            </div>
        </div>
      </div>

      {/* ── Adjust Stock Modal ── */}
      <Modal isOpen={adjModal} onClose={() => setAdjModal(false)} title="Inventory Adjustment">
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
            <div>
                <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-white tracking-tighter">{product.stockQuantity} Units</p>
            </div>
            <Box className="h-10 w-10 text-yellow-500/20" />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block">Manual Adjustment</label>
            <div className="flex items-center gap-6">
              <button 
                type="button" 
                onClick={() => setAdjValue((v) => String((parseInt(v) || 0) - 1))} 
                className="w-12 h-12 flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-2xl text-white hover:border-red-500/50 hover:text-red-500 transition-all"
              >
                <Minus className="h-5 w-5" />
              </button>
              <input 
                type="number" 
                value={adjValue} 
                onChange={(e) => setAdjValue(e.target.value)}
                className="flex-1 bg-black/40 border border-neutral-800 rounded-2xl px-5 py-3.5 text-xl font-bold text-center text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-all font-mono" 
                placeholder="0" 
              />
              <button 
                type="button" 
                onClick={() => setAdjValue((v) => String((parseInt(v) || 0) + 1))} 
                className="w-12 h-12 flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-2xl text-white hover:border-green-500/50 hover:text-green-500 transition-all"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <p className="text-[10px] text-neutral-600 font-medium italic ml-1 italic text-center">Use positive numbers to add stock, and negative numbers to subtract.</p>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block">Audit Note (Optional)</label>
            <input 
                value={adjReason} 
                onChange={(e) => setAdjReason(e.target.value)} 
                className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-all placeholder:text-neutral-700" 
                placeholder="e.g. Restocked from Lagos Hub" 
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-4">
            <button onClick={() => setAdjModal(false)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-white transition-colors">Abort</button>
            <button 
                onClick={adjustStock} 
                disabled={adjLoading} 
                className="px-10 py-3 bg-yellow-500 rounded-xl text-xs font-bold text-black hover:bg-yellow-400 shadow-xl shadow-yellow-500/20 transition-all disabled:opacity-50"
            >
              {adjLoading ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : "Commit Adjustment"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Confirm Delete Modal ── */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Destructive Action">
        <div className="p-8">
            <div className="flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl mb-8">
                <AlertTriangle className="h-8 w-8 text-red-500 shrink-0" />
                <p className="text-sm text-neutral-400 leading-relaxed font-medium">
                    You are about to delete <b className="text-white">"{product.title}"</b>. This will permanently remove its inventory data, images, and performance metrics from the cluster.
                </p>
            </div>
            <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeleteOpen(false)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-white transition-colors">Keep Product</button>
                <button 
                    onClick={handleDelete} 
                    disabled={deleting} 
                    className="px-10 py-3 bg-red-500 rounded-xl text-xs font-bold text-white hover:bg-red-400 shadow-xl shadow-red-500/20 transition-all disabled:opacity-50"
                >
                    {deleting ? <Spinner size="sm" /> : "Confirm Deletion"}
                </button>
            </div>
        </div>
      </Modal>

    </div>
  )
}