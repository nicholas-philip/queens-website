import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Plus, CheckCircle, AlertCircle, Send } from 'lucide-react';
import api from '../api';

export default function ReviewSection({ productId, reviews = [], averageRating = 0, reviewCount = 0 }) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error'
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    rating: 5,
    comment: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const { data } = await api.post('/reviews/send', {
        productId,
        ...formData
      });

      // Save review ID to localStorage for future reply notifications
      if (data.reviewId) {
        const stored = JSON.parse(localStorage.getItem('queens_submitted_reviews') || '[]');
        if (!stored.includes(data.reviewId)) {
          stored.push(data.reviewId);
          localStorage.setItem('queens_submitted_reviews', JSON.stringify(stored));
        }
      }

      setSubmitStatus('success');
      setShowForm(false);
      setFormData({ customerName: '', customerEmail: '', rating: 5, comment: '' });
    } catch (error) {
      console.error('Review submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-20 lg:mt-28 border-t border-base-200 pt-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-4 uppercase tracking-[0.05em]">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-5xl font-black text-neutral">{averageRating.toFixed(1)}</span>
              <div className="flex flex-col">
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i <= Math.round(averageRating) ? "currentColor" : "none"}
                      className={i <= Math.round(averageRating) ? "" : "text-base-content/20"}
                    />
                  ))}
                </div>
                <span className="text-xs font-black uppercase tracking-widest opacity-40 mt-1">
                  Based on {reviewCount} reviews
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-neutral rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest border-none hover:bg-zinc-800 transition-all flex items-center gap-2"
        >
          {showForm ? (
            <>Close Form</>
          ) : (
            <>
              <Plus size={18} />
              Write a Review
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-16"
          >
            <div className="bg-base-200/30 rounded-[2.5rem] p-8 md:p-12 border-2 border-primary/10">
              <h3 className="text-xl font-black mb-8 uppercase tracking-tight">Share Your Experience</h3>
              
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-4">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-base-100 rounded-2xl px-6 py-4 text-sm outline-none border-2 border-transparent focus:border-primary/40 font-bold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-4">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full bg-base-100 rounded-2xl px-6 py-4 text-sm outline-none border-2 border-transparent focus:border-primary/40 font-bold transition-all"
                  />
                </div>

                <div className="md:col-span-2 space-y-4 py-4">
                  <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-4 block">Overall Rating</label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          formData.rating >= star 
                            ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' 
                            : 'bg-base-100 text-base-content/20 border-2 border-base-200'
                        }`}
                      >
                        <Star size={20} fill={formData.rating >= star ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-4">Your Feedback</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Tell us what you liked (or didn't like)..."
                    className="w-full bg-base-100 rounded-[2rem] px-8 py-6 text-sm outline-none border-2 border-transparent focus:border-primary/40 font-bold transition-all resize-none"
                  ></textarea>
                </div>

                <div className="md:col-span-2 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`btn btn-primary w-full h-16 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl border-none ${
                      isSubmitting ? 'loading' : ''
                    }`}
                  >
                    {!isSubmitting && <Send size={18} className="mr-2" />}
                    {isSubmitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {submitStatus === 'success' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-success/10 border-2 border-success/20 rounded-3xl p-6 flex items-center gap-4 mb-12"
        >
          <div className="w-10 h-10 bg-success text-white rounded-full flex items-center justify-center shrink-0">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="font-black text-sm uppercase tracking-tight text-success">Review Submitted!</p>
            <p className="text-xs font-bold opacity-60">Thank you. Your review is being moderated and will appear shortly.</p>
          </div>
        </motion.div>
      )}

      {submitStatus === 'error' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-error/10 border-2 border-error/20 rounded-3xl p-6 flex items-center gap-4 mb-12"
        >
          <div className="w-10 h-10 bg-error text-white rounded-full flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="font-black text-sm uppercase tracking-tight text-error">Something went wrong</p>
            <p className="text-xs font-bold opacity-60">We couldn't post your review. Please try again later.</p>
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {reviews.length === 0 ? (
          <div className="md:col-span-2 py-20 text-center bg-base-200/10 rounded-[3rem] border-2 border-dashed border-base-200">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm font-black uppercase tracking-widest opacity-30">No reviews yet. Be the first!</p>
          </div>
        ) : (
          reviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-base-100 border border-base-200 p-8 md:p-10 rounded-[2.5rem] hover:shadow-2xl hover:shadow-primary/5 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center text-primary font-black text-lg shadow-inner">
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">{review.customerName}</h4>
                    <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={12}
                      fill={i <= review.rating ? "currentColor" : "none"}
                      className={i <= review.rating ? "" : "text-base-content/10"}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-base-content/80 text-sm leading-relaxed font-medium italic">
                "{review.comment}"
              </p>

              {review.adminReply?.text && (
                <div className="mt-8 pt-6 border-t border-base-200 ml-4 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 rounded-full" />
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={14} className="text-primary" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Queens Fashion Store Official Reply</span>
                  </div>
                  <p className="text-xs font-bold text-base-content/60 leading-relaxed">
                    {review.adminReply.text}
                  </p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
