import { useState, useEffect } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft, UploadCloud, Loader2 } from "lucide-react"
import { useToast } from "../../context/ToastContext"
import { blogAPI } from "../../libs/api"
import Spinner from "../../components/Spinner"

export default function BlogFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Beauty Tips",
    readTimeMin: 3,
    tags: "",
    authorName: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
  })

  const [imageFile, setImageFile] = useState(null)
  const [previewURL, setPreviewURL] = useState(null)

  useEffect(() => {
    if (isEdit) {
      const fetchPost = async () => {
        try {
          const { data } = await blogAPI.getById(id)
          const p = data.post
          setFormData({
            title: p.title || "",
            excerpt: p.excerpt || "",
            content: p.content || "",
            category: p.category || "Beauty Tips",
            readTimeMin: p.readTimeMin || 3,
            tags: Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags || ""),
            authorName: p.author?.name || "",
            slug: p.slug || "",
            metaTitle: p.metaTitle || "",
            metaDescription: p.metaDescription || "",
          })
          if (p.coverImage) setPreviewURL(p.coverImage)
        } catch (err) {
          toast.error("Error", "Failed to load post data")
          navigate("/blog")
        } finally {
          setLoading(false)
        }
      }
      fetchPost()
    }
  }, [id, isEdit, navigate, toast])

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setPreviewURL(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const fd = new FormData()
      Object.keys(formData).forEach(key => fd.append(key, formData[key]))
      if (imageFile) fd.append("coverImage", imageFile)

      if (isEdit) {
        await blogAPI.update(id, fd)
        toast.success("Success", "Blog post updated!")
      } else {
        await blogAPI.create(fd)
        toast.success("Success", "Blog post created!")
      }

      navigate("/blog")
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Failed to save post")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in pb-20">
      
      {/* ── Page Header ── */}
      <div className="flex items-center gap-4">
        <Link to="/blog" className="h-10 w-10 flex items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isEdit ? "Edit Post" : "New Blog Post"}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {isEdit ? "Update your article content and details." : "Create a new article for your customers."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-sm font-bold tracking-widest text-neutral-400 uppercase mb-6">Article Details</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Title</label>
              <input 
                name="title" 
                required
                value={formData.title} 
                onChange={handleChange} 
                className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all"
                placeholder="e.g. 5 Skincare Routines for Summer"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Category</label>
                <input 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all"
                  placeholder="e.g. Beauty Tips"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Read Time (minutes)</label>
                <input 
                  type="number"
                  name="readTimeMin" 
                  value={formData.readTimeMin} 
                  onChange={handleChange} 
                  className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Short Excerpt (Summary)</label>
              <textarea 
                name="excerpt" 
                required
                value={formData.excerpt} 
                onChange={handleChange} 
                className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all min-h-[80px]"
                placeholder="A brief summary of what the article is about..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Full Content (HTML allowed)</label>
              <textarea 
                name="content" 
                required
                value={formData.content} 
                onChange={handleChange} 
                className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all min-h-[300px]"
                placeholder="Write your beautiful article here..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Tags (comma separated)</label>
                <input 
                  name="tags" 
                  value={formData.tags} 
                  onChange={handleChange} 
                  className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all"
                  placeholder="e.g. skin, summer, care"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Author Name</label>
                <input 
                  name="authorName" 
                  value={formData.authorName} 
                  onChange={handleChange} 
                  className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all"
                  placeholder="Queens Fashion Store Team"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-sm font-bold tracking-widest text-neutral-400 uppercase mb-6">Cover Image</h2>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 aspect-video rounded-2xl border-2 border-dashed border-neutral-700 overflow-hidden bg-black/50 flex flex-col items-center justify-center relative group">
              {previewURL ? (
                <img src={previewURL} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center p-4 text-center">
                  <UploadCloud className="h-8 w-8 text-neutral-500 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">No Image</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-xs font-bold text-white bg-black/50 px-3 py-1.5 rounded-lg border border-white/20">Change Image</span>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-sm font-bold text-white">Upload Hero Graphic</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed max-w-sm">
                Choose an engaging banner. We recommend an image ratio of 16:9 and keeping the file size under 2MB for fast loading.
              </p>
            </div>
          </div>
        </div>
        
        {/* SEO Metadata */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-sm font-bold tracking-widest text-neutral-400 uppercase mb-6">SEO Metadata</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Slug (URL Keyword)</label>
              <input 
                name="slug" 
                value={formData.slug} 
                onChange={handleChange} 
                className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all font-mono"
                placeholder="e.g. skin-care-tips-2024"
              />
              <p className="text-[10px] text-neutral-500 mt-2 italic">If left blank, a slug will be automatically generated from the title.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Meta Title</label>
              <input 
                name="metaTitle" 
                value={formData.metaTitle} 
                onChange={handleChange} 
                className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all"
                placeholder="Highly optimized SEO title"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Meta Description</label>
              <textarea 
                name="metaDescription" 
                value={formData.metaDescription} 
                onChange={handleChange} 
                className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all min-h-[80px]"
                placeholder="The snippet that appears in search results..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-neutral-800/50">
          <Link to="/blog" className="px-6 py-3 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-yellow-500 rounded-xl text-xs font-bold text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Update Post" : "Publish Post"}
          </button>
        </div>
      </form>
    </div>
  )
}
