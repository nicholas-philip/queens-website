import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, ChevronDown, User, Heart, Sun, Moon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  
  // DaisyUI Theme State: 'queens-light' (White/Gold) or 'queens-dark' (Black/Gold)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'queens-light');

  const { cartItems, setCheckoutOpen } = useCartStore();
  const navigate = useNavigate();

  const { data: categories } = useQuery({
    queryKey: ['header-categories'],
    queryFn: async () => {
      const { data } = await api.get('/products/categories');
      return data.categories || [];
    }
  });

  // Apply DaisyUI Theme on Load & Change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle Scroll Transparency

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${searchQuery}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Top Utility Bar */}
        <div className="bg-green-900 text-white py-2.5 px-6 text-xs font-semibold flex justify-between items-center tracking-wide">
          <div className="hidden md:flex gap-4">
            <span className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">📞 +233 24 000 0000</span>
          </div>
          <div className="flex w-full md:w-auto justify-center gap-6 items-center">
            <span>Free Delivery on orders above GHS 500</span>
            <span className="hidden sm:block h-3 w-[1px] bg-white/20" />
            <Link to="/shop" className="hidden sm:inline hover:text-green-300 underline underline-offset-4 decoration-white/30 transition-colors">Shop Now</Link>
          </div>
          <div className="hidden md:flex gap-4">
            <span className="flex items-center gap-1 cursor-pointer opacity-80 hover:opacity-100">GHS <ChevronDown size={12}/></span>
          </div>
        </div>

        {/* Main Header */}
        <div className={`transition-all duration-300 ${isScrolled ? 'bg-base-100 shadow-md' : 'bg-base-100/95 backdrop-blur-md border-b border-base-200'}`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 md:py-5 flex items-center justify-between gap-6 md:gap-12">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-green-700 flex items-center justify-center rounded-xl shadow-lg shadow-green-700/20 group-hover:-rotate-6 transition-transform">
                  <span className="text-white font-black text-xl md:text-2xl font-serif italic">Q</span>
               </div>
               <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 uppercase">Queens</span>
            </Link>

            {/* Nav Links - Center */}
            <nav className="hidden lg:flex items-center gap-8 text-[15px] font-bold text-base-content">
               <Link to="/" className="hover:text-primary transition-colors">Home</Link>
               <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
               
               {/* Category Dropdown Wrapper */}
               <div 
                 className="relative h-full py-4 -my-4"
                 onMouseEnter={() => setShowCatDropdown(true)}
                 onMouseLeave={() => setShowCatDropdown(false)}
               >
                 <span className="hover:text-primary transition-colors flex items-center gap-1 h-full cursor-pointer">
                   Categories <ChevronDown size={16} className={`transition-transform ${showCatDropdown ? 'rotate-180' : ''}`} />
                 </span>
                 
                 {/* Mega Menu Dropdown */}
                 <AnimatePresence>
                   {showCatDropdown && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full -left-4 w-[240px] bg-base-100 border border-base-200 shadow-2xl rounded-2xl py-3 z-50 overflow-hidden"
                     >
                        {!categories || categories.length === 0 ? (
                           <div className="px-6 py-4 text-sm font-medium text-gray-400">
                             No categories added yet. Add products via Admin Dashboard.
                           </div>
                        ) : (
                          categories.map((cat) => (
                            <Link 
                              key={cat._id} 
                              to={`/shop?category=${cat.slug}`} 
                              className="block px-6 py-3 text-base-content hover:text-primary hover:bg-base-200 font-semibold transition-colors"
                            >
                              {cat.name}
                            </Link>
                          ))
                        )}
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               <Link to="/shop?sort=newest" className="hover:text-primary transition-colors">New Arrivals</Link>
            </nav>

            {/* Integrated Search & Actions */}
            <div className="flex items-center gap-5 flex-grow lg:flex-grow-0 justify-end w-full lg:w-auto">
               <form onSubmit={handleSearch} className="hidden xl:flex relative w-full max-w-[280px]">
                  <input 
                    type="text" 
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 rounded-full px-5 py-2.5 text-sm outline-none border border-gray-200 focus:border-green-700 focus:ring-1 focus:ring-green-700 transition-all font-medium placeholder:text-gray-400"
                  />
                  <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-700">
                     <Search size={18} />
                  </button>
               </form>

               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setTheme(prev => prev === 'queens-light' ? 'queens-dark' : 'queens-light')} 
                    className="flex items-center justify-center w-10 h-10 rounded-full text-base-content hover:text-primary hover:bg-base-200 transition-colors"
                    title="Toggle Theme"
                  >
                     {theme === 'queens-dark' ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-base-content hover:text-primary hover:bg-base-200 transition-colors">
                     <Heart size={20} />
                  </button>
                  <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-base-content hover:text-primary hover:bg-base-200 transition-colors">
                     <User size={20} />
                  </button>
                  <button 
                    onClick={() => setCheckoutOpen(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-full text-base-content hover:text-primary hover:bg-base-200 transition-colors relative"
                  >
                     <ShoppingBag size={22} />
                     {itemCount > 0 && (
                       <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-700 border-2 border-white text-white text-[10px] font-extrabold flex items-center justify-center rounded-full pointer-events-none shadow-sm">
                         {itemCount}
                       </span>
                     )}
                  </button>
               </div>

               <button className="lg:hidden text-base-content p-2" onClick={() => setIsMenuOpen(true)}>
                  <Menu size={28} />
               </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-[120px] md:h-[130px]" />

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="fixed inset-0 z-[100] bg-white p-6 md:p-10 flex flex-col pt-8"
          >
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
               <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-green-700 flex items-center justify-center rounded-lg shadow-md">
                    <span className="text-white font-black text-lg italic">Q</span>
                 </div>
                 <span className="text-2xl font-extrabold text-gray-900 tracking-tight uppercase">Queens</span>
               </Link>
               <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 bg-gray-50 rounded-full"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSearch} className="relative w-full mb-8">
               <input 
                 type="text" 
                 placeholder="Search products..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-gray-50 rounded-xl px-4 py-4 text-base outline-none border border-gray-200 focus:border-green-700 transition-all font-medium"
               />
               <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>

            <nav className="flex flex-col gap-6 text-xl font-extrabold text-gray-900 flex-grow overflow-y-auto">
               <Link to="/" onClick={() => setIsMenuOpen(false)} className="pb-4 border-b border-gray-50 flex justify-between items-center">
                 Home <ChevronRight size={20} className="text-gray-300"/>
               </Link>
               
               <div className="space-y-4 pb-4 border-b border-gray-50">
                 <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="flex justify-between items-center text-green-700">
                   Shop Everything <ChevronRight size={20} className="text-green-700/30"/>
                 </Link>
                 <div className="pl-4 flex flex-col gap-4 text-lg text-gray-500 font-semibold mt-4">
                    {categories?.map(cat => (
                      <Link key={cat._id} to={`/shop?category=${cat.slug}`} onClick={() => setIsMenuOpen(false)} className="hover:text-green-700">
                        {cat.name}
                      </Link>
                    ))}
                 </div>
               </div>

               <Link to="/shop?sort=newest" onClick={() => setIsMenuOpen(false)} className="pb-4 border-b border-gray-50 flex justify-between items-center">
                 New Arrivals <ChevronRight size={20} className="text-gray-300"/>
               </Link>
            </nav>
            <div className="mt-6 pt-6 grid grid-cols-2 gap-4">
               <button onClick={() => { setIsMenuOpen(false); }} className="w-full py-4 bg-gray-100 text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2">
                 <User size={20} /> Account
               </button>
               <button onClick={() => { setCheckoutOpen(true); setIsMenuOpen(false); }} className="w-full py-4 bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-700/20 active:scale-95 transition-transform">
                 <ShoppingBag size={20} /> Cart ({itemCount})
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
