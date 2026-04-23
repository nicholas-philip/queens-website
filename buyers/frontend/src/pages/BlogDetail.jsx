import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, User, ArrowLeft, Calendar, Tag, ChevronRight, Share2, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import { useToast } from '../context/ToastContext';

const safeDate = (d) => {
  try {
    const parsed = new Date(d);
    if (isNaN(parsed)) return '';
    return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return ''; }
};

const BlogDetail = () => {
  const { slug } = useParams();
  const toast = useToast();

  const { data: postData, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data } = await api.get(`/blog/${slug}`);
      return data;
    },
    enabled: !!slug,
  });

  const post = postData?.post;
  const relatedPosts = postData?.relatedPosts || [];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center pt-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold uppercase tracking-widest text-base-content/40">Loading Editorial...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center pt-24 px-6 text-center">
        <h2 className="text-4xl font-black text-base-content mb-4">Article Not Found</h2>
        <p className="text-base-content/60 mb-8 max-w-md">The editorial you're looking for might have been moved or doesn't exist.</p>
        <Link to="/blog" className="px-8 py-3 bg-primary text-primary-content rounded-full font-bold hover:scale-105 transition-all">
          Back to Editorial
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 pb-20 pt-40 transition-colors duration-300">
      {/* ── Progress Bar ── */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        {/* ── Breadcrumbs ── */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-base-content/40 mb-8 overflow-x-auto whitespace-nowrap py-2 hide-scrollbar">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link to="/blog" className="hover:text-primary transition-colors">Editorial</Link>
          <ChevronRight size={10} />
          <span className="text-base-content/80 truncate">{post.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16">
          {/* ── Left Content (8 cols) ── */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Meta information */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-primary">
                {post.category && <span className="bg-primary/10 px-3 py-1 rounded-full">{post.category}</span>}
                <span className="flex items-center gap-1.5 text-base-content/40">
                  <Clock size={12} /> {post.readTimeMin} Min Read
                </span>
                <span className="flex items-center gap-1.5 text-base-content/40">
                  <Calendar size={12} /> {safeDate(post.publishedAt || post.createdAt)}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-base-content leading-[1.05] tracking-tighter">
                {post.title}
              </h1>

              <div className="flex items-center gap-6 py-6 border-y border-base-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                    {post.author?.name?.[0] || 'Q'}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-base-content/30">Written by</p>
                    <p className="text-xs font-black uppercase tracking-tight">{post.author?.name || 'Queens Editor'}</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-base-200" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-base-content/30">Published on</p>
                  <p className="text-xs font-black uppercase tracking-tight">{safeDate(post.publishedAt || post.createdAt)}</p>
                </div>
              </div>

              <p className="text-xl sm:text-2xl text-base-content/50 font-medium leading-relaxed italic border-l-8 border-primary/20 pl-8 py-2">
                {post.excerpt}
              </p>

              {/* Hero Image */}
              <div className="aspect-[21/9] w-full rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-base-200 shadow-2xl border border-base-200">
                <img 
                  src={post.coverImage || 'https://images.unsplash.com/photo-1512496015851-a1fbaf6928e4?q=80&w=1200'} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Share Buttons Mobile */}
              <div className="flex lg:hidden items-center gap-3 pt-4 border-b border-base-200 pb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/30 mr-2">Share Article</span>
                {[
                  { icon: Facebook, label: 'Facebook', color: 'hover:bg-[#1877F2]' },
                  { icon: Twitter, label: 'Twitter', color: 'hover:bg-[#1DA1F2]' },
                ].map((s, i) => (
                  <button key={i} className={`h-10 w-10 flex items-center justify-center rounded-full bg-base-200 text-base-content transition-all hover:text-white ${s.color}`}>
                    <s.icon size={16} />
                  </button>
                ))}
                <button onClick={handleCopyLink} className="h-10 w-10 flex items-center justify-center rounded-full bg-base-200 text-base-content transition-all hover:bg-primary hover:text-white">
                  <LinkIcon size={16} />
                </button>
              </div>

              {/* Main Content */}
              <article 
                className="prose prose-lg sm:prose-xl max-w-none text-base-content/80 font-medium leading-[1.8] 
                prose-headings:text-base-content prose-headings:font-black prose-headings:tracking-tight 
                prose-a:text-primary prose-strong:text-base-content prose-strong:font-black
                prose-img:rounded-[2rem] prose-blockquote:border-primary prose-blockquote:bg-base-100 prose-blockquote:px-8 prose-blockquote:py-2 prose-blockquote:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Author & Tags */}
              <div className="pt-12 border-t border-base-200 mt-16 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-xl font-black border border-primary/20 shadow-inner">
                    {post.author?.name?.[0] || 'Q'}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 block mb-0.5">Author</span>
                    <h4 className="font-black text-base-content text-lg leading-none">{post.author?.name || 'Queens Fashion Store Editor'}</h4>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag, i) => (
                    <span key={i} className="px-4 py-1.5 bg-base-200 text-base-content/60 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary/10 hover:text-primary transition-all cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Share & Impact Section at the bottom */}
              <div className="mt-12 pt-12 border-t border-base-200">
                <div className="bg-base-100 rounded-[2.5rem] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-base-200/50">
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black text-base-content mb-2 tracking-tight">Enjoyed this editorial?</h3>
                    <p className="text-base-content/50 font-medium max-w-md leading-relaxed">
                      Share these insights with your circle or save the link for your next style inspiration.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center md:items-end gap-6">
                    <div className="flex items-center gap-3">
                      {[
                        { icon: Facebook, label: 'FB', color: 'hover:bg-[#1877F2]' },
                        { icon: Twitter, label: 'TW', color: 'hover:bg-[#1DA1F2]' },
                      ].map((s, i) => (
                        <button key={i} onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')} className={`h-14 w-14 flex items-center justify-center rounded-2xl bg-base-100 text-base-content transition-all hover:text-white shadow-sm ${s.color}`}>
                          <s.icon size={20} />
                        </button>
                      ))}
                      <button onClick={handleCopyLink} className="h-14 w-14 flex items-center justify-center rounded-2xl bg-base-100 text-base-content transition-all hover:bg-primary hover:text-white shadow-sm">
                        <LinkIcon size={20} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-center md:text-right">
                      <div className="h-10 w-px bg-base-300 hidden md:block" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/30 mb-1">Total Editorial Reads</p>
                        <p className="text-2xl font-black text-base-content">{(post.viewCount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Right Sidebar (4 cols) ── */}
          <aside className="lg:col-span-4 space-y-12">


            {/* Related Posts */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-base-content flex items-center gap-3 tracking-tight">
                <div className="h-6 w-1 bg-primary rounded-full" />
                Latest Editorial
              </h3>
              <div className="space-y-6">
                {relatedPosts.length > 0 ? relatedPosts.map((rp) => (
                  <Link key={rp._id} to={`/blog/${rp.slug}`} className="group block">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-base-200/30 hover:bg-base-200 border border-transparent hover:border-base-300 transition-all duration-300">
                      <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-base-200">
                        <img src={rp.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={rp.title} />
                      </div>
                      <div className="flex flex-col justify-center gap-1">
                        <span className="text-[9px] font-black tracking-widest uppercase text-primary mb-1">{rp.category}</span>
                        <h4 className="font-extrabold text-base-content group-hover:text-primary transition-colors text-sm leading-tight line-clamp-2">
                          {rp.title}
                        </h4>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <p className="text-sm font-medium text-base-content/40 italic">More articles arriving soon...</p>
                )}
              </div>
              <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-3 transition-all pt-4">
                View All Articles <ChevronRight size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;

