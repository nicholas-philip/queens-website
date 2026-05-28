import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, ChevronDown, ChevronRight, User, Heart, Sun, Moon, Star, Crown, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import logo from '../assets/logo.png';
import { useDebounce } from '../hooks/useDebounce';
import { cn } from '../libs/utils';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [isMobileCatOpen, setIsMobileCatOpen] = useState(true);
  const [hoveredCatId, setHoveredCatId] = useState(null);
  const [expandedCatId, setExpandedCatId] = useState(null);
  
  // DaisyUI Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'queens-light');

  const { cartItems, setCheckoutOpen } = useCartStore();
  const { wishlistIds } = useWishlistStore();
  const wishlistCount = wishlistIds.length;
  const navigate = useNavigate();

  const { data: categories } = useQuery({
    queryKey: ['header-categories'],
    queryFn: async () => {
      const { data } = await api.get('/products/categories');
      return data.categories || [];
    }
  });

  // Track Active Orders dynamically (poll every 15s)
  const { data: activeOrdersCount } = useQuery({
    queryKey: ['header-orders-count'],
    queryFn: async () => {
      const sessionId = localStorage.getItem('queens_session_id');
      if (!sessionId) return 0;
      try {
        const { data } = await api.get('/orders/my-history');
        const active = (data.orders || []).filter(o => 
          o.currentStatus !== 'Delivered' && 
          o.currentStatus !== 'Cancelled'
        );
        return active.length;
      } catch {
        return 0;
      }
    },
    refetchInterval: 15000 
  });

  // Search Suggestions Query
  const { data: suggestions, isLoading: isSearching } = useQuery({
    queryKey: ['search-suggestions', debouncedSearch],
    queryFn: async () => {
      if (debouncedSearch.length < 2) return [];
      const { data } = await api.get(`/products/search?q=${debouncedSearch}`);
      return data.suggestions || [];
    },
    enabled: debouncedSearch.length >= 2,
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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
      <header className="fixed top-0 left-0 right-0 z-[160]">
        {/* Top Utility Bar */}
        <div className="bg-[#0A0A0A] text-white py-2 px-4 md:px-6 text-xs md:text-xs font-black flex justify-between items-center tracking-[0.05em] border-b-2 border-primary/40 shadow-lg">
          {/* Left: Promo */}
          <div className="flex w-full md:w-auto justify-center md:justify-start items-center gap-3 uppercase italic">
            <span className="text-primary tracking-widest truncate">✦ Queens Fashion — Premium Jewelry & Accessories ✦</span>
          </div>
          {/* Right: Quick Nav Links */}
          <div className="hidden md:flex items-center gap-5 uppercase tracking-widest flex-shrink-0">
            <Link to="/orders" className="text-primary hover:text-white transition-all">My Orders</Link>
            <span className="h-3 w-[1px] bg-white/20" />
            <Link to="/track" className="opacity-60 hover:opacity-100 hover:text-primary transition-all">Track Order</Link>
            <span className="h-3 w-[1px] bg-white/20" />
            <Link to="/blog" className="opacity-60 hover:opacity-100 hover:text-primary transition-all">Blog</Link>
            <span className="h-3 w-[1px] bg-white/20" />
            <Link to="/faq" className="opacity-60 hover:opacity-100 hover:text-primary transition-all">FAQ</Link>
            <span className="h-3 w-[1px] bg-white/20" />
            <Link to="/contact" className="opacity-60 hover:opacity-100 hover:text-primary transition-all">Contact</Link>
          </div>
        </div>

        {/* Main Header */}
        <div className={`transition-all duration-500 border-b ${isScrolled ? 'bg-base-100 shadow-[0_15px_60px_rgba(10,10,10,0.4)] border-primary/20 py-2' : 'bg-base-100  border-base-200 py-3 md:py-6'}`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between gap-2 md:gap-12">
            
            {/* Logo */}
            <Link to="/" className="flex items-center group flex-shrink-0">
               <div className="w-16 h-12 md:w-32 md:h-20 flex items-center justify-center group-hover:drop-shadow-[0_0_15px_rgba(201,168,76,0.4)] group-hover:scale-105 transition-all duration-500 relative">
                  <img src={logo} alt="Queens Fashion Store Logo" className="w-full h-full object-contain" />
                  <Crown size={18} className="text-primary absolute -top-1 -right-2 md:-top-2 md:-right-4 drop-shadow-md rotate-[15deg] group-hover:rotate-0 transition-transform" />
               </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-black uppercase tracking-[0.12em] text-base-content">
               <Link to="/" className="hover:text-primary transition-all hover:-translate-y-0.5 relative group py-2">
                 Home
                 <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full rounded-full" />
               </Link>
               <Link to="/shop" className="hover:text-primary transition-all hover:-translate-y-0.5 relative group py-2">
                 Shop
                 <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full rounded-full" />
               </Link>
               
               {/* Collections Dropdown */}
               <div 
                 className="relative py-2"
                 onMouseEnter={() => setShowCatDropdown(true)}
                 onMouseLeave={() => setShowCatDropdown(false)}
               >
                 <span className="hover:text-primary transition-all flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5">
                   Collections <ChevronDown size={14} className={`transition-transform duration-300 ${showCatDropdown ? 'rotate-180 text-primary' : ''}`} />
                 </span>
                 
                 <AnimatePresence>
                   {showCatDropdown && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="absolute top-[calc(100%+8px)] -left-6 w-[280px] bg-base-100 border-2 border-primary/30 shadow-[0_30px_60px_rgba(10,10,10,0.15)] rounded-[2rem] py-4 z-[999] overflow-hidden"
                     >
                        {!categories || categories.length === 0 ? (
                           <div className="px-10 py-4 text-xs font-black text-base-content/20 tracking-widest uppercase animate-pulse">
                             Crafting...
                           </div>
                        ) : (
                          categories.map((cat) => (
                            <div 
                              key={cat._id} 
                              className="relative"
                              onMouseEnter={() => setHoveredCatId(cat._id)}
                              onMouseLeave={() => setHoveredCatId(null)}
                            >
                              <Link 
                                to={`/shop?category=${cat.slug}`}
                                onClick={() => setShowCatDropdown(false)}
                                className="flex items-center justify-between px-8 py-3.5 text-base-content hover:text-primary hover:bg-primary/5 transition-all group"
                              >
                                <span className="font-black text-sm uppercase tracking-widest transition-transform group-hover:translate-x-1">{cat.name}</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-all group-hover:scale-[2.5]" />
                              </Link>
                              
                              {/* Desktop Subcategories */}
                              <AnimatePresence>
                                {hoveredCatId === cat._id && cat.subcategories && cat.subcategories.length > 0 && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden bg-primary/5"
                                  >
                                    <div className="flex flex-col pb-3 pl-12 pr-4 pt-1">
                                      {cat.subcategories.map(sub => (
                                        <Link
                                          key={sub}
                                          to={`/shop?category=${cat.slug}&subcategory=${encodeURIComponent(sub)}`}
                                          onClick={() => setShowCatDropdown(false)}
                                          className="py-1.5 text-xs font-black uppercase tracking-widest text-base-content/60 hover:text-primary transition-colors flex items-center gap-2"
                                        >
                                          <span className="w-1 h-1 rounded-full bg-base-content/20" />
                                          {sub}
                                        </Link>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))
                        )}
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               <Link to="/shop?sort=newest" className="hover:text-primary transition-all hover:-translate-y-0.5 relative group py-2">
                 New
                 <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full rounded-full" />
               </Link>
               <Link to="/about" className="hidden xl:block hover:text-primary transition-all hover:-translate-y-0.5 relative group py-2">
                 About
                 <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full rounded-full" />
               </Link>
               <Link to="/blog" className="hidden xl:block hover:text-primary transition-all hover:-translate-y-0.5 relative group py-2">
                 Blog
                 <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full rounded-full" />
               </Link>
               <Link to="/contact" className="hidden xl:block hover:text-primary transition-all hover:-translate-y-0.5 relative group py-2">
                 Contact
                 <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full rounded-full" />
               </Link>
            </nav>

            {/* Integrated Search & Actions */}
            <div className="flex items-center gap-3 md:gap-6 justify-end">
               <div className="hidden xl:block relative w-full max-w-[280px]">
                  <form 
                    onSubmit={handleSearch} 
                    onFocus={() => setShowSearchOverlay(true)}
                    className="relative"
                  >
                    <input 
                      type="text" 
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!showSearchOverlay) setShowSearchOverlay(true);
                      }}
                      className="w-full bg-base-100 rounded-2xl px-6 py-3.5 text-xs outline-none border-2 border-transparent focus:border-primary/40 font-black tracking-widest placeholder:text-base-content/20 transition-all focus:bg-base-100 shadow-inner"
                    />
                    <button type="submit" className="absolute right-5 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-primary transition-colors">
                       <Search size={10} strokeWidth={4} />
                    </button>
                  </form>

                  {/* Desktop Search Overlay */}
                  <AnimatePresence>
                    {showSearchOverlay && debouncedSearch.length >= 2 && (
                      <>
                        <div 
                          className="fixed inset-0 z-40 bg-transparent" 
                          onClick={() => setShowSearchOverlay(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          className="absolute top-full mt-3 right-0 w-[420px] bg-base-100 border-2 border-primary/20 shadow-[0_40px_80px_rgba(10,10,10,0.2)] rounded-[2.5rem] py-6 z-50 overflow-hidden "
                        >
                          <div className="px-8 mb-4 flex justify-between items-center text-xs font-black uppercase tracking-widest text-base-content/40">
                             <span>Results For "{debouncedSearch}"</span>
                             {isSearching && <span className="animate-pulse text-primary italic">Analyzing...</span>}
                          </div>

                          <div className="max-h-[400px] overflow-y-auto px-4 custom-scrollbar">
                            {!isSearching && suggestions?.length === 0 && (
                              <div className="py-12 text-center">
                                <Search size={32} className="mx-auto mb-3 opacity-10" />
                                <p className="text-xs font-black opacity-30 tracking-widest">NO MATCHES FOUND</p>
                              </div>
                            )}

                            {suggestions?.map((product) => (
                              <Link
                                key={product._id}
                                to={`/product/${product._id}`}
                                onClick={() => {
                                  setShowSearchOverlay(false);
                                  setSearchQuery('');
                                }}
                                className="group flex items-center gap-4 p-4 rounded-3xl hover:bg-primary/5 transition-all mb-2"
                              >
                                <div className="w-16 h-16 rounded-2xl bg-neutral/5 overflow-hidden flex-shrink-0 border border-base-200 group-hover:border-primary/30 transition-colors">
                                  <img 
                                    src={product.images?.[0] || product.image} 
                                    alt={product.title} 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-black uppercase tracking-widest text-base-content truncate group-hover:text-primary transition-colors">
                                    {product.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-black text-primary">GHS {product.discountPrice || product.price}</span>
                                    {product.discountPrice && (
                                      <span className="text-xs line-through opacity-30">GHS {product.price}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="p-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                  <ChevronRight size={18} className="text-primary" />
                                </div>
                              </Link>
                            ))}
                          </div>

                          {suggestions?.length > 0 && (
                            <div className="px-8 mt-4 pt-4 border-t border-base-200">
                               <Link 
                                 to={`/shop?search=${debouncedSearch}`}
                                 onClick={() => {
                                   setShowSearchOverlay(false);
                                   setSearchQuery('');
                                 }}
                                 className="w-full py-3 bg-neutral text-neutral-content rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center hover:bg-neutral-focus transition-all"
                               >
                                 View All Results ({suggestions.length})
                               </Link>
                            </div>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
               </div>

               <div className="flex items-center gap-1.5 md:gap-2">
                  <button 
                    onClick={() => setTheme(prev => prev === 'queens-light' ? 'queens-dark' : 'queens-light')} 
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl text-base-content hover:bg-primary/10 hover:text-primary transition-all active:scale-90 shadow-sm border border-transparent hover:border-primary/20"
                  >
                     {theme === 'queens-dark' ? <Sun size={18} className="md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
                  </button>
                  <Link 
                    to="/orders" 
                    className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl text-base-content hover:bg-primary/10 hover:text-primary transition-all active:scale-90 shadow-sm border border-transparent hover:border-primary/20"
                  >
                     <Package size={18} className="md:w-5 md:h-5" />
                     {activeOrdersCount > 0 && (
                       <span className="absolute -top-1 -right-1 w-5 h-5 bg-success text-white text-xs font-black flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] pointer-events-none ring-4 ring-base-100 animate-pulse">
                         {activeOrdersCount}
                       </span>
                     )}
                  </Link>
                  <Link 
                    to="/wishlist" 
                    className="hidden sm:flex relative w-12 h-12 items-center justify-center rounded-2xl text-base-content hover:bg-primary/10 hover:text-primary transition-all active:scale-90 shadow-sm border border-transparent hover:border-primary/20"
                  >
                      <Heart size={20} />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-content text-xs font-black flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(201,168,76,0.5)] pointer-events-none ring-4 ring-base-100">
                          {wishlistCount}
                        </span>
                      )}
                  </Link>
                  <button 
                    onClick={() => setCheckoutOpen(true)}
                    className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl text-base-content hover:bg-primary/10 hover:text-primary transition-all active:scale-90 shadow-sm border border-transparent hover:border-primary/20"
                  >
                     <ShoppingBag size={18} className="md:w-[22px] md:h-[22px]" />
                     {itemCount > 0 && (
                       <span className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-primary text-primary-content text-xs md:text-xs font-black flex items-center justify-center rounded-full shadow-[0_0_20px_rgba(201,168,76,0.5)] pointer-events-none ring-4 ring-base-100 animate-bounce">
                         {itemCount}
                       </span>
                     )}
                  </button>

                  {/* Luxury Hamburger - Re-joined to Header for perfect alignment */}
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden relative w-11 h-11 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-base-200 to-base-100 border border-primary/20 shadow-xl active:scale-90 transition-all overflow-hidden z-20 ml-2"
                  >
                    <div className={`absolute inset-0 bg-primary/5 transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} />
                    <div className="flex flex-col gap-[4.5px] relative z-10">
                       <span className={cn(
                           "w-5 h-[2px] bg-gradient-to-r from-primary to-[#C9A84C] rounded-full transition-all duration-500 origin-center",
                           isMenuOpen ? "rotate-[225deg] translate-y-[6.5px] scale-x-110" : ""
                       )} />
                       <span className={cn(
                           "w-3.5 h-[2px] bg-primary rounded-full transition-all duration-300",
                           isMenuOpen ? "opacity-0 -translate-x-4" : ""
                       )} />
                       <span className={cn(
                           "w-5 h-[2px] bg-gradient-to-r from-[#C9A84C] to-primary rounded-full transition-all duration-500 origin-center",
                           isMenuOpen ? "-rotate-[225deg] -translate-y-[6.5px] scale-x-110" : ""
                       )} />
                    </div>
                  </button>
               </div>
            </div>
          </div>
        </div>
      </header>

      <div className="h-[100px] md:h-[110px]" />

      {/* Elegant Side-Drawer Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[155] bg-black/70 backdrop-blur-md lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-110%' }}
              animate={{ x: 0 }}
              exit={{ x: '-110%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-base-100/90 backdrop-blur-2xl border-r border-white/10 shadow-[20px_0_80px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header with Gold Accent */}
              <div className="relative flex-shrink-0 flex items-center px-8 py-8 border-b border-white/5 bg-base-200/20">
                <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-base-100 border border-primary/20 flex items-center justify-center p-2 shadow-inner">
                    <img src={logo} alt="Queens Fashion Store Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(201,168,76,0.3)]" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-base-content tracking-tighter leading-none uppercase italic">Queens Fashion</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1.5 opacity-80">Storefront</p>
                  </div>
                </Link>
              </div>

              {/* Scrollable Content */}
              <div className="flex-grow overflow-y-auto custom-scrollbar flex flex-col">
                
                {/* Search Bar */}
                <div className="p-5 border-b border-base-200">
                  <form onSubmit={handleSearch} className="relative">
                    <input 
                      type="text" 
                      placeholder="Search store..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-base-200 rounded-xl px-5 py-3.5 text-sm outline-none border border-transparent focus:border-primary/30 font-bold transition-all"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors">
                       <Search size={18} />
                    </button>
                  </form>
                </div>

                {/* Primary Nav */}
                <nav className="flex flex-col py-2 px-3">
                  <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-primary/5 text-sm font-black uppercase tracking-widest text-base-content transition-all">
                    Home
                  </Link>
                  <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-primary/5 text-sm font-black uppercase tracking-widest text-base-content transition-all mt-1">
                    Shop
                  </Link>

                  {/* Collections Accordion */}
                  <div className="mt-1">
                    <button 
                      onClick={() => setIsMobileCatOpen(!isMobileCatOpen)}
                      className="w-full flex justify-between items-center px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-primary bg-primary/5"
                    >
                      <span>Collections</span>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isMobileCatOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isMobileCatOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col px-2 py-2 gap-1 bg-base-100">
                            {!categories || categories.length === 0 ? (
                              <p className="text-xs text-base-content/40 px-4 py-2 italic font-bold">Loading...</p>
                            ) : (
                              categories.map(cat => (
                                <div key={cat._id} className="flex flex-col">
                                  <div className="flex items-center justify-between rounded-xl hover:bg-base-200 transition-all">
                                    <Link 
                                      to={`/shop?category=${cat.slug}`} 
                                      onClick={() => setIsMenuOpen(false)}
                                      className="flex-1 px-6 py-3 font-black text-xs uppercase tracking-widest text-base-content/70 hover:text-primary"
                                    >
                                      {cat.name}
                                    </Link>
                                    {cat.subcategories && cat.subcategories.length > 0 && (
                                      <button 
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setExpandedCatId(expandedCatId === cat._id ? null : cat._id);
                                        }}
                                        className="p-3 px-6 text-base-content/40 hover:text-primary transition-colors"
                                      >
                                        <ChevronDown size={14} className={`transition-transform duration-300 ${expandedCatId === cat._id ? 'rotate-180 text-primary' : ''}`} />
                                      </button>
                                    )}
                                  </div>
                                  
                                  <AnimatePresence initial={false}>
                                    {expandedCatId === cat._id && cat.subcategories && cat.subcategories.length > 0 && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="flex flex-col pl-10 pr-2 pb-2 gap-3 mt-1 border-l-2 border-base-200 ml-6">
                                          {cat.subcategories.map(sub => (
                                            <Link
                                              key={sub}
                                              to={`/shop?category=${cat.slug}&subcategory=${encodeURIComponent(sub)}`}
                                              onClick={() => setIsMenuOpen(false)}
                                              className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/50 hover:text-primary flex items-center gap-2"
                                            >
                                              • {sub}
                                            </Link>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link to="/shop?sort=newest" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-primary/5 text-sm font-black uppercase tracking-widest text-base-content transition-all mt-1">
                    New Arrivals
                  </Link>
                  <Link to="/about" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-primary/5 text-sm font-black uppercase tracking-widest text-base-content transition-all mt-1">
                    About Us
                  </Link>
                  <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-primary/5 text-sm font-black uppercase tracking-widest text-base-content transition-all mt-1">
                    Blog
                  </Link>
                </nav>

                <div className="w-full h-px bg-base-200 my-2" />

                {/* Secondary Nav */}
                <nav className="flex flex-col py-2 px-3 pb-8">
                  <p className="px-5 text-[10px] font-black uppercase tracking-[0.3em] text-base-content/30 mb-3">Your Account</p>
                  <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-base-200 text-xs font-bold uppercase tracking-widest text-base-content/70 transition-all">
                    <User size={16} className="text-base-content/50" /> Orders
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-base-200 text-xs font-bold uppercase tracking-widest text-base-content/70 transition-all mt-1">
                    <Heart size={16} className="text-base-content/50" /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                  </Link>
                  <Link to="/track" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-base-200 text-xs font-bold uppercase tracking-widest text-base-content/70 transition-all mt-1">
                    <Package size={16} className="text-base-content/50" /> Tracking
                  </Link>
                  
                  <div className="w-full h-px bg-base-100 my-4" />
                  
                  <p className="px-5 text-[10px] font-black uppercase tracking-[0.3em] text-base-content/30 mb-3">Support</p>
                  <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-2.5 hover:bg-base-200 text-xs font-bold uppercase tracking-widest text-base-content/60 transition-all rounded-xl">Contact Help</Link>
                  <Link to="/faq" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-2.5 hover:bg-base-200 text-xs font-bold uppercase tracking-widest text-base-content/60 transition-all rounded-xl">FAQs</Link>
                  <Link to="/returns" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-2.5 hover:bg-base-200 text-xs font-bold uppercase tracking-widest text-base-content/60 transition-all rounded-xl">Returns Policy</Link>
                </nav>
              </div>

              {/* Sticky Footer */}
              <div className="flex-shrink-0 p-5 bg-base-100 border-t border-base-200 flex flex-col gap-3">
                <button 
                  onClick={() => { setCheckoutOpen(true); setIsMenuOpen(false); }}
                  className="w-full py-4 bg-[#0A0A0A] text-primary rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-[0_5px_15px_rgba(201,168,76,0.2)] border border-primary/20 active:scale-95 transition-all uppercase tracking-widest"
                >
                  <ShoppingBag size={18} />
                  View Cart ({itemCount})
                </button>
                <div className="flex items-center justify-between px-2 mt-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-base-content/30 flex items-center gap-2">Theme Mode</span>
                  <button 
                    onClick={() => { setTheme(theme === 'queens-dark' ? 'queens-light' : 'queens-dark') }} 
                    className="p-2 rounded-xl bg-base-200 text-base-content hover:text-primary transition-all"
                  >
                     {theme === 'queens-dark' ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
