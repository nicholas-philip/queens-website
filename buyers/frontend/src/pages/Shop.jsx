import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import api from "../api";
import ProductCard from "../components/ProductCard";
import CategoryBar from "../components/CategoryBar";

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", activeCategory],
    queryFn: async () => {
      const params = activeCategory !== "all" ? { category: activeCategory } : {};
      const { data } = await api.get("/products", { params });
      return data.data || data;
    },
  });

  const filteredProducts = products?.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-base-100 min-h-screen pt-28 font-sans text-base-content">

      {/* HERO HEADER */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 text-center md:text-left mb-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Our <span className="text-primary">Collection</span>
        </h1>

        <p className="mt-4 text-base-content/60 text-lg max-w-2xl">
          Explore our full range of jewelry, beauty essentials, and premium
          gifts. Each piece is curated to elevate your everyday style.
        </p>
      </div>

      {/* CATEGORY BAR */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 mb-10">
        <CategoryBar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-base-200 border border-base-300 rounded-full py-3.5 pl-12 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition shadow-sm"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* PRODUCT COUNT */}
        <p className="text-sm font-semibold text-base-content/60">
          {filteredProducts?.length || 0} Products Found
        </p>
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
          ) : filteredProducts?.length === 0 ? (

            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
              <div className="w-20 h-20 rounded-full bg-base-300 flex items-center justify-center">
                <Search size={30} className="text-base-content/40" />
              </div>

              <h2 className="text-xl font-bold text-base-content/70">
                No Products Found
              </h2>

              <p className="text-sm text-base-content/50">
                Try searching with another keyword.
              </p>
            </div>
          ) : (

            /* PRODUCT GRID */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredProducts?.map((product) => (
                <div
                  key={product._id}
                  className="transition transform hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Shop;