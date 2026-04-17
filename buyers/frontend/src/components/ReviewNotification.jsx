import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, MessageSquare, ExternalLink, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import logo from '../assets/logo.png';

export default function ReviewNotification() {
  const [replies, setReplies] = useState([]);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkReplies = async () => {
      const stored = JSON.parse(localStorage.getItem('queens_submitted_reviews') || '[]');
      if (stored.length === 0) return;

      try {
        const { data } = await api.post('/reviews/check-replies', { reviewIds: stored });
        if (data.reviews?.length > 0) {
          // Filter out replies the user has already seen
          const seenIds = JSON.parse(localStorage.getItem('queens_seen_replies') || '[]');
          const newReplies = data.reviews.filter(r => !seenIds.includes(r._id));
          
          if (newReplies.length > 0) {
            setReplies(newReplies);
            // Delay showing to not overlap with other page load animations
            setTimeout(() => setShow(true), 1500);
          }
        }
      } catch (err) {
        console.error('Failed to check review replies:', err);
      }
    };

    checkReplies();
  }, []);

  const handleDismiss = (id) => {
    const seenIds = JSON.parse(localStorage.getItem('queens_seen_replies') || '[]');
    if (!seenIds.includes(id)) {
      seenIds.push(id);
      localStorage.setItem('queens_seen_replies', JSON.stringify(seenIds));
    }
    
    const remaining = replies.filter(r => r._id !== id);
    setReplies(remaining);
    if (remaining.length === 0) setShow(false);
  };

  const handleMarkAllSeen = () => {
    const seenIds = JSON.parse(localStorage.getItem('queens_seen_replies') || '[]');
    replies.forEach(r => {
      if (!seenIds.includes(r._id)) seenIds.push(r._id);
    });
    localStorage.setItem('queens_seen_replies', JSON.stringify(seenIds));
    setShow(false);
  };

  if (replies.length === 0 || dismissed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[200] max-w-[380px] w-full"
        >
          <div className="bg-neutral text-white rounded-[2rem] p-6 shadow-2xl border border-white/10 overflow-hidden relative group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                <img src={logo} alt="Logo" className="w-full h-full object-contain filter brightness-125" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Official Reply</span>
                  <button 
                    onClick={() => setShow(false)}
                    className="text-white/30 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <h4 className="text-sm font-black mb-1 leading-tight">
                  Queens Fashion Store responded to your feedback!
                </h4>
                
                <p className="text-xs text-white/50 font-bold mb-4 line-clamp-2 italic">
                  "{replies[0]?.adminReply.text}"
                </p>
                
                <div className="flex items-center gap-3">
                  <Link
                    to={`/product/${replies[0]?.productId.slug || replies[0]?.productId._id}`}
                    onClick={() => handleDismiss(replies[0]?._id)}
                    className="flex-1 btn btn-primary btn-sm h-10 rounded-xl font-black text-xs uppercase tracking-widest border-none text-neutral"
                  >
                    View Product <ChevronRight size={14} className="ml-1" />
                  </Link>
                  <button
                    onClick={() => handleDismiss(replies[0]?._id)}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            {replies.length > 1 && (
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">{replies.length - 1} more response{replies.length > 2 ? 's' : ''}</span>
                <button 
                  onClick={handleMarkAllSeen}
                  className="text-xs font-black text-primary uppercase tracking-[0.2em] hover:underline"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
