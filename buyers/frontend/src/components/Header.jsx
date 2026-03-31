import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, ChevronDown, ChevronRight, User, Heart, Sun, Moon, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import logo from '../assets/logo.png';
import { useDebounce } from '../hooks/useDebounce';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [isMobileCatOpen, setIsMobileCatOpen] = useState(false);
  
  // DaisyUI Theme State
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
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Top Utility Bar - Shiny Black with Gold Border */}
        <div className="bg-[#050505] text-white py-2.5 px-6 text-[11px] font-black flex justify-between items-center tracking-[0.05em] border-b-2 border-primary/40 shadow-lg">
          <div className="hidden md:flex gap-6">
            <span className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">📞 +233 24 000 0000</span>
          </div>
          <div className="flex w-full md:w-auto justify-center gap-4 md:gap-8 items-center uppercase italic text-center">
            <span className="text-primary tracking-widest animate-pulse w-full truncate md:w-auto">Free Delivery on orders above GHS 500</span>
            <span className="hidden sm:block h-3 w-[1px] bg-white/10" />
            <Link to="/shop" className="hidden sm:inline text-white hover:text-primary underline underline-offset-4 decoration-primary/30 transition-all font-black">Shop Now</Link>
          </div>
          <div className="hidden md:flex gap-4">
            <span className="flex items-center gap-1 cursor-pointer opacity-60 hover:opacity-100 group">GHS <ChevronDown size={12} className="group-hover:text-primary transition-colors"/></span>
          </div>
        </div>

        {/* Main Header */}
        <div className={`transition-all duration-500 border-b ${isScrolled ? 'bg-base-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] border-primary/20 py-2' : 'bg-base-100/95 backdrop-blur-3xl border-base-200 py-3 md:py-6'}`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between gap-2 md:gap-12">
            
            {/* Logo - Fully Transparent Branding */}
            <Link to="/" className="flex items-center group flex-shrink-0">
               <div className="w-16 h-12 md:w-32 md:h-20 flex items-center justify-center group-hover:drop-shadow-[0_0_15px_rgba(201,168,76,0.4)] group-hover:scale-105 transition-all duration-500 relative">
                  <img src={logo} alt="Queens Luxe Logo" className="w-full h-full object-contain" />
               </div>
            </Link>

            {/* Nav Links - Center */}
            <nav className="hidden lg:flex items-center gap-10 text-[13px] font-black uppercase tracking-[0.15em] text-base-content">
               <Link to="/" className="hover:text-primary transition-all hover:-translate-y-0.5 relative group">
                 Home
                 <span className="absolute -bottom-2 left-0 w-0 h-1 bg-primary transition-all group-hover:w-full rounded-full" />
               </Link>
               <Link to="/shop" className="hover:text-primary transition-all hover:-translate-y-0.5 relative group">
                 Shop
                 <span className="absolute -bottom-2 left-0 w-0 h-1 bg-primary transition-all group-hover:w-full rounded-full" />
               </Link>
               
               <div 
                 className="relative h-full py-4 -my-4"
                 onMouseEnter={() => setShowCatDropdown(true)}
                 onMouseLeave={() => setShowCatDropdown(false)}
               >
                 <span className="hover:text-primary transition-all flex items-center gap-1.5 h-full cursor-pointer hover:-translate-y-0.5">
                   Collections <ChevronDown size={14} className={`transition-transform duration-300 ${showCatDropdown ? 'rotate-180 text-primary' : ''}`} />
                 </span>
                 
                 <AnimatePresence>
                   {showCatDropdown && (
                     <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        className="absolute top-full -left-6 w-[280px] bg-base-100 border-2 border-primary/30 shadow-[0_30px_60px_rgba(0,0,0,0.15)] rounded-[2.5rem] py-6 z-50 overflow-hidden backdrop-blur-3xl"
                     >
                        {!categories || categories.length === 0 ? (
                           <div className="px-10 py-4 text-xs font-black text-base-content/20 tracking-widest uppercase animate-pulse">
                             Crafting...
                           </div>
                        ) : (
                          categories.map((cat) => (
                            <Link 
                              key={cat._id} 
                              to={`/shop?category=${cat.slug}`} 
                              className="group flex items-center justify-between px-10 py-4 text-base-content hover:text-primary hover:bg-primary/5 transition-all"
                            >
                              <span className="font-black text-[13px] uppercase tracking-widest transition-transform group-hover:translate-x-2">{cat.name}</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-all group-hover:scale-[2.5] shadow-gold shadow-sm" />
                            </Link>
                          ))
                        )}
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               <Link to="/shop?sort=newest" className="hover:text-primary transition-all hover:-translate-y-0.5 relative group">
                 New
                 <span className="absolute -bottom-2 left-0 w-0 h-1 bg-primary transition-all group-hover:w-full rounded-full" />
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
                      className="w-full bg-base-200/50 rounded-2xl px-6 py-3.5 text-xs outline-none border-2 border-transparent focus:border-primary/40 font-black tracking-widest placeholder:text-base-content/20 transition-all focus:bg-base-100 shadow-inner"
                    />
                    <button type="submit" className="absolute right-5 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-primary transition-colors">
                       <Search size={16} strokeWidth={4} />
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
                          className="absolute top-full mt-3 right-0 w-[420px] bg-base-100 border-2 border-primary/20 shadow-[0_40px_80px_rgba(0,0,0,0.2)] rounded-[2.5rem] py-6 z-50 overflow-hidden backdrop-blur-3xl"
                        >
                          <div className="px-8 mb-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-base-content/40">
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
                                  <h4 className="text-[11px] font-black uppercase tracking-widest text-base-content truncate group-hover:text-primary transition-colors">
                                    {product.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-black text-primary">GHS {product.discountPrice || product.price}</span>
                                    {product.discountPrice && (
                                      <span className="text-[10px] line-through opacity-30">GHS {product.price}</span>
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
                                 className="w-full py-3 bg-neutral text-neutral-content rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center hover:bg-neutral-focus transition-all"
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
                  <button className="hidden sm:flex w-12 h-12 items-center justify-center rounded-2xl text-base-content hover:bg-primary/10 hover:text-primary transition-all active:scale-90 shadow-sm border border-transparent hover:border-primary/20">
                     <Heart size={20} />
                  </button>
                  <button 
                    onClick={() => setCartOpen(true)}
                    className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl text-base-content hover:bg-primary/10 hover:text-primary transition-all active:scale-90 shadow-sm border border-transparent hover:border-primary/20"
                  >
                     <ShoppingBag size={18} className="md:w-[22px] md:h-[22px]" />
                     {itemCount > 0 && (
                       <span className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-primary text-primary-content text-[9px] md:text-[11px] font-black flex items-center justify-center rounded-full shadow-[0_0_20px_rgba(201,168,76,0.5)] pointer-events-none ring-4 ring-base-100 animate-bounce">
                         {itemCount}
                       </span>
                     )}
                  </button>
               </div>

               <button className="lg:hidden text-primary p-1 md:p-2 flex flex-col items-center justify-center gap-0.5 hover:bg-primary/5 rounded-xl md:rounded-2xl transition-all border border-transparent hover:border-primary/20 ml-1 md:ml-0" onClick={() => setIsMenuOpen(true)}>
                  <Menu size={26} className="md:w-[34px] md:h-[34px]" strokeWidth={2.5} />
                  <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-[0.3em]">Menu</span>
               </button>
            </div>
          </div>
        </div>
      </header>

      <div className="h-[120px] md:h-[130px]" />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-base-100 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 flex justify-between items-center bg-[#050505] text-white">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
                  <div className="w-24 h-12 flex items-center justify-center">
                    <img src={logo} alt="Queens Logo" className="w-full h-full object-contain" />
                  </div>
                </Link>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-primary hover:text-[#050505] transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto px-6 py-8 bg-base-100">
                <div className="relative mb-8">
                  <form onSubmit={handleSearch} className="relative">
                    <input 
                      type="text" 
                      placeholder="Search collection..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!showSearchOverlay) setShowSearchOverlay(true);
                      }}
                      onFocus={() => setShowSearchOverlay(true)}
                      className="w-full bg-base-200 rounded-2xl px-5 py-3.5 text-xs outline-none border-2 border-transparent focus:border-primary font-black tracking-widest transition-all shadow-inner"
                    />
                    <Search size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-base-content/30" strokeWidth={3} />
                  </form>

                  {/* Mobile Search Overlay */}
                  <AnimatePresence>
                    {showSearchOverlay && debouncedSearch.length >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-full mt-2 left-0 right-0 bg-base-100 border-2 border-primary/20 shadow-xl rounded-3xl z-50 overflow-hidden"
                      >
                         <div className="max-h-[300px] overflow-y-auto p-2">
                           {isSearching ? (
                             <div className="p-4 text-center animate-pulse text-[10px] font-black uppercase text-primary">Searching...</div>
                           ) : suggestions?.length === 0 ? (
                             <div className="p-4 text-center text-[10px] font-black uppercase opacity-30">No Results</div>
                           ) : (
                             suggestions.map(product => (
                               <Link
                                 key={product._id}
                                 to={`/product/${product._id}`}
                                 onClick={() => {
                                   setIsMenuOpen(false);
                                   setShowSearchOverlay(false);
                                   setSearchQuery('');
                                 }}
                                 className="flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/10 transition-colors"
                               >
                                 <img src={product.images?.[0] || product.image} className="w-10 h-10 rounded-lg object-cover" />
                                 <div className="flex-1 min-w-0">
                                   <p className="text-[10px] font-black uppercase truncate">{product.title}</p>
                                   <p className="text-[10px] font-bold text-primary">GHS {product.discountPrice || product.price}</p>
                                 </div>
                               </Link>
                             ))
                           )}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <nav className="flex flex-col gap-2">
                  <Link 
                    to="/" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex justify-between items-center p-4 rounded-2xl hover:bg-primary/5 text-base font-black tracking-tight transition-all active:scale-95 text-base-content"
                  >
                    Home
                  </Link>

                  <Link 
                    to="/shop" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex justify-between items-center p-4 rounded-2xl hover:bg-primary/5 text-base font-black tracking-tight transition-all active:scale-95 text-base-content"
                  >
                    Shop
                  </Link>

                  <div className="rounded-2xl overflow-hidden mt-1">
                    <button 
                      onClick={() => setIsMobileCatOpen(!isMobileCatOpen)}
                      className="w-full flex justify-between items-center p-4 text-base font-black tracking-tight text-primary uppercase"
                    >
                      Collections
                    </button>
                    
                    <AnimatePresence>
                      {isMobileCatOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-base-100/50"
                        >
                          <div className="px-6 py-4 flex flex-col gap-2">
                            {!categories || categories.length === 0 ? (
                              <p className="text-sm text-base-content/40 p-6 italic text-center">Empty</p>
                            ) : (
                              categories.map(cat => (
                                <Link 
                                  key={cat._id} 
                                  to={`/shop?category=${cat.slug}`} 
                                  onClick={() => setIsMenuOpen(false)}
                                  className="flex items-center justify-between px-4 py-3 hover:text-primary font-black text-base-content/80 transition-all uppercase tracking-widest text-xs"
                                >
                                  {cat.name}
                                  <ChevronRight size={14} className="text-primary/30"/>
                                </Link>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link 
                    to="/shop?sort=newest" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex justify-between items-center p-4 mt-2 rounded-2xl hover:bg-primary/5 text-base font-black tracking-tight transition-all active:scale-95 text-base-content"
                  >
                    New Arrivals
                  </Link>
                </nav>
              </div>

              <div className="p-6 bg-base-200/30 backdrop-blur-3xl">
                <button 
                  onClick={() => { setCheckoutOpen(true); setIsMenuOpen(false); }}
                  className="w-full py-4 bg-[#050505] text-primary rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(201,168,76,0.3)] border-2 border-primary/40 active:scale-95 transition-all uppercase tracking-widest"
                >
                  <ShoppingBag size={20} />
                  Cart ({itemCount})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
