// =====================================================
// pages/Blog.jsx  —  FIXED
//
// Fixes:
//   1. Was reading data.posts but blogController.getPosts returns data.data
//      → blog always rendered empty with "New Articles Coming Soon"
//   2. Added pagination support
//   3. Category filter bar wired to GET /api/blog/categories
//   4. Safe date formatting (invalid dates no longer crash)
// =====================================================

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, User, Tag } from 'lucide-react';
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

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data } = await api.get('/blog/categories');
      return data.categories || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch posts — FIX: backend returns data.data not data.posts
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['blog-posts', activeCategory],
    queryFn: async () => {
      const params = activeCategory ? { category: activeCategory } : {};
      const { data } = await api.get('/blog', { params });
      return data; // { data: [...], pagination: {...} }
    },
  });

  const posts = postsData?.data || [];

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 font-sans">

      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 mb-10 text-center md:text-left mt-8">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
          The <span className="text-green-700">Editorial</span>.
        </h1>
        <p className="text-gray-500 max-w-2xl text-lg font-medium mx-auto md:mx-0">
          Curated beauty tips, style guides, and insider secrets from the Queens team.
        </p>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                !activeCategory
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/3] bg-gray-100 animate-pulse rounded-[2rem]" />
                <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
                <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-60">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
              <Clock size={32} />
            </div>
            <p className="text-xl font-bold text-gray-600">New articles coming soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, idx) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="group cursor-pointer flex flex-col"
              >
                <div className="aspect-[4/3] w-full rounded-[2rem] overflow-hidden mb-5 bg-gray-100 relative shadow-sm border border-gray-100">
                  <img
                    src={post.coverImage || 'https://images.unsplash.com/photo-1512496015851-a1fbaf6928e4?q=80&w=600'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    loading="lazy"
                  />
                  {post.category && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-gray-900 shadow-sm">
                      {post.category}
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-grow px-2">
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    {post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {safeDate(post.publishedAt)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <User size={11} /> {post.author?.name || 'Editors'}
                    </span>
                    {post.readTimeMin && (
                      <span>{post.readTimeMin} min read</span>
                    )}
                  </div>

                  <h3 className="text-2xl font-extrabold text-gray-900 leading-tight mb-3 group-hover:text-green-700 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-500 font-medium line-clamp-2 mb-5 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto">
                    <span className="inline-flex items-center gap-2 text-sm font-extrabold text-gray-900 tracking-wide uppercase group-hover:text-green-700 group-hover:gap-3 transition-all">
                      Read Article <ArrowRight size={15} />
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