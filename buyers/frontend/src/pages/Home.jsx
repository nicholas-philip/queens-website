import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, Clock, Star, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

/* ─── Tiny fade-up helper ─────────────────────────────── */
const FadeUp = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ eyebrow, title, subtitle, linkTo, linkLabel }) => (
  <div className="flex justify-between items-end mb-8 sm:mb-12 gap-4">
    <div>
      {eyebrow && (
        <span className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-2 block">
          {eyebrow}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-base-content tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm text-base-content/50 font-medium max-w-lg">{subtitle}</p>
      )}
    </div>
    {linkTo && (
      <Link
        to={linkTo}
        className="shrink-0 flex items-center gap-1.5 text-primary font-black text-xs sm:text-sm uppercase tracking-widest hover:gap-3 transition-all group"
      >
        {linkLabel || 'View All'} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    )}
  </div>
);

const Home = () => {
  const { data: homepageData, isLoading: homeLoading } = useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const { data } = await api.get('/store/homepage');
      return data.homepage || {};
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: allProductsData } = useQuery({
    queryKey: ['home-all-products'],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: { limit: 60 } });
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const featured   = homepageData?.featured   || [];
  const newArrivals = homepageData?.newArrivals || [];
  const categories  = homepageData?.categories  || [];
  const allProducts = allProductsData           || [];

  return (
    <div className="bg-base-100 min-h-screen font-sans text-base-content transition-colors duration-300">

      {/* ═══════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-base-100 border-b border-base-200">
        {/* Subtle gold radial glow */}
        
        

        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24 lg:py-32 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
                <Star size={12} className="fill-primary text-primary" />
                <span className="text-xs font-black uppercase tracking-[0.25em] text-primary">
                  New Season Arrivals
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-base-content mb-6">
                Dress Like<br />
                <span className="text-primary">Royalty.</span>
              </h1>

              <p className="text-base-content/60 text-base sm:text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-xl">
                Curated luxury dresses, authentic sneakers, signature perfumes, and premium beauty essentials — delivered to your door.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="px-8 py-4 bg-primary text-primary-content font-black text-sm uppercase tracking-widest rounded-2xl hover:brightness-110 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  Browse Collection
                </Link>
                <Link
                  to="/shop?sort=newest"
                  className="px-8 py-4 border-2 border-base-300 text-base-content font-black text-sm uppercase tracking-widest rounded-2xl hover:border-primary hover:text-primary active:scale-95 transition-all"
                >
                  Latest Drops
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Animated Marquee strip */}
          <div className="mt-16 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap text-xs font-black uppercase tracking-[0.3em] text-base-content/20 select-none">
              {Array.from({ length: 2 }).map((_, i) => (
                <span key={i}>
                  {['Express Delivery Worldwide', '✦', 'Authentic Products', '✦', 'Premium Quality', '✦', 'Luxury Fashion', '✦', 'Beauty Essentials', '✦', 'Verified Quality', '✦'].join('   ')}
                  {'     '}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

    

      {/* ═══════════════════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="py-14 sm:py-20 md:py-24 max-w-[1440px] mx-auto px-4 md:px-8">
          <FadeUp>
            <SectionHeader
              eyebrow="Browse"
              title="Shop by Category"
              linkTo="/shop"
              linkLabel="All Products"
            />
          </FadeUp>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((cat, i) => (
              <FadeUp key={cat._id} delay={i * 0.05}>
                <Link to={`/shop?category=${cat.slug}`} className="group flex flex-col items-center text-center">
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-base-200 mb-3 border-2 border-base-100 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-primary/30">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1615397323716-e52293b6e82c?q=80&w=400&auto=format&fit=crop'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={cat.name}
                      loading="lazy"
                    />
                  </div>
                  <span className="font-black text-base-content text-xs sm:text-sm group-hover:text-primary transition-colors tracking-wide line-clamp-1">
                    {cat.name}
                  </span>
                </Link>
              </FadeUp>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="py-14 sm:py-20 bg-base-100 border-y border-base-200">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8">
            <FadeUp>
              <SectionHeader
                eyebrow="Handpicked"
                title="Featured Picks"
                subtitle="Our editors' top selections right now."
                linkTo="/shop"
                linkLabel="View All"
              />
            </FadeUp>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((product, i) => (
                <FadeUp key={product._id} delay={i * 0.06}>
                  <ProductCard product={product} />
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          ALL PRODUCTS
      ═══════════════════════════════════════════════════ */}
      {allProducts.length > 0 && (
        <section className="py-14 sm:py-20 md:py-24 bg-base-100 border-t border-base-200">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8">
            <FadeUp>
              <SectionHeader
                eyebrow="The Master Catalog"
                title="Explore the Collection"
                subtitle="Browse every exquisite piece in our curated inventory."
                linkTo="/shop"
                linkLabel="Shop All Pieces"
              />
            </FadeUp>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {allProducts.map((product, i) => (
                <FadeUp key={product._id} delay={(i % 10) * 0.04}>
                  <ProductCard product={product} />
                </FadeUp>
              ))}
            </div>
            <div className="mt-14 text-center">
              <Link to="/shop" className="btn btn-primary btn-wide rounded-full shadow-lg shadow-primary/20 text-sm font-black uppercase tracking-widest">
                Browse Full Shop
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          NEW ARRIVALS (Now lower)
      ═══════════════════════════════════════════════════ */}
      {newArrivals.length > 0 && (
        <section className="py-14 sm:py-20 md:py-24 max-w-[1440px] mx-auto px-4 md:px-8 bg-base-100 border-t border-base-200">
          <FadeUp>
            <SectionHeader
              eyebrow="Just Dropped"
              title="Recent Additions"
              subtitle="The very latest pieces added to our catalog."
              linkTo="/shop?sort=newest"
              linkLabel="See All New"
            />
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {newArrivals.map((product, i) => (
              <FadeUp key={product._id} delay={i * 0.05}>
                <ProductCard product={product} />
              </FadeUp>
            ))}
          </div>
        </section>
      )}

      {/* Loading placeholder */}
      {homeLoading && allProducts.length === 0 && (
        <section className="py-24 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </section>
      )}

 {/* ═══════════════════════════════════════════════════
          PROMO BANNER  (mid-page CTA)
      ═══════════════════════════════════════════════════ */}
      <section className="py-8 px-4 md:px-8">
        <FadeUp>
          <div className="max-w-[1440px] mx-auto">
            <div className="relative overflow-hidden rounded-[2rem] bg-neutral text-neutral-content flex flex-col sm:flex-row items-center justify-between gap-8 px-8 py-10 md:px-14 md:py-12 shadow-2xl border border-primary/20">
              {/* Gold glow */}
              
              <div>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-3 block">
                  ✦ Limited Time
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-2">
                  Complimentary Shipping<br />on Featured Pieces
                </h2>
                <p className="text-neutral-content/60 text-sm font-medium">
                  Don't miss out — shop the full collection today.
                </p>
              </div>
              <Link
                to="/shop"
                className="shrink-0 px-8 py-4 bg-primary text-primary-content font-black text-sm uppercase tracking-widest rounded-2xl hover:brightness-110 shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center gap-2"
              >
                <Zap size={16} /> Shop Now
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>


      

    </div>
  );
};

export default Home;


