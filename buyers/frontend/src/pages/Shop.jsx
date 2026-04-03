import React, { useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Search, X, Loader2, SlidersHorizontal, ChevronDown, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { label: 'Newest',        value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Best Sellers',  value: 'popular' },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSortMenu, setShowSortMenu] = useState(false);

  const activeCategory = searchParams.get('category') || 'all';
  const searchQuery    = searchParams.get('search')   || '';
  const activeSort     = searchParams.get('sort')     || '';

  const setParam = useCallback((key, val) => {
    setSearchParams(prev => {
      if (val) prev.set(key, val);
      else prev.delete(key);
      return new URLSearchParams(prev);
    });
  }, [setSearchParams]);

  /* ── Infinite products ─── */
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['products', activeCategory, searchQuery, activeSort],
      queryFn: async ({ pageParam = 1 }) => {
        const params = {
          page: pageParam,
          limit: 20,
          ...(activeCategory !== 'all' && { category: activeCategory }),
          ...(searchQuery && { search: searchQuery }),
          ...(activeSort && { sort: activeSort }),
        };
        const { data } = await api.get('/products', { params });
        return data;
      },
      getNextPageParam: (last) =>
        last.pagination?.hasNext ? last.pagination.page + 1 : undefined,
    });

  /* ── Categories ─── */
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/products/categories');
      return data.categories || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const currentCategory = categories.find(
    c => c.slug === activeCategory || c._id === activeCategory
  );
  const displayTitle = currentCategory
    ? currentCategory.name
    : searchQuery
    ? `Results for "${searchQuery}"`
    : 'All Collections';

  const allProducts = data?.pages.flatMap(p => p.data) || [];
  const total       = data?.pages[0]?.pagination?.total ?? 0;
  const activeSortLabel = SORT_OPTIONS.find(o => o.value === activeSort)?.label ?? 'Sort';

  return (
    <div className="bg-base-100 min-h-screen font-sans text-base-content">

      {/* ── Page Header ─────────────────────────────── */}
      <div className="border-b border-base-200 bg-base-200/30">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 pt-8 pb-6">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight">
            {searchQuery ? (
              <>Results for <span className="text-primary">"{searchQuery}"</span></>
            ) : (
              <>Our <span className="text-primary">{displayTitle}</span></>
            )}
          </h1>
          {currentCategory?.description && (
            <p className="mt-2 text-base-content/50 text-sm sm:text-base max-w-2xl font-medium">
              {currentCategory.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Category Pills ──────────────────────────── */}
      {categories.length > 0 && (
        <div className="border-b border-base-200 bg-base-100 sticky top-[106px] sm:top-[118px] z-30 shadow-sm">
          <div className="max-w-[1440px] mx-auto px-4 md:px-10">
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-3">
              <button
                onClick={() => setParam('category', '')}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                  activeCategory === 'all'
                    ? 'bg-primary text-primary-content border-transparent shadow-md shadow-primary/20'
                    : 'bg-base-200/60 text-base-content/60 border-base-200 hover:border-primary/40 hover:text-primary'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => setParam('category', cat.slug || cat._id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                    activeCategory === cat.slug || activeCategory === cat._id
                      ? 'bg-primary text-primary-content border-transparent shadow-md shadow-primary/20'
                      : 'bg-base-200/60 text-base-content/60 border-base-200 hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar ─────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-5 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-[400px] group">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setParam('search', e.target.value)}
            className="w-full bg-base-200/60 border border-base-300 rounded-2xl py-3 pl-11 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setParam('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content transition-colors p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right: count + sort */}
        <div className="flex items-center gap-3 ml-auto">
          {total > 0 && (
            <span className="text-xs font-black text-base-content/40 uppercase tracking-widest whitespace-nowrap">
              {total} items
            </span>
          )}

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(v => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-base-300 bg-base-200/60 text-xs font-black uppercase tracking-widest text-base-content/70 hover:border-primary/40 hover:text-primary transition-all"
            >
              <ArrowUpDown size={13} />
              {activeSortLabel}
              <ChevronDown size={12} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-base-100 border border-base-200 rounded-2xl shadow-xl z-50 overflow-hidden py-2"
                  >
                    <button
                      onClick={() => { setParam('sort', ''); setShowSortMenu(false); }}
                      className={`w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
                        !activeSort ? 'text-primary bg-primary/5' : 'text-base-content/60 hover:bg-base-200'
                      }`}
                    >
                      Default
                    </button>
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setParam('sort', opt.value); setShowSortMenu(false); }}
                        className={`w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
                          activeSort === opt.value ? 'text-primary bg-primary/5' : 'text-base-content/60 hover:bg-base-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Product Grid ─────────────────────────────── */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-base-200 animate-pulse" />
              ))}
            </div>
          ) : allProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
              <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center">
                <Search size={28} className="text-base-content/30" />
              </div>
              <h2 className="text-xl font-black text-base-content/60">No Products Found</h2>
              <p className="text-sm text-base-content/40 max-w-sm font-medium">
                Try a different search term or browse a different category.
              </p>
              <Link to="/shop" className="btn btn-primary rounded-full px-8 text-xs font-black uppercase tracking-widest mt-2">
                Clear Filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                {allProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {hasNextPage && (
                <div className="mt-14 flex justify-center">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="btn btn-primary btn-wide rounded-full shadow-lg shadow-primary/20 font-black text-sm uppercase tracking-widest flex items-center gap-2"
                  >
                    {isFetchingNextPage ? (
                      <><Loader2 size={16} className="animate-spin" /> Loading...</>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Shop;