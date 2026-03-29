import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  ChevronLeft,
  Star,
  ShieldCheck,
  Truck,
  Heart,
  Share2,
  Plus,
  Minus,
} from "lucide-react";

import { useCartStore } from "../store/useCartStore";
import api from "../api";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {
  const { id } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { addToCart, setCheckoutOpen } = useCartStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data.data || data;
    },
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", product?.category?.name || product?.category],
    enabled: !!(product?.category?.name || product?.category),
    queryFn: async () => {
      const catParam = product.category?.name || product.category;

      const { data } = await api.get("/products", {
        params: { category: catParam, limit: 5 },
      });

      const list = data.data || data;

      return list.filter((p) => p._id !== id);
    },
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-2xl font-bold">Product Not Found</p>
        <Link to="/shop" className="text-primary font-semibold underline">
          Go Back to Shop
        </Link>
      </div>
    );

  return (
    <div className="bg-base-100 min-h-screen pt-28 pb-20">

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

        {/* BACK LINK */}
        <Link
          to="/shop"
          className="flex items-center gap-2 text-sm text-base-content/60 hover:text-primary mb-10"
        >
          <ChevronLeft size={16} />
          Back to Shop
        </Link>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* PRODUCT GALLERY */}
          <div className="space-y-6">

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-3xl bg-base-200 border border-base-300 flex items-center justify-center relative p-10 overflow-hidden"
            >
              {product.images?.length > 0 ? (
                <img
                  src={product.images[activeImage] || product.images?.[0]}
                  alt={product.title}
                  className="object-contain w-full h-full transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <ShoppingBag size={64} className="text-base-content/10" />
              )}

              <button className="absolute top-4 right-4 bg-white p-3 rounded-full shadow hover:text-red-500 transition-colors">
                <Heart size={20} />
              </button>
            </motion.div>

            {/* THUMBNAILS */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {(product.images || []).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 min-w-[5rem] rounded-xl overflow-hidden border-2 transition
                  ${
                    activeImage === idx
                      ? "border-primary"
                      : "border-transparent hover:border-base-300"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="object-contain w-full h-full p-2"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="space-y-8">

            <div>
              <span className="badge badge-primary badge-outline mb-4">
                Premium Selection
              </span>

              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
                {product.title}
              </h1>

              {/* PRICE + RATING */}
              <div className="flex flex-wrap items-center gap-6 mt-5">

                <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-extrabold text-primary">
                    GHS {(product.discountPrice ?? product.price ?? 0).toFixed(2)}
                  </p>
                  {product.discountPrice && (
                    <p className="text-lg text-base-content/30 line-through">
                      GHS {(product.price ?? 0).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 border-l border-base-300 pl-6">
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i <= Math.round(product.averageRating || 0) ? "currentColor" : "none"}
                        className={i <= Math.round(product.averageRating || 0) ? "" : "text-base-content/20"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-base-content/70">
                    ({product.reviewCount || 0} reviews)
                  </span>
                </div>

              </div>
            </div>

            {/* DESCRIPTION */}
            <p className="text-base-content/70 text-lg leading-relaxed">
              {product.description ||
                "Experience the perfect blend of elegance and quality. Carefully curated to elevate your everyday style."}
            </p>

            {/* FEATURES */}
            <div className="flex flex-wrap gap-6 text-sm font-semibold">

              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                100% Authentic Quality
              </div>

              <div className="flex items-center gap-2">
                <Truck size={18} className="text-primary" />
                Free Delivery Available
              </div>

            </div>

            {/* QUANTITY */}
            <div className="flex items-center gap-4 pt-6">

              <div className="flex items-center border border-base-300 rounded-lg">

                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:text-primary"
                >
                  <Minus size={18} />
                </button>

                <span className="w-12 text-center font-bold">{quantity}</span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:text-primary"
                >
                  <Plus size={18} />
                </button>

              </div>

              <button className="btn btn-outline btn-square">
                <Share2 size={18} />
              </button>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">

              <button
                onClick={() => addToCart(product, quantity)}
                className="btn btn-primary flex-1 gap-2"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>

              <button
                onClick={() => {
                  addToCart(product, quantity);
                  setCheckoutOpen(true);
                }}
                className="btn btn-neutral flex-1"
              >
                Checkout Now
              </button>

            </div>

            {/* INFO CARDS */}
            <div className="grid sm:grid-cols-2 gap-4 pt-6">

              <div className="flex items-center gap-4 bg-base-200 p-4 rounded-xl">
                <Truck className="text-primary" />
                <div>
                  <p className="font-semibold text-sm">Swift Shipping</p>
                  <p className="text-xs opacity-60">
                    Dispatched within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-base-200 p-4 rounded-xl">
                <ShieldCheck className="text-primary" />
                <div>
                  <p className="font-semibold text-sm">Secure Payment</p>
                  <p className="text-xs opacity-60">
                    Pay via Momo or Card
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts?.length > 0 && (
          <section className="mt-28">

            <h2 className="text-3xl font-bold mb-10 text-center">
              You May Also Like
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {relatedProducts
                .slice(0, 5)
                .map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
            </div>

          </section>
        )}

      </div>
    </div>
  );
};

export default ProductDetails;