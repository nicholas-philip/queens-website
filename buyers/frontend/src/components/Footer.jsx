import React from 'react';
import { Link } from 'react-router-dom';
import Instagram from 'lucide-react/dist/esm/icons/instagram';
import Twitter from 'lucide-react/dist/esm/icons/twitter';
import FacebookIcon from 'lucide-react/dist/esm/icons/facebook';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Phone from 'lucide-react/dist/esm/icons/phone';
import logo from '../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: 'Latest Arrivals', path: '/shop?sort=newest' },
      { name: 'Best Sellers', path: '/shop' },
      { name: 'All Collections', path: '/shop' },
      { name: 'Track My Order', path: '/track' },
      // { name: 'Queens Rewards', path: '/rewards' }, // Temporarily deactivated
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
    <footer className="bg-base-200 border-t border-base-300 pt-24 pb-8 px-6 mt-32 font-sans transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-20">
        
        {/* Brand Identity */}
        <div className="space-y-8">
          <Link to="/" className="flex flex-col">
             <div className="flex items-center group -ml-8">
                <div className="w-48 h-24 flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
                   <img src={logo} alt="Queens Luxe Logo" className="w-full h-full object-contain" />
                </div>
             </div>
           </Link>
           <p className="text-base-content/60 text-sm leading-relaxed max-w-xs font-medium">
             Elevating your style with curated luxury dresses, authentic sneakers, signature perfumes, and essential beauty items. Based in Accra, serving Queens worldwide.
           </p>
           <div className="flex gap-4 text-base-content/40">
             <a href="#" className="w-10 h-10 rounded-full bg-base-100 flex items-center justify-center shadow-sm hover:text-primary hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"><Instagram size={18} strokeWidth={2} /></a>
             <a href="#" className="w-10 h-10 rounded-full bg-base-100 flex items-center justify-center shadow-sm hover:text-primary hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"><FacebookIcon size={18} strokeWidth={2} /></a>
             <a href="#" className="w-10 h-10 rounded-full bg-base-100 flex items-center justify-center shadow-sm hover:text-primary hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"><Twitter size={18} strokeWidth={2} /></a>
           </div>
        </div>

        {/* Boutique Links */}
        <div>
          <h4 className="text-base-content font-extrabold tracking-wide uppercase text-sm mb-6">The Boutique</h4>
          <ul className="space-y-4">
            {footerLinks.shop.map(link => (
              <li key={link.name}>
                <Link to={link.path} className="text-base-content/60 hover:text-primary transition-colors text-[15px] font-medium tracking-wide group flex items-center gap-2">
                  <div className="w-0 h-[2px] bg-primary group-hover:w-4 transition-all" />
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Concierge Links */}
        <div>
           <h4 className="text-base-content font-extrabold tracking-wide uppercase text-sm mb-6">Concierge</h4>
          <ul className="space-y-4">
            {footerLinks.concierge.map(link => (
              <li key={link.name}>
                <Link to={link.path} className="text-base-content/60 hover:text-primary transition-colors text-[15px] font-medium tracking-wide group flex items-center gap-2">
                  <div className="w-0 h-[2px] bg-primary group-hover:w-4 transition-all" />
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Global Contact */}
        <div>
           <h4 className="text-base-content font-extrabold tracking-wide uppercase text-sm mb-6">Inquiries</h4>
           <ul className="space-y-6">
             <li className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-base-100 shadow-sm flex items-center justify-center rounded-xl text-primary group-hover:scale-105 transition-transform"><Phone size={20} strokeWidth={2} /></div>
                <div>
                   <p className="text-[11px] font-bold uppercase tracking-widest text-base-content/40 mb-0.5">WhatsApp Support</p>
                   <p className="text-base-content text-[15px] font-extrabold">+233 24 570 9324</p>
                </div>
             </li>
             <li className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-base-100 shadow-sm flex items-center justify-center rounded-xl text-primary group-hover:scale-105 transition-transform"><Mail size={20} strokeWidth={2} /></div>
                <div>
                   <p className="text-[11px] font-bold uppercase tracking-widest text-base-content/40 mb-0.5">Email Support</p>
                   <p className="text-base-content text-[15px] font-extrabold">concierge@queens.com</p>
                </div>
             </li>
           </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-[1440px] mx-auto mt-24 pt-8 border-t border-base-300 flex flex-col md:flex-row justify-between items-center gap-6 text-[12px] font-bold tracking-wider text-base-content/40">
        <p>© {currentYear} Queens Premium Fashion & Beauty. All Rights Reserved.</p>
        <div className="flex gap-8">
           {footerLinks.legal.map(link => (
             <Link key={link.name} to={link.path} className="hover:text-primary transition-colors uppercase">{link.name}</Link>
           ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
