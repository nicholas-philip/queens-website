import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, Shield, Heart, Award, Users } from 'lucide-react';
import logo from '../assets/logo.png';

const FadeUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.03, 1] }}
  >
    {children}
  </motion.div>
);

const About = () => {
  return (
    <div className="min-h-screen bg-base-100 pt-32 pb-20 overflow-hidden font-sans">
      
      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative px-4 md:px-8 mb-24 md:mb-32">
        <div className="max-w-[1440px] mx-auto text-center relative z-10">
          <FadeUp>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-8">
              <Crown size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Est. 2024</span>
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-base-content tracking-tighter leading-[0.9] mb-8 uppercase">
              The Queen's <br/> <span className="text-primary">Legacy.</span>
            </h1>
            <p className="max-w-xl mx-auto text-base-content/60 text-lg font-medium leading-relaxed">
              Based in the heart of Accra, we're redefining West African luxury through a curated lens of high fashion, streetwear, and premium beauty.
            </p>
          </FadeUp>
        </div>
        
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </section>

      {/* ── Visual Strip ────────────────────────────── */}
      <section className="mb-24 md:mb-32">
        <div className="flex gap-4 sm:gap-6 overflow-hidden select-none">
          {[
            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800',
            'https://images.unsplash.com/photo-1539109132384-361555753195?q=80&w=800',
            'https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=800',
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800',
          ].map((img, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 1.1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className="flex-shrink-0 w-64 sm:w-80 md:w-[400px] h-[500px] rounded-[2.5rem] overflow-hidden border border-base-200"
            >
              <img src={img} className="w-full h-full object-cover" alt="Fashion Editorial" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Story Section ───────────────────────────── */}
      <section className="px-4 md:px-8 mb-32">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
             <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-6">Our Narrative</h2>
             <h3 className="text-3xl md:text-5xl font-black text-base-content mb-8 tracking-tight leading-tight uppercase">
               Curating more than just <br/> <span className="italic font-medium normal-case">fashion.</span>
             </h3>
             <div className="space-y-6 text-base-content/70 font-medium text-lg leading-relaxed">
               <p>
                 Queens Fashion Store wasn't born in a boardroom; it was inspired by the vibrant streets of Ghana and the timeless elegance of classic couture. We believed that luxury should be accessible yet exclusionary—a paradox that defined our curation.
               </p>
               <p>
                 Today, we house a meticulously selected collection of unisex apparel, authentic sneakers, and signature scents that represent the best of global and local trends. Every piece is vetted for quality, authenticity, and style impact.
               </p>
             </div>
          </FadeUp>

          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Authenticity', icon: Shield, text: '100% verified original products.' },
              { label: 'Curation', icon: Sparkles, text: 'Expertly selected seasonal pieces.' },
              { label: 'Community', icon: Heart, text: 'Built by and for fashion enthusiasts.' },
              { label: 'Excellence', icon: Award, text: 'Unmatched customer service standards.' },
            ].map((feature, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="bg-base-200/50 p-8 rounded-[2rem] border border-base-200 hover:border-primary/20 transition-all group">
                  <feature.icon size={28} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="font-black text-sm uppercase tracking-widest mb-2">{feature.label}</h4>
                  <p className="text-xs text-base-content/50 font-bold leading-relaxed">{feature.text}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Boutique Experience ─────────────────── */}
      <section className="bg-[#050505] text-white py-24 md:py-32 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
        
        <div className="max-w-[1440px] mx-auto relative z-10 text-center">
          <FadeUp>
             <h2 className="text-4xl md:text-7xl font-black tracking-tight mb-12 uppercase">
               The <span className="text-primary">Boutique</span> Hub.
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
               <div>
                  <p className="text-4xl font-black text-primary mb-2">12k+</p>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-40">Style Enthusiasts</p>
               </div>
               <div>
                  <p className="text-4xl font-black text-primary mb-2">100%</p>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-40">Authentic Sneakers</p>
               </div>
               <div>
                  <p className="text-4xl font-black text-primary mb-2">24h</p>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-40">Concierge Support</p>
               </div>
             </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 md:px-8 text-center">
        <FadeUp>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
            Ready to Shop the <span className="text-primary">Collection?</span>
          </h2>
          <p className="text-base-content/50 text-base font-medium mb-8 max-w-md mx-auto">
            Discover luxury fashion, beauty, and accessories curated just for you.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-primary-content font-black text-sm uppercase tracking-widest rounded-2xl hover:brightness-110 shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            Shop Now
          </Link>
        </FadeUp>
      </section>

    </div>
  );
};

export default About;
