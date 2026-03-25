import { useEffect, useState, useCallback } from "react"
import { Star, CheckCircle, Trash2, MessageSquare, Clock, Loader2 } from "lucide-react"
import { reviewsAPI } from "../../libs/api"
import { useToast } from "../../context/ToastContext"
import Modal from "../../components/Modal"

const formatRelativeTime = (dateString) => {
  if (!dateString) return "Unknown"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

function StarRating({ rating, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? "fill-yellow-500 text-yellow-500" : "text-neutral-700"}`} />
      ))}
      <span className="ml-1.5 text-xs font-bold text-white">{rating}.0</span>
    </div>
  )
}

function ReviewCard({ review, onApprove, onDelete, onReply }) {
  return (
    <div className={`border rounded-2xl p-5 flex flex-col gap-4 transition-all
      ${!review.isApproved ? "border-yellow-600/25 bg-neutral-900/30" : "border-neutral-800 bg-transparent"}`}>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs font-bold">
            {review.customerName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{review.customerName}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">{review.customerEmail || "No email"} · {formatRelativeTime(review.createdAt)}</p>
          </div>
        </div>
        <div>
          {!review.isApproved ? (
            <span className="flex items-center gap-1 px-2 py-1 bg-neutral-900 border border-yellow-600/30 text-yellow-500 text-[9px] font-bold uppercase tracking-widest rounded-lg">
              <Clock className="h-3 w-3" /> Pending
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-1 bg-neutral-900 border border-neutral-700 text-neutral-400 text-[9px] font-bold uppercase tracking-widest rounded-lg">
              <CheckCircle className="h-3 w-3" /> Approved
            </span>
          )}
        </div>
      </div>

      {/* Product */}
      {review.productId && (
        <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-900/60 border border-neutral-800 px-3 py-2 rounded-xl">
          <span className="font-medium text-neutral-400 truncate">{review.productId.title || "Unknown Product"}</span>
          {review.productId.SKU && (
            <>
              <span className="text-neutral-700">·</span>
              <span className="font-mono text-[10px] text-neutral-600 uppercase">{review.productId.SKU}</span>
            </>
          )}
        </div>
      )}

      {/* Rating + Comment */}
      <div>
        <StarRating rating={review.rating} />
        <p className="mt-3 text-sm text-neutral-400 leading-relaxed border-l-2 border-neutral-700 pl-3">
          "{review.comment}"
        </p>
      </div>

      {/* Admin Reply */}
      {review.adminReply?.text && (
        <div className="rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3" /> Admin Reply
          </p>
          <p className="text-sm text-neutral-300 leading-relaxed">{review.adminReply.text}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-neutral-800">
        {!review.isApproved && (
          <button onClick={() => onApprove(review._id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-yellow-500 hover:bg-yellow-400 rounded-xl text-xs font-bold text-black transition-all">
            <CheckCircle className="h-3.5 w-3.5" /> Approve
          </button>
        )}
        <button onClick={() => onReply(review)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-xs font-bold text-white transition-all">
          <MessageSquare className="h-3.5 w-3.5" />
          {review.adminReply?.text ? "Edit Reply" : "Reply"}
        </button>
        <button onClick={() => onDelete(review)}
          className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-neutral-500 hover:text-white transition-all">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function ReviewsPage() {
  const toast = useToast()

  const [reviews, setReviews] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("pending")

  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [replyModal, setReplyModal] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [savingReply, setSavingReply] = useState(false)
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === "pending") {
        const res = await reviewsAPI.getPending()
        setReviews(res.data.reviews || [])
        setPagination(null)
      } else {
        const params = { page, limit: 12 }
        if (tab === "approved") params.isApproved = true
        const res = await reviewsAPI.getAll(params)
        setReviews(res.data.data || [])
        setPagination(res.data.pagination)
      }
    } catch { toast.error("Error", "Failed to load reviews.") }
    finally { setLoading(false) }
  }, [tab, page, toast])

  useEffect(() => { load() }, [load])

  const handleApprove = async (id) => {
    try {
      await reviewsAPI.approve(id)
      toast.success("Approved", "Review is now visible publicly.")
      setReviews((p) => p.filter((r) => r._id !== id))
    } catch (err) {
      toast.error("Error", err.response?.data?.message || "Failed to approve.")
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await reviewsAPI.delete(deleteItem._id)
      toast.success("Deleted", "Review removed.")
      setDeleteItem(null)
      load()
    } catch { toast.error("Error", "Failed to delete.") }
    finally { setDeleting(false) }
  }

  const openReply = (review) => { setReplyModal(review); setReplyText(review.adminReply?.text || "") }

  const submitReply = async () => {
    if (!replyText.trim()) return toast.error("Error", "Reply cannot be empty.")
    setSavingReply(true)
    try {
      await reviewsAPI.reply(replyModal._id, { reply: replyText })
      toast.success("Reply saved", "Your reply is now visible.")
      setReplyModal(null)
      load()
    } catch { toast.error("Error", "Failed to post reply.") }
    finally { setSavingReply(false) }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Reviews</h1>
        <p className="text-sm text-neutral-500 mt-1">Moderate and respond to customer feedback</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl w-fit">
        {[
          { key: "pending",  label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "all",      label: "All Reviews" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => { setTab(key); setPage(1) }}
            className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === key ? "bg-white text-black" : "text-neutral-500 hover:text-neutral-300"}`}>
            {label}
            {key === "pending" && tab === "pending" && reviews.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded bg-yellow-500 text-black text-[9px] font-black">
                {reviews.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="border border-neutral-800 rounded-2xl p-16 text-center flex flex-col items-center">
          <div className="h-12 w-12 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center mb-4">
            <Star className="h-6 w-6 text-neutral-600" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {tab === "pending" ? "All caught up" : "No reviews found"}
          </h3>
          <p className="text-sm text-neutral-500 max-w-xs">
            {tab === "pending" ? "No reviews pending approval." : "Reviews will appear here once submitted."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <ReviewCard key={r._id} review={r} onApprove={handleApprove} onDelete={setDeleteItem} onReply={openReply} />
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-1.5">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold border transition-all ${
                    page === p ? "bg-yellow-500 text-black border-yellow-500" : "bg-transparent text-neutral-500 border-neutral-800 hover:text-white hover:border-neutral-600"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reply Modal */}
      <Modal open={!!replyModal} onClose={() => setReplyModal(null)} title="Reply to Review">
        <div className="p-6 space-y-5">
          {replyModal && (
            <>
              <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white">{replyModal.customerName}</span>
                  <StarRating rating={replyModal.rating} />
                </div>
                <p className="text-sm text-neutral-400 italic">"{replyModal.comment}"</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Your reply</label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-600/50 resize-none leading-relaxed placeholder-neutral-600"
                  placeholder="Write a professional response..."
                />
              </div>
            </>
          )}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
            <button onClick={() => setReplyModal(null)} className="px-5 py-2 text-xs font-bold text-neutral-500 hover:text-white transition-colors">Cancel</button>
            <button onClick={submitReply} disabled={savingReply}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 rounded-xl text-xs font-bold text-black transition-all disabled:opacity-50 flex items-center gap-2">
              {savingReply ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
              Publish Reply
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Review">
        <div className="p-6">
          <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
            Permanently delete this {deleteItem?.rating}-star review by <b className="text-white">{deleteItem?.customerName}</b>? The product rating will be recalculated.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setDeleteItem(null)} className="px-5 py-2 text-xs font-bold text-neutral-500 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleDelete} disabled={deleting}
              className="px-6 py-2 bg-white hover:bg-neutral-200 rounded-xl text-xs font-bold text-black transition-all disabled:opacity-50 flex items-center gap-2">
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Delete Forever"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}