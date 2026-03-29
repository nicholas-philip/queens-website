import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../api';

const CategoryBar = ({ activeCategory, onCategoryChange }) => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/products/categories');
      return data.categories || [];
    }
  });

  if (isLoading) return <div className="h-16 flex items-center gap-4 overflow-x-auto pb-4 px-6 animate-pulse">
    {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-32 bg-white/5 rounded-full flex-shrink-0" />)}
  </div>;

  return (
    <div className="sticky top-[72px] z-40 glass border-b border-gold/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => onCategoryChange('all')}
          className={`flex-shrink-0 px-8 py-3 rounded-full border transition-all text-[10px] font-black uppercase tracking-[0.2em] ${
            activeCategory === 'all' 
            ? 'bg-gold text-black-rich border-gold shadow-gold/20 shadow-xl scale-105' 
            : 'bg-white/5 text-white/60 border-white/10 hover:border-gold/30 hover:bg-gold/5'
          }`}
        >
          Signature House
        </button>

        {categories?.map((cat) => (
          <button
            key={cat._id}
            onClick={() => onCategoryChange(cat._id || cat.slug)}
            className={`flex-shrink-0 px-8 py-3 rounded-full border transition-all text-[10px] font-black uppercase tracking-[0.2em] ${
              activeCategory === (cat._id || cat.slug)
              ? 'bg-gold text-black-rich border-gold shadow-gold/20 shadow-xl scale-105' 
              : 'bg-white/5 text-white/60 border-white/10 hover:border-gold/30 hover:bg-gold/5'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
