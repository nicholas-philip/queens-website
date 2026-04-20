import React, { useState, useEffect } from "react";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const category = searchParams.get("category") || "";
  const sort     = searchParams.get("sort") || "newest";
  const search   = searchParams.get("search") || "";

  // ── Fetch Categories ──
  const { data: categories } = useQuery({
    queryKey: ["shop-categories"],
    queryFn: async () => {
      const { data } = await api.get("/products/categories");
      return data.categories || [];
    },
  });

  // ── Infinite Scroll Products ──
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["products", category, sort, search],
    queryFn: async ({ pageParam = 1 }) => {
      // Translate the combined sort value into what the backend expects
      const sortMap = {
        "newest":     { sortBy: "createdAt", sortOrder: "desc" },
        "price-asc":  { sortBy: "price",     sortOrder: "asc"  },
        "price-desc": { sortBy: "price",     sortOrder: "desc" },
        "popular":    { sortBy: "popular",   sortOrder: "desc" },
      };
      const { sortBy, sortOrder } = sortMap[sort] || sortMap["newest"];
      const params = {
        page: pageParam,
        limit: 12,
        category,
        sortBy,
        sortOrder,
        search,
      };
      const { data } = await api.get("/products", { params });
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.pages) {
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
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-base-100 pt-32 pb-20">
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
              <div className="relative group">
                <select 
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-base-200 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 pr-12 text-xs font-black uppercase tracking-widest outline-none transition-all hover:bg-base-300 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
                <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:rotate-180 transition-transform" />
              </div>

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
            <div className="max-w-[1440px] mx-auto bg-base-200/50 rounded-[2rem] p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-base-content/40 mb-4">Categories</h4>
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
