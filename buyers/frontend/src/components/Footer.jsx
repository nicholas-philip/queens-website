import React from 'react';
import { Link } from 'react-router-dom';
import Instagram from 'lucide-react/dist/esm/icons/instagram';
import Twitter from 'lucide-react/dist/esm/icons/twitter';
import FacebookIcon from 'lucide-react/dist/esm/icons/facebook';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Phone from 'lucide-react/dist/esm/icons/phone';
import Crown from 'lucide-react/dist/esm/icons/crown';
import logo from '../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: 'Latest Arrivals', path: '/shop?sort=newest' },
      { name: 'Best Sellers', path: '/shop' },
      { name: 'All Collections', path: '/shop' },
      { name: 'Track My Order', path: '/track' },
    ],
    concierge: [
      { name: 'Shipping Policy', path: '/shipping' },
      { name: 'Returns & Exchanges', path: '/returns' },
      { name: 'Help & FAQ', path: '/faq' },
      { name: 'Fashion & Beauty Blog', path: '/blog' },
      { name: 'Contact Us', path: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/privacy' },
    ]
  };

  return (
    <footer className="bg-base-200 border-t border-base-300 pt-14 sm:pt-20 md:pt-24 pb-6 sm:pb-8 px-4 sm:px-6 mt-16 sm:mt-24 md:mt-32 font-sans transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 md:gap-16 lg:gap-20">
        
        {/* Brand Identity - full width on mobile */}
        <div className="col-span-2 lg:col-span-1 space-y-5 sm:space-y-8">
           <Link to="/" className="flex flex-col">
             <div className="flex items-center group">
                <div className="w-36 sm:w-48 h-16 sm:h-24 flex items-center justify-center transition-transform group-hover:scale-105 duration-500 relative">
                   <img src={logo} alt="Queens Fashion Store Logo" className="w-full h-full object-contain" />
                   <Crown size={20} className="text-primary absolute -top-1 right-0 md:-right-2 drop-shadow-md rotate-[15deg] group-hover:rotate-0 transition-transform" />
                </div>
             </div>
           </Link>
           <p className="text-base-content/60 text-sm leading-relaxed max-w-xs font-medium">
             Elevating your style with premium unisex apparel, authentic sneakers, streetwear, and lifestyle essentials. Based in Accra, serving you worldwide.
           </p>
           <div className="flex gap-3 sm:gap-4 text-base-content/40">
             <a href="#" className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-base-100 flex items-center justify-center shadow-sm hover:text-primary hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"><Instagram size={16} strokeWidth={2} /></a>
             <a href="#" className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-base-100 flex items-center justify-center shadow-sm hover:text-primary hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"><FacebookIcon size={16} strokeWidth={2} /></a>
             <a href="#" className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-base-100 flex items-center justify-center shadow-sm hover:text-primary hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"><Twitter size={16} strokeWidth={2} /></a>
           </div>
        </div>

        {/* Boutique Links */}
        <div>
          <h4 className="text-base-content font-extrabold tracking-wide uppercase text-xs sm:text-sm mb-4 sm:mb-6">The Boutique</h4>
          <ul className="space-y-3 sm:space-y-4">
            {footerLinks.shop.map(link => (
              <li key={link.name}>
                <Link to={link.path} className="text-base-content/60 hover:text-primary transition-colors text-sm sm:text-[15px] font-medium tracking-wide group flex items-center gap-2">
                  <div className="w-0 h-[2px] bg-primary group-hover:w-4 transition-all" />
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Concierge Links */}
        <div>
           <h4 className="text-base-content font-extrabold tracking-wide uppercase text-xs sm:text-sm mb-4 sm:mb-6">Concierge</h4>
          <ul className="space-y-3 sm:space-y-4">
            {footerLinks.concierge.map(link => (
              <li key={link.name}>
                <Link to={link.path} className="text-base-content/60 hover:text-primary transition-colors text-sm sm:text-[15px] font-medium tracking-wide group flex items-center gap-2">
                  <div className="w-0 h-[2px] bg-primary group-hover:w-4 transition-all" />
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Global Contact */}
        <div>
           <h4 className="text-base-content font-extrabold tracking-wide uppercase text-xs sm:text-sm mb-4 sm:mb-6">Inquiries</h4>
           <ul className="space-y-4 sm:space-y-6">
             <li className="flex items-center gap-3 sm:gap-4 group">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-base-100 shadow-sm flex items-center justify-center rounded-xl text-primary group-hover:scale-105 transition-transform flex-shrink-0"><Phone size={18} strokeWidth={2} /></div>
                <div>
                   <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-base-content/40 mb-0.5">WhatsApp Support</p>
                   <p className="text-base-content text-sm sm:text-[15px] font-extrabold">+233 053 647 9169</p>
                </div>
             </li>
             <li className="flex items-center gap-3 sm:gap-4 group">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-base-100 shadow-sm flex items-center justify-center rounded-xl text-primary group-hover:scale-105 transition-transform flex-shrink-0"><Mail size={18} strokeWidth={2} /></div>
                <div>
                   <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-base-content/40 mb-0.5">Email Support</p>
                   <p className="text-base-content text-sm sm:text-[15px] font-extrabold break-all">nyarkopriscilla240@gmail.com</p>
                </div>
             </li>
           </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-[1440px] mx-auto mt-12 sm:mt-20 md:mt-24 pt-6 sm:pt-8 border-t border-base-300 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-[11px] sm:text-[12px] font-bold tracking-wider text-base-content/40">
        <p className="text-center md:text-left flex items-center justify-center md:justify-start gap-1">© {currentYear} Queens Fashion Store <Crown size={12} className="text-primary" />. All Rights Reserved.</p>
        <div className="flex gap-5 sm:gap-8">
           {footerLinks.legal.map(link => (
             <Link key={link.name} to={link.path} className="hover:text-primary transition-colors uppercase">{link.name}</Link>
           ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
