import { useEffect, useState, useCallback } from "react"
import { Link, useSearchParams }             from "react-router-dom"
import { Plus, Search, Filter, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react"
import { blogAPI }                           from "../../libs/api"
import { cn }                                from "../../libs/utils"
import { useToast }                          from "../../context/ToastContext"
import { Table, TableHead, TableBody, TableRow, TableCell, TableLoading, TableEmpty } from "../../components/Table"
import Pagination                            from "../../components/Pagination"
import Modal                                 from "../../components/Modal"

export default function BlogPage() {
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [posts,       setPosts]     = useState([])
  const [pagination,  setPagination] = useState(null)
  const [loading,     setLoading]    = useState(true)
  const [search,      setSearch]     = useState(searchParams.get("search") || "")
  const [isPublished, setIsPublished] = useState(searchParams.get("isPublished") || "")
  const [page,        setPage]       = useState(1)
  const [deleteId,    setDeleteId]   = useState(null)
  const [deleting,    setDeleting]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12, search, isPublished }
      const { data } = await blogAPI.getAll(params)
      setPosts(data.posts)
      setPagination({
          page: data.currentPage,
          pages: data.pages,
          total: data.total
      })
    } catch { toast.error("Error", "Failed to load blog posts") }
    finally { setLoading(false) }
  }, [page, search, isPublished, toast])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await blogAPI.delete(deleteId)
      toast.success("Deleted", "Blog post removed.")
      setDeleteId(null)
      load()
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Delete failed.")
    } finally { setDeleting(false) }
  }

  const togglePublish = async (id, currentPublished) => {
    try {
      await blogAPI.publish(id)
      setPosts((p) => p.map((pr) => pr._id === id ? { ...pr, isPublished: !currentPublished } : pr))
      toast.success("Updated", `Post is now ${(!currentPublished) ? "Published" : "a Draft"}.`)
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Publish toggle failed.")
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Blog Posts</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage articles, beauty tips, and news.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/blog/new" className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 rounded-xl text-xs font-bold text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all">
            <Plus className="h-4 w-4" /> Create Post
          </Link>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
          <input 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title or content..."
            className="w-full bg-black border border-neutral-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-neutral-700" 
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
                <select 
                    value={isPublished} 
                    onChange={(e) => { setIsPublished(e.target.value); setPage(1) }}
                    className="w-full bg-black border border-neutral-800 rounded-xl pl-11 pr-8 py-2.5 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-500/50 cursor-pointer"
                >
                    <option value="">All Statuses</option>
                    <option value="true">Published</option>
                    <option value="false">Draft</option>
                </select>
            </div>
        </div>
      </div>

      {/* ── Products Table ── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        <Table>
          <TableHead headers={["Post Info", "Category", "Reads", "Status", "Actions"]} />
          <TableBody>
            {loading ? (
              <TableLoading cols={5} rows={8} />
            ) : posts.length === 0 ? (
              <TableEmpty message="No posts found. Create your first article!" />
            ) : (
              posts.map((p) => (
                <TableRow key={p._id}>
                  {/* Post Info */}
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 shrink-0 rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden shadow-inner group-hover:border-yellow-500/30 transition-colors">
                        {p.coverImage ? (
                          <img src={p.coverImage} alt={p.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-neutral-600 text-xs font-bold uppercase">{p.title?.[0]}</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link to={`/blog/${p._id}/edit`} className="font-bold text-white hover:text-yellow-500 transition-colors block max-w-sm truncate text-sm">
                            {p.title}
                        </Link>
                        <p className="text-xs font-bold text-neutral-600 uppercase tracking-widest mt-1.5">{new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-neutral-400 bg-neutral-800/80 border border-neutral-800 px-2 py-1 rounded-lg">
                      {p.category || "Uncategorized"}
                    </span>
                  </TableCell>

                  {/* Views */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-neutral-300 text-sm">{p.viewCount} views</span>
                      <span className="text-xs text-neutral-600 font-bold uppercase">{p.readTimeMin} min read</span>
                    </div>
                  </TableCell>

                  {/* Status Toggle */}
                  <TableCell>
                    <button 
                        onClick={() => togglePublish(p._id, p.isPublished)}
                        title={p.isPublished ? "Unpublish" : "Publish"}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all hover:scale-105 active:scale-95 flex items-center gap-2",
                            p.isPublished ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-neutral-800 border-neutral-700 text-neutral-400"
                        )}
                    >
                        {p.isPublished ? <Eye className="h-3 w-3"/> : <EyeOff className="h-3 w-3"/>}
                        {p.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Link 
                         to={`/blog/${p._id}/edit`}
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
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        title="Delete Post"
      >
        <div className="p-6">
            <p className="text-sm text-neutral-400 leading-relaxed">
                Are you sure you want to delete this post? This action is <b className="text-red-500">permanent</b> and will remove the content from your blog forever.
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
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : "Delete Forever"}
                </button>
            </div>
        </div>
      </Modal>
    </div>
  )
}
