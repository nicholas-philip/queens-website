import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';


const safeDate = (d) => {
  try {
    const parsed = new Date(d);
    if (isNaN(parsed)) return '';
    return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
};

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data } = await api.get('/blog/categories');
      return data.categories || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['blog-posts', activeCategory],
    queryFn: async () => {
      const params = activeCategory ? { category: activeCategory } : {};
      const { data } = await api.get('/blog', { params });
      return data;
    },
  });

  const posts = postsData?.data || [];

  return (
    <div className="min-h-screen bg-base-100 pt-24 pb-16 sm:pb-20 font-sans transition-colors duration-300">

      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 mb-8 sm:mb-10 text-center md:text-left mt-6 sm:mt-8">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-base-content tracking-tight mb-3 sm:mb-4">
          The <span className="text-primary">Editorial</span>.
        </h1>
        <p className="text-base-content/60 max-w-2xl text-base sm:text-lg font-medium mx-auto md:mx-0">
          Curated beauty tips, style guides, and insider secrets from the Queens team.
        </p>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                !activeCategory
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200 text-base-content/70 hover:bg-base-300'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/3] bg-base-200 animate-pulse rounded-[1.5rem] sm:rounded-[2rem]" />
                <div className="h-4 bg-base-200 animate-pulse rounded w-3/4" />
                <div className="h-3 bg-base-200 animate-pulse rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 opacity-60">
            <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center text-base-content/40 mb-6">
              <Clock size={32} />
            </div>
            <p className="text-lg sm:text-xl font-bold text-base-content/60">New articles coming soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post, idx) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="group cursor-pointer flex flex-col"
              >
                <div className="aspect-[4/3] w-full rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden mb-4 sm:mb-5 bg-base-200 relative shadow-sm border border-base-200">
                  <img
                    src={post.coverImage || 'https://images.unsplash.com/photo-1512496015851-a1fbaf6928e4?q=80&w=600'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    loading="lazy"
                  />
                  {post.category && (
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-base-100/90 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-base-content shadow-sm">
                      {post.category}
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-grow px-1 sm:px-2">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-bold text-base-content/40 uppercase tracking-widest mb-2 sm:mb-3">
                    {post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {safeDate(post.publishedAt)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <User size={10} /> {post.author?.name || 'Editors'}
                    </span>
                    {post.readTimeMin && (
                      <span>{post.readTimeMin} min read</span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-base-content leading-tight mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-base-content/60 font-medium line-clamp-2 mb-4 sm:mb-5 leading-relaxed text-sm">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto">
                    <span className="inline-flex items-center gap-2 text-sm font-extrabold text-base-content tracking-wide uppercase group-hover:text-primary group-hover:gap-3 transition-all">
                      Read Article <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;