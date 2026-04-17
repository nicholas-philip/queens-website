import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, User, ArrowRight, Bell, Search, Sparkles } from 'lucide-react';
import api from '../api';

const Blog = () => {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const { data } = await api.get('/blog');
      return data.blogs || [];
    },
  });

  const featuredPost = blogs?.[0];
  const remainingPosts = blogs?.slice(1) || [];

  return (
    <div className="min-h-screen bg-base-100 pt-32 pb-20 font-sans">
      
      {/* ── Header ── */}
      <header className="px-4 md:px-8 mb-16 sm:mb-24">
        <div className="max-w-[1440px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
              <Sparkles size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">The Queens Editorial</span>
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-base-content tracking-tighter leading-[0.9] uppercase mb-8">
              Fashion <br/> <span className="text-primary">Insights.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-base-content/60 text-lg font-medium leading-relaxed">
              Curated perspectives on luxury style, beauty standards, and the culture defining West African modernism.
            </p>
          </motion.div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {isLoading ? (
          <div className="py-40 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-base-content/20 italic">Loading Stories...</p>
          </div>
        ) : blogs?.length === 0 ? (
          <div className="py-32 text-center bg-base-200/50 rounded-[3rem] border-2 border-dashed border-base-300">
            <Bell size={48} className="mx-auto text-base-content/10 mb-4" />
            <h3 className="text-xl font-black text-base-content/40 uppercase">No editorials yet</h3>
            <p className="text-sm font-medium text-base-content/30 mt-2">We're currently crafting new stories for you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {blogs.map((post, index) => (
              <motion.article 
                key={post._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
                className="group flex flex-col"
              >
                <Link to={`/blog/${post.slug}`} className="relative aspect-[16/10] sm:aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 bg-base-200 border border-base-200 block shadow-sm group-hover:shadow-2xl transition-all duration-500">
                  <img 
                    src={post.coverImage || 'https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=800'} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {post.category && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg">
                      <span className="text-[10px] font-black uppercase tracking-widest text-black">{post.category}</span>
                    </div>
                  )}
                </Link>

                <div className="flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary mb-4 italic">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} strokeWidth={3} /> {new Date(post.createdAt).toLocaleDateString()}
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
