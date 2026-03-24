import { useEffect, useState, useCallback } from "react"
import { Link, useSearchParams }             from "react-router-dom"
import { Plus, Search, Download, Filter, Pencil, Trash2, Eye, LayoutGrid, List } from "lucide-react"
import { productsAPI, exportAPI }            from "../../libs/api"
import { formatCurrency, getStatusBadge, downloadCSV, truncate, cn } from "../../libs/utils"
import { useToast }                          from "../../context/ToastContext"
import { Table, TableHead, TableBody, TableRow, TableCell, TableLoading, TableEmpty } from "../../components/Table"
import Pagination                            from "../../components/Pagination"
import Modal                                 from "../../components/Modal"
import Spinner                               from "../../components/Spinner"

export default function ProductsPage() {
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [products,   setProducts]   = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState(searchParams.get("search") || "")
  const [status,     setStatus]     = useState(searchParams.get("status") || "")
  const [page,       setPage]       = useState(1)
  const [deleteId,   setDeleteId]   = useState(null)
  const [deleting,   setDeleting]   = useState(false)
  const [exporting,  setExporting]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12, search, status }
      const { data } = await productsAPI.getAll(params)
      setProducts(data.data)
      setPagination(data.pagination)
    } catch { toast.error("Error", "Failed to load products") }
    finally { setLoading(false) }
  }, [page, search, status, toast])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await productsAPI.delete(deleteId)
      toast.success("Deleted", "Product removed.")
      setDeleteId(null)
      load()
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Delete failed.")
    } finally { setDeleting(false) }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const { data } = await exportAPI.products({ status })
      downloadCSV(data, "products-export.csv")
    } catch { toast.error("Error", "Export failed.") }
    finally { setExporting(false) }
  }

  const toggleStatus = async (id, currentStatus) => {
    const next = currentStatus === "Active" ? "Draft" : "Active"
    try {
      await productsAPI.updateStatus(id, { status: next })
      setProducts((p) => p.map((pr) => pr._id === id ? { ...pr, status: next } : pr))
      toast.success("Updated", `Product set to ${next}.`)
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Update failed.")
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Product Catalog</h1>
          <p className="text-sm text-neutral-500 mt-1">Add, edit, and manage your inventory items.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport} 
            disabled={exporting} 
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-white hover:bg-neutral-800 transition-all disabled:opacity-50"
          >
            {exporting ? <Spinner size="sm" /> : <Download className="h-4 w-4" />}
            Export CSV
          </button>
          <Link to="/products/new" className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 rounded-xl text-xs font-bold text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all">
            <Plus className="h-4 w-4" /> Add New Product
          </Link>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
          <input 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, SKU, or category..."
            className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-neutral-700" 
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
                <select 
                    value={status} 
                    onChange={(e) => { setStatus(e.target.value); setPage(1) }}
                    className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-11 pr-8 py-2.5 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-500/50 cursor-pointer"
                >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Out of Stock">Out of Stock</option>
                </select>
            </div>
        </div>
      </div>

      {/* ── Products Table ── */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        <Table>
          <TableHead headers={["Product Detail", "SKU", "Price", "Inventory", "Status", "Actions"]} />
          <TableBody>
            {loading ? (
              <TableLoading cols={6} rows={8} />
            ) : products.length === 0 ? (
              <TableEmpty message="Your catalog is empty. Start by adding a product!" />
            ) : (
              products.map((p) => (
                <TableRow key={p._id}>
                  {/* Product Info */}
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 shrink-0 rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden shadow-inner group-hover:border-yellow-500/30 transition-colors">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-neutral-600 text-[10px] font-bold uppercase">{p.title?.[0]}</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link to={`/products/${p._id}`} className="font-bold text-white hover:text-yellow-500 transition-colors truncate block">
                            {truncate(p.title, 40)}
                        </Link>
                        <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mt-1">{p.category?.name || "Uncategorized"}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* SKU */}
                  <TableCell>
                    <span className="font-mono text-[11px] font-bold text-neutral-500 bg-black/40 border border-neutral-800 px-2 py-1 rounded-lg">
                      {p.SKU || "NO-SKU"}
                    </span>
                  </TableCell>

                  {/* Price */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{formatCurrency(p.discountPrice || p.price)}</span>
                      {p.discountPrice && (
                        <span className="text-[10px] text-neutral-600 line-through decoration-red-500/50">{formatCurrency(p.price)}</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Stock */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-4 max-w-[80px]">
                            <span className={cn(
                                "text-xs font-bold",
                                p.stockQuantity <= 5 ? "text-red-500" : "text-neutral-400"
                            )}>
                                {p.stockQuantity} Left
                            </span>
                        </div>
                        <div className="w-16 h-1 rounded-full bg-neutral-800 overflow-hidden">
                            <div 
                                className={cn("h-full rounded-full transition-all duration-1000", p.stockQuantity <= 5 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]")}
                                style={{ width: `${Math.min((p.stockQuantity / 50) * 100, 100)}%` }} 
                            />
                        </div>
                    </div>
                  </TableCell>

                  {/* Status Toggle */}
                  <TableCell>
                    <button 
                        onClick={() => toggleStatus(p._id, p.status)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all hover:scale-105 active:scale-95",
                            p.status === 'Active' ? "bg-green-500/10 border-green-500/20 text-green-500" : 
                            p.status === 'Out of Stock' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                            "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                        )}
                    >
                        {p.status}
                    </button>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Link 
                         to={`/products/${p._id}`}
                         className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-white hover:border-neutral-700 transition-all"
                       >
                         <Eye className="h-4 w-4" />
                       </Link>
                       <Link 
                         to={`/products/${p._id}/edit`}
                         className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-yellow-500 hover:border-yellow-500/30 transition-all"
                       >
                         <Pencil className="h-4 w-4" />
                       </Link>
                       <button 
                         onClick={() => setDeleteId(p._id)}
                         className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-red-500 hover:border-red-500/30 transition-all"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <Modal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        title="Delete Product"
      >
        <div className="p-6">
            <p className="text-sm text-neutral-400 leading-relaxed">
                Are you sure you want to delete this product? This action is <b className="text-red-500">permanent</b> and will remove all product data, variants, and associated images from storage.
            </p>
            <div className="flex items-center justify-end gap-3 mt-8">
                <button 
                    onClick={() => setDeleteId(null)}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-8 py-2.5 rounded-xl bg-red-500 text-xs font-bold text-white hover:bg-red-400 shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                >
                    {deleting ? <Spinner size="sm" /> : "Delete Forever"}
                </button>
            </div>
        </div>
      </Modal>
    </div>
  )
}