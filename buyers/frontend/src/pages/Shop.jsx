import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, ChevronDown } from "lucide-react";
import api from "../api";
import ProductCard from "../components/ProductCard";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL-driven states
  const activeCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";
  
  // Fetch products with infinite scroll/pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: ["products", activeCategory, searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        page: pageParam,
        limit: 15,
        ...(activeCategory !== "all" && { category: activeCategory }),
        ...(searchQuery && { search: searchQuery }),
      };
      const { data } = await api.get("/products", { params });
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNext) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });

  // Fetch category info for the dynamic title
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/products/categories");
      return data.categories || [];
    }
  });

  const currentCategory = categories?.find(c => c.slug === activeCategory || c._id === activeCategory);
  const displayTitle = currentCategory ? currentCategory.name : "Collection";

  const allProducts = data?.pages.flatMap((page) => page.data) || [];
  const totalFound = data?.pages[0]?.pagination.total || 0;

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchParams(prev => {
      if (val) prev.set("search", val);
      else prev.delete("search");
      return prev;
    });
  };

  const clearSearch = () => {
    setSearchParams(prev => {
      prev.delete("search");
      return prev;
    });
  };

  return (
    <div className="bg-base-100 min-h-screen pt-28 font-sans text-base-content">

      {/* HERO HEADER */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 text-center md:text-left mb-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Our <span className="text-primary">{displayTitle}</span>
        </h1>

        <p className="mt-4 text-base-content/60 text-lg max-w-2xl">
          {currentCategory?.description || "Explore our premium range of essentials, curated to elevate your everyday style."}
        </p>
      </div>

      {/* TOOLBAR */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* SEARCH */}
        <div className="relative w-full md:w-[420px] group">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary"
          />

          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-base-200 border border-base-300 rounded-full py-3.5 pl-12 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition shadow-sm"
          />

          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* PRODUCT COUNT & STATUS */}
        <div className="flex items-center gap-4">
          <p className="text-sm font-semibold text-base-content/60">
            {totalFound} Products Available
          </p>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <section className="bg-base-200/50 py-12">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">

          {/* LOADING STATE */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-3xl bg-base-300 animate-pulse"
                />
              ))}
            </div>
          ) : allProducts.length === 0 ? (

            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
              <div className="w-20 h-20 rounded-full bg-base-300 flex items-center justify-center">
                <Search size={30} className="text-base-content/40" />
              </div>

              <h2 className="text-xl font-bold text-base-content/70">
                No Products Found
              </h2>

              <p className="text-sm text-base-content/50">
                Try searching with another keyword or checking another category.
              </p>
            </div>
          ) : (

            /* PRODUCT GRID */
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {allProducts.map((product) => (
                  <div
                    key={product._id}
                    className="transition transform hover:-translate-y-1 hover:scale-[1.02]"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* LOAD MORE */}
              {hasNextPage && (
                <div className="mt-16 flex justify-center">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="btn btn-primary btn-wide rounded-full shadow-lg shadow-primary/20 flex items-center gap-2"
                  >
                    {isFetchingNextPage ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      "Load More"
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