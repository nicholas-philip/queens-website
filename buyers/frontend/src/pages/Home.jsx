import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  // Fetch fully configured Homepage Data from Admin Settings
  const { data: homepageData, isLoading } = useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const { data } = await api.get('/store/homepage');
      return data.homepage || {};
    }
  });

  const featured = homepageData?.featured || [];
  const newArrivals = homepageData?.newArrivals || [];
  const categories = homepageData?.categories || [];

  return (
    <div className="bg-base-100 min-h-screen font-sans text-base-content transition-colors duration-300">
      {/* Standard Clean Hero */}
      <section className="bg-base-200 border-b border-base-300 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="z-10 text-center lg:text-left"
          >
            <span className="text-primary font-bold tracking-wider uppercase text-sm md:text-base mb-4 block">New Collection</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-base-content mb-6 leading-tight tracking-tight">
              Discover True <br className="hidden md:block" /> <span className="text-primary">Elegance.</span>
            </h1>
            <p className="text-base-content/70 text-lg md:text-xl mb-10 max-w-lg mx-auto lg:mx-0">
              Shop our latest collection of premium beauty products and exquisite jewelry designed to enhance your natural glow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
               <Link to="/shop" className="px-8 py-3.5 bg-primary text-primary-content font-bold rounded-lg hover:brightness-110 transition-all shadow-lg active:scale-95 text-center">
                 Shop Now
               </Link>
               <Link to="/shop" className="px-8 py-3.5 border-2 border-base-content/20 text-base-content font-bold rounded-lg hover:border-primary hover:text-primary transition-all active:scale-95 text-center">
                 Explore Categories
               </Link>
            </div>
          </motion.div>

          {/* Clean Hero Image */}
          <div className="relative h-[400px] lg:h-[550px] w-full hidden md:block rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
             <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Trust & Features Row */}
      <section className="border-b border-base-300 bg-base-100 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="flex items-center gap-4 justify-center md:justify-start">
             <div className="w-14 h-14 rounded-full bg-base-200 flex items-center justify-center text-primary">
               <Truck size={28} />
             </div>
             <div>
               <h4 className="font-bold text-base-content text-lg">Fast & Free Delivery</h4>
               <p className="text-sm text-base-content/60 font-medium">On all orders over GHS 500</p>
             </div>
           </div>
           <div className="flex items-center gap-4 justify-center md:justify-start">
             <div className="w-14 h-14 rounded-full bg-base-200 flex items-center justify-center text-primary">
               <ShieldCheck size={28} />
             </div>
             <div>
               <h4 className="font-bold text-base-content text-lg">Secure Payment</h4>
               <p className="text-sm text-base-content/60 font-medium">100% secure checkout process</p>
             </div>
           </div>
           <div className="flex items-center gap-4 justify-center md:justify-start">
             <div className="w-14 h-14 rounded-full bg-base-200 flex items-center justify-center text-primary">
               <Clock size={28} />
             </div>
             <div>
               <h4 className="font-bold text-base-content text-lg">24/7 Support</h4>
               <p className="text-sm text-base-content/60 font-medium">Dedicated online assistance</p>
             </div>
           </div>
        </div>
      </section>

      {/* Live Categories from Admin */}
      {categories.length > 0 && (
        <section className="py-20 md:py-24 max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">Shop by Category</h2>
            <Link to="/shop" className="text-primary font-bold flex items-center gap-1 hover:underline text-sm md:text-base">
              View All <ArrowRight size={18}/>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-8 md:gap-12">
             {categories.map((cat) => (
               <Link key={cat._id} to={`/shop?category=${cat.slug}`} className="group flex flex-col items-center text-center">
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden bg-base-200 mb-5 border-4 border-base-100 shadow-xl transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl flex items-center justify-center">
                     <img 
                       src={cat.image || 'https://images.unsplash.com/photo-1615397323716-e52293b6e82c?q=80&w=400&auto=format&fit=crop'} 
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                       alt={cat.name}
                     />
                  </div>
                  <span className="font-extrabold text-base-content text-lg group-hover:text-primary transition-colors tracking-wide">{cat.name}</span>
               </Link>
             ))}
          </div>
        </section>
      )}

      {/* Featured Priority Items from Admin */}
      {featured.length > 0 && (
        <section className="py-20 md:py-24 bg-base-200 border-y border-base-300 transition-colors duration-300">
           <div className="max-w-[1440px] mx-auto px-4 md:px-8">
              <div className="flex justify-between items-end mb-12">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">Featured Queens</h2>
                  <Link to="/shop" className="text-primary font-bold hidden md:flex items-center gap-1 hover:underline text-sm md:text-base">
                    Discover More <ArrowRight size={18}/>
                  </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                 {featured.slice(0, 5).map(product => (
                   <ProductCard key={product._id} product={product} />
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* Standard Promo Banner */}
      <section className="py-20 max-w-[1440px] mx-auto px-4 md:px-8">
         <div className="bg-neutral rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl border flex border-neutral-content/20 relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2000')] bg-cover bg-center bg-blend-overlay">
            <div className="absolute inset-0 bg-neutral/80 mix-blend-multiply z-0"></div>
            <div className="z-10 text-center md:text-left max-w-xl">
               <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-content mb-5 tracking-tight">Luxury Defined.</h2>
               <p className="text-neutral-content/80 text-lg font-medium mb-8 leading-relaxed">Embrace your elegance. Our curated pieces are exclusively verified by Admin to guarantee authenticity.</p>
               <Link to="/shop" className="px-10 py-4 bg-primary text-primary-content font-extrabold rounded-xl hover:brightness-110 transition-all shadow-xl active:scale-95 inline-block text-lg">
                  Shop the Collection
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;
