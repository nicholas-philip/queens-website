import React, { useState, useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  X, 
  ShoppingBag, 
  ArrowUpDown, 
  LayoutGrid, 
  List,
  Loader2,
  Sparkles
} from "lucide-react";
import api from "../api";
import ProductCard from "../components/ProductCard";
import { useSearchParams } from "react-router-dom";

const Shop = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  const category    = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";
  const sort        = searchParams.get("sort") || "all";
  const search      = searchParams.get("search") || "";

  // ── Fetch Categories ──
  const { data: categories } = useQuery({
    queryKey: ["shop-categories"],
    queryFn: async () => {
      const { data } = await api.get("/products/categories");
      return data.categories || [];
    },
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["products", category, subcategory, sort, search],
    queryFn: async ({ pageParam = 1 }) => {
      const sortMap = {
        "newest":     { sortBy: "createdAt", sortOrder: "desc" },
        "price-asc":  { sortBy: "price",     sortOrder: "asc"  },
        "price-desc": { sortBy: "price",     sortOrder: "desc" },
        "popular":    { sortBy: "popular",   sortOrder: "desc" },
      };

      // "all" = no sort params → backend returns every product
      const sortParams = sort === "all" ? { sortBy: "random", sortOrder: "asc" } : (sortMap[sort] || {});
      const actualLimit = 12; // Standardize limit to 12 for better infinite scroll behavior

      const params = {
        page: pageParam,
        limit: actualLimit, 
        category,
        subcategory,
        search,
        ...sortParams,
      };
      const { data } = await api.get("/products", { params });
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });

  const allProducts = data?.pages.flatMap((page) => page.data) || [];

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", newSort);
    setSearchParams(params);
  };

  const handleCategoryChange = (newCat) => {
    const params = new URLSearchParams(searchParams);
    if (newCat) params.set("category", newCat);
    else params.delete("category");
    params.delete("subcategory"); // Reset subcategory when category changes
    setSearchParams(params);
  };

  const handleSubcategoryChange = (newSub) => {
    const params = new URLSearchParams(searchParams);
    if (newSub) params.set("subcategory", newSub);
    else params.delete("subcategory");
    setSearchParams(params);
  };

  const activeCategoryObj = categories?.find(c => c.slug === category);

  return (
    <div className="min-h-screen bg-base-100 pt-36 md:pt-48 pb-20">
      {/* ── Header Section ── */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-[1440px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-primary" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">The Collection</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-base-content uppercase">
                {category ? category.replace("-", " ") : "All Pieces"}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Premium Custom Sorting Dropdown */}
              <div className="relative z-40">
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  onBlur={() => setTimeout(() => setIsSortOpen(false), 200)}
                  className={`flex items-center justify-between gap-3 min-w-[200px] border-2 transition-all px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest outline-none cursor-pointer ${isSortOpen ? 'border-primary/20 bg-base-300' : 'border-transparent bg-base-200 hover:bg-base-300'}`}
                >
                  {sort === 'all' ? 'Sort By' : 
                   sort === 'newest' ? 'Newest First' : 
                   sort === 'price-asc' ? 'Price: Low to High' : 
                   sort === 'price-desc' ? 'Price: High to Low' : 'Most Popular'}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute top-full left-0 mt-2 w-full bg-base-200/90  border border-white/5 rounded-2xl shadow-2xl overflow-hidden py-2 z-40"
                    >
                      {[
                        { id: 'all', label: 'All Pieces' },
                        { id: 'newest', label: 'Newest First' },
                        { id: 'price-asc', label: 'Price: Low to High' },
                        { id: 'price-desc', label: 'Price: High to Low' },
                        { id: 'popular', label: 'Most Popular' }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => {
                            handleSortChange(option.id);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors ${sort === option.id ? 'text-primary bg-primary/5' : 'text-base-content/60 hover:text-primary hover:bg-base-300'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Filtering Button */}
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isFilterOpen ? 'bg-primary text-primary-content' : 'bg-base-200 hover:bg-base-300'}`}
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Filters Bar (Expandable) ── */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.section 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 md:px-8 mb-12 overflow-hidden"
          >
            <div className="max-w-[1440px] mx-auto bg-base-100 rounded-[2rem] p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-base-content/40 mb-4">Categories</h4>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleCategoryChange("")}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === "" ? 'bg-primary text-primary-content shadow-lg shadow-primary/20' : 'bg-base-100 hover:bg-primary/10'}`}
                      >
                        All Pieces
                      </button>
                      {categories?.map((cat) => (
                        <button 
                          key={cat.slug}
                          onClick={() => handleCategoryChange(cat.slug)}
                          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === cat.slug ? 'bg-primary text-primary-content shadow-lg shadow-primary/20' : 'bg-base-100 hover:bg-primary/10'}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    {/* Subcategories (only show if active category has them) */}
                    <AnimatePresence>
                       {activeCategoryObj?.subcategories?.length > 0 && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex flex-wrap gap-2 pt-2 border-t border-base-content/5 mt-2"
                          >
                            <button 
                              onClick={() => handleSubcategoryChange("")}
                              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${subcategory === "" ? 'bg-neutral text-neutral-content' : 'bg-base-100 hover:bg-neutral/10'}`}
                            >
                              All {activeCategoryObj.name}
                            </button>
                            {activeCategoryObj.subcategories.map(sub => (
                              <button 
                                key={sub}
                                onClick={() => handleSubcategoryChange(sub)}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${subcategory === sub ? 'bg-neutral text-neutral-content' : 'bg-base-100 hover:bg-neutral/10'}`}
                              >
                                {sub}
                              </button>
                            ))}
                          </motion.div>
                       )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Product Grid ── */}
      <section className="px-4 md:px-8">
        <div className="max-w-[1440px] mx-auto">
          {isLoading ? (
            <div className="py-40 flex flex-col items-center gap-4">
              <Loader2 size={40} className="text-primary animate-spin" />
              <p className="text-xs font-black uppercase tracking-[0.3em] text-base-content/30 italic">Curating Elegance...</p>
            </div>
          ) : allProducts.length === 0 ? (
            <div className="py-40 text-center">
              <ShoppingBag size={64} className="mx-auto text-base-content/5 mb-6" />
              <h3 className="text-2xl font-black text-base-content mb-2 uppercase">No Pieces Found</h3>
              <p className="text-base-content/50 font-medium">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => {
                  setSearchParams({});
                  setIsFilterOpen(false);
                }}
                className="mt-8 text-xs font-black uppercase tracking-widest text-primary hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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

